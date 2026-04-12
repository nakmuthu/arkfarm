# Translation Debug Guide

## To Test Translations:

### Option 1: Test File (Recommended)
Visit: https://nakmuthu.github.io/arkfarm/test-category-translation.html

This page:
- Shows sample plant cards with i18n attributes
- Has a "Toggle Language" button
- Shows debug info about loaded translations
- Uses the actual i18n.js from the site

### Option 2: Category Page
Visit: https://nakmuthu.github.io/arkfarm/categories/spices-herbs.html

Then:
1. Open browser console (F12)
2. Click the language toggle button (தமிழ் / English)
3. Plant cards should translate

### Option 3: Check Console for Errors
Open browser console (F12) and look for:
- Any fetch errors loading `/arkfarm/data/i18n-ta.json`
- Any JavaScript errors in i18n.js

## What Should Happen

**When you toggle to Tamil:**
- Plant names → Tamil (e.g., "கிராம்பு" for Clove)
- Scientific names → English (e.g., "Syzygium aromaticum")
- Descriptions → Tamil (e.g., "நறுமண மலர் மொட்டுகள்...")

## If It's Not Working

1. **Hard refresh** (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
2. **Clear browser cache** completely
3. **Wait 5-10 minutes** for GitHub Pages to update
4. **Check console** for errors (F12)
5. **Try incognito/private mode** to bypass cache

## Files Involved

- `js/i18n.js` - Translation engine
- `data/i18n-ta.json` - Global Tamil dictionary (354 keys)
- `categories/*.html` - Category pages with i18n attributes
- `scripts/generate-category-pages.js` - Generates category pages
- `scripts/extract-and-translate-cards.js` - Extracts names and translates descriptions

## Verification

All translations are confirmed to be:
- ✓ In local data/i18n-ta.json
- ✓ Pushed to GitHub
- ✓ Accessible via raw.githubusercontent.com
- ✓ In category pages with correct i18n attributes
