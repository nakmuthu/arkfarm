const fs = require('fs');
const globalTa = JSON.parse(fs.readFileSync('data/i18n-ta.json', 'utf8'));
const plants = JSON.parse(fs.readFileSync('data/plants.json', 'utf8'));
const missing = plants.filter(p => {
  const slug = p.url.split('/').pop().replace('.html','');
  return !globalTa['plant_name_' + slug];
}).map(p => p.url.split('/').pop().replace('.html',''));
console.log(missing.length + ' missing from global dict:');
missing.forEach(s => console.log(' ', s));
