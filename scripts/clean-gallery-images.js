#!/usr/bin/env node
// Removes <img> tags from .photo-gallery divs and the Wikimedia attribution <p> in all plant HTML files

const fs = require('fs');
const path = require('path');

function walk(dir) {
  let files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files = files.concat(walk(full));
    else if (entry.name.endsWith('.html')) files.push(full);
  }
  return files;
}

const files = walk(path.join(__dirname, '../plants'));
let changed = 0;

for (const file of files) {
  let html = fs.readFileSync(file, 'utf8');
  const original = html;

  // Remove <img ...> lines inside photo-gallery
  html = html.replace(/(<div class="photo-gallery">)([\s\S]*?)(<\/div>)/g, (match, open, inner, close) => {
    const cleaned = inner.replace(/[ \t]*<img[^>]*>\n?/g, '');
    return open + cleaned + close;
  });

  // Remove the Wikimedia attribution <p> line
  html = html.replace(/[ \t]*<p style="font-size:11px; color:#999; margin-top:5px;">Images: Wikimedia Commons[^<]*<\/p>\n?/g, '');

  if (html !== original) {
    fs.writeFileSync(file, html, 'utf8');
    console.log('cleaned:', path.relative(process.cwd(), file));
    changed++;
  }
}

console.log(`\nDone. ${changed} file(s) updated.`);
