// Syncs plant_name_<slug> keys into the global i18n-ta.json from per-plant files
const fs = require('fs');
const path = require('path');

const globalTa = JSON.parse(fs.readFileSync('data/i18n-ta.json', 'utf8'));
const plants = JSON.parse(fs.readFileSync('data/plants.json', 'utf8'));

let added = 0;
for (const p of plants) {
  const slug = p.url.split('/').pop().replace('.html', '');
  const nameKey = 'plant_name_' + slug;
  if (globalTa[nameKey]) continue;

  // Try per-plant Tamil file
  const tamilFile = 'data/i18n-ta-' + slug + '.json';
  if (fs.existsSync(tamilFile)) {
    const td = JSON.parse(fs.readFileSync(tamilFile, 'utf8'));
    if (td.plant_name) {
      globalTa[nameKey] = td.plant_name;
      // Also add scientific and desc keys if available
      if (td.scientific_name) globalTa['plant_scientific_' + slug] = td.scientific_name;
      added++;
      console.log('added:', nameKey, '->', td.plant_name);
    }
  }
}

fs.writeFileSync('data/i18n-ta.json', JSON.stringify(globalTa, null, 2), 'utf8');
console.log('\nDone. Added', added, 'keys to global dict.');
