#!/usr/bin/env node
/**
 * Validate all plant pages use standard data-i18n keys.
 * Run after adding new plants to catch issues before pushing.
 * 
 * Usage: node scripts/validate-i18n.js
 */
const fs = require('fs');
const path = require('path');

const globalDict = JSON.parse(fs.readFileSync('data/i18n-ta.json', 'utf8'));
const dirs = ['plants/fruit-trees', 'plants/spices-herbs', 'plants/medicinal-plants', 'plants/flowering-plants', 'plants/timber-trees'];

let errors = 0;
let warnings = 0;

for (const dir of dirs) {
  if (!fs.existsSync(dir)) continue;
  for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.html'))) {
    const fp = path.join(dir, file);
    const slug = file.replace('.html', '');
    const html = fs.readFileSync(fp, 'utf8');
    const issues = [];

    // Check data-plant attribute
    if (!html.includes('data-plant="' + slug + '"')) {
      issues.push('ERROR: Missing <body data-plant="' + slug + '">');
      errors++;
    }

    // Check i18n.js script
    if (!html.includes('i18n.js')) {
      issues.push('ERROR: Missing i18n.js script tag');
      errors++;
    }

    // Check for non-standard key formats
    const badKeys = html.match(/data-i18n="(section\.|label\.|plant\.|breadcrumb\.)[^"]*"/g);
    if (badKeys) {
      issues.push('ERROR: Non-standard keys: ' + badKeys.join(', '));
      errors += badKeys.length;
    }

    // Check all data-i18n keys exist in global dict or are _val keys
    const allKeys = [...html.matchAll(/data-i18n="([^"]+)"/g)].map(m => m[1]);
    for (const key of allKeys) {
      if (key.endsWith('_val')) continue; // per-plant values
      if (key === 'plant_name' || key === 'scientific_name') continue; // per-plant
      if (key === 'home' || key === 'footer' || key === 'disclaimer' || key === 'observation_placeholder') continue;
      if (!globalDict[key]) {
        issues.push('WARNING: Key "' + key + '" not in global Tamil dict');
        warnings++;
      }
    }

    // Check Tamil file exists
    const tamilFile = 'data/i18n-ta-' + slug + '.json';
    if (!fs.existsSync(tamilFile)) {
      issues.push('ERROR: Missing Tamil file ' + tamilFile);
      errors++;
    } else {
      const td = JSON.parse(fs.readFileSync(tamilFile, 'utf8'));
      if (!td.plant_name) { issues.push('WARNING: No plant_name in Tamil file'); warnings++; }
      const valCount = Object.keys(td).filter(k => k.endsWith('_val')).length;
      const htmlValCount = (html.match(/data-i18n="[^"]*_val"/g) || []).length;
      if (valCount < htmlValCount * 0.5) {
        issues.push('WARNING: Tamil file has ' + valCount + ' _val keys but HTML has ' + htmlValCount + ' _val attrs');
        warnings++;
      }
    }

    if (issues.length > 0) {
      console.log('\n' + fp + ':');
      issues.forEach(i => console.log('  ' + i));
    }
  }
}

console.log('\n=== Summary ===');
console.log('Errors: ' + errors);
console.log('Warnings: ' + warnings);
if (errors > 0) process.exit(1);
