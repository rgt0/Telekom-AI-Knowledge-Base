const content = document.getElementById("content");
const toc = document.getElementById("toc");
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

function getPageFromHash() {
  const hash = (location.hash || "#home").replace("#", "").trim();
  return hash || "home";
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
    toc.innerHTML = `<div class="toc__empty">Nincs tartalomjegyzék.</div>`;
  }
}

function setActiveTopNav(pageKey) {
  document.querySelectorAll("#topNav a[data-page]").forEach(a => {
    a.classList.toggle("is-active", a.getAttribute("data-page") === pageKey);
  });
}

/* ---------- TOC: Sidebar tartalomjegyzék (H2 + H3) ---------- */
function buildTOC() {
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
