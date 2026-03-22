# Telekom AI Knowledge Base
RAG / EIE / Knowledge Graph – dokumentáció és UI portál

<p align="left">
  <a href="https://rgt0.github.io/Telekom-AI-Knowledge-Base/">
    <img src="https://img.shields.io/badge/Open%20Portal-Telekom%20AI%20KB-e20074?style=for-the-badge" alt="Open Portal">
  </a>
</p>

---

## 📘 Projekt áttekintése

A **Telekom AI Knowledge Base** célja egy egységes, AI‑kompatibilis tudásrendszer kialakítása, amely támogatja:

- ✅ RAG alapú keresést  
- ✅ EIE entitáskinyerést  
- ✅ Tudásgráf építést  
- ✅ Copilot Studio integrációt  
- ✅ AIFS RAG pipeline feltöltést  
- ✅ Modernizációs AI elemzést  

A portál élő verziója:  
🔗 **https://rgt0.github.io/Telekom-AI-Knowledge-Base/**

---

## 📂 Könyvtárstruktúra

A tudásbázis három fő dokumentumkategóriára épül:
Telekom_AI_Knowledge_Base/
│
├── 00_MASTER/
│     └── DOCUMENTS/
│           ├── AI_Knowledge_Package_Master_with_APPENDIX.docx
│           ├── MASTER_RAG_FULL.json
│           ├── MASTER_entities.json
│           ├── MASTER_relations.json
│           ├── LibraryIndex_MASTER.xlsx
│           └── Meta_MASTER.txt
│
├── 01_WHITEPAPER/
│     ├── Whitepaper_RAG.json
│     ├── Whitepaper_entities.json
│     ├── Whitepaper_relations.json
│     ├── LibraryIndex_WHITEPAPER.xlsx
│     └── Meta_WHITEPAPER.txt
│
└── 02_TOOLS/
├── Tools_RAG.json
├── Tools_entities.json
├── Tools_relations.json
├── LibraryIndex_TOOLS.xlsx
└── Meta_TOOLS.txt

---

## 🔄 AI feldolgozási pipeline

A dokumentumok feldolgozása a következő AI‑modulokon keresztül történik:

1. **Bemenet előkészítése**
2. **RAG** – chunkolás + metaadatok
3. **EIE** – entitáskinyerés
4. **Relations** – tudásgráf kapcsolatok
5. **Index és meta fájlok**
6. **Telekom-kompatibilis publikálás**

---

## 🧩 Kimeneti fájlok

### ✅ RAG kimenet  
`*_RAG_FULL.json` – chunkokra bontott tartalom + metaadatok

### ✅ EIE entitások  
`*_entities.json` – felismert fogalmak listája

### ✅ Kapcsolati gráf  
`*_relations.json` – entitás–chunk–fejezet–use case háló

### ✅ Index  
`LibraryIndex_*.xlsx` – chunk–entitás–use case összerendelés

### ✅ Meta fájl  
`Meta_*.txt` – összefoglaló a feldolgozásról

---

## 🌐 GitHub Pages portál

A portál automatikusan épül és frissül a `main` branch alapján.

**Élő portál:**  
👉 https://rgt0.github.io/Telekom-AI-Knowledge-Base/

---

## 🛠 Fejlesztési lehetőségek

- Navigációs menü (sidebar + topbar)  
- MASTER / WHITEPAPER / TOOLS oldalak  
- AI-kereső modul  
- Dark Mode  
- Telekom logós fejléc  
- Interaktív tudásgráf nézet  

---

## © 2026 Telekom AI Knowledge Base
