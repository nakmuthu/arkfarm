#!/usr/bin/env node
/**
 * ArkFarm Master Script — Run after creating a new plant HTML page.
 * Handles everything: images, Tamil, search index, categories, homepage, print tags, validation, git push.
 *
 * Usage:
 *   node scripts/add-plant.js                    # process all new/changed plants
 *   node scripts/add-plant.js --push             # also git push at the end
 *   node scripts/add-plant.js --slug champak     # process a specific plant only
 *   node scripts/add-plant.js --push --slug champak
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
const shouldPush = args.includes('--push');
const slugFilter = args.includes('--slug') ? args[args.indexOf('--slug') + 1] : null;

const PLANT_DIRS = ['plants/fruit-trees', 'plants/spices-herbs', 'plants/medicinal-plants', 'plants/flowering-plants', 'plants/timber-trees', 'plants/ornamental-plants', 'plants/greens'];
const HAND_CRAFTED = new Set(['passion-fruit', 'malkova-mango', 'paneer-rose', 'moringa-tree', 'jasmine']);

// ─── Utilities ───────────────────────────────────────────────────────────────

function httpGet(url, timeout = 8000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'ArkFarm/1.0' }, timeout }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => res.statusCode === 200 ? resolve(d) : reject(new Error('HTTP ' + res.statusCode)));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function log(emoji, msg) { console.log(emoji + ' ' + msg); }

// ─── Step 1: Find new/changed plant pages ────────────────────────────────────

function getTargetSlugs() {
  const slugs = [];
  for (const dir of PLANT_DIRS) {
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.html'))) {
      const slug = file.replace('.html', '');
      if (slugFilter && slug !== slugFilter) continue;
      slugs.push({ slug, dir, file: path.join(dir, file) });
    }
  }
  return slugs;
}

// ─── Step 2: Add images ───────────────────────────────────────────────────────

async function getWikiImages(scientificName, category) {
  const names = [
    scientificName,
    scientificName.replace(/\s*[''][^'']*['']\s*/g, '').replace(/\s*\([^)]*\)\s*/g, '').trim(),
    scientificName.split(' ').slice(0, 2).join(' '),
    scientificName.split(' ')[0]
  ];
  const unique = [...new Set(names.filter(n => n && n.length > 2))];

  function scoreImage(url, cat) {
    const lower = url.toLowerCase();
    const skip = ['status_iucn', 'gnome-', 'tango_', 'emblem-', 'question_book', '.svg', 'flag_of', 'coat_of', 'map_', 'icon', 'logo', 'stamp_of'];
    if (skip.some(s => lower.includes(s))) return -1;
    let score = 0;
    if (cat === 'Fruit Trees') { if (lower.includes('fruit')) score += 10; if (lower.includes('halved')) score += 8; }
    else if (cat === 'Flowering Plants') { if (lower.includes('flower') || lower.includes('bloom')) score += 10; }
    else if (cat === 'Spices & Herbs') { if (lower.includes('leaf') || lower.includes('leaves') || lower.includes('spice')) score += 10; }
    else if (cat === 'Timber Trees') { if (lower.includes('tree') || lower.includes('wood')) score += 10; }
    else if (cat === 'Medicinal Plants') { if (lower.includes('leaf') || lower.includes('flower')) score += 10; }
    if (lower.includes('/500px-')) score += 2;
    return score;
  }

  for (const name of unique) {
    const slug = name.replace(/\s+/g, '_').replace(/×\s*/g, '%C3%97_');
    try {
      const data = JSON.parse(await httpGet(`https://en.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(slug)}`));
      if (!data.items) continue;
      let candidates = [];
      let isLead = true;
      for (const item of data.items) {
        if (item.type !== 'image' || !item.srcset || !item.srcset.length) continue;
        const src = item.srcset[0].src;
        if (!src || src.includes('.svg')) continue;
        const fullUrl = src.startsWith('//') ? 'https:' + src : src;
        const s = scoreImage(fullUrl, category);
        if (s < 0) continue;
        candidates.push({ url: fullUrl, score: s + (isLead ? 3 : 0) });
        isLead = false;
      }
      if (candidates.length > 0) {
        candidates.sort((a, b) => b.score - a.score);
        return candidates.slice(0, 5).map(c => c.url);
      }
    } catch {}
  }
  return [];
}

