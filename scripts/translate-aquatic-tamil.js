#!/usr/bin/env node
/**
 * Translate aquatic plant Tamil files using Google Translate free API.
 * Only processes aquatic plant files (those with matching HTML in plants/aquatic-plants/).
 * 
 * Usage: node scripts/translate-aquatic-tamil.js
 */
const fs = require('fs');
const https = require('https');

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
  const separator = ' ||| ';
  const combined = texts.join(separator);
  
  if (combined.length > 4500) {
    const mid = Math.floor(texts.length / 2);
    const first = await translateBatch(texts.slice(0, mid));
    await sleep(500);
    const second = await translateBatch(texts.slice(mid));
    return [...first, ...second];
  }
  
  try {
    const result = await googleTranslate(combined, 'en', 'ta');
    return result.split('|||').map(s => s.trim());
  } catch (e) {
    console.error('  Translation error:', e.message);
    return texts;
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  // Get list of aquatic plant slugs
  const aquaticSlugs = fs.readdirSync('plants/aquatic-plants')
    .filter(f => f.endsWith('.html'))
    .map(f => f.replace('.html', ''));
  
  console.log(`Translating ${aquaticSlugs.length} aquatic plant files...\n`);
  
  let totalTranslated = 0;
  let totalFiles = 0;
  let errors = 0;
  
  for (const slug of aquaticSlugs) {
    const filePath = `data/i18n-ta-${slug}.json`;
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  No Tamil file for ${slug}, skipping`);
      continue;
    }
    
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Collect all _val keys that need translation (still English)
    const toTranslate = [];
    const keys = [];
    
    for (const [key, val] of Object.entries(data)) {
      if (!key.endsWith('_val') && key !== 'plant_name') continue;
      if (!val || typeof val !== 'string') continue;
      // Skip if already Tamil
      const stripped = val.replace(/[\d.,°–\-\/₹%+()×\s]/g, '');
      if (stripped.length > 0 && !/[A-Za-z]/.test(stripped)) continue;
      
      toTranslate.push(val);
      keys.push(key);
    }
    
    if (toTranslate.length === 0) {
      console.log(`⏭️  ${slug} (already translated)`);
      continue;
    }
    
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
      process.stdout.write(`✅ ${slug} (${changed} values)\n`);
    } else {
      errors++;
      console.log(`⚠️  ${slug} - no changes`);
    }
    
    // Rate limit: 800ms between files
    await sleep(800);
  }
  
  console.log(`\n🎉 Done! Translated ${totalTranslated} values across ${totalFiles} files`);
  if (errors > 0) console.log(`⚠️  ${errors} files had no changes (may need retry)`);
}

main().catch(console.error);
