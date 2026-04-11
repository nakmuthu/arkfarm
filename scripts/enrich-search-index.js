#!/usr/bin/env node
/**
 * Enrich plants.json with common names and local names extracted from plant HTML pages.
 * Adds them to the keywords array for search.
 */
const fs = require('fs');
const path = require('path');

const plants = JSON.parse(fs.readFileSync('data/plants.json', 'utf8'));

let enriched = 0;
for (const plant of plants) {
  const htmlPath = plant.url.replace('/arkfarm/', '');
  if (!fs.existsSync(htmlPath)) continue;

  const html = fs.readFileSync(htmlPath, 'utf8');
  const newKeywords = new Set(plant.keywords || []);

  // Extract common names
  const commonMatch = html.match(/Common Names:<\/strong>\s*(?:<span[^>]*>)?([^<]+)/);
  if (commonMatch) {
    commonMatch[1].split(/[,;]/).forEach(n => {
      const name = n.trim().toLowerCase();
      if (name && name.length > 1) newKeywords.add(name);
    });
  }

  // Extract local names
  const localMatch = html.match(/Local Name:<\/strong>\s*(?:<span[^>]*>)?([^<]+)/);
  if (localMatch) {
    // Parse "Karuveppilai (Tamil), Kadi Patta (Hindi)" format
    localMatch[1].split(/[,;]/).forEach(n => {
      // Remove language tags like (Tamil), (Hindi)
      const name = n.replace(/\([^)]*\)/g, '').trim().toLowerCase();
      if (name && name.length > 1) newKeywords.add(name);
    });
  }

  const oldCount = (plant.keywords || []).length;
  plant.keywords = [...newKeywords];
  if (plant.keywords.length > oldCount) enriched++;
}

fs.writeFileSync('data/plants.json', JSON.stringify(plants, null, 2) + '\n', 'utf8');
console.log(`Enriched ${enriched} plants with common/local names`);
console.log(`Total plants: ${plants.length}`);
