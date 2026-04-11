#!/usr/bin/env node
/**
 * Merge all per-plant dictionary keys into the global i18n-ta.json
 * This ensures all section headers and value keys are available globally
 */
const fs = require('fs');
const path = require('path');

const globalDict = JSON.parse(fs.readFileSync('data/i18n-ta.json', 'utf8'));
const dataDir = 'data';

// Get all per-plant dictionary files
const files = fs.readdirSync(dataDir).filter(f => f.startsWith('i18n-ta-') && f.endsWith('.json') && f !== 'i18n-ta.json');

console.log(`Merging ${files.length} per-plant dictionaries into global dictionary...\n`);

let keysAdded = 0;
let keysSkipped = 0;

files.forEach(file => {
  const plantDict = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
  
  Object.entries(plantDict).forEach(([key, value]) => {
    if (!(key in globalDict)) {
      globalDict[key] = value;
      keysAdded++;
    } else {
      keysSkipped++;
    }
  });
});

// Write updated global dictionary
fs.writeFileSync('data/i18n-ta.json', JSON.stringify(globalDict, null, 2), 'utf8');

console.log(`✓ Complete!`);
console.log(`  Keys added: ${keysAdded}`);
console.log(`  Keys skipped (already exist): ${keysSkipped}`);
console.log(`  Total keys in global dict: ${Object.keys(globalDict).length}`);
console.log(`  Updated: data/i18n-ta.json`);
