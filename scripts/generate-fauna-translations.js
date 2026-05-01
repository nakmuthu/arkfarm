#!/usr/bin/env node
/**
 * Generate per-species Tamil translation files for fauna pages.
 * Reads data-i18n + data-en attributes from each fauna HTML page,
 * translates each value individually, and writes data/i18n-fauna-<slug>.json
 *
 * Usage: node scripts/generate-fauna-translations.js [--slug <slug>]
 */
const fs = require('fs');
const https = require('https');

const args = process.argv.slice(2);
const slugFilter = args.includes('--slug') ? args[args.indexOf('--slug') + 1] : null;

function translate(text) {
  return new Promise((resolve) => {
    const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ta&dt=t&q=' + encodeURIComponent(text);
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 8000 }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)[0].map(x => x[0]).join('')); }
        catch(e) { resolve(text); }
      });
    });
    req.on('error', () => resolve(text));
    req.on('timeout', () => { req.destroy(); resolve(text); });
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function isTamil(s) { return s && /[\u0B80-\u0BFF]/.test(s); }

// Extract data-i18n="*_val" keys with their inline text content from HTML
function extractKeys(html) {
  const pairs = {};
  // Match: data-i18n="key_val">text content<
  const re = /data-i18n="([^"]+_val)">([^<]+)</g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const key = m[1];
    const val = m[2].trim();
    if (val) pairs[key] = val;
  }
  return pairs;
}

// Find all fauna HTML files
function getFaunaFiles() {
  const FAUNA_DIRS = [
    'fauna/insects-pollinators',
    'fauna/birds',
    'fauna/reptiles-amphibians',
    'fauna/mammals',
    'fauna/arachnids',
    'fauna/soil-decomposers',
    'fauna/aquatic-fauna',
  ];
  const files = [];
  for (const dir of FAUNA_DIRS) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.html'))) {
      const slug = f.replace('.html', '');
      if (slugFilter && slug !== slugFilter) continue;
      files.push({ slug, path: dir + '/' + f });
    }
  }
  return files;
}

async function processFile({ slug, path: htmlPath }) {
  const outFile = 'data/i18n-fauna-' + slug + '.json';
  const html = fs.readFileSync(htmlPath, 'utf8');

  // Get fauna_name from h1 text
  const nameMatch = html.match(/<h1[^>]*data-i18n="fauna_name"[^>]*>([^<]+)</);
  const faunaName = nameMatch ? nameMatch[1].trim() : slug;

  // Extract all _val keys that need translation
  const pairs = extractKeys(html);

  // Load existing translations if any
  let existing = {};
  if (fs.existsSync(outFile)) {
    existing = JSON.parse(fs.readFileSync(outFile, 'utf8'));
  }

  const result = { ...existing };
  if (!result.fauna_name) result.fauna_name = faunaName; // will be translated below

  let count = 0;
  const toTranslate = [];

  // Always translate fauna_name
  if (!isTamil(result.fauna_name)) {
    toTranslate.push(['fauna_name', faunaName]);
  }

  // Translate all _val keys from data-en attributes
  for (const [key, en] of Object.entries(pairs)) {
    if (!key.endsWith('_val')) continue;
    if (result[key] && isTamil(result[key])) continue; // already translated
    toTranslate.push([key, en]);
  }

  process.stdout.write('  ' + slug + ' (' + toTranslate.length + ' keys)');

  for (const [key, en] of toTranslate) {
    const ta = await translate(en);
    result[key] = ta;
    count++;
    process.stdout.write('.');
    await sleep(300);
  }

  fs.writeFileSync(outFile, JSON.stringify(result, null, 2));
  console.log(' ✓');
  return count;
}

async function main() {
  const files = getFaunaFiles();
  console.log('Processing ' + files.length + ' fauna pages...');
  let total = 0;
  for (const f of files) {
    total += await processFile(f);
  }
  console.log('Done — ' + total + ' keys translated');
}

main().catch(console.error);
