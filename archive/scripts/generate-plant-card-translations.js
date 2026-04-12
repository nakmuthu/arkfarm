#!/usr/bin/env node
/**
 * Generate Tamil translations for plant card content (names, scientific names, descriptions)
 * Uses Google Translate API via translate-google-api package
 * Install: npm install translate-google-api
 * Run: node scripts/generate-plant-card-translations.js
 */
const fs = require('fs');

const plants = JSON.parse(fs.readFileSync('data/plants.json', 'utf8'));
let tamilDict = {};

try {
  tamilDict = JSON.parse(fs.readFileSync('data/i18n-ta.json', 'utf8'));
} catch (e) {
  console.log('Creating new i18n-ta.json');
}

// Try to use translate-google-api if available, otherwise use fallback
let translate;
try {
  translate = require('translate-google-api');
} catch (e) {
  console.log('Note: translate-google-api not installed. Install with: npm install translate-google-api');
  translate = null;
}

async function translateText(text) {
  if (!translate) {
    return text; // Return original if no translator available
  }
  try {
    const result = await translate(text, { to: 'ta' });
    return result[0];
  } catch (e) {
    console.warn(`Translation failed for: "${text}"`);
    return text;
  }
}

async function generateTranslations() {
  console.log(`Processing ${plants.length} plants for card translations...`);
  
  let translated = 0;
  let skipped = 0;
  
  for (const plant of plants) {
    const slug = plant.url.split('/').pop().replace('.html', '');
    const nameKey = `plant_name_${slug}`;
    const scientificKey = `plant_scientific_${slug}`;
    const descKey = `plant_desc_${slug}`;
    
    // Only add if not already present or if it's a placeholder
    if (!tamilDict[nameKey] || tamilDict[nameKey].startsWith('[TRANSLATE:')) {
      if (translate) {
        tamilDict[nameKey] = await translateText(plant.name);
        translated++;
      } else {
        tamilDict[nameKey] = plant.name; // Keep English if no translator
        skipped++;
      }
    }
    
    if (!tamilDict[scientificKey]) {
      tamilDict[scientificKey] = plant.scientific; // Scientific names usually stay the same
    }
    
    if (!tamilDict[descKey] || tamilDict[descKey].startsWith('[TRANSLATE:')) {
      if (translate) {
        tamilDict[descKey] = await translateText(plant.description);
        translated++;
      } else {
        tamilDict[descKey] = plant.description; // Keep English if no translator
        skipped++;
      }
    }
  }
  
  // Write updated dictionary
  fs.writeFileSync('data/i18n-ta.json', JSON.stringify(tamilDict, null, 2), 'utf8');
  console.log(`✓ Updated data/i18n-ta.json`);
  console.log(`  Translated: ${translated} entries`);
  console.log(`  Skipped: ${skipped} entries (translator not available)`);
  
  if (!translate) {
    console.log('\nTo enable automatic translation, install translate-google-api:');
    console.log('  npm install translate-google-api');
    console.log('  Then run this script again');
  }
}

generateTranslations().catch(console.error);
