---
inclusion: manual
---

# ArkFarm — Adding New Plants (Complete Workflow)

When the user provides plant names, follow ALL steps below for EACH plant. Do not skip any step. The site is at https://nakmuthu.github.io/arkfarm/ from GitHub repo `nakmuthu/arkfarm` (branch: `main`).

## Prerequisites

- Git is installed locally and can push to the repo
- Use git clone/push for bulk operations (much faster than GitHub API)
- For single plants, GitHub API (`mcp_github_create_or_update_file`) is fine
- Local workspace is at the user's current working directory
- Always keep local files in sync with GitHub

## Step 0: Determine Category & Slug

### Categories
| Category | Folder | Category Page |
|----------|--------|---------------|
| Fruit Trees | `plants/fruit-trees/` | `categories/fruit-trees.html` |
| Spices & Herbs | `plants/spices-herbs/` | `categories/spices-herbs.html` |
| Medicinal Plants | `plants/medicinal-plants/` | `categories/medicinal-plants.html` |
| Flowering Plants | `plants/flowering-plants/` | `categories/flowering-plants.html` |
| Vegetables | `plants/vegetables/` | `categories/vegetables.html` |
| Greens | `plants/greens/` | `categories/greens.html` |
| Cactus | `plants/cactus/` | `categories/cactus.html` |
| Ornamental Plants | `plants/ornamental-plants/` | `categories/ornamental-plants.html` |
| Timber Trees | `plants/timber-trees/` | `categories/timber-trees.html` |

If a plant fits multiple categories, pick the most prominent use. Coconut = Fruit Trees. Curry Leaf = Spices & Herbs. Ask the user if unclear.

### Slug Convention
Lowercase, hyphens for spaces, no special characters.
- "Mango - Miyazaki" → `mango-miyazaki`
- "Cherry - Barbados" → `cherry-barbados`
- "Herbal - Lemongrass" → `lemongrass`

## Step 1: Research the Plant

Before creating any files, gather accurate botanical information. Use web search to find:
- Scientific name and family
- Common names and local Tamil/Hindi names
- Botanical description (growth habit, size, leaves, flowers, fruit, seeds, roots)
- Growing conditions (climate, temperature, rainfall, soil, sun, spacing, irrigation)
- Cultivation & care (fertilizer, pesticides, mulching, pruning, pests, diseases)
- Flowering & fruiting (months, harvest indicators, yield, pollination)
- Propagation methods (seeds, cuttings, grafting)
- Economic importance (commercial regions, market uses, market value)
- Cultural significance
- Nutritional information (if edible)
- Medicinal uses (if applicable)

Reference credible sources: Wikipedia, university extension services (e.g., IIHR, TNAU, Kerala Agricultural University), FAO, botanical databases.

## Step 2: Add Hero Image

All plant images are stored locally — no external URLs (Wikimedia or otherwise).

### Image location:
```
images/categories/plants/<category-folder>/<slug>.jpg
```
Example: `images/categories/plants/fruit-trees/mango-miyazaki.jpg`

### Recommended image spec:
- Size: 800×600px (landscape, 4:3 ratio)
- Format: JPEG at ~80% quality (~100–150KB)
- Content: clear photo of the fruit, flower, or whole plant

### After adding the image file, run:
```bash
node scripts/use-local-images.js
```
This script automatically:
- Detects all images under `images/categories/plants/`
- Updates the hero `<img src>` in the plant HTML page (handles both plain and `data-plant` variants of the top-card div)
- Updates the card image in the relevant category page
- Updates the `"image"` field in `print-tags.html` inline JS data

**Do NOT hardcode image paths manually** — always run the script to ensure correct relative paths.

If no image is available yet, leave the hero `<img>` tag with an empty `src=""` or omit it entirely. Do NOT use external URLs.

## Step 3: Create the Plant HTML Page

File: `plants/<category-folder>/<slug>.html`

Use `#[[file:plants/fruit-trees/passion-fruit.html]]` as the reference template. The page MUST include:

