#!/usr/bin/env node
/**
 * Update species counts on the homepage from plants.json.
 * Uses data-count="Category Name" attributes — works for any category automatically.
 * Excludes hidden species from data/hidden-species.json.
 */
const fs = require('fs');
const path = require('path');
const plants = JSON.parse(fs.readFileSync('data/plants.json', 'utf8'));

// Load hidden species
const HIDDEN_FILE = path.join(__dirname, '..', 'data', 'hidden-species.json');
const hiddenSet = new Set(
  fs.existsSync(HIDDEN_FILE) ? JSON.parse(fs.readFileSync(HIDDEN_FILE, 'utf8')).hidden || [] : []
);

// Filter out hidden plants by extracting slug from url
const visiblePlants = plants.filter(p => {
  const match = p.url && p.url.match(/\/([^/]+)\.html$/);
  return !match || !hiddenSet.has(match[1]);
});

let html = fs.readFileSync('index.html', 'utf8');

const total = visiblePlants.length;

// Update hero total
html = html.replace(/🌱 \d+ species documented/, '🌱 ' + total + ' species documented');

// Update per-category counts via data-count attribute
html = html.replace(/data-count="([^"]+)">[^<]* species<\/p>/g, (match, category) => {
  const count = visiblePlants.filter(p => p.category === category).length;
  return `data-count="${category}">${count} species</p>`;
});

fs.writeFileSync('index.html', html, 'utf8');

// Report
console.log('Updated homepage: ' + total + ' total (excluding ' + hiddenSet.size + ' hidden)');
const cats = [...new Set(plants.map(p => p.category))].sort();
cats.forEach(c => console.log('  ' + c + ': ' + visiblePlants.filter(p => p.category === c).length));