async function addImages(slug, htmlPath, category) {
  let html = fs.readFileSync(htmlPath, 'utf8');
  if (html.includes('upload.wikimedia.org') || html.includes('https://')) {
    // Check if hero image already exists
    const heroMatch = html.match(/(<div class="section top-card"[^>]*>)\s*\n\s*<img/);
    if (heroMatch) return false; // already has hero
  }

  const sciMatch = html.match(/data-i18n="scientific_name">([^<]+)</);
  if (!sciMatch) return false;
  const sciName = sciMatch[1].trim();
  const plantName = (html.match(/<h1[^>]*>([^<]+)</) || [])[1] || slug;

  const images = await getWikiImages(sciName, category);
  if (images.length === 0) return false;

  const heroImg = images[0];
  const galleryImgs = images.slice(1, 5);

  const topCard = html.match(/(<div class="section top-card"[^>]*>)\s*\n/);
  if (topCard) {
    html = html.replace(topCard[0],
      topCard[1] + '\n      <img src="' + heroImg + '" alt="' + plantName + '" style="width:100%;border-radius:12px;margin-bottom:10px;">\n');
  }

  if (galleryImgs.length > 0) {
    const gm = html.match(/<div class="photo-gallery">\s*\n?\s*<\/div>/);
    if (gm) {
      const gh = galleryImgs.map(u => '        <img src="' + u + '" alt="' + plantName + '">').join('\n');
      html = html.replace(gm[0],
        '<div class="photo-gallery">\n' + gh + '\n      </div>\n      <p style="font-size:11px; color:#999; margin-top:5px;">Images: Wikimedia Commons (CC BY-SA / Public Domain)</p>');
    }
  }

  fs.writeFileSync(htmlPath, html, 'utf8');
  return true;
}

// ─── Step 3: Tamil translation (batched) ─────────────────────────────────────

