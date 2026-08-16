#!/usr/bin/env node
/**
 * Translate aquatic plant Tamil files one value at a time (reliable, no batch misalignment).
 * Usage: node scripts/translate-aquatic-v2.js
 */
const fs = require('fs');
const https = require('https');

function googleTranslate(text) {
  return new Promise((resolve, reject) => {
    const encoded = encodeURIComponent(text);
    const url = `/translate_a/single?client=gtx&sl=en&tl=ta&dt=t&q=${encoded}`;
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
          resolve(parsed[0].map(s => s[0]).join(''));
        } catch (e) { reject(new Error('Parse error')); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function needsTranslation(val) {
  if (!val || typeof val !== 'string') return false;
  if (val === '—' || val === '6.0–7.5') return false;
  const stripped = val.replace(/[\d.,°–\-\/₹%+()\s×]/g, '');
  return stripped.length > 0 && /[A-Za-z]/.test(stripped);
}

async function main() {
  const slugs = fs.readdirSync('plants/aquatic-plants')
    .filter(f => f.endsWith('.html'))
    .map(f => f.replace('.html', ''))
    .sort();

  let totalTranslated = 0;
  let totalFiles = 0;

  for (const slug of slugs) {
    const filePath = `data/i18n-ta-${slug}.json`;
    if (!fs.existsSync(filePath)) continue;

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let changed = 0;

    for (const key of Object.keys(data)) {
      if (!key.endsWith('_val') && key !== 'plant_name') continue;
      if (!needsTranslation(data[key])) continue;

      try {
        const translated = await googleTranslate(data[key]);
        if (translated && translated !== data[key]) {
          data[key] = translated;
          changed++;
        }
      } catch (e) {
        // skip on error, keep original
      }
      await sleep(350); // rate limit
    }

    if (changed > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
      totalTranslated += changed;
      totalFiles++;
      console.log(`✅ ${slug} (${changed})`);
    } else {
      console.log(`⏭️  ${slug}`);
    }
  }

  console.log(`\n🎉 Done! ${totalTranslated} values across ${totalFiles} files`);
}

main().catch(console.error);
