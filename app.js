
/* ---------- DOM elements ---------- */
const content = document.getElementById("content");
const toc     = document.getElementById("toc");
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const searchStatus = document.getElementById("searchStatus");
const searchBox    = document.getElementById("searchBox");

let marks = [];
let activeMark = -1;

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}
function getPageFromHash() {
  const hash = (location.hash || "#home").replace("#", "").trim();
  return hash || "home";
}
function slugify(s) {
  return String(s).toLowerCase().trim()
    .replace(/[^\w\u00C0-\u017F]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildTOC() {
  if (!toc || !content) return;

  const headings = content.querySelectorAll("h2, h3");
  if (!headings.length) {
    toc.innerHTML = `<div class="toc__empty">Nincs cím a tartalomjegyzékhez.</div>`;
    return;
  }

  // egyedi id-k, hogy azonos címek se ütközzenek
  const seen = new Map();
  const uniqueId = (title) => {
    const base = slugify(title);
    const n = (seen.get(base) || 0) + 1;
    seen.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  };

  const items = [];
  headings.forEach(h => {
    const text = (h.textContent || "").trim();
    if (!text) return;
    if (!h.id) h.id = uniqueId(text);

    const isH3 = h.tagName.toLowerCase() === "h3";
    items.push(
      `<a href="#" data-scrollto="${h.id}" class="${isH3 ? "toc__item toc__item--sub" : "toc__item"}">${escapeHtml(text)}</a>`
    );
  });

  toc.innerHTML = items.join("");

  toc.querySelectorAll("a[data-scrollto]").forEach(a => {
    a.addEventListener("click", (ev) => {
      ev.preventDefault();
      const id = a.getAttribute("data-scrollto");
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}
/* ---------- Slug helpers (EGYEZZEN a .js-sel) ---------- */
function slugify(s) {
  return String(s).toLowerCase().trim()
    .replace(/[^\w\u00C0-\u017F]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueSlugger() {
  const map = new Map(); // base -> count
  return (title) => {
    const base = slugify(title);
    const n = (map.get(base) || 0) + 1;
    map.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  };
}

/* ---------- Betöltés külön HTML fragmentekből ---------- */
async function loadPage(pageKey) {
  const url = `./pages/${pageKey}.html`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    content.innerHTML = html;
    content.focus({ preventScroll: true });

    setActiveTopNav(pageKey);
    buildTOC();                 // H2/H3 -> TOC + id kiosztás
    scrollToPendingAnchor(pageKey); // keresőből jövő ugrás
    closeSidebar();
  } catch (e) {
    content.innerHTML = `
      <section class="card">
        <h2>Hiba</h2>
        <p>Nem sikerült betölteni: <code>${url}</code></p>
        <p><small>${String(e)}</small></p>
      </section>`;
      if (toc)    toc.innerHTML = `<div class="toc__empty">Nincs tartalomjegyzék.</div>`;
  }
}

function setActiveTopNav(pageKey) {
  document.querySelectorAll("#topNav a[data-page]").forEach(a => {
    a.classList.toggle("is-active", a.getAttribute("data-page") === pageKey);
  });
}

/* ---------- TOC: Sidebar tartalomjegyzék (H2 + H3) ---------- */
function buildTOC() {
   if (!toc) return; // nincs TOC konténer, nincs mit építeni
  const headings = content.querySelectorAll("h2, h3");
  if (!headings.length) {
    toc.innerHTML = `<div class="toc__empty">Nincs cím a tartalomjegyzékhez.</div>`;
    return;
  }

  const makeUnique = uniqueSlugger();

  // 1) id-k kiosztása H2/H3-ra (deduplikációval)
  headings.forEach(h => {
    const title = (h.textContent || "").trim();
    if (!title) return;
    if (!h.id) h.id = makeUnique(title);
  });

  // 2) TOC felépítés
  const items = Array.from(headings).map(h => {
    const level = h.tagName.toLowerCase(); // h2/h3
    const cls = level === "h3" ? "toc__item toc__item--sub" : "toc__item";
    const title = (h.textContent || "").trim();
    return `
      <a href="#" class="${cls}" data-scrollto="${h.id}">
        ${escapeHtml(title)}
      </a>`;
  });

  toc.innerHTML = items.join("");

  // 3) TOC kattintás: smooth scroll
  toc.querySelectorAll("a[data-scrollto]").forEach(a => {
    a.addEventListener("click", (ev) => {
      ev.preventDefault();
      const id = a.getAttribute("data-scrollto");
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

/* ---------- Keresőből érkező: oldal betöltés után fejezetre ugrás ---------- */
function scrollToPendingAnchor(pageKey) {
  const pendingPage = sessionStorage.getItem("pendingPage");
  const pendingAnchor = sessionStorage.getItem("pendingAnchor");
  const pendingQuery = sessionStorage.getItem("pendingQuery"); // opcionális, in-page highlight

  if (!pendingPage || pendingPage !== pageKey || !pendingAnchor) return;

  sessionStorage.removeItem("pendingPage");
  sessionStorage.removeItem("pendingAnchor");

  setTimeout(() => {
    const el = document.getElementById(pendingAnchor);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });

    // opcionális: betöltés után oldalon belüli highlight
    if (pendingQuery) {
      sessionStorage.removeItem("pendingQuery");
      const inPage = document.getElementById("inPage");
      if (inPage) {
        inPage.value = pendingQuery;
        inPage.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }
  }, 60);
}
function setStatus(html) {
  if (!Status) return;
  Status.innerHTML = html || "";
}

function updateStatus() {
  if (!searchBox) return;

  const q = searchBox.value.trim();
  if (!q) { 
    setSearchStatus("");
    return;
  }

  if (!marks.length) {
    setSearchStatus(`Nincs találat: <strong>${escapeHtml(q)}</strong>`);
    return;
  }

  // activeMark 0-alapú, ezért +1
  setSearchStatus(`Találat: <strong>${activeMark + 1}</strong>/<strong>${marks.length}</strong>`);
}
/* ---------- Mobil sidebar ---------- */
function openSidebar(){
  sidebar.classList.add("is-open");
  overlay.hidden = false;
  menuBtn.setAttribute("aria-expanded", "true");
}
function closeSidebar(){
  sidebar.classList.remove("is-open");
  overlay.hidden = true;
  menuBtn.setAttribute("aria-expanded", "false");
}
menuBtn?.addEventListener("click", () => sidebar.classList.contains("is-open") ? closeSidebar() : openSidebar());
overlay?.addEventListener("click", closeSidebar);

window.addEventListener("hashchange", () => loadPage(getPageFromHash()));

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}

buildTOC();
// --- In-page highlight search (biztos bekötés) ---
(() => {
  const contentEl = document.getElementById("content");
  const searchEl = document.getElementById("searchBox");
  if (!contentEl || !searchEl) return;

  

  const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  function clearHighlights() {
    content.querySelectorAll("mark.hl").forEach(mark => {
      mark.replaceWith(document.createTextNode(mark.textContent));
    });
  setStatus();
  }
// Globális állapot (legyen csak egyszer!)


function escapeRegExp(s){
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightInContent(query){
  if (!content) return;

  const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, {
    acceptNode(node){
      const p = node.parentNode;
      if(!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      if(p && p.tagName){
        const tag = p.tagName.toLowerCase();
        if(tag === "script" || tag === "style" || tag === "mark") return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  const re = new RegExp(escapeRegExp(query), "gi");
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  nodes.forEach(node => {
    const text = node.nodeValue;
    re.lastIndex = 0;
    if(!re.test(text)) return;

    const frag = document.createDocumentFragment();
    let last = 0;
    re.lastIndex = 0;

    let m;
    while((m = re.exec(text)) !== null){
      const before = text.slice(last, m.index);
      if(before) frag.appendChild(document.createTextNode(before));

      const mark = document.createElement("mark");
      mark.className = "hl";
      mark.textContent = m[0];
      frag.appendChild(mark);

      last = m.index + m[0].length;
    }

    const after = text.slice(last);
    if(after) frag.appendChild(document.createTextNode(after));

    node.parentNode.replaceChild(frag, node);
  });

  // 🔥 EZ KELL: a globális marks frissítése
  marks = Array.from(content.querySelectorAll("mark.hl"));
  activeMark = marks.length ? 0 : -1;
}

function applySearch() {
  if (!searchBox || !content) return;

  const q = searchBox.value.trim();
  clearHighlights();

  if (q.length < 2) {
    setStatus("");
    return;
  }

  highlightInContent(q);

  if (!marks.length) {
    setStatus(`Nincs találat: <strong>${escapeHtml(q)}</strong>`);
    return;
  }

  jumpTo(0);
  setStatus(`Találat: <strong>${activeMark + 1}</strong>/<strong>${marks.length}</strong>`);
marks = Array.from(content.querySelectorAll("mark.hl"));
activeMark = marks.length ? 0 : -1;
}

  function highlight(query) {
    const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentNode;
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (parent && parent.tagName) {
          const tag = parent.tagName.toLowerCase();
          if (tag === "script" || tag === "style" || tag === "mark") return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const re = new RegExp(escapeRegExp(query), "gi");
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(node => {
      const text = node.nodeValue;
      re.lastIndex = 0;
      if (!re.test(text)) return;

      const frag = document.createDocumentFragment();
      let last = 0;
      re.lastIndex = 0;

      let m;
      while ((m = re.exec(text)) !== null) {
        const before = text.slice(last, m.index);
        if (before) frag.appendChild(document.createTextNode(before));

        const mark = document.createElement("mark");
        mark.className = "hl";
        mark.textContent = m[0];
        frag.appendChild(mark);

        last = m.index + m[0].length;
      }

      const after = text.slice(last);
      if (after) frag.appendChild(document.createTextNode(after));

      node.parentNode.replaceChild(frag, node);
    });

    marks = Array.from(content.querySelectorAll("mark.hl"));
    activeMark = marks.length ? 0 : -1;
  }

  if (!marks || marks.length === 0) {
    searchStatus.innerHTML = `Nincs találat: <strong>${escapeHtml(q)}</strong>`;
    return;
  }

  searchStatus.innerHTML = `Találat: <strong>${activeMark + 1}</strong>/<strong>${marks.length}</strong>`;
}
  function jumpTo(idx) {
    if (!marks.length) return;
    if (idx < 0) idx = marks.length - 1;
    if (idx >= marks.length) idx = 0;

    marks.forEach(m => m.classList.remove("hl-active"));
    activeMark = idx;

    const el = marks[activeMark];
    el.classList.add("hl-active");
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // gépelés közben highlight
  searchEl.addEventListener("input", () => {
    const q = searchEl.value.trim();
    clearHighlights();
    if (q.length >= 2) {
      highlight(q);
      jumpTo(0);
    }
  });

  // Enter = next, Shift+Enter = prev, Esc = törlés
  searchEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) jumpTo(active - 1);
      else jumpTo(active + 1);
    }
    if (e.key === "Escape") {
      searchEl.value = "";
      clearHighlights();
    }
  });

  // oldalváltás után (loadPage) gyakran új content jön -> tisztítunk
  window.addEventListener("hashchange", () => {
    clearHighlights();
    const q = searchEl.value.trim();
    if (q.length >= 2) {
      highlight(q);
      jumpTo(0);
    }
  });
  // ===== In-page highlight search (stabil, tiszta) =====
(() => {
  const content = document.getElementById("content");
  const searchBox = document.getElementById("searchBox");
  const searchStatus = document.getElementById("searchStatus");

  if (!content || !searchBox) return;


  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[c]));
  }

  function escapeRegExp(s){
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }


  function clearHighlights(){
    content.querySelectorAll("mark.hl").forEach(mark => {
      mark.replaceWith(document.createTextNode(mark.textContent));
    });
    marks = [];
    activeMark = -1;
    setStatus("");
  }

  function highlightInContent(query){
    const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, {
      acceptNode(node){
        const p = node.parentNode;
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;

        if (p && p.tagName) {
          const tag = p.tagName.toLowerCase();
          if (tag === "script" || tag === "style" || tag === "mark") return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const re = new RegExp(escapeRegExp(query), "gi");
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(node => {
      const text = node.nodeValue;
      re.lastIndex = 0;
      if (!re.test(text)) return;

      const frag = document.createDocumentFragment();
      let last = 0;
      re.lastIndex = 0;

      let m;
      while ((m = re.exec(text)) !== null) {
        const before = text.slice(last, m.index);
        if (before) frag.appendChild(document.createTextNode(before));

        const mark = document.createElement("mark");
        mark.className = "hl";
        mark.textContent = m[0];
        frag.appendChild(mark);

        last = m.index + m[0].length;
      }

      const after = text.slice(last);
      if (after) frag.appendChild(document.createTextNode(after));

      node.parentNode.replaceChild(frag, node);
    });

    // 🔥 globális marks frissítés
    marks = Array.from(content.querySelectorAll("mark.hl"));
    activeMark = marks.length ? 0 : -1;
  }

  function jumpTo(index){
    if (!marks.length) return;

    if (index < 0) index = marks.length - 1;
    if (index >= marks.length) index = 0;

    marks.forEach(m => m.classList.remove("hl-active"));
    activeMark = index;

    const el = marks[activeMark];
    el.classList.add("hl-active");
    el.scrollIntoView({ behavior: "smooth", block: "center" });

    setStatus(`Találat: <strong>${activeMark + 1}</strong>/<strong>${marks.length}</strong>`);
  }

  function applySearch(){
    const q = searchBox.value.trim();
    clearHighlights();

    if (q.length < 2) {
      setStatus("");
      return;
    }

    highlightInContent(q);

    if (!marks.length) {
      setStatus(`Nincs találat: <strong>${escapeHtml(q)}</strong>`);
      return;
    }

    jumpTo(0);
  }

  // gépelés → highlight
  searchBox.addEventListener("input", applySearch);

  // Enter = next, Shift+Enter = prev, Esc = törlés
  searchBox.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) jumpTo(activeMark - 1);
      else jumpTo(activeMark + 1);
    }
    if (e.key === "Escape") {
      searchBox.value = "";
      clearHighlights();
    }
  });
mark.hl{
  background: rgba(226,0,116,.18);
  border-radius: 6px;
  padding: 0 2px;
}
mark.hl-active{
  outline: 2px solid var(--t-magenta);
  background: rgba(226,0,116,.30);
}
  // oldalváltás után újra-alkalmazzuk (ha maradt szöveg)
  window.addEventListener("hashchange", () => {
    if (searchBox.value.trim().length >= 2) applySearch();
  });
})();
})();
