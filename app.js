/* Telekom AI KB – minimal SPA routing (hash) */

const pages = {
  "home": `
    <section class="card">
      <span class="badge">Portál</span>
      <h1>Telekom AI Knowledge Base</h1>
      <p>Válassz a bal oldali menüből (sidebar) vagy a felső navigációból.</p>
      <ul>
        <li>Reszponzív sidebar + topnav</li>
        <li>Hash-alapú navigáció (GitHub Pages kompatibilis)</li>
        <li>Keresés a menüpontokra</li>
      </ul>
    </section>
  `,
  "ai-alapok": `
    <section class="card">
      <h2>AI‑Alapok</h2>
      <p>Itt jönnek az alapfogalmak: LLM, embedding, token, kontextus, RAG, EIE…</p>
    </section>
  `,
  "prompt-engineering": `
    <section class="card">
      <h2>Prompt Engineering</h2>
      <p>Sablonok, példák, guardrail-ek, best practice-ek.</p>
    </section>
  `,
  "ai-sandbox": `
    <section class="card">
      <h2>AI Sandbox</h2>
      <p>Biztonságos tesztelési környezet: adatszabályok, logolás, mérések.</p>
    </section>
  `,
  "aimc-explain-engine": `
    <section class="card">
      <h2>AIM/C Explain Engine</h2>
      <p>Magyarázhatóság, döntéstámogatás, trace, források, auditálhatóság.</p>
    </section>
  `,
  "eszkozok": `
    <section class="card">
      <h2>Eszközök</h2>
      <p>Tooling: pipeline, konverterek, validátorok, indexer, stb.</p>
    </section>
  `,
  "tudastar": `
    <section class="card">
      <h2>Tudástár</h2>
      <p>Dokumentumcsomagok, metaadatok, chunkolás és verziózás.</p>
    </section>
  `,
  "rag": `
    <section class="card">
      <h2>RAG</h2>
      <p>Chunking + embedding + retrieval + válaszgenerálás – irányelvek és minták.</p>
    </section>
  `,
  "itf-adatlap": `
    <section class="card">
      <h2>ITF‑Adatlap</h2>
      <p>ITF sablon: cél, scope, adatforrások, megfelelőség, owner, SLA.</p>
    </section>
  `,
  "iranyelvek": `
    <section class="card">
      <h2>Irányelvek</h2>
      <p>Adatvédelem, compliance, prompt safety, minőségi kapuk.</p>
    </section>
  `
};

const content = document.getElementById("content");
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const searchBox = document.getElementById("searchBox");

function getPageFromHash() {
  const hash = (location.hash || "#home").replace("#", "").trim();
  return pages[hash] ? hash : "home";
}

function setActiveLinks(pageKey) {
  document.querySelectorAll("[data-page]").forEach(a => {
    a.classList.toggle("is-active", a.getAttribute("data-page") === pageKey);
  });
}

function render() {
  const pageKey = getPageFromHash();
  content.innerHTML = pages[pageKey];
  setActiveLinks(pageKey);
  content.focus({ preventScroll: true });
  closeSidebar();
}

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

menuBtn?.addEventListener("click", () => {
  sidebar.classList.contains("is-open") ? closeSidebar() : openSidebar();
});
overlay?.addEventListener("click", closeSidebar);

window.addEventListener("hashchange", render);

/* Keresés: menüpontok szűrése (sidebar linkek) */
searchBox?.addEventListener("input", (e) => {
  const q = (e.target.value || "").toLowerCase();
  document.querySelectorAll("#sideNav a[data-page]").forEach(a => {
    const text = a.textContent.toLowerCase();
    a.style.display = text.includes(q) ? "" : "none";
  });
});

render();
``
