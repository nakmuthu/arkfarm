#!/usr/bin/env node
/**
 * Extract Tamil plant names from per-plant dictionaries and translate descriptions using Google Translate API
 * Install: npm install translate-google-api
 * Run: node scripts/extract-and-translate-cards.js
 */
const fs = require('fs');
const path = require('path');

let translate;
try {
  translate = require('translate-google-api');
} catch (e) {
  console.error('ERROR: translate-google-api not installed');
  console.error('Install with: npm install translate-google-api');
  process.exit(1);
}

const plants = JSON.parse(fs.readFileSync('data/plants.json', 'utf8'));
let tamilDict = JSON.parse(fs.readFileSync('data/i18n-ta.json', 'utf8'));

// Extract Tamil plant name from per-plant dictionary
function extractTamilName(plantSlug) {
  const dictPath = `data/i18n-ta-${plantSlug}.json`;
  
  try {
    if (fs.existsSync(dictPath)) {
      const plantDict = JSON.parse(fs.readFileSync(dictPath, 'utf8'));
      if (plantDict.plant_name) {
        return plantDict.plant_name;
      }
    }
  } catch (e) {
    // File not found or error reading
  }
  
  return null;
}

async function translateDescription(text) {
  try {
    const result = await translate(text, { to: 'ta' });
    return result[0];
  } catch (e) {
    console.warn(`  ⚠ Translation failed: ${e.message}`);
    return null;
  }
}

async function processPlants() {
  console.log(`Processing ${plants.length} plants...\n`);
  
  let extracted = 0;
  let translated = 0;
  let skipped = 0;
  let errors = 0;
  
  for (let i = 0; i < plants.length; i++) {
    const plant = plants[i];
    const slug = plant.url.split('/').pop().replace('.html', '');
    const nameKey = `plant_name_${slug}`;
    const scientificKey = `plant_scientific_${slug}`;
    const descKey = `plant_desc_${slug}`;
    
    process.stdout.write(`[${i + 1}/${plants.length}] ${slug}... `);
    
    // Extract Tamil name from per-plant dictionary
    const tamilName = extractTamilName(slug);
    if (tamilName) {
      tamilDict[nameKey] = tamilName;
      extracted++;
      process.stdout.write(`✓ name extracted`);
    } else {
      tamilDict[nameKey] = plant.name;
      process.stdout.write(`⚠ no Tamil name`);
    }
    
    // Keep scientific name in English
    tamilDict[scientificKey] = plant.scientific;
    
    // Translate description to Tamil (always translate, don't check if exists)
    process.stdout.write(`, translating desc...`);
    const tamilDesc = await translateDescription(plant.description);
    if (tamilDesc) {
      tamilDict[descKey] = tamilDesc;
      translated++;
      process.stdout.write(` ✓`);
    } else {
      tamilDict[descKey] = plant.description;
      skipped++;
      process.stdout.write(` ✗`);
    }
    
    console.log();
    
    // Add delay to avoid rate limiting (100ms between requests)
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Write updated dictionary
  fs.writeFileSync('data/i18n-ta.json', JSON.stringify(tamilDict, null, 2), 'utf8');
  
  console.log('\n✓ Complete!');
  console.log(`  Tamil names extracted: ${extracted}`);
  console.log(`  Descriptions translated: ${translated}`);
  console.log(`  Descriptions skipped: ${skipped}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Updated: data/i18n-ta.json`);
}

processPlants().catch(console.error);
