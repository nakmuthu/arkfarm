---
inclusion: manual
---

# Hide / Unhide Species at ArkFarm

When the user asks to hide a species (died, removed, no longer on farm) or unhide one (replanted, returned), follow these steps:

## To Hide a Species

1. Get the slug from the user (e.g. `lime-butterfly`, `passion-fruit`). If they give a common name, derive the slug: lowercase, hyphens for spaces.
2. Edit `data/hidden-species.json` — add the slug to the `"hidden"` array (keep sorted alphabetically).
3. Run: `node scripts/hide-species.js`
4. Run: `node scripts/update-fauna-counts.js`
5. Confirm to the user which species was hidden and from which category page.

## To Unhide a Species

1. Get the slug from the user.
2. Edit `data/hidden-species.json` — remove the slug from the `"hidden"` array.
3. Run: `node scripts/hide-species.js`
4. Run: `node scripts/update-fauna-counts.js`
5. Confirm to the user which species was restored.

## To List Currently Hidden Species

1. Read `data/hidden-species.json` and show the user the current list.

## Notes

- This works for both flora (plants) and fauna species.
- The species detail page, images, and translations remain untouched — only the card in the category page is hidden via `data-hidden="true"`.
- The CSS rule `.card[data-hidden="true"] { display: none; }` handles the visual hiding.
- `update-fauna-counts.js` automatically excludes hidden species from homepage counts.
- The hidden list is also editable from the admin UI at `/admin/` → **🚫 Hidden Species**.
