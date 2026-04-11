# Category Page Card Translation Fix

## Problem
Category page cards (plant names, scientific names, descriptions) were hardcoded in English and not translating to Tamil when users toggled the language.

## Solution
Made category page cards translatable by:

### 1. Updated `scripts/generate-category-pages.js`
- Added `data-i18n` attributes to all card content (h3, em, p tags)
- Added `data-en` attributes to preserve English text for fallback
- Generated translation keys in format: `plant_name_<slug>`, `plant_scientific_<slug>`, `plant_desc_<slug>`

### 2. Regenerated all category pages
- Ran `node scripts/generate-category-pages.js`
- All 9 category pages now have i18n-enabled cards:
  - categories/fruit-trees.html (100 plants)
  - categories/spices-herbs.html (14 plants)
  - categories/medicinal-plants.html (1 plant)
  - categories/flowering-plants.html (2 plants)
  - categories/timber-trees.html (1 plant)
  - categories/vegetables.html (0 plants)
  - categories/greens.html (0 plants)
  - categories/cactus.html (0 plants)
  - categories/ornamental-plants.html (0 plants)

### 3. Created `scripts/generate-plant-card-translations.js`
- Generates translation keys for all 118 plants in data/i18n-ta.json
- Supports optional Google Translate API integration (install: `npm install translate-google-api`)
- Currently stores English text as placeholders for manual translation

### 4. Updated `data/i18n-ta.json`
- Added 354 new translation keys (3 per plant × 118 plants)
- Scientific names kept in Latin (unchanged)
- Plant names and descriptions ready for Tamil translation

## How It Works
1. User toggles language to Tamil
2. i18n.js loads data/i18n-ta.json
3. applyTranslations() finds all `data-i18n` elements (including card content)
4. Replaces English text with Tamil translations from dictionary
5. Falls back to English if translation not found

## Next Steps
To add Tamil translations:

### Option 1: Manual Translation
Edit data/i18n-ta.json and replace `[TRANSLATE: ...]` entries with actual Tamil text

### Option 2: Automated Translation
```bash
npm install translate-google-api
node scripts/generate-plant-card-translations.js
```

## Example
Before (hardcoded English):
```html
<h3>Clove</h3>
<p><em>Syzygium aromaticum</em></p>
<p>Aromatic flower buds used as a spice worldwide.</p>
```

After (translatable):
```html
<h3 data-i18n="plant_name_clove" data-en="Clove">Clove</h3>
<p><em data-i18n="plant_scientific_clove" data-en="Syzygium aromaticum">Syzygium aromaticum</em></p>
<p data-i18n="plant_desc_clove" data-en="Aromatic flower buds used as a spice worldwide.">Aromatic flower buds used as a spice worldwide.</p>
```

When Tamil is selected and translation exists:
```html
<h3>கிராம்பு</h3>
<p><em>Syzygium aromaticum</em></p>
<p>நறுமணமிக்க மொட்டுகள் உலகெங்கும் மசாலாவாக பயன்படுத்தப்படுகிறது.</p>
```
