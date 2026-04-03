(() => {
  const content = document.getElementById("content");
  const searchBox = document.getElementById("searchBox");
  const searchStatus = document.getElementById("searchStatus");
  if (!content || !searchBox) return;

  let marks = [];
  let activeMark = -1;

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[c]));
  }

  function escapeRegExp(s){
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function setStatus(html) {
    if (!searchStatus) return;
    searchStatus.innerHTML = html || "";
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

  searchBox.addEventListener("input", applySearch);

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

  window.addEventListener("hashchange", () => {
    if (searchBox.value.trim().length >= 2) applySearch();
  });
})();
