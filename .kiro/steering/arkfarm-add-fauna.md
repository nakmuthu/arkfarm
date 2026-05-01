---
inclusion: manual
---

# ArkFarm — Adding New Fauna (Complete Workflow)

When the user provides fauna species, follow ALL steps below. The site is at https://nakmuthu.github.io/arkfarm/ from GitHub repo `nakmuthu/arkfarm` (branch: `main`).

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

### Image Location
```
images/categories/fauna/<category-folder>/<slug>.jpg
```
If images are provided with scientific names, rename to slug when copying.

## Step 1: Research the Species

Gather accurate information:
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
- Cultural significance

## Step 2: Add Image

Copy image to:
```
images/categories/fauna/<category-folder>/<slug>.jpg
```

## Step 3: Create the Species HTML Page

File: `fauna/<category-folder>/<slug>.html`

### Required HTML structure:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>COMMON_NAME - SCIENTIFIC_NAME | ArkFarm</title>
  <meta name="description" content="One sentence description.">
  <link rel="canonical" href="https://nakmuthu.github.io/arkfarm/fauna/CATEGORY/SLUG.html">
  <link rel="stylesheet" href="../../css/style.css?v=2">
</head>
<body>
  <div id="site-header"></div>
  <div class="container">
    <div class="breadcrumb">
      <a href="../../index.html" data-i18n="home">Home</a> /
      <a href="../../categories/CATEGORY.html">CATEGORY_NAME</a> / COMMON_NAME
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

### Status Badges (always include at top of top-card):
```html
<div style="display:flex;gap:8px;flex-wrap:wrap;margin:10px 0;">
  <!-- Choose appropriate badges: -->
  <span style="background:#ffebee;color:#c62828;padding:4px 12px;border-radius:20px;font-size:13px;font-weight:600;">🚨 Pest</span>
  <span style="background:#e8f5e9;color:#2e7d32;padding:4px 12px;border-radius:20px;font-size:13px;font-weight:600;">✅ Beneficial</span>
  <span style="background:#e3f2fd;color:#1565c0;padding:4px 12px;border-radius:20px;font-size:13px;font-weight:600;">🔵 Neutral</span>
  <span style="background:#fff3e0;color:#e65100;padding:4px 12px;border-radius:20px;font-size:13px;font-weight:600;">⚠️ Low Risk</span>
  <span style="background:#fff3e0;color:#e65100;padding:4px 12px;border-radius:20px;font-size:13px;font-weight:600;">⚠️ Medium Risk</span>
  <span style="background:#fce4ec;color:#880e4f;padding:4px 12px;border-radius:20px;font-size:13px;font-weight:600;">🩸 High Risk — Do Not Handle</span>
  <span style="background:#fce4ec;color:#880e4f;padding:4px 12px;border-radius:20px;font-size:13px;font-weight:600;">🌍 Invasive</span>
  <span style="background:#f3e5f5;color:#6a1b9a;padding:4px 12px;border-radius:20px;font-size:13px;font-weight:600;">🌿 Ecosystem Indicator</span>
</div>
```

### Required Sections (use `<details>` for all):

| Section | Summary | Always Include? |
|---------|---------|----------------|
| 🔍 Identification | Appearance, size, colour, distinguishing features, similar species | Always |
| 🌿 Habitat & Behaviour | Habitat, behaviour, activity pattern, diet, seasonal presence | Always |
| 🔄 Lifecycle | Egg/larva/nymph/adult stages, generations per year | Always |
| 🌾 Orchard Impact | Impact type, crops affected, damage/benefit description | Always |
| 🛡️ Pest Status & Safety | Pest classification, danger to humans/livestock, invasive status | Always |
| 🚫 Prevention & Control | Physical, biological, organic, cultural controls, early warning signs | **Pests and dangerous species only** |
| ✅ Conservation & Encouragement | How to encourage, threats, conservation status | **Beneficial species only** |
| 📝 Observation Notes | Free text field for field notes | Always |

### Key-grid fields (in top-card):
- Common Names
- Tamil Name
- Family
- Order
- Category
- Size / Wingspan
- Activity (Diurnal / Nocturnal / Both)

## Step 4: Update the Category Page

Edit `categories/<category>.html` to add a card for the new species:

```html
<a class="card" href="../fauna/CATEGORY/SLUG.html">
  <img src="../images/categories/fauna/CATEGORY/SLUG.jpg" alt="COMMON_NAME">
  <div class="card-body">
    <h3>COMMON_NAME</h3>
    <p><em>SCIENTIFIC_NAME</em></p>
    <p style="margin-top:4px;">
      <span class="status-badge badge-pest">🚨 Pest</span>
      <!-- or badge-beneficial, badge-neutral, badge-high -->
    </p>
    <p style="font-size:12px;color:#555;margin-top:4px;">One-line description.</p>
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

## Step 5: Push to GitHub

```bash
git add -A
git commit -m "Add fauna: COMMON_NAME (SCIENTIFIC_NAME)"
git push origin main
```

## File Structure

```
fauna/
  insects-pollinators/
  birds/
  reptiles-amphibians/
  mammals/
  arachnids/
  soil-decomposers/
  aquatic-fauna/

images/categories/fauna/
  insects-pollinators/
  birds/
  ...
```

## Quick Checklist Per Species

- [ ] Research species from credible sources
- [ ] Copy image to `images/categories/fauna/<category>/<slug>.jpg`
- [ ] Create `fauna/<category>/<slug>.html` with all sections
- [ ] Add status badges (Pest/Beneficial/Neutral + Risk level)
- [ ] Include Prevention & Control section for pests/dangerous species
- [ ] Include Conservation section for beneficial species
- [ ] Update `categories/<category>.html` with new card
- [ ] `git add -A && git commit -m "..." && git push origin main`

## Pest Status Badge Guide

| Status | When to use | Badge class |
|--------|------------|-------------|
| 🚨 Pest | Damages crops or structures | `badge-pest` |
| ✅ Beneficial | Predator, pollinator, decomposer | `badge-beneficial` |
| 🔵 Neutral | Neither harmful nor helpful | `badge-neutral` |
| ⚠️ Low/Medium Risk | Minor bite/sting risk | `badge-danger` |
| 🩸 High Risk | Serious bite, sting, or disease risk | `badge-high` |
| 🌍 Invasive | Non-native, spreading | `badge-high` |
| 🌿 Ecosystem Indicator | Signals healthy environment | `badge-beneficial` |

## Notes

- Fauna pages do NOT use `data-plant` attributes or Tamil i18n translation files
- No `add-plant.js` script for fauna — update category pages manually
- Images go under `images/categories/fauna/` not `images/categories/plants/`
- Fauna pages link to `categories/<fauna-category>.html` in breadcrumb
- The Fauna tab on the homepage links to these category pages
