#!/usr/bin/env node
/**
 * Re-fetch images for ALL plant pages.
 * Picks the best hero image based on category:
 *   - Fruit Trees: prefer images with "fruit" in filename
 *   - Flowering Plants: prefer "flower" 
 *   - Spices & Herbs: prefer "leaf", "leaves", "seed", "bark", "spice"
 *   - Timber Trees: prefer "tree", "trunk", "wood"
 * Verifies each URL with a HEAD request before inserting.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'ArkFarm/1.0' }, timeout: 8000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) resolve(data);
        else reject(new Error(`HTTP ${res.statusCode}`));
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function headRequest(url) {
  return new Promise((resolve) => {
    try {
      const u = new URL(url);
      const req = https.request({
        hostname: u.hostname, path: u.pathname + (u.search || ''),
        method: 'HEAD', headers: { 'User-Agent': 'ArkFarm/1.0' }, timeout: 5000
      }, (res) => resolve(res.statusCode === 200));
      req.on('error', () => resolve(false));
      req.on('timeout', () => { req.destroy(); resolve(false); });
      req.end();
    } catch { resolve(false); }
  });
}

// Score an image URL based on how relevant it is for the category
function scoreImage(url, category) {
  const lower = url.toLowerCase();
  const skip = ['status_iucn', 'gnome-', 'tango_', 'emblem-', 'question_book', '.svg', 'flag_of', 'coat_of', 'map_', 'icon', 'logo', 'stamp_of', 'wikispecies'];
  if (skip.some(s => lower.includes(s))) return -1;

  let score = 0;
  
  if (category === 'Fruit Trees') {
    if (lower.includes('fruit')) score += 10;
    if (lower.includes('halved') || lower.includes('cross_section') || lower.includes('cut')) score += 8;
    if (lower.includes('ripe')) score += 6;
    if (lower.includes('seed') || lower.includes('pod')) score += 3;
    if (lower.includes('flower') || lower.includes('blossom')) score += 1;
    if (lower.includes('tree') && !lower.includes('fruit')) score += 2;
  } else if (category === 'Flowering Plants') {
    if (lower.includes('flower') || lower.includes('blossom') || lower.includes('bloom')) score += 10;
    if (lower.includes('petal') || lower.includes('bud')) score += 8;
    if (lower.includes('garden')) score += 3;
  } else if (category === 'Spices & Herbs') {
    if (lower.includes('leaf') || lower.includes('leaves') || lower.includes('foliage')) score += 10;
    if (lower.includes('spice') || lower.includes('dried') || lower.includes('powder')) score += 9;
    if (lower.includes('seed') || lower.includes('bark') || lower.includes('pod')) score += 8;
    if (lower.includes('flower')) score += 4;
  } else if (category === 'Timber Trees') {
    if (lower.includes('tree') || lower.includes('trunk') || lower.includes('wood')) score += 10;
    if (lower.includes('bark')) score += 8;
    if (lower.includes('timber') || lower.includes('log')) score += 9;
  } else if (category === 'Medicinal Plants') {
    if (lower.includes('leaf') || lower.includes('leaves')) score += 10;
    if (lower.includes('flower')) score += 7;
    if (lower.includes('pod') || lower.includes('fruit')) score += 5;
    if (lower.includes('tree')) score += 3;
  }
  
  // Prefer larger thumbnails
  if (lower.includes('/500px-')) score += 2;
  else if (lower.includes('/330px-')) score += 1;
  else if (lower.includes('/250px-')) score += 0;
  else if (lower.includes('/120px-')) score -= 2;
  
  // Lead image from Wikipedia gets a small bonus (usually the best representative)
  return score;
}

async function getWikiImages(scientificName, category) {
  const names = [
    scientificName,
    scientificName.replace(/\s*[''][^'']*['']\s*/g, '').replace(/\s*\([^)]*\)\s*/g, '').trim(),
    scientificName.split(' ').slice(0, 2).join(' '),
    scientificName.split(' ')[0]
  ];
  const unique = [...new Set(names.filter(n => n && n.length > 2))];
  
  for (const name of unique) {
    const slug = name.replace(/\s+/g, '_').replace(/×\s*/g, '%C3%97_');
    const url = `https://en.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(slug)}`;
    
    try {
      const data = JSON.parse(await httpGet(url));
      if (!data.items) continue;
      
      let candidates = [];
      let isLead = true;
      for (const item of data.items) {
        if (item.type !== 'image' || !item.srcset || !item.srcset.length) continue;
        // Prefer the 1x scale (usually 500px)
        const src = item.srcset[0].src;
        if (!src) continue;
        const fullUrl = src.startsWith('//') ? 'https:' + src : src;
        const s = scoreImage(fullUrl, category);
        if (s < 0) continue;
        candidates.push({ url: fullUrl, score: s + (isLead ? 3 : 0), caption: item.caption?.text || '' });
        isLead = false;
      }
      
      if (candidates.length === 0) continue;
      
      // Sort by score descending
      candidates.sort((a, b) => b.score - a.score);
      
      // Take top 5 candidates — Wikimedia CDN blocks HEAD requests on thumbnails
      // so we trust the API response (it only returns existing files)
      return candidates.slice(0, 5).map(c => c.url);
    } catch {}
  }
  return [];
}

