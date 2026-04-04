// ===== Stabil alap: page betöltés + aktív link + TOC =====
const content = document.getElementById("content");
const toc = document.getElementById("toc");

function pageFromHash() {
  const h = (location.hash || "#home").slice(1).trim();
  return h || "home";
}

function setActiveLinks(pageKey) {
  document.querySelectorAll("a[data-page]").forEach(a => {
    a.classList.toggle("is-active", a.getAttribute("data-page") === pageKey);
  });
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

function buildTOC() {
  if (!toc || !content) return;

  const headings = content.querySelectorAll("h2, h3");
  if (!headings.length) {
    toc.innerHTML = `<div class="toc__empty">Nincs cím a tartalomjegyzékhez.</div>`;
    return;
  }
// --- Keresőből érkező fejezet-ugrás + highlight ---
function scrollToPending(currentPage) {
  const pendingPage = sessionStorage.getItem("pendingPage");
  const pendingAnchor = sessionStorage.getItem("pendingAnchor");
  const pendingQuery = sessionStorage.getItem("pendingQuery");

  // Fejezet-ugrás csak akkor, ha ugyanarra az oldalra töltöttünk
  if (pendingPage && pendingPage === currentPage && pendingAnchor) {
    sessionStorage.removeItem("pendingPage");
    sessionStorage.removeItem("pendingAnchor");

    setTimeout(() => {
      const el = document.getElementById(pendingAnchor);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }

  // Opcionális: a globális keresés kifejezését átadjuk az in-page highlight keresőnek
  if (pendingQuery) {
    sessionStorage.removeItem("pendingQuery");
    const sb = document.getElementById("searchBox");
    if (sb) {
      sb.value = pendingQuery;
      sb.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }
}
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
      `<a href="#" data-scrollto="${h.id}" class="toc__item ${isH3 ? "toc__item--sub" : ""}">${escapeHtml(text)}</a>`
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

async function loadPage(pageKey) {
  if (!content) {
    console.error("Hiányzik a #content elem az index.html-ből.");
    return;
  }

  const url = `./pages/${pageKey}.html`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();
    content.innerHTML = html;

    setActiveLinks(pageKey);
    buildTOC();
    scrollToPending(pageKey);
  } catch (e) {
    content.innerHTML = `
      <section class="card">
        <h2>Hiba</h2>
        <p>Nem sikerült betölteni: <code>${url}</code></p>
        <p><small>${escapeHtml(String(e))}</small></p>
      </section>`;
    if (toc) toc.innerHTML = `<div class="toc__empty">Nincs tartalomjegyzék.</div>`;
  }
}
// Top / Vissza a tetejére
document.querySelectorAll(".js-scroll-top").forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();

    // oldal teteje
    window.scrollTo({ top: 0, behavior: "smooth" });

    // opcionális: fókusz vissza a tartalomra (a11y)
    const content = document.getElementById("content");
    if (content) content.focus({ preventScroll: true });

    // opcionális: mobilon zárjuk az oldalsávot, ha van ilyen funkciód
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");
    if (sidebar && sidebar.classList.contains("is-open")) {
      sidebar.classList.remove("is-open");
      if (overlay) overlay.hidden = true;
    }
  });
});
// Top / Vissza a tetejére (smooth)
document.querySelectorAll(".js-scroll-top").forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });

    const content = document.getElementById("content");
    if (content) content.focus({ preventScroll: true });
  });
});
window.addEventListener("hashchange", () => loadPage(pageFromHash()));
loadPage(pageFromHash());
