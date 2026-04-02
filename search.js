const globalSearch = document.getElementById("globalSearch");
const searchResults = document.getElementById("searchResults");
const modeQuickBtn = document.getElementById("modeQuick");
const modeFullBtn = document.getElementById("modeFull");
const searchStatus = document.getElementById("searchStatus");

let searchIndex = [];
let mode = "quick"; // quick | full

// Deep index: page -> sections[]
// sections: [{id, title, text}]
let deepIndex = new Map();

let deepReady = false;
const CACHE_KEY = "kb_deep_sections_cache_v1";

initSearch();

sessionStorage.setItem("pendingPage", page);
sessionStorage.setItem("pendingAnchor", anchor);
sessionStorage.setItem("pendingQuery", queryForJump);

async function initSearch() {
  await loadSearchIndex();
  loadDeepCache();
  wireModeButtons();
  wireInput();
}

async function loadSearchIndex() {
  try {
    const res = await fetch("./search-index.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    searchIndex = await res.json();
  } catch {
    searchIndex = [];
  }
}

function wireModeButtons() {
  const setMode = (m) => {
    mode = m;
    modeQuickBtn?.classList.toggle("btn--active", mode === "quick");
    modeFullBtn?.classList.toggle("btn--active", mode === "full");
    if (mode === "full") ensureDeepIndexed();
    runSearch((globalSearch.value || "").trim());
  };
  modeQuickBtn?.addEventListener("click", () => setMode("quick"));
  modeFullBtn?.addEventListener("click", () => setMode("full"));
}

function wireInput() {
  globalSearch?.addEventListener("input", () => {
    runSearch((globalSearch.value || "").trim());
  });
}

function runSearch(q) {
  if (!q || q.length < 2) return hideResults();
  if (mode === "quick") return showQuick(q);
  return showDeep(q);
}

/* -------------------------
   QUICK (index alapján)
-------------------------- */
function showQuick(q) {
  const qq = q.toLowerCase();
  const hits = searchIndex
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

  return renderHits(hits);
}

/* -------------------------
   DEEP (H2/H3 szekciók)
-------------------------- */
async function ensureDeepIndexed() {
  if (deepReady) return;

  setStatus("Indexelés…");

  const files = searchIndex.map(x => x.file).filter(Boolean);
  const concurrency = 3;
  let i = 0;

  async function worker() {
    while (i < files.length) {
      const my = i++;
      const file = files[my];
      if ([...deepIndex.keys()].includes(file)) continue;
      try {
        const sections = await fetchAndBuildSections(file);
        deepIndex.set(file, sections);
      } catch {
        // ignore
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, files.length) }, worker));
  deepReady = true;
  saveDeepCache();
  setStatus("Kész");
}

