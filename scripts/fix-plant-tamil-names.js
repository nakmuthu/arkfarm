// Updates plant_name in per-plant i18n files where it's still English,
// using the correct Tamil from the global dict
const fs = require('fs');
const globalTa = JSON.parse(fs.readFileSync('data/i18n-ta.json', 'utf8'));

function isEnglish(str) {
  return /^[A-Za-z0-9\s\-\/\(\)\.]+$/.test(str);
}

let fixed = 0;
for (const file of fs.readdirSync('data').filter(f => f.startsWith('i18n-ta-') && f.endsWith('.json'))) {
  const slug = file.replace('i18n-ta-', '').replace('.json', '');
  const path = 'data/' + file;
  const td = JSON.parse(fs.readFileSync(path, 'utf8'));
  const globalName = globalTa['plant_name_' + slug];

  if (td.plant_name && isEnglish(td.plant_name) && globalName && !isEnglish(globalName)) {
    td.plant_name = globalName;
    fs.writeFileSync(path, JSON.stringify(td, null, 2), 'utf8');
    console.log('fixed:', slug, '->', globalName);
    fixed++;
  }
}
console.log('\nFixed', fixed, 'per-plant Tamil name files.');
