(() => {
  const globalSearch = document.getElementById("globalSearch");
  const globalResults = document.getElementById("globalResults");
  const modeQuickBtn = document.getElementById("modeQuick");
  const modeFullBtn = document.getElementById("modeFull");
  const statusEl = document.getElementById("globalSearchStatus");

  if (!globalSearch || !globalResults) return;

  let mode = "quick"; // quick | full
  let index = [];
  let deepReady = false;

  // deepIndex: file -> [{id,title,text}]
  const deepIndex = new Map();
  const CACHE_KEY = "kb_deep_sections_cache_v1";

  function setStatus(txt) {
    if (!statusEl) return;
    statusEl.textContent = txt || "";
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[c]));
  }

  function slugify(s) {
    return String(s).toLowerCase().trim()
      .replace(/[^\w\u00C0-\u017F]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function uniqueSlugger() {
    const map = new Map();
    return (title) => {
      const base = slugify(title);
      const n = (map.get(base) || 0) + 1;
      map.set(base, n);
      return n === 1 ? base : `${base}-${n}`;
    };
  }

  function showEmpty(msg) {
    globalResults.hidden = false;
    globalResults.innerHTML = `<div class="search-empty">${escapeHtml(msg)}</div>`;
  }

  function hideResults() {
    globalResults.hidden = true;
    globalResults.innerHTML = "";
    setStatus("");
  }

  function renderHits(hits, q) {
    if (!hits.length) return showEmpty("Nincs találat.");
    globalResults.hidden = false;

    globalResults.innerHTML = hits.map(h => `
      <a class="search-hit" href="#${escapeHtml(h.page)}" data-page="${escapeHtml(h.page)}" data-anchor="${escapeHtml(h.anchor || "")}" data-q="${escapeHtml(q)}">
        <div class="search-hit__row">
          <div class="search-hit__title">${escapeHtml(h.title)}</div>
          <span class="search-badge">${escapeHtml(h.badge || "")}</span>
        </div>
        ${h.sectionTitle ? `<div class="search-hit__section">↳ ${escapeHtml(h.sectionTitle)}</div>` : ""}
        <div class="search-hit__excerpt">${escapeHtml(h.excerpt || "")}</div>
      </a>
    `).join("");

    globalResults.querySelectorAll("a.search-hit").forEach(a => {
      a.addEventListener("click", () => {
        const page = a.getAttribute("data-page");
        const anchor = a.getAttribute("data-anchor");
        const query = a.getAttribute("data-q");

        if (anchor) {
          sessionStorage.setItem("pendingPage", page);
          sessionStorage.setItem("pendingAnchor", anchor);
        }
        if (query) sessionStorage.setItem("pendingQuery", query);

        hideResults();
        globalSearch.value = "";
      });
    });
  }

  async function loadIndex() {
    try {
      const res = await fetch("./search-index.json", { cache: "no-store" });
      if (!res.ok) throw new Error("Index not found");
      index = await res.json();
    } catch {
      index = [];
    }
  }

  function quickSearch(q) {
    const qq = q.toLowerCase();
    return index
      .filter(p =>
        (p.title && p.title.toLowerCase().includes(qq)) ||
        (p.tags && p.tags.join(" ").toLowerCase().includes(qq)) ||
        (p.excerpt && p.excerpt.toLowerCase().includes(qq))
      )
      .slice(0, 12)
      .map(p => ({
        page: p.page,
        title: p.title || p.page,
        excerpt: p.excerpt || "",
        badge: "Gyors"
      }));
  }

  function makeSnippet(text, pos, len) {
    if (!text) return "";
    if (pos == null || pos < 0) pos = 0;
    const start = Math.max(0, pos - 60);
    const end = Math.min(text.length, pos + len + 80);
    return `${start > 0 ? "…" : ""}${text.slice(start, end)}${end < text.length ? "…" : ""}`.trim();
  }

  async function fetchSections(file) {
    const res = await fetch(file, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const doc = new DOMParser().parseFromString(html, "text/html");
    doc.querySelectorAll("script, style, noscript").forEach(n => n.remove());
    const root = doc.body;

    const headings = Array.from(root.querySelectorAll("h2, h3"));

    // ha nincs H2/H3: egy szekció
    if (!headings.length) {
      const text = (root.innerText || "").replace(/\s+/g, " ").trim();
      return [{ id: "top", title: "Tartalom", text }];
    }

    const makeUnique = uniqueSlugger();
    const sections = [];

    for (let i = 0; i < headings.length; i++) {
      const h = headings[i];
      const title = (h.textContent || "").trim();
      const id = makeUnique(title || "section");

      let textParts = [];
      let cur = h.nextSibling;

      while (cur) {
        if (cur.nodeType === 1) {
          const tag = cur.tagName.toLowerCase();
          if (tag === "h2" || tag === "h3") break;
          const t = (cur.innerText || "").trim();
          if (t) textParts.push(t);
        } else if (cur.nodeType === 3) {
          const t = (cur.nodeValue || "").trim();
          if (t) textParts.push(t);
        }
        cur = cur.nextSibling;
      }

      const text = textParts.join(" ").replace(/\s+/g, " ").trim();
      sections.push({ id, title, text });
    }

    return sections;
  }

  function loadDeepCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return;
      const obj = JSON.parse(raw);
      Object.entries(obj).forEach(([file, sections]) => deepIndex.set(file, sections));
      if (deepIndex.size > 0) deepReady = true;
    } catch { /* ignore */ }
  }

  function saveDeepCache() {
    try {
      const obj = {};
      for (const [file, sections] of deepIndex.entries()) obj[file] = sections;
      localStorage.setItem(CACHE_KEY, JSON.stringify(obj));
    } catch { /* ignore */ }
  }

  async function ensureDeepIndex() {
    if (deepReady) return;
    setStatus("Indexelés…");

    const files = index.map(x => x.file).filter(Boolean);
    let i = 0;
    const concurrency = 3;

    async function worker() {
      while (i < files.length) {
        const file = files[i++];
        if (deepIndex.has(file)) continue;
        try {
          const sections = await fetchSections(file);
          deepIndex.set(file, sections);
        } catch { /* ignore */ }
      }
    }

    await Promise.all(Array.from({ length: Math.min(concurrency, files.length) }, worker));
    deepReady = true;
    saveDeepCache();
    setStatus("Kész");
  }

  function fullTextSearch(q) {
    const qq = q.toLowerCase();
    const hits = [];

    for (const p of index) {
      const file = p.file;
      if (!file) continue;

      const sections = deepIndex.get(file) || [];
      for (const s of sections) {
        const hay = (s.title + " " + s.text).toLowerCase();
        const pos = hay.indexOf(qq);
        if (pos >= 0) {
          const snippet = makeSnippet(s.text || s.title, (s.text || s.title).toLowerCase().indexOf(qq), q.length);
          hits.push({
            page: p.page,
            anchor: s.id,
            title: p.title || p.page,
            sectionTitle: s.title,
            excerpt: snippet,
            badge: "Teljes"
          });
          if (hits.length >= 12) return hits;
        }
      }
    }
    return hits;
  }

  async function run(q) {
    const query = q.trim();
    if (!query || query.length < 2) return hideResults();

    if (mode === "quick") {
      const hits = quickSearch(query);
      renderHits(hits, query);
      return;
    }

    // full-text
    if (!deepReady) await ensureDeepIndex();
    const hits = fullTextSearch(query);
    renderHits(hits, query);
  }

  function setMode(m) {
    mode = m;
    modeQuickBtn?.classList.toggle("btn--active", mode === "quick");
    modeFullBtn?.classList.toggle("btn--active", mode === "full");
    if (mode === "full") ensureDeepIndex();
    run(globalSearch.value || "");
  }

  modeQuickBtn?.addEventListener("click", () => setMode("quick"));
  modeFullBtn?.addEventListener("click", () => setMode("full"));

  globalSearch.addEventListener("input", () => run(globalSearch.value || ""));

  // init
  loadIndex().then(() => {
    loadDeepCache();
  });
})();
