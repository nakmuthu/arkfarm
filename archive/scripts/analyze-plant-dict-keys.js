#!/usr/bin/env node
/**
 * Analyze which keys are unique to specific plants vs common across all plants
 */
const fs = require('fs');
const path = require('path');

const dataDir = 'data';
const files = fs.readdirSync(dataDir).filter(f => f.startsWith('i18n-ta-') && f.endsWith('.json') && f !== 'i18n-ta.json');

console.log(`Analyzing ${files.length} per-plant dictionaries...\n`);

// Collect all keys from all plants
const allKeysMap = new Map(); // key -> Set of plants that have it

files.forEach(file => {
  const plantName = file.replace('i18n-ta-', '').replace('.json', '');
  const plantDict = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
  
  Object.keys(plantDict).forEach(key => {
    if (!allKeysMap.has(key)) {
      allKeysMap.set(key, new Set());
    }
    allKeysMap.get(key).add(plantName);
  });
});

// Categorize keys
const commonKeys = [];
const plantSpecificKeys = new Map(); // plant -> [keys]

allKeysMap.forEach((plants, key) => {
  if (plants.size === files.length) {
    // Key exists in all plants
    commonKeys.push(key);
  } else if (plants.size === 1) {
    // Key exists in only one plant
    const plant = Array.from(plants)[0];
    if (!plantSpecificKeys.has(plant)) {
      plantSpecificKeys.set(plant, []);
    }
    plantSpecificKeys.get(plant).push(key);
  }
});

console.log(`Total unique keys across all plants: ${allKeysMap.size}`);
console.log(`Common keys (in all ${files.length} plants): ${commonKeys.length}`);
console.log(`Plant-specific keys (in only 1 plant): ${Array.from(plantSpecificKeys.values()).reduce((sum, arr) => sum + arr.length, 0)}`);
console.log(`Keys in 2-${files.length - 1} plants: ${allKeysMap.size - commonKeys.length - Array.from(plantSpecificKeys.values()).reduce((sum, arr) => sum + arr.length, 0)}`);

console.log('\n=== COMMON KEYS (in all plants) ===');
commonKeys.slice(0, 20).forEach(k => console.log('  ' + k));
if (commonKeys.length > 20) console.log(`  ... and ${commonKeys.length - 20} more`);

console.log('\n=== PLANT-SPECIFIC KEYS (in only 1 plant) ===');
let totalSpecific = 0;
Array.from(plantSpecificKeys.entries()).forEach(([plant, keys]) => {
  console.log(`\n${plant}: ${keys.length} unique keys`);
  keys.slice(0, 5).forEach(k => console.log('  - ' + k));
  if (keys.length > 5) console.log(`  ... and ${keys.length - 5} more`);
  totalSpecific += keys.length;
});

console.log(`\n=== SUMMARY ===`);
console.log(`Total plant-specific keys: ${totalSpecific}`);
console.log(`Percentage of keys that are plant-specific: ${((totalSpecific / allKeysMap.size) * 100).toFixed(1)}%`);