async function fetchAndBuildSections(file) {
  const res = await fetch(file, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();

  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("script, style, noscript").forEach(n => n.remove());

  // csak a body tartalmát vizsgáljuk
  const root = doc.body;

  // Heading-ek: H2/H3 → szekciók
  const nodes = Array.from(root.querySelectorAll("h2, h3, p, li, div, section"));
  // Megjegyzés: egyszerűbb: a heading-ek közötti "szövegfolyamot" gyűjtjük.

  const headings = Array.from(root.querySelectorAll("h2, h3"));
  const slugMap = new Map(); // deduplikáció azonos címekre

  function uniqueSlug(title) {
    let base = slugify(title);
    let n = (slugMap.get(base) || 0) + 1;
    slugMap.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  }

  // ha nincs H2/H3, akkor egyetlen szekció: page
  if (!headings.length) {
    const text = (root.innerText || "").replace(/\s+/g, " ").trim();
    return [{ id: "top", title: "Tartalom", text }];
  }

  // Szekciók felépítése headingenként
  const sections = [];
  for (let idx = 0; idx < headings.length; idx++) {
    const h = headings[idx];
    const title = (h.textContent || "").trim();
    const id = uniqueSlug(title);

    // begyűjtjük a heading utáni testvér elemek szövegét a következő headingig
    let textParts = [];
    let cur = h.nextSibling;

    while (cur) {
      if (cur.nodeType === 1) {
        const tag = cur.tagName?.toLowerCase();
        if (tag === "h2" || tag === "h3") break;
        // csak értelmes szövegek
        if (tag !== "script" && tag !== "style") {
          const t = (cur.innerText || "").trim();
          if (t) textParts.push(t);
        }
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

function showDeep(q) {
  // ha még indexel, indítjuk
  if (!deepReady) {
    ensureDeepIndexed();
    setStatus("Indexelés…");
  }

  const qq = q.toLowerCase();
  const hits = [];

  for (const p of searchIndex) {
    const file = p.file;
    if (!file) continue;

    const sections = deepIndex.get(file) || [];
    for (const s of sections) {
      const hay = (s.title + " " + s.text).toLowerCase();
      const pos = hay.indexOf(qq);
      if (pos >= 0) {
        hits.push({
          page: p.page,
          anchor: s.id,              // ide ugrunk
          title: p.title || p.page,
          sectionTitle: s.title,     // megjelenítjük
          excerpt: makeSnippet(s.text || s.title, (s.text || s.title).toLowerCase().indexOf(qq), q.length),
          badge: "Teljes"
        });
        if (hits.length >= 12) break;
      }
    }
    if (hits.length >= 12) break;
  }

  if (!hits.length) return renderEmpty("Nincs találat (teljes szöveg).");
  return renderHits(hits, q);
}

/* -------------------------
   Render + kattintás: oldal + fejezet
-------------------------- */
function renderHits(hits, queryForJump) {
  searchResults.hidden = false;
  searchResults.innerHTML = hits.map(h => `
    <a class="search-hit" href="#${escapeHtml(h.page)}" data-page="${escapeHtml(h.page)}" data-anchor="${escapeHtml(h.anchor || "")}">
      <div class="search-hit__row">
        <div class="search-hit__title">${escapeHtml(h.title)}</div>
        <span class="search-badge">${escapeHtml(h.badge || "")}</span>
      </div>
      ${h.sectionTitle ? `<div class="search-hit__section">↳ ${escapeHtml(h.sectionTitle)}</div>` : ""}
      <div class="search-hit__excerpt">${escapeHtml(h.excerpt || "")}</div>
    </a>
  `).join("");

  searchResults.querySelectorAll("a[data-page]").forEach(a => {
    a.addEventListener("click", (ev) => {
      // hash navigáció marad, de beállítjuk a cél fejezetet
      const page = a.getAttribute("data-page");
      const anchor = a.getAttribute("data-anchor");

      if (anchor) {
        sessionStorage.setItem("pendingPage", page);
        sessionStorage.setItem("pendingAnchor", anchor);

        // opcionális: betöltés után az in-page highlight is fusson le
        if (queryForJump) sessionStorage.setItem("pendingQuery", queryForJump);
      }

      // UX: eredménylista bezár
      hideResults();
      globalSearch.value = "";
      // hash-t a browser amúgy is beállítja a href miatt
    });
  });
}

function renderEmpty(msg) {
  searchResults.hidden = false;
  searchResults.innerHTML = `<div class="search-empty">${escapeHtml(msg)}</div>`;
}

function hideResults() {
  searchResults.hidden = true;
  searchResults.innerHTML = "";
  setStatus("");
}

function setStatus(msg) {
  if (searchStatus) searchStatus.textContent = msg;
}

/* -------------------------
   Snippet + util
-------------------------- */
function makeSnippet(text, pos, len) {
  if (!text) return "";
  if (pos == null || pos < 0) pos = 0;
  const start = Math.max(0, pos - 60);
  const end = Math.min(text.length, pos + len + 80);
  const raw = text.slice(start, end);
  return `${start > 0 ? "…" : ""}${raw}${end < text.length ? "…" : ""}`.trim();
}

function slugify(s) {
  return String(s).toLowerCase().trim()
    .replace(/[^\w\u00C0-\u017F]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}

/* -------------------------
   Cache (localStorage)
-------------------------- */
function loadDeepCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return;
    const obj = JSON.parse(raw);
    for (const [file, sections] of Object.entries(obj)) {
      deepIndex.set(file, sections);
    }
    if (deepIndex.size > 0) deepReady = true;
  } catch {
    // ignore
  }
}

function saveDeepCache() {
  try {
    const obj = {};
    for (const [file, sections] of deepIndex.entries()) obj[file] = sections;
    localStorage.setItem(CACHE_KEY, JSON.stringify(obj));
  } catch {
    // ignore
  }
}
