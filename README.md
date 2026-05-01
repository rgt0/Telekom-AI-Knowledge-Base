# Telekom AI Knowledge Base
RAG / EIE / Tudásgráf – dokumentáció és UI portál
<p align="left">
  <a href="https://rgt0.github.io/Telekom-AI-Knowledge-Base/">
    <img src="https://img.shields.io/badge/Open%20Portal-Telekom%20AI%20KB-e20074?style=for-the-badge" alt="Open Portal">
  </a>
</p>

---

## 📘 Projekt áttekintése


A Telekom AI Knowledge Base célja egy egységes,
AI‑kompatibilis tudásrendszer kialakítása, amely támogatja:

- ✅ RAG alapú keresést  
- ✅ EIE entitáskinyerést  
- ✅ Tudásgráf építést  
- ✅ Copilot Studio integrációt  
- ✅ AIFS RAG pipeline feltöltést  
- ✅ Modernizációs AI elemzést  

A portál aktuális verziója:  
🔗 **https://rgt0.github.io/Telekom-AI-Knowledge-Base/**

---

## Kapcsolat az AIM / AIMC kezdeményezéssel

A Telekom AI Knowledge Base egy publikus, csak olvasásra szolgáló
tudásrétege egy szélesebb belső kezdeményezésnek, az
**AIM (AI Mindset & Competence)** programnak.

Az AIM egy belső, kontrollált program, amely jóváhagyott
vállalati környezetekben működik és STRIVE‑hoz igazodó
governance elveket követ. Fő fókuszai:

- AI műveltség és oktatás
- Felelős AI használat
- Strukturált kísérletezés
- STRIVE‑kompatibilis eszközhasználat

Ez a repository szándékosan nem tartalmaz privát projekt‑artefaktumokat.
Célja az orientáció, az átláthatóság és a közös megértés támogatása,
produktív hozzáférés biztosítása nélkül.

Az operatív elemek (pipeline‑ok, AI futtatókörnyezetek, governance)
egy külön, privát AIM projekt repóban és kontrollált környezetekben
kerülnek kezelésre.

A Knowledge Base az AIM koncepciók és artefaktumok
elsődleges belépési pontja.
``

## 📂 Könyvtárstruktúra

A Telekom AI Knowledge Base három fő tartalmi rétegre épül,
amelyek az AI tudás életciklusának eltérő szerepeit támogatják.
## 📂 Könyvtárstruktúra

A Telekom AI Knowledge Base három fő tartalmi rétegre épül,
amelyek az AI tudás életciklusának eltérő szerepeit támogatják.

### 🟦 00_MASTER – Kanonikus tudásalap
Hiteles, konszolidált referencia tartalom,
amely az AI feldolgozás elsődleges bemenete.

