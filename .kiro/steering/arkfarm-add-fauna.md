---
inclusion: manual
---

# ArkFarm — Adding New Fauna (Complete Workflow)

When the user provides fauna species, follow ALL steps below for EACH species. Do not skip any step. The site is at https://nakmuthu.github.io/arkfarm/ from GitHub repo `nakmuthu/arkfarm` (branch: `main`).

## Step 0: Determine Category & Slug

### Fauna Categories
| Category | Folder | Category Page |
|----------|--------|---------------|
| Insects & Pollinators | `fauna/insects-pollinators/` | `categories/insects-pollinators.html` |
| Birds | `fauna/birds/` | `categories/birds.html` |
| Reptiles & Amphibians | `fauna/reptiles-amphibians/` | `categories/reptiles-amphibians.html` |
| Mammals | `fauna/mammals/` | `categories/mammals.html` |
| Arachnids | `fauna/arachnids/` | `categories/arachnids.html` |
| Soil & Decomposers | `fauna/soil-decomposers/` | `categories/soil-decomposers.html` |
| Aquatic Fauna | `fauna/aquatic-fauna/` | `categories/aquatic-fauna.html` |

### Slug Convention
Lowercase, hyphens for spaces, use common name.
- "Papilio demoleus" → `lime-butterfly`
- "Halyomorpha halys" → `brown-marmorated-stink-bug`

## Step 1: Research the Species

Use web search to gather accurate information:
- Scientific name, family, order
- Common names and local Tamil name
- Pest status: **Pest** / **Beneficial** / **Neutral**
- Danger level: **None** / **Low** / **Medium** / **High**
- Identification (appearance, size, colour, distinguishing features)
- Habitat and behaviour
- Diet and lifecycle
- Orchard impact (crops affected, damage description, benefit)
- Prevention & control methods (if pest or dangerous)
- Conservation notes (if beneficial)

Reference credible sources: Wikipedia, university extension services, entomology databases.

## Step 2: Add Image

Copy image to:
```
images/categories/fauna/<category-folder>/<slug>.jpg
```
If images are provided with scientific names, rename to slug when copying.

## Step 3: Create the Species HTML Page

File: `fauna/<category-folder>/<slug>.html`

Use `#[[file:fauna/insects-pollinators/wandering-violin-mantis.html]]` as the reference template.

### CRITICAL — Required for Tamil translation:
- `<body data-fauna="SLUG">` — this triggers per-species Tamil translation loading (equivalent of `data-plant` for flora)
- ALL text labels must have `data-i18n="key_name"` attributes
- ALL text values must have `data-i18n="key_name_val"` attributes
- Badges must have `data-i18n="badge_*"` attributes
- Breadcrumb category link must have `data-i18n` for the category name

### Required HTML structure:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>COMMON_NAME - SCIENTIFIC_NAME | ArkFarm</title>
  <meta name="description" content="One sentence description — this becomes the category card description.">
  <link rel="canonical" href="https://nakmuthu.github.io/arkfarm/fauna/CATEGORY/SLUG.html">
  <link rel="stylesheet" href="../../css/style.css?v=2">
</head>
<body data-fauna="SLUG">
  <div id="site-header"></div>
  <div class="container">
    <div class="breadcrumb">
      <a href="../../index.html" data-i18n="home">Home</a> /
      <a href="../../categories/CATEGORY.html" data-i18n="CATEGORY_I18N_KEY">Category Name</a> /
      <span data-i18n="fauna_name">COMMON_NAME</span>
    </div>
    ...
  </div>
  <div id="site-footer"></div>
  <script src="../../js/i18n.js?v=2"></script>
  <script src="../../js/components.js?v=7"></script>
  <script src="../../js/nav.js?v=2"></script>
</body>
</html>
```

### Status Badges (with data-i18n):
```html
<div style="display:flex;gap:8px;flex-wrap:wrap;margin:10px 0;">
  <span style="background:#ffebee;color:#c62828;..." data-i18n="badge_pest">🚨 Pest</span>
  <span style="background:#e8f5e9;color:#2e7d32;..." data-i18n="badge_beneficial">✅ Beneficial</span>
  <span style="background:#e3f2fd;color:#1565c0;..." data-i18n="badge_neutral">🔵 Neutral</span>
  <span style="background:#fff3e0;color:#e65100;..." data-i18n="badge_low_risk">⚠️ Low Risk</span>
  <span style="background:#fff3e0;color:#e65100;..." data-i18n="badge_medium_risk">⚠️ Medium Risk</span>
  <span style="background:#fce4ec;color:#880e4f;..." data-i18n="badge_do_not_handle">🩸 Do Not Handle</span>
  <span style="background:#fce4ec;color:#880e4f;..." data-i18n="badge_invasive">🌍 Invasive</span>
  <span style="background:#f3e5f5;color:#6a1b9a;..." data-i18n="badge_ecosystem">🌿 Ecosystem Indicator</span>
  <span style="..." data-i18n="badge_pest_larva">🚨 Pest (Larva)</span>
  <span style="..." data-i18n="badge_pollinator">✅ Pollinator (Adult)</span>
  <span style="..." data-i18n="badge_beneficial_predator">🔵 Beneficial Predator</span>
