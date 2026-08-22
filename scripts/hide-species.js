#!/usr/bin/env node
/**
 * hide-species.js
 * Reads data/hidden-species.json and adds data-hidden="true" to matching cards
 * in category pages. Also removes data-hidden from cards not in the list.
 * Works for both flora (plants) and fauna species.
 *
 * Usage: node scripts/hide-species.js
 */
const fs = require('fs');
const path = require('path');

const HIDDEN_FILE = path.join(__dirname, '..', 'data', 'hidden-species.json');
const CATEGORIES_DIR = path.join(__dirname, '..', 'categories');

// Load hidden slugs
if (!fs.existsSync(HIDDEN_FILE)) {
  console.error('Error: data/hidden-species.json not found');
  process.exit(1);
}

const { hidden } = JSON.parse(fs.readFileSync(HIDDEN_FILE, 'utf8'));
const hiddenSet = new Set(hidden || []);

console.log(`Hidden species (${hiddenSet.size}):`, [...hiddenSet].join(', ') || '(none)');

// Process all category pages
const categoryFiles = fs.readdirSync(CATEGORIES_DIR).filter(f => f.endsWith('.html'));
let totalHidden = 0;
let totalUnhidden = 0;

for (const file of categoryFiles) {
  const filePath = path.join(CATEGORIES_DIR, file);
  let html = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Match card links: <a class="card" href="../plants/cat/SLUG.html"> or <a class="card" href="../fauna/cat/SLUG.html">
  // Also handles cards that already have data-hidden="true"
  html = html.replace(
    /<a\s+class="card"([^>]*)\s+href="\.\.\/(?:plants|fauna)\/[^/]+\/([^"]+)\.html"/g,
    (match, attrs, slug) => {
      const hasHidden = /data-hidden="true"/.test(attrs);
      const shouldHide = hiddenSet.has(slug);

      if (shouldHide && !hasHidden) {
        // Add data-hidden
        totalHidden++;
        changed = true;
        return match.replace('class="card"', 'class="card" data-hidden="true"');
      } else if (!shouldHide && hasHidden) {
        // Remove data-hidden
        totalUnhidden++;
        changed = true;
        return match.replace(/\s*data-hidden="true"/, '');
      }
      return match;
    }
  );

  if (changed) {
    fs.writeFileSync(filePath, html);
    console.log(`  Updated: ${file}`);
  }
}

console.log(`\nDone. Hidden: ${totalHidden} cards, Unhidden: ${totalUnhidden} cards.`);
console.log('Remember to also run: node scripts/update-fauna-counts.js');
console.log('Remember to also run: node scripts/generate-print-tags.js');
