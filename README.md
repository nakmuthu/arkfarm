# 🌳 ArkFarm - Digital Biodiversity Orchard

A static, mobile-friendly website documenting plants, trees, and flowers in our orchard. Built with pure HTML/CSS/JS — no backend required.

**Live Site:** [https://nakmuthu.github.io/arkfarm/](https://nakmuthu.github.io/arkfarm/)
**Print Tags:** [https://nakmuthu.github.io/arkfarm/print-tags.html](https://nakmuthu.github.io/arkfarm/print-tags.html)

## Features

- Mobile-responsive green theme with sticky header
- 9 plant categories (Fruit Trees, Spices & Herbs, Medicinal Plants, Flowering Plants, Vegetables, Greens, Cactus, Ornamental Plants, Timber Trees)
- Individual plant pages with collapsible detail sections
- Client-side search (by name, scientific name, local names, keywords)
- English/Tamil bilingual toggle — section headers, labels, and content all translate
- Floating share button (native share on mobile, copy link on desktop)
- Printable name tags with QR codes, category filter, Tamil toggle, selection UI
- SEO-friendly with JSON-LD structured data
- Images from Wikimedia Commons

## Adding New Plants

### Step 1: Create the plant HTML page

File: `plants/<category>/<slug>.html`

Use `plants/fruit-trees/passion-fruit.html` as the reference template. Required:
- `<body data-plant="SLUG">` — triggers Tamil translation
- `<script src="../../js/i18n.js"></script>` before `components.js`
- `data-i18n` on ALL `<summary>`, `<strong>` labels, and value `<td>` cells
- Use ONLY standard i18n keys (see steering file for full list)
- **Do NOT add Photo Gallery** — add manually later
- No placeholder image paths (`../../images/plants/...`)

### Step 2: Run the master script

```bash
node scripts/add-plant.js           # process all new/changed plants
node scripts/add-plant.js --push    # also push to GitHub
node scripts/add-plant.js --slug champak --push  # single plant
```

This handles everything automatically:
- Fetches Wikimedia images
- Generates Tamil translations (batched Google Translate)
- Updates `data/plants.json` search index
- Enriches search keywords with local names
- Rebuilds all category pages
- Updates homepage species counts
- Rebuilds print tags
- Validates i18n
- Optionally pushes to GitHub

## Project Structure

```
arkfarm/
├── index.html                    # Homepage
├── search.html                   # Search page
├── print-tags.html               # Printable name tags
├── css/style.css                 # Global styles
├── js/
│   ├── i18n.js                   # Translation engine
│   ├── components.js             # Shared header/footer + share button
│   ├── nav.js                    # Mobile hamburger menu
│   └── search.js                 # Client-side search
├── data/
│   ├── plants.json               # Search index (all plants)
│   ├── i18n-ta.json              # Global Tamil translations (labels, nav, UI)
│   └── i18n-ta-<slug>.json       # Per-plant Tamil translations
├── categories/                   # Category listing pages (auto-generated)
├── plants/
│   ├── fruit-trees/
│   ├── spices-herbs/
│   ├── medicinal-plants/
│   ├── flowering-plants/
│   ├── timber-trees/
│   ├── vegetables/
│   ├── greens/
│   ├── cactus/
│   └── ornamental-plants/
├── scripts/
│   ├── add-plant.js              # ⭐ Master script — run after creating new plant pages
│   ├── generate-category-pages.js
│   ├── generate-print-tags.js
│   ├── update-homepage-counts.js
│   ├── validate-i18n.js
│   ├── enrich-search-index.js
│   ├── fix-all-images.js         # Re-fetch all images with category-aware scoring
│   ├── fix-missing-i18n-labels.js # Fix pages missing data-i18n on labels
│   ├── add-i18n-attrs.js         # Add data-i18n to value cells
│   └── translate-small-batch.js  # Manual Tamil translation runner
└── archive/                      # Unused scripts and docs (to be deleted)
```

## Translation System

- Global labels: `data/i18n-ta.json` (section headers, table row labels, nav, UI)
- Per-plant content: `data/i18n-ta-<slug>.json` (all value cells, plant name)
- Engine: `js/i18n.js` detects `data-plant` on `<body>` and loads the matching file
- Language persists via `localStorage`
- 5 hand-crafted files with high-quality translations (passion-fruit, malkova-mango, paneer-rose, moringa-tree, jasmine)
- Remaining files auto-translated via Google Translate API

## i18n Key Reference

### Section headers (summary elements)
`botanical_desc`, `growing_conditions`, `cultivation_care`, `flowering_fruiting`, `pollination_propagation`, `environmental_impact`, `economic_importance`, `cultural_significance`, `nutritional_info`, `medicinal_uses`, `observation_notes`

### Table row labels
`growth_habit`, `plant_size`, `leaves`, `flowers`, `flower_characteristics`, `fruit`, `fruit_color`, `seed_characteristics`, `root_system`, `climate`, `temperature_range`, `rainfall`, `soil_type`, `soil_ph`, `sun_requirement`, `spacing`, `irrigation`, `water_requirement`, `can_grow_pots`, `fertilizer_schedule`, `organic_fertilizers`, `pesticide_frequency`, `organic_pesticides`, `mulching`, `training_system`, `pruning_time`, `how_to_prune`, `common_pests`, `common_diseases`, `disease_prevention`, `flowering_months`, `fruiting_season`, `days_to_harvest`, `harvest_indicators`, `avg_yield`, `pollination_type`, `pollination_notes`, `pollination_details`, `prop_seeds`, `prop_cuttings`, `prop_grafting`, `water_usage`, `soil_conservation`, `organic_practices`, `companion_plants`, `biodiversity`, `commercial_regions`, `market_uses`, `processing_uses`, `market_value`, `symbolism`, `traditional_uses`, `calories`, `dietary_fiber`, `vitamin_c`, `vitamin_a`, `iron`, `potassium`, `antioxidants`, `other_nutrients`, `anxiety_sleep`, `immune_support`, `anti_inflammatory`, `heart_health`, `digestive_health`

### Key-grid labels
`common_names`, `local_name`, `family`, `origin`, `plant_type`, `variety`, `avg_lifespan`

### Value keys (per-plant)
Same as label keys with `_val` suffix: `growth_habit_val`, `climate_val`, etc.

## Deployment

Hosted via GitHub Pages from the `main` branch.
Settings → Pages → Source: Deploy from branch → main / root.

## Categories

| Category | Folder | Count |
|----------|--------|-------|
| Fruit Trees | `plants/fruit-trees/` | 100 |
| Spices & Herbs | `plants/spices-herbs/` | 14 |
| Flowering Plants | `plants/flowering-plants/` | 5 |
| Medicinal Plants | `plants/medicinal-plants/` | 1 |
| Timber Trees | `plants/timber-trees/` | 1 |
| Vegetables | `plants/vegetables/` | 0 |
| Greens | `plants/greens/` | 0 |
| Cactus | `plants/cactus/` | 0 |
| Ornamental Plants | `plants/ornamental-plants/` | 0 |
