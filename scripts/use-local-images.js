#!/usr/bin/env node
// Replaces remote image URLs with local paths for plants that have a local image file.
// Updates: plant HTML hero, categories/*.html cards, print-tags.html JS data

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const LOCAL_IMG_BASE = 'images/categories/plants'; // relative to root

// Walk a directory for files matching an extension
function walk(dir, ext) {
  let files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files = files.concat(walk(full, ext));
    else if (entry.name.endsWith(ext)) files.push(full);
  }
  return files;
}

// Build map: slug -> local image path (relative to root, web-style)
// e.g. "abiu" -> "images/categories/plants/fruit-trees/abiu.jpg"
const localImages = {};
const imgDir = path.join(ROOT, LOCAL_IMG_BASE);
for (const imgFile of walk(imgDir, '.jpg').concat(walk(imgDir, '.png').concat(walk(imgDir, '.webp')))) {
  const slug = path.basename(imgFile, path.extname(imgFile));
  const rel = path.relative(ROOT, imgFile).replace(/\\/g, '/');
  localImages[slug] = rel;
}

console.log('Local images found:', Object.keys(localImages));

// ── 1. Update plant HTML hero images ──────────────────────────────────────────
for (const [slug, localPath] of Object.entries(localImages)) {
  // Find the plant HTML file (search all subdirs under plants/)
  const matches = walk(path.join(ROOT, 'plants'), '.html')
    .filter(f => path.basename(f, '.html') === slug);

  for (const file of matches) {
    let html = fs.readFileSync(file, 'utf8');
    const original = html;
    // Replace the top-card hero img src — div may have extra attributes like data-plant
    const relToFile = path.relative(path.dirname(file), path.join(ROOT, localPath)).replace(/\\/g, '/');
    // If img tag exists, replace its src; otherwise insert one after the top-card div opening
    if (/(<div class="section top-card"[^>]*>[\s\S]{0,100}<img\s+src=")[^"]+(")/m.test(html)) {
      html = html.replace(
        /(<div class="section top-card"[^>]*>[\s\S]{0,100}<img\s+src=")[^"]+(")/,
        `$1${relToFile}$2`
      );
    } else {
      html = html.replace(
        /(<div class="section top-card"[^>]*>)\s*\n(\s*<h1)/,
        `$1\n      <img src="${relToFile}" alt="${slug.replace(/-/g,' ')}" style="width:100%;border-radius:12px;margin-bottom:10px;">\n$2`
      );
    }
    if (html !== original) {
      fs.writeFileSync(file, html, 'utf8');
      console.log('plant html updated:', path.relative(ROOT, file));
    }
  }
}

// ── 2. Update category page card images ───────────────────────────────────────
for (const catFile of walk(path.join(ROOT, 'categories'), '.html')) {
  let html = fs.readFileSync(catFile, 'utf8');
  const original = html;

  for (const [slug, localPath] of Object.entries(localImages)) {
    // Match card img where the href points to this plant slug
    const re = new RegExp(
      `(href="[^"]*/${slug}\\.html"[^>]*>\\s*<img\\s+src=")[^"]+(")`,'g'
    );
    const relToCat = path.relative(path.dirname(catFile), path.join(ROOT, localPath)).replace(/\\/g, '/');
    html = html.replace(re, `$1${relToCat}$2`);
  }

  if (html !== original) {
    fs.writeFileSync(catFile, html, 'utf8');
    console.log('category updated:', path.relative(ROOT, catFile));
  }
}

// ── 3. Update print-tags.html inline JS ───────────────────────────────────────
const tagsFile = path.join(ROOT, 'print-tags.html');
let tagsHtml = fs.readFileSync(tagsFile, 'utf8');
const tagsOriginal = tagsHtml;

for (const [slug, localPath] of Object.entries(localImages)) {
  // Match "image":"<any url>" inside the plant object that has this slug in its url field
  // Strategy: replace image value for entries whose url contains the slug
  const re = new RegExp(
    `("url":"[^"]*/${slug}\\.html"[^}]*?"image":")[^"]+(")`,'g'
  );
  tagsHtml = tagsHtml.replace(re, `$1https://nakmuthu.github.io/arkfarm/${localPath}$2`);
}

if (tagsHtml !== tagsOriginal) {
  fs.writeFileSync(tagsFile, tagsHtml, 'utf8');
  console.log('print-tags.html updated');
}

console.log('\nDone.');
