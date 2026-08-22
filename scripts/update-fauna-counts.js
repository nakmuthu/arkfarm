#!/usr/bin/env node
/**
 * Count fauna species per category folder and update homepage data-fauna-count attributes.
 */
const fs = require('fs');
const path = require('path');

const FAUNA_DIRS = {
  'arachnids':           'fauna/arachnids',
  'aquatic-fauna':       'fauna/aquatic-fauna',
  'birds':               'fauna/birds',
  'insects-pollinators': 'fauna/insects-pollinators',
  'mammals':             'fauna/mammals',
  'reptiles-amphibians': 'fauna/reptiles-amphibians',
  'soil-decomposers':    'fauna/soil-decomposers',
};

// Load hidden species list
const HIDDEN_FILE = path.join(__dirname, '..', 'data', 'hidden-species.json');
const hiddenSet = new Set(
  fs.existsSync(HIDDEN_FILE) ? JSON.parse(fs.readFileSync(HIDDEN_FILE, 'utf8')).hidden || [] : []
);

const counts = {};
let totalFauna = 0;

for (const [key, dir] of Object.entries(FAUNA_DIRS)) {
  if (!fs.existsSync(dir)) { counts[key] = 0; continue; }
  const species = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
  const visible = species.filter(f => !hiddenSet.has(f.replace('.html', '')));
  counts[key] = visible.length;
  totalFauna += visible.length;
}

// Update index.html
let html = fs.readFileSync('index.html', 'utf8');

// Update per-category fauna counts
for (const [key, count] of Object.entries(counts)) {
  const label = count === 1 ? '1 species' : count + ' species';
  // Match: data-fauna-count="key">ANYTHING (up to but not including <)
  html = html.replace(
    new RegExp('(data-fauna-count="' + key + '">)[^<]*', 'g'),
    '$1' + label
  );
}

// Update fauna-count span in hero
html = html.replace(/<span id="fauna-count">[^<]*<\/span>/, '<span id="fauna-count">' + totalFauna + '</span>');

// Update flora-count span using plants.json (excluding hidden)
const plants = JSON.parse(fs.readFileSync('data/plants.json', 'utf8'));
const totalFlora = plants.filter(p => {
  // Extract slug from url: /arkfarm/plants/category/SLUG.html
  const match = p.url && p.url.match(/\/([^/]+)\.html$/);
  return !match || !hiddenSet.has(match[1]);
}).length;
html = html.replace(/<span id="flora-count">[^<]*<\/span>/, '<span id="flora-count">' + totalFlora + '</span>');

fs.writeFileSync('index.html', html);
console.log('Updated fauna counts:');
for (const [k, v] of Object.entries(counts)) console.log('  ' + k + ': ' + v);
console.log('Total fauna: ' + totalFauna);
console.log('Total flora: ' + totalFlora);
