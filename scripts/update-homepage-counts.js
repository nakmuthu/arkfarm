#!/usr/bin/env node
/**
 * Update species counts on the homepage from plants.json.
 * Updates both the hero total and per-category counts.
 */
const fs = require('fs');
const plants = JSON.parse(fs.readFileSync('data/plants.json', 'utf8'));
let html = fs.readFileSync('index.html', 'utf8');

const total = plants.length;
const counts = {
  'cat_fruit_desc': plants.filter(p => p.category === 'Fruit Trees').length,
  'cat_medicinal_desc': plants.filter(p => p.category === 'Medicinal Plants').length,
  'cat_flowering_desc': plants.filter(p => p.category === 'Flowering Plants').length,
  'cat_spices_desc': plants.filter(p => p.category === 'Spices & Herbs').length,
  'cat_timber_desc': plants.filter(p => p.category === 'Timber Trees').length,
};

// Update hero total
html = html.replace(/🌱 \d+ species documented/, '🌱 ' + total + ' species documented');

// Update per-category counts
for (const [key, count] of Object.entries(counts)) {
  // Find the count line after the category description
  const regex = new RegExp('(data-i18n="' + key + '">[^<]*</p>\\s*\\n\\s*<p[^>]*>)\\d+( species</p>)');
  html = html.replace(regex, '$1' + count + '$2');
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('Updated homepage: ' + total + ' total');
for (const [k, v] of Object.entries(counts)) console.log('  ' + k.replace('cat_', '').replace('_desc', '') + ': ' + v);