async function googleTranslateBatch(texts) {
  const results = [];
  let i = 0;
  while (i < texts.length) {
    // Build a batch that fits under 2000 chars
    const batch = [];
    let charCount = 0;
    while (i < texts.length && batch.length < 8 && charCount + texts[i].length < 1800) {
      batch.push(texts[i]);
      charCount += texts[i].length;
      i++;
    }
    if (batch.length === 0) { results.push(texts[i]); i++; continue; }

    const separator = ' ||| ';
    const combined = batch.join(separator);
    try {
      const encoded = encodeURIComponent(combined);
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ta&dt=t&q=${encoded}`;
      const data = JSON.parse(await httpGet(url, 10000));
      const translated = data[0].map(s => s[0]).join('');
      const parts = translated.split('|||').map(s => s.trim());
      for (let j = 0; j < batch.length; j++) {
        results.push(parts[j] && parts[j] !== batch[j] ? parts[j] : batch[j]);
      }
    } catch {
      batch.forEach(t => results.push(t));
    }
    await sleep(600);
  }
  return results;
}

async function generateTamil(slug, htmlPath) {
  const tamilFile = `data/i18n-ta-${slug}.json`;
  const html = fs.readFileSync(htmlPath, 'utf8');
  const existing = fs.existsSync(tamilFile) ? JSON.parse(fs.readFileSync(tamilFile, 'utf8')) : {};

  // Extract all _val keys and their English text
  const pairs = {};
  const regex = /data-i18n="([^"]*_val)"[^>]*>([^<]+)/g;
  let m;
  while ((m = regex.exec(html)) !== null) {
    const key = m[1], val = m[2].trim();
    if (val && !existing[key]) pairs[key] = val;
  }
  const spanRegex = /<span data-i18n="([^"]*_val)">([^<]+)<\/span>/g;
  while ((m = spanRegex.exec(html)) !== null) {
    const key = m[1], val = m[2].trim();
    if (val && !existing[key]) pairs[key] = val;
  }

  // Translate each key individually to avoid batch-split scrambling
  let count = 0;
  for (const [key, enVal] of Object.entries(pairs)) {
    const translated = await googleTranslateBatch([enVal]);
    if (translated[0] && translated[0] !== enVal) {
      existing[key] = translated[0];
      count++;
    }
    await sleep(150);
  }

  // Set plant_name if missing
  if (!existing.plant_name) {
    const nameMatch = html.match(/<h1[^>]*>([^<]+)</);
    if (nameMatch) {
      const translated = await googleTranslateBatch([nameMatch[1].trim()]);
      existing.plant_name = (translated[0] && translated[0] !== nameMatch[1].trim())
        ? translated[0] : nameMatch[1].trim();
    }
  }

  fs.writeFileSync(tamilFile, JSON.stringify(existing, null, 2) + '\n', 'utf8');
  return count;
}

// ─── Step 4: Update plants.json ───────────────────────────────────────────────

function updateSearchIndex(slug, htmlPath, dir) {
  const plants = JSON.parse(fs.readFileSync('data/plants.json', 'utf8'));
  const category = dir.includes('fruit-trees') ? 'Fruit Trees'
    : dir.includes('spices-herbs') ? 'Spices & Herbs'
    : dir.includes('medicinal-plants') ? 'Medicinal Plants'
    : dir.includes('flowering-plants') ? 'Flowering Plants'
    : dir.includes('timber-trees') ? 'Timber Trees'
    : dir.includes('vegetables') ? 'Vegetables'
    : dir.includes('greens') ? 'Greens'
    : 'Ornamental Plants';

  const url = '/arkfarm/' + htmlPath.replace(/\\/g, '/');
  if (plants.find(p => p.url === url)) return false; // already exists

  const html = fs.readFileSync(htmlPath, 'utf8');
  const name = (html.match(/<h1[^>]*>([^<]+)</) || [])[1] || slug;
  const scientific = (html.match(/data-i18n="scientific_name">([^<]+)</) || [])[1] || '';
  // Use meta description for a proper sentence; fall back to common names
  const metaDesc = (html.match(/<meta name="description" content="([^"]+)"/) || [])[1] || '';
  const commonNames = (html.match(/data-i18n="common_names_val">([^<]+)</) || [])[1] || '';
  // Strip any generic "Complete guide to ..." boilerplate regardless of format
  const cleanedMeta = metaDesc.replace(/^Complete guide to .+?(?:at ArkFarm\.?)?$/i, '').trim();
  const desc = cleanedMeta || commonNames;

  plants.push({ name: name.trim(), scientific: scientific.trim(), category, url, keywords: [slug], description: desc.trim() });
  fs.writeFileSync('data/plants.json', JSON.stringify(plants, null, 2) + '\n', 'utf8');
  return true;
}

// ─── Step 5: Enrich search keywords ──────────────────────────────────────────

function enrichSearch() {
  const plants = JSON.parse(fs.readFileSync('data/plants.json', 'utf8'));
  for (const plant of plants) {
    const htmlPath = plant.url.replace('/arkfarm/', '');
    if (!fs.existsSync(htmlPath)) continue;
    const html = fs.readFileSync(htmlPath, 'utf8');
    const newKw = new Set(plant.keywords || []);
    const cm = html.match(/Common Names:<\/strong>\s*(?:<span[^>]*>)?([^<]+)/);
    if (cm) cm[1].split(/[,;]/).forEach(n => { const t = n.trim().toLowerCase(); if (t.length > 1) newKw.add(t); });
    const lm = html.match(/Local Name:<\/strong>\s*(?:<span[^>]*>)?([^<]+)/);
    if (lm) lm[1].split(/[,;]/).forEach(n => { const t = n.replace(/\([^)]*\)/g, '').trim().toLowerCase(); if (t.length > 1) newKw.add(t); });
    plant.keywords = [...newKw];
  }
  fs.writeFileSync('data/plants.json', JSON.stringify(plants, null, 2) + '\n', 'utf8');
}

// ─── Step 6-9: Run generators ─────────────────────────────────────────────────

function runScript(name) {
  try { require('./' + name); } catch {}
}

// ─── Step 10: Git push ────────────────────────────────────────────────────────

function gitPush(message) {
  const tmp = '/tmp/arkfarm-push-' + Date.now();
  try {
    execSync(`git clone https://github.com/nakmuthu/arkfarm.git ${tmp}`, { stdio: 'pipe' });
    execSync(`rsync -a --exclude='.git' --exclude='.DS_Store' --exclude='template.html' --exclude='translate-these.json' . ${tmp}/`, { stdio: 'pipe' });
    execSync(`git -C ${tmp} add .`, { stdio: 'pipe' });
    execSync(`git -C ${tmp} commit -m "${message}"`, { stdio: 'pipe' });
    execSync(`git -C ${tmp} push origin main`, { stdio: 'pipe' });
    execSync(`rm -rf ${tmp}`, { stdio: 'pipe' });
    return true;
  } catch (e) {
    execSync(`rm -rf ${tmp}`, { stdio: 'pipe' });
    return false;
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const targets = getTargetSlugs();
  log('🌱', `Processing ${targets.length} plant pages...`);

  const newSlugs = [];

  for (const { slug, dir, file } of targets) {
    const category = dir.includes('fruit-trees') ? 'Fruit Trees'
      : dir.includes('spices-herbs') ? 'Spices & Herbs'
      : dir.includes('medicinal-plants') ? 'Medicinal Plants'
      : dir.includes('flowering-plants') ? 'Flowering Plants'
      : dir.includes('timber-trees') ? 'Timber Trees'
      : dir.includes('ornamental-plants') ? 'Ornamental Plants'
      : dir.includes('greens') ? 'Greens' : 'Other';

    process.stdout.write(`  ${slug}... `);

    // Images
    const imgAdded = await addImages(slug, file, category);
    if (imgAdded) process.stdout.write('📸 ');

    // Tamil
    if (!HAND_CRAFTED.has(slug)) {
      const count = await generateTamil(slug, file);
      if (count > 0) process.stdout.write(`🇮🇳(${count}) `);
    }

    // Search index
    const isNew = updateSearchIndex(slug, file, dir);
    if (isNew) { process.stdout.write('🔍 '); newSlugs.push(slug); }

    console.log('✓');
    await sleep(300);
  }

  // Enrich keywords
  log('🔍', 'Enriching search keywords...');
  enrichSearch();

  // Sync global Tamil dict with plant_name and plant_desc for all processed plants
  log('🌐', 'Syncing global Tamil dict...');
  const globalTa = JSON.parse(fs.readFileSync('data/i18n-ta.json', 'utf8'));
  const allPlants = JSON.parse(fs.readFileSync('data/plants.json', 'utf8'));
  let syncCount = 0;
  for (const { slug } of targets) {
    const tamilFile = `data/i18n-ta-${slug}.json`;
    if (!fs.existsSync(tamilFile)) continue;
    const td = JSON.parse(fs.readFileSync(tamilFile, 'utf8'));
    const nameKey = `plant_name_${slug}`;
    // Only write to global if it's Tamil (not English fallback)
    const isTamil = str => str && /[\u0B80-\u0BFF]/.test(str);
    if (td.plant_name && isTamil(td.plant_name) && !isTamil(globalTa[nameKey] || '')) {
      globalTa[nameKey] = td.plant_name;
      syncCount++;
    }
    // Sync plant_desc from plants.json — translate to Tamil if not already present
    const descKey = `plant_desc_${slug}`;
    if (!isTamil(globalTa[descKey] || '')) {
      const plant = allPlants.find(p => p.url.includes(`/${slug}.html`));
      if (plant && plant.description) {
        try {
          const translated = await httpGet(
            'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ta&dt=t&q=' +
            encodeURIComponent(plant.description), 8000
          );
          const parsed = JSON.parse(translated);
          const ta = parsed[0].map(x => x[0]).join('');
          if (isTamil(ta)) {
            globalTa[descKey] = ta;
            syncCount++;
          }
        } catch (e) {
          // fallback: store English so card at least has text
          globalTa[descKey] = plant.description;
          syncCount++;
        }
        await sleep(300);
      }
    }
  }
  if (syncCount > 0) {
    fs.writeFileSync('data/i18n-ta.json', JSON.stringify(globalTa, null, 2), 'utf8');
    log('🌐', `Synced ${syncCount} keys to global Tamil dict`);
  }

  // Regenerate all outputs
  log('📄', 'Regenerating category pages...');
  require('./generate-category-pages');

  log('🏠', 'Updating homepage counts...');
  require('./update-homepage-counts');

  log('🏷️', 'Regenerating print tags...');
  require('./generate-print-tags');

  // Validate
  log('✅', 'Validating i18n...');
  try {
    execSync('node scripts/validate-i18n.js', { stdio: 'pipe' });
    log('✅', 'Validation passed');
  } catch (e) {
    log('⚠️', 'Validation warnings — check output');
    console.log(e.stdout?.toString() || '');
  }

  if (shouldPush) {
    const msg = newSlugs.length > 0
      ? `Add plants: ${newSlugs.join(', ')}`
      : 'Update plant pages and regenerate outputs';
    log('🚀', 'Pushing to GitHub...');
    const ok = gitPush(msg);
    log(ok ? '✅' : '❌', ok ? 'Pushed successfully' : 'Push failed — push manually');
  } else {
    log('💡', 'Run with --push to auto-push to GitHub');
  }

  log('🎉', 'Done!');
}

main().catch(console.error);
