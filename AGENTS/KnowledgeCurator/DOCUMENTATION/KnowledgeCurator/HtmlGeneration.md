## Example: HTML Page Generation

### Source Document

```text
AI Tool User Guide.docx
```

### Agent Analysis

The agent reads the source document and extracts:

- title
- purpose
- audience
- key concepts
- structure

Example:

```yaml
title: Browser AI
category: Tool
audience: Employees
topic: Automation
```

---

### Knowledge Transformation

The agent does not copy the document.

Instead, it transforms the document into Knowledge Base content.

```text
Source Document
        ↓
Document Analysis
        ↓
Knowledge Extraction
        ↓
Page Structure Selection
        ↓
HTML Generation
```

---

### Selected Page Template

For a document classified as a Tool:

```text
Introduction

Purpose

Key Capabilities

Installation

Use Cases

Related Concepts
```

---

### Generated HTML Structure

```html
<section class="card">

  <h1>Browser AI</h1>

  <p>
    Browser AI is an AI-powered browser automation platform.
  </p>

</section>

<section class="card">

  <h2>Key Capabilities</h2>

  <ul>
    <li>Browser Automation</li>
    <li>Marketplace</li>
    <li>Skill Builder</li>
  </ul>

</section>
```

---

### Generated Repository Assets

```text
pages/tools-browser-ai.html

BrowserAI_RAG.json

BrowserAI_entities.json

BrowserAI_relations.json

Meta_BrowserAI.txt
```

---

### Result

```text
Input

BrowserAI_UserManual.docx

        ↓

Knowledge Curator Agent

        ↓

Output

Knowledge Base Page

RAG Artifacts

Entity List

Relationship List
```

The output is no longer a document.

The output becomes a reusable Telekom AI Knowledge Base asset.
``
