#!/usr/bin/env node
/**
 * Update species counts on the homepage from plants.json.
 * Uses data-count="Category Name" attributes — works for any category automatically.
 */
const fs = require('fs');
const plants = JSON.parse(fs.readFileSync('data/plants.json', 'utf8'));
let html = fs.readFileSync('index.html', 'utf8');

const total = plants.length;

// Update hero total
html = html.replace(/🌱 \d+ species documented/, '🌱 ' + total + ' species documented');

// Update per-category counts via data-count attribute
html = html.replace(/data-count="([^"]+)">[^<]* species<\/p>/g, (match, category) => {
  const count = plants.filter(p => p.category === category).length;
  return `data-count="${category}">${count} species</p>`;
});

fs.writeFileSync('index.html', html, 'utf8');

// Report
console.log('Updated homepage: ' + total + ' total');
const cats = [...new Set(plants.map(p => p.category))].sort();
cats.forEach(c => console.log('  ' + c + ': ' + plants.filter(p => p.category === c).length));
