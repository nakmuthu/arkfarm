const fs = require('fs');
const https = require('https');
const globalTa = JSON.parse(fs.readFileSync('data/i18n-ta.json', 'utf8'));
const plants = JSON.parse(fs.readFileSync('data/plants.json', 'utf8'));

// Only retranslate the new plants
const newSlugs = new Set([
  'adathodai','vasambu','vathanarayanan','karunochi','maha-vilvam','vetiver',
  'aloe-vera','aloe-vera-red','ranakalli','pirandai','elumbu-otti-ilai','thippili',
  'poonai-meesai','murungai-kalyana','murungai-karumbu','chitharathai',
  'banana-karpuravalli','banana-nendran','banana-peyan','banana-poongathali',
  'banana-poovan','banana-rasthali','banana-red','banana-sirumalai','banana-yelakki',
  'cashew-nut','dragon-fruit-purple','dragon-fruit-yellow','fig-brown-turkey',
  'fig-elephant-ear','fig-pune-red','orange-kamala','pomegranate','sweet-tamarind',
  'cat-eye-fruit','grape-black','allamanda-purple','allamanda-yellow',
  'bougainvillea-red','bougainvillea-white','butterfly-pea','cypress-vine',
  'hibiscus-red','manoranjitham','petrea-creeper','touch-me-not','neem-tree',
  'purple-heart','areca-palm','norfolk-island-pine','curtain-creeper','rubber-plant',
  'mint','coriander','sweet-basil','basil-black','karpuravalli',
  'mango-nam-doc-mai-gold','cherry-manila-tennis-ball','berry-brazilian-long-mulberry',
  'bleeding-heart','gold-shower','champak'
]);

const targets = plants.filter(p => {
  const slug = p.url.split('/').pop().replace('.html','');
  return newSlugs.has(slug) && p.description;
});

function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(d));
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
  } catch(e) { return texts; }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const BATCH = 10;
  for (let i = 0; i < targets.length; i += BATCH) {
    const batch = targets.slice(i, i + BATCH);
    const translated = await translateBatch(batch.map(p => p.description));
    for (let j = 0; j < batch.length; j++) {
      const slug = batch[j].url.split('/').pop().replace('.html','');
      globalTa['plant_desc_' + slug] = translated[j];
      console.log(slug + ': ' + translated[j]);
    }
    await sleep(500);
  }
  fs.writeFileSync('data/i18n-ta.json', JSON.stringify(globalTa, null, 2), 'utf8');
  console.log('\nDone. Translated', targets.length, 'descriptions.');
}
main();