### Required HTML structure:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PLANT_NAME - SCIENTIFIC_NAME | ArkFarm</title>
  <meta name="description" content="Complete guide to PLANT_NAME (SCIENTIFIC_NAME) at ArkFarm.">
  <meta name="keywords" content="keyword1, keyword2, keyword3">
  <link rel="canonical" href="https://nakmuthu.github.io/arkfarm/plants/CATEGORY/SLUG.html">
  <link rel="stylesheet" href="../../css/style.css">
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"Article","name":"PLANT_NAME","description":"...","url":"https://nakmuthu.github.io/arkfarm/plants/CATEGORY/SLUG.html"}
  </script>
</head>
<body data-plant="SLUG">
```

### Required elements:
- `<body data-plant="SLUG">` — triggers per-plant Tamil translation loading
- `<div id="site-header"></div>` at top, `<div id="site-footer"></div>` at bottom
- Scripts in this order at bottom: `i18n.js`, `components.js`, `nav.js`
- Breadcrumb with `data-i18n="home"` on Home link
- Hero image (if available) — Wikimedia URL, NO onerror attribute
- Key-grid with `data-i18n` on all `<strong>` labels AND `<span data-i18n="xxx_val">` on values
- All collapsible `<details>` sections with `data-i18n` on `<summary>`
- Every table `<strong>` label has `data-i18n="key_name"`
- Every value `<td>` has `data-i18n="key_name_val"`
- Photo gallery with Wikimedia images + attribution line — **DO NOT add Photo Gallery section; it will be added manually later**
- Disclaimer on medicinal section: `data-i18n="disclaimer"`
- Observation notes: `data-i18n="observation_placeholder"`

### Section headers and their data-i18n keys:
| Section | data-i18n key |
|---------|--------------|
| 🌿 Botanical Description | `botanical_desc` |
| ☀ Growing Conditions | `growing_conditions` |
| 🌾 Cultivation & Care | `cultivation_care` |
| 🌸 Flowering & Fruiting | `flowering_fruiting` |
| 🌱 Pollination & Propagation | `pollination_propagation` |
| 💧 Environmental Impact & Sustainability | `environmental_impact` |
| 💰 Economic Importance | `economic_importance` |
| 🌿 Cultural Significance | `cultural_significance` |
| 🍈 Nutritional Information | `nutritional_info` |
| 🌿 Medicinal Uses | `medicinal_uses` |
| 📝 Orchard Observation Notes | `observation_notes` |

**DO NOT include 📸 Photo Gallery section** — galleries will be added manually later.

**Omit sections not relevant** to the plant (e.g., no Nutritional Info for ornamental plants, no Flowering & Fruiting for non-flowering plants).

### Table row label data-i18n keys:
`growth_habit`, `plant_size`, `leaves`, `flowers`, `flower_characteristics`, `fruit`, `fruit_color`, `seed_characteristics`, `root_system`, `climate`, `temperature_range`, `rainfall`, `soil_type`, `soil_ph`, `sun_requirement`, `spacing`, `irrigation`, `water_requirement`, `can_grow_pots`, `fertilizer_schedule`, `organic_fertilizers`, `pesticide_frequency`, `organic_pesticides`, `mulching`, `training_system`, `pruning_time`, `how_to_prune`, `common_pests`, `common_diseases`, `disease_prevention`, `flowering_months`, `fruiting_season`, `days_to_harvest`, `harvest_indicators`, `avg_yield`, `pollination_type`, `pollination_notes`, `pollination_details`, `prop_seeds`, `prop_cuttings`, `prop_grafting`, `water_usage`, `soil_conservation`, `organic_practices`, `companion_plants`, `biodiversity`, `commercial_regions`, `market_uses`, `processing_uses`, `market_value`, `symbolism`, `traditional_uses`, `calories`, `dietary_fiber`, `vitamin_c`, `vitamin_a`, `iron`, `potassium`, `antioxidants`, `other_nutrients`, `anxiety_sleep`, `immune_support`, `anti_inflammatory`, `heart_health`, `digestive_health`

### Key-grid label keys:
`common_names`, `local_name`, `family`, `origin`, `plant_type`, `variety`, `avg_lifespan`

### Value keys (on `<td>` and `<span>` elements):
Same as label keys but with `_val` suffix: `growth_habit_val`, `climate_val`, `common_names_val`, etc.

## Step 4: Create Tamil Translation File

### Automated (preferred for bulk):
After creating the HTML page, run both scripts:
```bash
node scripts/generate-tamil.js
node scripts/generate-tamil-fallback.js
```
The first script handles pages with proper `data-i18n` attributes on value cells. The second catches any remaining pages.

### Manual (for higher quality translations):
Create file: `data/i18n-ta-<slug>.json`

Must contain:
- `plant_name` — Tamil name of the plant (use actual Tamil name if known, e.g., "தேங்காய்" for Coconut)
- `scientific_name` — Scientific name transliterated into Tamil script
- All `_val` keys matching every `data-i18n` attribute in the HTML page
- For English terms without Tamil equivalents, transliterate into Tamil script:
  - "Compost" → "கம்போஸ்ட்"
  - "Drip irrigation" → "டிரிப் இரிகேஷன்"
  - "Polyphenols" → "பாலிஃபீனால்கள்"
  - "Tropical" → "வெப்பமண்டல"
  - "Subtropical" → "துணை வெப்பமண்டல"

Alternatively, run the generation script: `node scripts/generate-tamil.js` (handles pages with proper data-i18n attributes) followed by `node scripts/generate-tamil-fallback.js` (handles remaining pages).

## Step 5: Update Search Index

File: `data/plants.json`

Add a new entry to the JSON array:
```json
{
  "name": "Plant Name",
  "scientific": "Scientific Name",
  "category": "Category Name",
  "url": "/arkfarm/plants/<category-folder>/<slug>.html",
  "keywords": ["keyword1", "keyword2", "local-tamil-name", "local-hindi-name"],
  "description": "One-line description of the plant."
}
```

Keywords should include: common names, local names (Tamil, Hindi), category-related terms, and distinctive features.

Then run the enrichment script to auto-extract common names and local names from the HTML pages into the keywords:
```bash
node scripts/enrich-search-index.js
```
This ensures search works with local names like "karuveppilai", "nimbu", "sahjan", etc.

## Step 6: Regenerate Category Page

Run the script to rebuild all category pages from plants.json:
```bash
node scripts/generate-category-pages.js
```

## Step 6b: Update Homepage Counts

Run the script to update species counts on the homepage:
```bash
node scripts/update-homepage-counts.js
```
This updates the hero total ("🌱 121 species documented") and per-category counts.

This auto-generates all category pages with correct plant cards. No manual editing needed.

## Step 7: Update Print Tags

Run the script to regenerate print-tags.html with all plants from plants.json:
```bash
node scripts/generate-print-tags.js
```
This auto-generates portrait ID card tags (54mm × 85.6mm) for every plant with:
- Hole punch space at top
- Hero image (extracted from each plant's HTML page)
- Plant name and scientific name
- QR code linking to the plant's page
- 🌳 ARKFARM logo

No manual editing needed — the script reads plants.json and each plant's HTML to build everything.

**IMPORTANT:** This script MUST be re-run whenever a plant's hero image is added or changed, otherwise the name tag will show the old/missing image.

## Step 8: Push to GitHub

### For bulk operations (multiple plants):
```bash
git clone https://github.com/nakmuthu/arkfarm.git /tmp/arkfarm-push
# Copy all changed files
cp -r plants/ /tmp/arkfarm-push/plants/
cp -r categories/ /tmp/arkfarm-push/categories/
cp -r data/ /tmp/arkfarm-push/data/
cp print-tags.html /tmp/arkfarm-push/
# Commit and push
git -C /tmp/arkfarm-push add .
git -C /tmp/arkfarm-push commit -m "Add new plants: Plant1, Plant2, ..."
git -C /tmp/arkfarm-push push origin main
rm -rf /tmp/arkfarm-push
```

### For single plant:
Use `mcp_github_create_or_update_file` for each file. For updating existing files (plants.json, category pages, print-tags.html), get the current sha first.

## Step 9: Validate

Run the validation script to catch i18n issues before pushing:
```bash
node scripts/validate-i18n.js
```
This checks every plant page for:
- `data-plant` attribute on `<body>` tag
- `i18n.js` script tag present
- No non-standard key formats (`section.*`, `label.*`, `plant.*`, `breadcrumb.*`)
- All `data-i18n` label keys exist in the global Tamil dictionary (`data/i18n-ta.json`)
- Tamil translation file exists with sufficient `_val` keys

If any new label keys are needed (e.g., a unique section like "Timber Qualities"), add them to `data/i18n-ta.json` with proper Tamil translations BEFORE pushing.

**CRITICAL RULES for data-i18n keys:**
- Section headers: use ONLY keys from the global dict (e.g., `botanical_desc`, `growing_conditions`)
- Table row labels: use ONLY standard keys (e.g., `growth_habit`, `climate`, `soil_type`)
- Value cells: use standard `_val` suffix keys (e.g., `growth_habit_val`, `climate_val`)
- NEVER invent new key formats like `section.growingConditions` or `plant.slug.keyName`
- If a plant needs a unique label not in the dict, add it to `data/i18n-ta.json` first

## Step 10: Push & Verify

After pushing, verify:
1. Plant page loads: `https://nakmuthu.github.io/arkfarm/plants/<category>/<slug>.html`
2. Search finds the plant: `https://nakmuthu.github.io/arkfarm/search.html`
3. Category page shows the card: `https://nakmuthu.github.io/arkfarm/categories/<category>.html`
4. Tamil toggle works on the plant page
5. Images load correctly (no broken icons)

