#!/usr/bin/env node
/**
 * Translate values from translate-these.json one at a time using Google Translate.
 * Saves progress after each plant so it can be resumed if interrupted.
 * 
 * Usage: node scripts/translate-small-batch.js [max_values]
 * Default: translates 100 values per run
 */
const fs = require('fs');
const https = require('https');

const MAX = parseInt(process.argv[2]) || 100;

function googleTranslate(text) {
  return new Promise((resolve, reject) => {
    const encoded = encodeURIComponent(text);
    const path = `/translate_a/single?client=gtx&sl=en&tl=ta&dt=t&q=${encoded}`;
    
    if (path.length > 8000) {
      // Too long for URL, skip
      return reject(new Error('text too long'));
    }
    
    const req = https.get({
      hostname: 'translate.googleapis.com',
      path: path,
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode));
          const parsed = JSON.parse(data);
          const translated = parsed[0].map(s => s[0]).join('');
          resolve(translated);
        } catch (e) {
          reject(new Error('parse error'));
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const todo = JSON.parse(fs.readFileSync('translate-these.json', 'utf8'));
  const slugs = Object.keys(todo);
  
  let translated = 0;
  let failed = 0;
  let skipped = 0;
  
  for (const slug of slugs) {
    if (translated >= MAX) break;
    
    const vals = todo[slug];
    const keys = Object.keys(vals);
    if (keys.length === 0) continue;
    
    // Load existing Tamil file
    const tamilFile = `data/i18n-ta-${slug}.json`;
    if (!fs.existsSync(tamilFile)) continue;
    const tamilData = JSON.parse(fs.readFileSync(tamilFile, 'utf8'));
    
    let plantChanged = false;
    
    for (const key of keys) {
      if (translated >= MAX) break;
      
      // Skip if already translated
      if (tamilData[key]) { skipped++; continue; }
      
      const enText = vals[key];
      if (!enText || enText.length < 2) continue;
      
      try {
        const ta = await googleTranslate(enText);
        if (ta && ta !== enText) {
          tamilData[key] = ta;
          plantChanged = true;
          translated++;
          
          // Remove from todo
          delete vals[key];
        }
      } catch (e) {
        failed++;
      }
      
      // 1.5 second delay between each translation
      await sleep(1500);
    }
    
    // Save Tamil file after each plant
    if (plantChanged) {
      fs.writeFileSync(tamilFile, JSON.stringify(tamilData, null, 2) + '\n', 'utf8');
      process.stdout.write(`✓ ${slug}\n`);
    }
    
    // Clean up empty plants from todo
    if (Object.keys(vals).length === 0) {
      delete todo[slug];
    }
  }
  
  // Save remaining todo
  fs.writeFileSync('translate-these.json', JSON.stringify(todo, null, 2), 'utf8');
  
  const remaining = Object.values(todo).reduce((sum, v) => sum + Object.keys(v).length, 0);
  console.log(`\nDone! Translated: ${translated}, Failed: ${failed}, Skipped: ${skipped}`);
  console.log(`Remaining: ${remaining} values across ${Object.keys(todo).length} plants`);
}

main().catch(console.error);