</div>
```

### Required Sections (use `<details>` with `data-i18n` on `<summary>`):

| Section | data-i18n key | Always Include? |
|---------|--------------|----------------|
| 🔍 Identification | `identification` | Always |
| 🌿 Habitat & Behaviour | `habitat_behaviour` | Always |
| 🔄 Lifecycle | `lifecycle` | Always |
| 🌾 Orchard Impact | `orchard_impact` | Always |
| 🛡️ Pest Status & Safety | `pest_status_safety` | Always |
| 🚫 Prevention & Control | `prevention_control` | Pests and dangerous species only |
| ✅ Conservation & Encouragement | `conservation` | Beneficial species only |
| 📝 Observation Notes | `observation_notes` | Always |

### Table row label data-i18n keys:
`appearance`, `colour`, `distinguishing_features`, `similar_species`, `sound`, `eggs_label`, `larva_appearance`, `pupa`, `adult_appearance`, `habitat`, `behaviour`, `activity_pattern`, `diet`, `seasonal_presence`, `host_plants`, `egg_stage`, `nymph_stage`, `larval_stage`, `pupal_stage`, `adult_stage`, `generations_per_year`, `overwintering`, `impact_type`, `crops_affected`, `damage_description`, `damage_severity`, `benefit`, `ecosystem_role`, `pest_classification`, `danger_to_humans`, `danger_to_livestock`, `disease_risk`, `invasive_status`, `physical_control`, `pheromone_traps`, `biological_control`, `organic_sprays`, `threshold`, `early_warning_signs`, `personal_protection`, `habitat_management`, `night_work`, `if_bitten`, `lighting`, `control_needed`, `how_to_encourage`, `threats`, `conservation_status`, `significance`, `risk`

### Value keys (on `<td>` elements):
Same as label keys but with `_val` suffix: `appearance_val`, `habitat_val`, `diet_val`, etc.

### Key-grid label keys:
`common_names`, `local_name`, `family`, `order`, `size`, `wingspan`, `activity`

### Key-grid value keys:
Same with `_val` suffix: `common_names_val`, `local_name_val`, `family_val`, `order_val`, `size_val`, `wingspan_val`, `activity_val`

## Step 4: Generate Tamil Translation File

After creating the HTML page, run:
```bash
node scripts/generate-fauna-translations.js --slug <slug>
```
This script:
- Reads all `data-i18n="*_val"` elements from the HTML page
- Translates each value individually to Tamil
- Creates `data/i18n-fauna-<slug>.json` with `fauna_name` + all `_val` keys

## Step 5: Sync to Global Tamil Dict

Run:
```bash
node scripts/sync-fauna-global.js
```
This syncs `fauna_name_<slug>` and `fauna_desc_<slug>` keys to `data/i18n-ta.json` so category card names and descriptions translate correctly.

**IMPORTANT:** If you add a new species, add its entry to the `SPECIES` array in `scripts/sync-fauna-global.js` before running.

## Step 6: Update the Category Page

Edit `categories/<category>.html` to add a card with `data-i18n` attributes:

```html
<a class="card" href="../fauna/CATEGORY/SLUG.html">
  <img src="../images/categories/fauna/CATEGORY/SLUG.jpg" alt="COMMON_NAME">
  <div class="card-body">
    <h3 data-i18n="fauna_name_SLUG" data-en="COMMON_NAME">COMMON_NAME</h3>
    <p><em>SCIENTIFIC_NAME</em></p>
    <p style="margin-top:4px;">
      <span class="status-badge badge-pest" data-i18n="badge_pest">🚨 Pest</span>
    </p>
    <p style="font-size:12px;color:#555;margin-top:4px;" data-i18n="fauna_desc_SLUG" data-en="One-line description.">One-line description.</p>
  </div>
