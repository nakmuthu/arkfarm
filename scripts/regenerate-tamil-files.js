#!/usr/bin/env node
// Regenerates Tamil translation files for scrambled plants
// Translates each key individually to avoid batch-split errors

const fs = require('fs');
const https = require('https');
const path = require('path');

const args = process.argv.slice(2);
const slugFilter = args.includes('--slug') ? args[args.indexOf('--slug') + 1] : null;

function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 }, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(d));
    }).on('error', reject).on('timeout', () => reject(new Error('timeout')));
  });
}

async function translate(text) {
  if (!text || !text.trim()) return text;
  const encoded = encodeURIComponent(text);
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ta&dt=t&q=${encoded}`;
  try {
    const raw = await httpGet(url);
    const json = JSON.parse(raw);
    return json[0].map(x => x[0]).join('').trim();
  } catch(e) { return text; }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Extract data-i18n key/value pairs from HTML
function extractPairs(html) {
  const pairs = {};
  // Match <td data-i18n="key">value</td> and <span data-i18n="key">value</span>
  const re = /data-i18n="([^"]+_val)"[^>]*>([^<]+)</g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const key = m[1];
    const val = m[2].trim();
    if (val && !pairs[key]) pairs[key] = val;
  }
  return pairs;
}

function isEnglish(str) {
  // Returns true if string is primarily English (not Tamil)
  // Tamil unicode range: \u0B80-\u0BFF
  const tamilChars = (str.match(/[\u0B80-\u0BFF]/g) || []).length;
  return tamilChars === 0;
}

async function processSlug(slug) {
  const htmlPath = `plants/${slug.includes('fruit') || slug.includes('banana') || slug.includes('mango') || slug.includes('cherry') || slug.includes('guava') || slug.includes('jackfruit') || slug.includes('jamun') || slug.includes('berry') || slug.includes('apple') || slug.includes('avocado') || slug.includes('plum') || slug.includes('longan') || slug.includes('custard') || slug.includes('dragon') || slug.includes('fig') || slug.includes('grape') || slug.includes('orange') || slug.includes('pomegranate') || slug.includes('tamarind') || slug.includes('cashew') || slug.includes('cat-eye') || slug.includes('coconut') || slug.includes('litchi') || slug.includes('rambutan') || slug.includes('sapota') || slug.includes('sea') || slug.includes('star') || slug.includes('sweet') || slug.includes('bilimbi') || slug.includes('bignay') || slug.includes('araza') || slug.includes('abiu') || slug.includes('ambalam') || slug.includes('egg') || slug.includes('ice') || slug.includes('jaboticaba') || slug.includes('kodakapuli') || slug.includes('lemon') || slug.includes('lipote') || slug.includes('malkova') || slug.includes('miracle') || slug.includes('olosapo') || slug.includes('passion') || slug.includes('pomelo') ? 'fruit-trees' : 'unknown'}/${slug}.html`;

  // Better: find the file
  let file = null;
  for (const cat of ['fruit-trees','spices-herbs','medicinal-plants','flowering-plants','timber-trees','ornamental-plants']) {
    const p = `plants/${cat}/${slug}.html`;
    if (fs.existsSync(p)) { file = p; break; }
  }
  if (!file) { console.log('  file not found:', slug); return; }

  const html = fs.readFileSync(file, 'utf8');
  const pairs = extractPairs(html);

  const tamilFile = `data/i18n-ta-${slug}.json`;
  const existing = fs.existsSync(tamilFile) ? JSON.parse(fs.readFileSync(tamilFile, 'utf8')) : {};

  // Keep plant_name if it's already Tamil
  const result = {};
  if (existing.plant_name && !isEnglish(existing.plant_name)) {
    result.plant_name = existing.plant_name;
  } else if (existing.plant_name) {
    result.plant_name = existing.plant_name; // keep as-is, fixed separately
  }

  let count = 0;
  for (const [key, enVal] of Object.entries(pairs)) {
    if (!enVal || !isEnglish(enVal)) continue; // skip if already Tamil or empty
    const tamil = await translate(enVal);
    result[key] = tamil;
    count++;
    await sleep(150);
  }

  fs.writeFileSync(tamilFile, JSON.stringify(result, null, 2), 'utf8');
  console.log(`  ${slug}: ${count} keys translated`);
}

async function main() {
  // Find all scrambled files
  let slugs = [];
  for (const f of fs.readdirSync('data').filter(f => f.startsWith('i18n-ta-') && f.endsWith('.json'))) {
    const d = JSON.parse(fs.readFileSync('data/' + f));
    const scrambled = Object.values(d).some(v => typeof v === 'string' && v.includes('||'));
    if (scrambled) slugs.push(f.replace('i18n-ta-','').replace('.json',''));
  }

  if (slugFilter) slugs = [slugFilter];

  console.log(`Regenerating ${slugs.length} Tamil files...`);
  for (const slug of slugs) {
    process.stdout.write(slug + '... ');
    await processSlug(slug);
    await sleep(200);
  }
  console.log('\nDone.');
}

main();
