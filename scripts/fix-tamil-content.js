#!/usr/bin/env node
/**
 * Fix Tamil translation files: remove broken mixed English/Tamil values.
 * Keep only plant_name, scientific_name, and values that are purely Tamil
 * (from the hand-crafted files like passion-fruit, malkova-mango, etc.)
 * 
 * For auto-generated files, strip all _val keys that contain mixed content.
 * The i18n engine will fall back to showing the English text from the HTML.
 */
const fs = require('fs');

// These files were hand-crafted with proper Tamil translations - don't touch them
const handCrafted = [
  'i18n-ta-passion-fruit.json',
  'i18n-ta-malkova-mango.json',
  'i18n-ta-paneer-rose.json',
  'i18n-ta-moringa-tree.json',
  'i18n-ta-jasmine.json',
];

function hasMixedContent(text) {
  if (!text || typeof text !== 'string') return false;
  const hasLatin = /[A-Za-z]/.test(text);
  const hasTamil = /[\u0B80-\u0BFF]/.test(text);
  return hasLatin && hasTamil;
}

function isPurelyTamil(text) {
  if (!text || typeof text !== 'string') return false;
  // Allow numbers, punctuation, symbols alongside Tamil
  // But no Latin letters
  return /[\u0B80-\u0BFF]/.test(text) && !/[A-Za-z]/.test(text);
}

const files = fs.readdirSync('data').filter(f => f.startsWith('i18n-ta-') && f.endsWith('.json'));
let fixed = 0;

for (const file of files) {
  if (handCrafted.includes(file)) continue;
  
  const filePath = 'data/' + file;
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let changed = false;
  
  for (const key of Object.keys(data)) {
    // Keep plant_name (already fixed by fix-tamil-names.js)
    if (key === 'plant_name') continue;
    
    // Keep scientific_name as-is (Latin is expected)
    if (key === 'scientific_name') continue;
    
    const val = data[key];
    
    // Remove values that have mixed English+Tamil (broken translations)
    if (hasMixedContent(val)) {
      delete data[key];
      changed = true;
    }
    // Also remove values that are purely English (no translation happened)
    else if (typeof val === 'string' && /[A-Za-z]/.test(val) && !/[\u0B80-\u0BFF]/.test(val)) {
      delete data[key];
      changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    fixed++;
  }
}

console.log(`Cleaned ${fixed} Tamil files (removed broken mixed-language values)`);
console.log(`Hand-crafted files preserved: ${handCrafted.length}`);

// Count remaining keys
let totalKeys = 0;
for (const file of files) {
  const data = JSON.parse(fs.readFileSync('data/' + file, 'utf8'));
  totalKeys += Object.keys(data).length;
}
console.log(`Total remaining Tamil keys across all files: ${totalKeys}`);
