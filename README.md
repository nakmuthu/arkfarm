# 🌳 ArkFarm - Digital Biodiversity Orchard

A static, mobile-friendly website documenting plants, trees, and flowers in our orchard. Built with pure HTML/CSS/JS — no backend required.

**Live Site:** [https://nakmuthu.github.io/arkfarm/](https://nakmuthu.github.io/arkfarm/)

## Features
- Mobile-responsive green theme
- 8 plant categories (Fruit Trees, Medicinal Plants, Flowering Plants, Vegetables, Greens, Cactus, Ornamental Plants, Timber Trees)
- Individual plant pages with collapsible detail sections
- Client-side search across all plants
- English/Tamil bilingual support with one-click toggle
- SEO-friendly with JSON-LD structured data
- QR-code ready clean URLs
- Images from Wikimedia Commons (no storage cost)

## Project Structure
```
arkfarm/
├── index.html                    # Homepage
├── search.html                   # Search page
├── css/style.css                 # Global styles
├── js/
│   ├── i18n.js                   # Translation engine (English/Tamil)
│   ├── components.js             # Shared header/footer with lang toggle
│   ├── nav.js                    # Mobile hamburger menu
│   └── search.js                 # Client-side search
├── data/
│   ├── plants.json               # Search index (all plants)
│   ├── i18n-ta.json              # Global Tamil translations (labels)
│   └── i18n-ta-<slug>.json       # Per-plant Tamil translations
├── categories/
│   ├── fruit-trees.html
│   ├── medicinal-plants.html
│   ├── flowering-plants.html
│   ├── vegetables.html
│   ├── greens.html
│   ├── cactus.html
│   ├── ornamental-plants.html
│   └── timber-trees.html
└── plants/
    ├── fruit-trees/
    │   ├── passion-fruit.html
    │   └── malkova-mango.html
    ├── flowering-plants/
    │   ├── paneer-rose.html
    │   └── jasmine.html
    └── medicinal-plants/
        └── moringa-tree.html
```

## Adding a New Plant

For each new plant, you need to create/update 4 files:

### 1. Plant HTML page
Create `plants/<category>/<slug>.html` using an existing plant page as template. Must include:
- `<body data-plant="<slug>">` for Tamil translation loading
- `<script src="../../js/i18n.js"></script>` before components.js
- All `data-i18n` attributes on labels AND values
- Wikimedia Commons images (use Wikipedia media API for verified URLs)
- SEO meta tags and JSON-LD

### 2. Tamil translation file
Create `data/i18n-ta-<slug>.json` with all translated content values. Transliterate English terms into Tamil script when no Tamil word exists.

### 3. Search index
Add entry to `data/plants.json`:
```json
{
  "name": "Plant Name",
  "scientific": "Scientific Name",
  "category": "Category Name",
  "url": "/arkfarm/plants/<category>/<slug>.html",
  "keywords": ["keyword1", "keyword2"],
  "description": "Short description."
}
```

### 4. Category page
Add a card to `categories/<category>.html` inside the `.card-grid` div.

## Translation System

- Global labels: `data/i18n-ta.json` (section headers, table row labels, nav)
- Per-plant content: `data/i18n-ta-<slug>.json` (all value cells)
- Engine: `js/i18n.js` detects `data-plant` attribute on `<body>` and loads the matching file
- Language persists via `localStorage`

## Deployment
Hosted via GitHub Pages from the `main` branch. Go to Settings → Pages → Source: Deploy from branch → main / root.

## Categories
| Category | Folder | Plants |
|----------|--------|--------|
| Fruit Trees | `plants/fruit-trees/` | Passion Fruit, Malkova Mango |
| Medicinal Plants | `plants/medicinal-plants/` | Moringa Tree |
| Flowering Plants | `plants/flowering-plants/` | Paneer Rose, Jasmine |
| Vegetables | `plants/vegetables/` | (coming soon) |
| Greens | `plants/greens/` | (coming soon) |
| Cactus | `plants/cactus/` | (coming soon) |
| Ornamental Plants | `plants/ornamental-plants/` | (coming soon) |
| Timber Trees | `plants/timber-trees/` | (coming soon) |
