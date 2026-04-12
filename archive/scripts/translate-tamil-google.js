#!/usr/bin/env node
/**
 * Translate all English _val content in Tamil files using Google Translate free API.
 * Processes in batches to avoid rate limiting.
 * 
 * Usage: node scripts/translate-tamil-google.js
 */
const fs = require('fs');
const https = require('https');

// Hand-crafted files to skip
const handCrafted = new Set([
  'passion-fruit', 'malkova-mango', 'paneer-rose', 'moringa-tree', 'jasmine'
]);

function googleTranslate(text, from, to) {
  return new Promise((resolve, reject) => {
    const encoded = encodeURIComponent(text);
    const url = `/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encoded}`;
    
    const req = https.get({
      hostname: 'translate.googleapis.com',
      path: url,
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const translated = parsed[0].map(s => s[0]).join('');
          resolve(translated);
        } catch (e) {
          reject(new Error('Parse error: ' + data.substring(0, 200)));
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function translateBatch(texts) {
  // Join texts with a separator that won't be translated
  const separator = ' ||| ';
  const combined = texts.join(separator);
  
  // Google Translate has a ~5000 char limit per request
  if (combined.length > 4500) {
    // Split into smaller batches
    const mid = Math.floor(texts.length / 2);
    const first = await translateBatch(texts.slice(0, mid));
    await sleep(300);
    const second = await translateBatch(texts.slice(mid));
    return [...first, ...second];
  }
  
  try {
    const result = await googleTranslate(combined, 'en', 'ta');
    return result.split('|||').map(s => s.trim());
  } catch (e) {
    console.error('  Translation error:', e.message);
    return texts; // Return originals on failure
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const files = fs.readdirSync('data')
    .filter(f => f.startsWith('i18n-ta-') && f.endsWith('.json'))
    .sort();
  
  let totalTranslated = 0;
  let totalFiles = 0;
  
  for (const file of files) {
    const slug = file.replace('i18n-ta-', '').replace('.json', '');
    if (handCrafted.has(slug)) continue;
    
    const filePath = 'data/' + file;
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Collect all _val keys that need translation
    const toTranslate = [];
    const keys = [];
    
    for (const [key, val] of Object.entries(data)) {
      if (!key.endsWith('_val')) continue;
      if (!val || typeof val !== 'string') continue;
      // Skip if already purely Tamil (no Latin chars except numbers/units)
      const stripped = val.replace(/[\d.,°–\-\/₹%+()×\s]/g, '');
      if (stripped.length > 0 && !/[A-Za-z]/.test(stripped)) continue;
      
      toTranslate.push(val);
      keys.push(key);
    }
    
    if (toTranslate.length === 0) continue;
    
    // Translate in batch
    const translated = await translateBatch(toTranslate);
    
    let changed = 0;
    for (let i = 0; i < keys.length; i++) {
      if (translated[i] && translated[i] !== toTranslate[i]) {
        data[keys[i]] = translated[i];
        changed++;
      }
    }
    
    if (changed > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
      totalTranslated += changed;
      totalFiles++;
      process.stdout.write(`✓ ${slug} (${changed} values)\n`);
    }
    
    // Rate limit: 1000ms between files
    await sleep(1000);
  }
  
  console.log(`\nDone! Translated ${totalTranslated} values across ${totalFiles} files`);
}

main().catch(console.error);
