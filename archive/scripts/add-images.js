#!/usr/bin/env node
/**
 * Fetch Wikimedia Commons images for plant pages that don't have them.
 * Uses Wikipedia REST API to find images by scientific name.
 * 
 * Usage: node scripts/add-images.js
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'ArkFarm/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) resolve(data);
        else reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      });
    }).on('error', reject);
  });
}

async function getWikiImages(scientificName) {
  const slug = scientificName.replace(/['']/g, '').replace(/\s+/g, '_').replace(/×_?/g, '%C3%97_');
  const url = `https://en.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(slug)}`;
  
  try {
    const data = JSON.parse(await fetch(url));
    if (!data.items) return [];
    
    const images = [];
    for (const item of data.items) {
      if (item.type !== 'image' || !item.srcset || !item.srcset.length) continue;
      const src = item.srcset[0].src;
      if (!src || src.includes('.svg')) continue;
      // Convert protocol-relative to https
      const fullUrl = src.startsWith('//') ? 'https:' + src : src;
      // Only include actual plant photos, skip icons/status images
      if (fullUrl.includes('Status_iucn') || fullUrl.includes('Gnome-') || fullUrl.includes('Tango_') || fullUrl.includes('Emblem-') || fullUrl.includes('Question_book')) continue;
      images.push(fullUrl);
    }
    return images;
  } catch (e) {
    return [];
  }
}

function extractScientificName(html) {
  // Try data-i18n="scientific_name" first
  let match = html.match(/data-i18n="scientific_name">([^<]+)</);
  if (match) return match[1].trim();
  // Try <em> tag
  match = html.match(/<em[^>]*>([A-Z][a-z]+ [a-z]+[^<]*)<\/em>/);
  if (match) return match[1].trim();
  return null;
}

function extractPlantName(html) {
  let match = html.match(/<h1[^>]*>([^<]+)</);
  if (match) return match[1].trim();
  return 'Plant';
}

async function processFile(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');
  
  // Skip if already has wikimedia images
  if (html.includes('upload.wikimedia.org')) return null;
  
  const sciName = extractScientificName(html);
  const plantName = extractPlantName(html);
  if (!sciName) return null;
  
  // Try the full scientific name first
  let images = await getWikiImages(sciName);
  
  // If no results, try just the genus + species (strip variety/cultivar names)
  if (images.length === 0) {
    const baseSpecies = sciName.replace(/\s*[''][^'']*['']\s*/g, '').replace(/\s*\([^)]*\)\s*/g, '').trim();
    if (baseSpecies !== sciName) {
      images = await getWikiImages(baseSpecies);
    }
  }
  
  // If still no results, try just the genus
  if (images.length === 0) {
    const genus = sciName.split(' ')[0];
    if (genus && genus !== sciName) {
      images = await getWikiImages(genus);
    }
  }
  
  if (images.length === 0) return null;
  
  const heroImg = images[0];
  const galleryImgs = images.slice(1, 5);
  
  // Insert hero image after top-card div opening
  const topCardMatch = html.match(/(<div class="section top-card">)\s*\n/);
  if (topCardMatch) {
    html = html.replace(
      topCardMatch[0],
      topCardMatch[1] + '\n      <img src="' + heroImg + '" alt="' + plantName + '" style="width:100%;border-radius:12px;margin-bottom:10px;">\n'
    );
  }
  
  // Add gallery images if photo gallery section exists and has no images
  if (galleryImgs.length > 0) {
    const galleryMatch = html.match(/<div class="photo-gallery">\s*\n?\s*<\/div>/);
    if (galleryMatch) {
      const galleryHtml = galleryImgs.map(url => 
        '        <img src="' + url + '" alt="' + plantName + '">'
      ).join('\n');
      html = html.replace(galleryMatch[0], 
        '<div class="photo-gallery">\n' + galleryHtml + '\n      </div>\n      <p style="font-size:11px; color:#999; margin-top:5px;">Images: Wikimedia Commons (CC BY-SA / Public Domain)</p>'
      );
    }
  }
  
  fs.writeFileSync(filePath, html, 'utf8');
  return { name: plantName, heroImg, galleryCount: galleryImgs.length };
}

async function main() {
  const plantDirs = ['plants/fruit-trees', 'plants/spices-herbs', 'plants/medicinal-plants', 'plants/flowering-plants', 'plants/timber-trees'];
  const allFiles = [];
  
  for (const dir of plantDirs) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
    for (const f of files) allFiles.push(path.join(dir, f));
  }
  
  // Filter to only files without wikimedia images
  const needImages = allFiles.filter(f => {
    const html = fs.readFileSync(f, 'utf8');
    return !html.includes('upload.wikimedia.org');
  });
  
  console.log(`Found ${needImages.length} pages needing images...`);
  
  let success = 0, failed = 0;
  
  // Process in batches of 5 to avoid rate limiting
  for (let i = 0; i < needImages.length; i += 5) {
    const batch = needImages.slice(i, i + 5);
    const results = await Promise.all(batch.map(f => processFile(f)));
    
    for (let j = 0; j < results.length; j++) {
      const r = results[j];
      if (r) {
        console.log(`✓ ${r.name}: hero + ${r.galleryCount} gallery`);
        success++;
      } else {
        const slug = path.basename(batch[j], '.html');
        console.log(`✗ ${slug}: no images found`);
        failed++;
      }
    }
    
    // Small delay between batches
    if (i + 5 < needImages.length) {
      await new Promise(r => setTimeout(r, 500));
    }
  }
  
  console.log(`\nDone! Added images: ${success}, No images found: ${failed}`);
}

main().catch(console.error);
