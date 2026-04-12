// Adds plant_desc_<slug> Tamil translations to global i18n-ta.json
// Uses Google Translate via the same batch method as generate-tamil.js
const fs = require('fs');
const https = require('https');

const globalTa = JSON.parse(fs.readFileSync('data/i18n-ta.json', 'utf8'));
const plants = JSON.parse(fs.readFileSync('data/plants.json', 'utf8'));

// Find plants missing desc translation
const missing = plants.filter(p => {
  const slug = p.url.split('/').pop().replace('.html', '');
  return p.description && !globalTa['plant_desc_' + slug];
});

console.log(missing.length + ' plants need desc translation');

function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(d));
    }).on('error', reject);
  });
}

async function translateBatch(texts) {
  const encoded = encodeURIComponent(texts.join('\n||||\n'));
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ta&dt=t&q=${encoded}`;
  try {
    const raw = await httpGet(url);
    const json = JSON.parse(raw);
    const full = json[0].map(x => x[0]).join('');
    return full.split('\n||||\n').map(s => s.trim());
  } catch (e) {
    return texts; // fallback to English
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const BATCH = 10;
  for (let i = 0; i < missing.length; i += BATCH) {
    const batch = missing.slice(i, i + BATCH);
    const texts = batch.map(p => p.description);
    const translated = await translateBatch(texts);
    for (let j = 0; j < batch.length; j++) {
      const slug = batch[j].url.split('/').pop().replace('.html', '');
      globalTa['plant_desc_' + slug] = translated[j];
      console.log('  ' + slug + ': ' + translated[j]);
    }
    await sleep(500);
  }
  fs.writeFileSync('data/i18n-ta.json', JSON.stringify(globalTa, null, 2), 'utf8');
  console.log('\nDone. Added', missing.length, 'desc translations.');
}

main();