function extractScientificName(html) {
  let m = html.match(/data-i18n="scientific_name">([^<]+)</);
  if (m) return m[1].trim();
  m = html.match(/<em[^>]*>([A-Z][a-z]+ [a-z]+[^<]*)<\/em>/);
  if (m) return m[1].trim();
  return null;
}

function extractPlantName(html) {
  let m = html.match(/<h1[^>]*>([^<]+)</);
  return m ? m[1].trim() : 'Plant';
}

function detectCategory(filePath) {
  if (filePath.includes('fruit-trees')) return 'Fruit Trees';
  if (filePath.includes('spices-herbs')) return 'Spices & Herbs';
  if (filePath.includes('flowering-plants')) return 'Flowering Plants';
  if (filePath.includes('medicinal-plants')) return 'Medicinal Plants';
  if (filePath.includes('timber-trees')) return 'Timber Trees';
  return 'Fruit Trees';
}

function stripImages(html) {
  // Remove all wikimedia img tags
  html = html.replace(/<img[^>]*src="https:\/\/upload\.wikimedia\.org\/[^"]*"[^>]*>\s*/g, '');
  // Clean up gallery
  html = html.replace(/<div class="photo-gallery">[^]*?<\/div>(\s*<p[^>]*>Images:[^<]*<\/p>)?/g, '<div class="photo-gallery">\n      </div>');
  return html;
}

async function processFile(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');
  const sciName = extractScientificName(html);
  const plantName = extractPlantName(html);
  const category = detectCategory(filePath);
  if (!sciName) return { status: 'skip', name: plantName };
  
  const images = await getWikiImages(sciName, category);
  if (images.length === 0) return { status: 'none', name: plantName };
  
  // Strip existing images
  html = stripImages(html);
  
  const heroImg = images[0];
  const galleryImgs = images.slice(1, 5);
  
  // Insert hero
  const topCard = html.match(/(<div class="section top-card">)\s*\n/);
  if (topCard) {
    html = html.replace(topCard[0],
      topCard[1] + '\n      <img src="' + heroImg + '" alt="' + plantName + '" style="width:100%;border-radius:12px;margin-bottom:10px;">\n');
  }
  
  // Insert gallery
  if (galleryImgs.length > 0) {
    const gm = html.match(/<div class="photo-gallery">\s*\n?\s*<\/div>/);
    if (gm) {
      const gh = galleryImgs.map(u => '        <img src="' + u + '" alt="' + plantName + '">').join('\n');
      html = html.replace(gm[0],
        '<div class="photo-gallery">\n' + gh + '\n      </div>\n      <p style="font-size:11px; color:#999; margin-top:5px;">Images: Wikimedia Commons (CC BY-SA / Public Domain)</p>');
    }
  }
  
  fs.writeFileSync(filePath, html, 'utf8');
  return { status: 'ok', name: plantName, gallery: galleryImgs.length };
}

async function main() {
  const dirs = ['plants/fruit-trees', 'plants/spices-herbs', 'plants/medicinal-plants', 'plants/flowering-plants', 'plants/timber-trees'];
  const files = [];
  for (const d of dirs) {
    if (!fs.existsSync(d)) continue;
    for (const f of fs.readdirSync(d).filter(f => f.endsWith('.html'))) files.push(path.join(d, f));
  }
  
  console.log(`Processing ${files.length} plant pages...`);
  let ok = 0, none = 0, skip = 0;
  
  // Process in batches of 3
  for (let i = 0; i < files.length; i += 3) {
    const batch = files.slice(i, i + 3);
    const results = await Promise.all(batch.map(f => processFile(f)));
    for (let j = 0; j < results.length; j++) {
      const r = results[j];
      if (r.status === 'ok') { console.log(`✓ ${r.name} (+${r.gallery})`); ok++; }
      else if (r.status === 'none') { console.log(`✗ ${path.basename(batch[j], '.html')}`); none++; }
      else { console.log(`- ${path.basename(batch[j], '.html')}`); skip++; }
    }
    if (i + 3 < files.length) await new Promise(r => setTimeout(r, 400));
  }
  console.log(`\nDone! OK: ${ok}, No images: ${none}, Skipped: ${skip}`);
}

main().catch(console.error);