</a>
```

Add this CSS to the category page `<style>` block if not already present:
```css
.status-badge { display:inline-block; padding:2px 8px; border-radius:12px; font-size:11px; font-weight:600; margin-right:4px; }
.badge-pest       { background:#ffebee; color:#c62828; }
.badge-beneficial { background:#e8f5e9; color:#2e7d32; }
.badge-neutral    { background:#e3f2fd; color:#1565c0; }
.badge-danger     { background:#fff3e0; color:#e65100; }
.badge-high       { background:#fce4ec; color:#880e4f; }
```

## Step 7: Update Homepage Counts

Run:
```bash
node scripts/update-fauna-counts.js
```
This updates:
- Per-category fauna species counts (`data-fauna-count` on homepage)
- Total flora and fauna counts in the hero section

## Step 8: Push to GitHub

```bash
git add -A
git commit -m "Add fauna: COMMON_NAME (SCIENTIFIC_NAME)"
git push origin main
```

## Quick Checklist Per Species

- [ ] Research species from credible sources
- [ ] Copy image to `images/categories/fauna/<category>/<slug>.jpg`
- [ ] Create `fauna/<category>/<slug>.html` with `data-fauna="SLUG"` on body and `data-i18n` on ALL text elements
- [ ] Use ONLY standard data-i18n keys from the list above
- [ ] Add status badges with `data-i18n="badge_*"` attributes
- [ ] Include Prevention & Control section for pests/dangerous species
- [ ] Include Conservation section for beneficial species
- [ ] Run `node scripts/generate-fauna-translations.js --slug <slug>` to create Tamil translation file
- [ ] Add species to `scripts/sync-fauna-global.js` SPECIES array, then run `node scripts/sync-fauna-global.js`
- [ ] Update `categories/<category>.html` with new card (with `data-i18n` + `data-en` on name and description)
- [ ] Run `node scripts/update-fauna-counts.js` to update homepage counts
- [ ] `git add -A && git commit -m "..." && git push origin main`

## Utility Scripts

| Script | Purpose | When to run |
|--------|---------|-------------|
| `node scripts/generate-fauna-translations.js --slug <slug>` | Creates per-species Tamil translation file `data/i18n-fauna-<slug>.json` | After creating each fauna HTML page |
| `node scripts/generate-fauna-translations.js` | Processes ALL fauna pages (no --slug filter) | For bulk additions |
| `node scripts/sync-fauna-global.js` | Syncs `fauna_name_*` and `fauna_desc_*` to global Tamil dict | After generating translations |
| `node scripts/add-fauna-i18n.js` | Adds new fauna label keys to global Tamil dict | Only when adding new section/label types |
| `node scripts/update-fauna-counts.js` | Updates homepage fauna counts and flora/fauna totals | After adding/removing fauna species |

## File Structure

```
fauna/
  insects-pollinators/<slug>.html
  birds/<slug>.html
  reptiles-amphibians/<slug>.html
  mammals/<slug>.html
  arachnids/<slug>.html
  soil-decomposers/<slug>.html
  aquatic-fauna/<slug>.html

images/categories/fauna/
  insects-pollinators/<slug>.jpg
  birds/<slug>.jpg
  ...

data/
  i18n-fauna-<slug>.json     # Per-species Tamil translations
  i18n-ta.json               # Global Tamil dict (fauna_name_*, fauna_desc_*, badges, labels)
```

## How Tamil Translation Works for Fauna

1. `<body data-fauna="SLUG">` tells `i18n.js` to load `data/i18n-fauna-<slug>.json`
2. The i18n engine translates all elements with `data-i18n` attributes using:
   - Per-species dict (`i18n-fauna-<slug>.json`) for `_val` keys — checked first
   - Global dict (`i18n-ta.json`) for label keys, badges, category names — checked second
3. Category card names use `fauna_name_<slug>` and descriptions use `fauna_desc_<slug>` from the global dict
4. The engine auto-captures English text as `data-en` on first run if not explicitly set

## Pest Status Badge Guide

| Status | data-i18n key | When to use |
|--------|--------------|-------------|
| 🚨 Pest | `badge_pest` | Damages crops or structures |
| ✅ Beneficial | `badge_beneficial` | Predator, pollinator, decomposer |
| 🔵 Neutral | `badge_neutral` | Neither harmful nor helpful |
| ⚠️ Low Risk | `badge_low_risk` | Minor bite/sting risk |
| ⚠️ Medium Risk | `badge_medium_risk` | Moderate crop/bite risk |
| 🩸 Do Not Handle | `badge_do_not_handle` | Serious bite, sting, or disease risk |
| 🌍 Invasive | `badge_invasive` | Non-native, spreading |
| 🌿 Ecosystem Indicator | `badge_ecosystem` | Signals healthy environment |
| 🚨 Pest (Larva) | `badge_pest_larva` | Pest only in larval stage |
| ✅ Pollinator (Adult) | `badge_pollinator` | Beneficial only as adult |
| 🔵 Beneficial Predator | `badge_beneficial_predator` | Predator of pest insects |

## Reference Template

Use `#[[file:fauna/insects-pollinators/wandering-violin-mantis.html]]` as the reference template for new fauna species pages.