## Quick Checklist Per Plant

- [ ] Research plant info from credible sources
- [ ] Create `plants/<category>/<slug>.html` with full content and all data-i18n attributes (NO photo gallery)
- [ ] Use ONLY standard data-i18n keys (never invent section.*, label.*, plant.* formats)
- [ ] Run `node scripts/add-plant.js` — handles everything else automatically:
  - Generates Tamil translations (batched Google Translate)
  - Updates search index
  - Enriches search keywords
  - Rebuilds category pages
  - Updates homepage counts
  - Rebuilds print tags
  - Validates i18n
- [ ] Add image file to `images/categories/plants/<category>/<slug>.jpg` and run `node scripts/use-local-images.js`
- [ ] Run `node scripts/add-plant.js --push` to also auto-push to GitHub

## Recommended Order for Bulk Additions

When adding multiple plants at once:
1. Create all HTML plant pages first
2. Run `node scripts/add-plant.js --push`

That's it — the master script handles all remaining steps in one command.

## File Reference

| Purpose | Path |
|---------|------|
| Global CSS | `css/style.css` |
| i18n engine | `js/i18n.js` |
| Shared header/footer | `js/components.js` |
| Mobile nav | `js/nav.js` |
| Search engine | `js/search.js` |
| Global Tamil dict | `data/i18n-ta.json` |
| Search index | `data/plants.json` |
| Per-plant Tamil | `data/i18n-ta-<slug>.json` |
| Plant pages | `plants/<category>/<slug>.html` |
| Category pages | `categories/<category>.html` |
| Print tags | `print-tags.html` |
| Homepage | `index.html` |
| Search page | `search.html` |
| Tamil generator | `scripts/generate-tamil.js` |
| Tamil fallback generator | `scripts/generate-tamil-fallback.js` |
| Category page generator | `scripts/generate-category-pages.js` |
| Image cleanup | `scripts/fix-images.js` |
| Reference template | `plants/fruit-trees/passion-fruit.html` |

## Utility Scripts

| Script | Purpose | When to run |
|--------|---------|-------------|
| `node scripts/enrich-search-index.js` | Extracts common/local names from HTML into search keywords | After adding plants to plants.json |
| `node scripts/use-local-images.js` | Updates hero, category card, and name tag image paths from local image files | After adding/replacing images under `images/categories/plants/` |
| `node scripts/generate-category-pages.js` | Rebuilds ALL category pages from plants.json | After adding/removing plants from plants.json |
| `node scripts/update-homepage-counts.js` | Updates species counts on homepage | After adding/removing plants |
| `node scripts/generate-print-tags.js` | Rebuilds print-tags.html with all plants and images | After adding plants, changing images, or any hero image update |
| `node scripts/generate-tamil.js` | Generates Tamil files for pages with data-i18n on values | After creating new plant HTML pages |
| `node scripts/generate-tamil-fallback.js` | Generates Tamil files for remaining pages | After generate-tamil.js if some pages still missing |
| `node scripts/validate-i18n.js` | Validates all pages use standard i18n keys | After creating new plant pages, BEFORE pushing |