```text
00_MASTER/
└── DOCUMENTS/
    ├── AI_Knowledge_Package_Master_with_APPENDIX.docx
    ├── MASTER_RAG_FULL.json
    ├── MASTER_entities.json
    ├── MASTER_relations.json
    ├── LibraryIndex_MASTER.xlsx
    └── Meta_MASTER.txt
``
01_WHITEPAPER/
├── Whitepaper_RAG.json
├── Whitepaper_entities.json
├── Whitepaper_relations.json
├── LibraryIndex_WHITEPAPER.xlsx
└── Meta_WHITEPAPER.txt

02_TOOLS/
├── Tools_RAG.json
├── Tools_entities.json
├── Tools_relations.json
├── LibraryIndex_TOOLS.xlsx
└── Meta_TOOLS.txt 

### Hogyan érdemes olvasni a struktúrát?

- Kezdd a **00_MASTER** réteggel az alapok megértéséhez.
- A **01_WHITEPAPER** segít a koncepciók és összefüggések feltárásában.
- A **02_TOOLS** megmutatja a tudás és az eszközök kapcsolatát.``````


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

🔄 AI feldolgozási pipeline

A Telekom AI Knowledge Base 모든 dokumentuma
egy egységes, ismételhető AI feldolgozási pipeline-on keresztül halad,
biztosítva az egységességet, átláthatóságot és újrahasznosíthatóságot.

A pipeline célja, hogy az ember által olvasható dokumentumokat
strukturált, gépileg feldolgozható tudáselemekké alakítsa.

### 1. Bemenet előkészítése
A forrásdokumentumok összegyűjtése, ellenőrzése és
alap metaadatokkal való ellátása
(kategória, hatókör, forrás, cél).

### 2. RAG feldolgozás (chunkolás + metaadatok)
A dokumentumok szemantikailag értelmes egységekre (chunkokra)
bontása történik.  
Minden chunk olyan metaadatokat kap, amelyek támogatják:
- a visszakeresést,
- a szűrést,
- a kontextus biztosítását AI rendszerek számára.

### 3. EIE – Entitás- és információkinyerés
A rendszer automatikusan felismeri a kulcsfontosságú entitásokat
(pl. fogalmak, rendszerek, eszközök, technológiák, témák).
Ez a lépés egységes fogalomkészletet hoz létre a tudásbázison belül.

### 4. Kapcsolatok létrehozása (Tudásgráf)
Az entitások és tartalmi egységek expliciten összekapcsolásra kerülnek:
- entitás ↔ entitás
- entitás ↔ chunk
- chunk ↔ fejezet
- chunk ↔ use case

Ez képezi a tudásgráf alapját, és támogatja az összefüggések
feltárását és az érvelést.

### 5. Indexek és metaadatok generálása
Indexek készülnek a következők leképezésére:
- chunk ↔ entitás kapcsolatok,
- entitás ↔ use case kapcsolatok,
- feldolgozási állapotok.

Ez a pipeline biztosítja, hogy ugyanaz a tudás
kereséshez, AI asszisztensekhez, elemzésekhez
és modernizációs felhasználásokhoz is újrahasznosítható legyen.


### 6. Telekom-kompatibilis publikálás
Az eredmény olyan formátumban kerül publikálásra, amely kompatibilis:
- RAG-alapú AI rendszerekkel,
- Copilot típusú asszisztensekkel,
- belső tudásportálokkal.

---

## 🧩 Kimeneti artefaktumok

### ✅ RAG kimenet
`*_RAG_FULL.json` – szemantikusan bontott (chunkokra) tartalom metaadatokkal

### ✅ EIE entitások
`*_entities.json` – felismert fogalmak és entitások listája

### ✅ Tudásgráf kapcsolatok
`*_relations.json` – entitás–chunk–fejezet–use case kapcsolatok

### ✅ Index
`LibraryIndex_*.xlsx` – chunk–entitás–use case összerendelések

### ✅ Meta fájl
`Meta_*.txt` – feldolgozási összefoglaló és statisztikák


---

## 🌐 GitHub Pages portál

A portál automatikusan frissül a `main` branch alapján.

Élő portál:
👉 https://rgt0.github.io/Telekom-AI-Knowledge-Base/

## 🛠 Fejlesztési lehetőségek

- Navigációs menü (sidebar + topbar)  
- MASTER / WHITEPAPER / TOOLS oldalak  
- AI-kereső modul  
- Dark Mode  
- Telekom logós fejléc  
- Interaktív tudásgráf nézet  
## Hogyan lehet bekapcsolódni az AIM kezdeményezésbe?

### Explore – Megismerés
A repository és a portál böngészése a koncepciók megértéséhez.

### Learn – Tanulás
AIMC alkalmakhoz való csatlakozás,
kuratált tananyagok használata.

### Contribute – Közreműködés
A privát AIM projektbe történő hozzájárulás
szerepkörhöz kötött, és onboardingot,
valamint governance jóváhagyást igényel.

Megjegyzés:
Közvetlen hozzáférés belső AI futtatókörnyezetekhez
(AIO/AIE), STRIVE környezetekhez vagy pipeline‑okhoz
nem történik ezen a repository‑n keresztül.
---

## © 2026 Telekom AI Knowledge Base
