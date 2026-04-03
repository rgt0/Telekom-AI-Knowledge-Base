const content = document.getElementById("content");
const toc     = document.getElementById("toc");
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const searchStatus = document.getElementById("searchStatus");

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
/* ---------- Slug helpers (EGYEZZEN a search.js-sel) ---------- */
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
      const inPage = document.getElementById("inPageSearch");
      if (inPage) {
        inPage.value = pendingQuery;
        inPage.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }
  }, 60);
}
function setSearchStatus(html) {
  if (!searchStatus) return;
  searchStatus.innerHTML = html || "";
}

function updateSearchStatus() {
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
searchBox.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    if (e.shiftKey) jumpTo(activeMark - 1);
    else jumpTo(activeMark + 1);
  }
  if (e.key === "Escape") {
    searchBox.value = "";
    clearHighlights();
    setSearchStatus("");
  }
});
function jumpTo(index){
  if(!marks.length) { updateSearchStatus(); return; }

  if(index < 0) index = marks.length - 1;
  if(index >= marks.length) index = 0;

  marks.forEach(m => m.classList.remove("hl-active"));
  activeMark = index;

  const el = marks[activeMark];
  el.classList.add("hl-active");
  el.scrollIntoView({ behavior: "smooth", block: "center" });

  updateSearchStatus();
}
updateSearchStatus();
/* indulás */
loadPage(getPageFromHash());
buildTOC();
