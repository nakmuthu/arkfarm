#!/usr/bin/env node
/**
 * Generate print-tags.html from plants.json with selection UI.
 */
const fs = require('fs');
const path = require('path');

const plants = JSON.parse(fs.readFileSync('data/plants.json', 'utf8'));

const plantEntries = plants.map(p => {
  const htmlPath = p.url.replace('/arkfarm/', '');
  let image = '';
  if (fs.existsSync(htmlPath)) {
    const html = fs.readFileSync(htmlPath, 'utf8');
    const match = html.match(/src="(https:\/\/upload\.wikimedia\.org\/[^"]+)"/);
    if (match) image = match[1];
  }
  return { name: p.name, scientific: p.scientific, category: p.category, url: 'https://nakmuthu.github.io' + p.url, image };
});

// Get unique categories
const categories = [...new Set(plantEntries.map(p => p.category))].sort();

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Plant Name Tags - ArkFarm</title>
  <script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js"><\/script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      background: #f4f8f4; color: #333; margin: 0; padding: 20px;
    }

    /* Controls bar */
    .controls {
      max-width: 900px; margin: 0 auto 20px; padding: 15px;
      background: #fff; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.05);
    }
    .controls h1 { color: #2e7d32; margin: 0 0 10px; font-size: 1.4em; }
    .controls p { color: #666; margin: 0 0 12px; font-size: 14px; }
    .controls-row {
      display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-bottom: 12px;
    }
    .controls-row label { font-size: 14px; cursor: pointer; }
    .controls-row input[type="checkbox"] { margin-right: 4px; cursor: pointer; }
    .btn {
      background: #2e7d32; color: #fff; border: none;
      padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;
    }
    .btn:hover { background: #1b5e20; }
    .btn-outline {
      background: #fff; color: #2e7d32; border: 2px solid #2e7d32;
      padding: 8px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;
    }
    .btn-outline:hover { background: #e8f5e9; }
    .search-tags {
      padding: 8px 14px; border: 2px solid #4caf50; border-radius: 8px;
      font-size: 14px; outline: none; width: 220px;
    }
    .search-tags:focus { border-color: #2e7d32; }
    .count-label { font-size: 13px; color: #666; margin-left: auto; }
    .category-filters { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
    .cat-btn {
      padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;
      border: 1.5px solid #4caf50; background: #fff; color: #2e7d32; cursor: pointer;
    }
    .cat-btn.active { background: #2e7d32; color: #fff; }
    .back-link { display: inline-block; margin-top: 8px; color: #2e7d32; font-size: 14px; }

    /* Tag wrapper with checkbox */
    .tag-wrapper { position: relative; display: inline-block; }
    .tag-check {
      position: absolute; top: 4px; right: 4px; z-index: 10;
      width: 18px; height: 18px; cursor: pointer; accent-color: #2e7d32;
    }
    .tag-wrapper.deselected { opacity: 0.35; }

    .tag-grid {
      display: flex; flex-wrap: wrap; gap: 20px; justify-content: center;
    }

    .plant-tag {
      width: 54mm; height: 85.6mm;
      border: 1.5px solid #2e7d32; border-radius: 3mm;
      background: #fff; box-sizing: border-box; overflow: hidden;
      display: flex; flex-direction: column; position: relative;
    }
    .tag-side-logo {
      position: absolute; left: 2mm; bottom: 3mm;
      writing-mode: vertical-rl; transform: rotate(180deg);
      font-size: 5.5pt; color: #a5d6a7; font-weight: 700;
      letter-spacing: 1.5px; white-space: nowrap;
    }
    .tag-hole {
      height: 8mm; display: flex; align-items: center;
      justify-content: center; flex-shrink: 0;
    }
    .tag-hole-dot {
      width: 5mm; height: 5mm; border-radius: 50%; border: 0.5px dashed #ccc;
    }
    .tag-image {
      width: 100%; height: 28mm; object-fit: cover; flex-shrink: 0;
    }
    .tag-no-image {
      width: 100%; height: 28mm;
      background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
      display: flex; align-items: center; justify-content: center;
      font-size: 24pt; flex-shrink: 0;
    }
    .tag-info {
      flex: 1; padding: 2mm 3mm 1mm;
      display: flex; flex-direction: column;
      align-items: center; text-align: center; justify-content: center;
    }
    .tag-name {
      font-size: 15pt; font-weight: 700; color: #1b5e20;
      line-height: 1.15; margin-bottom: 1mm;
    }
    .tag-scientific {
      font-size: 7.5pt; font-style: italic; color: #555;
    }
    .tag-bottom {
      display: flex; align-items: center; justify-content: center;
      padding: 0 3mm 2.5mm; flex-shrink: 0;
    }
    .tag-qr { width: 22mm; height: 22mm; flex-shrink: 0; }
    .tag-qr img, .tag-qr canvas { width: 22mm !important; height: 22mm !important; }

    @media print {
      body { background: #fff; padding: 0; margin: 0; }
      .controls { display: none; }
      .tag-check { display: none; }
      .tag-wrapper.deselected { display: none !important; }
      .tag-grid { gap: 5mm; justify-content: flex-start; padding: 5mm; }
      .plant-tag { page-break-inside: avoid; }
      @page { size: A4; margin: 10mm; }
    }
  </style>
</head>
<body>

  <div class="controls">
    <h1>🌳 ArkFarm Plant Name Tags</h1>
    <p>Select the tags you want to print. Portrait ID card size (54mm × 85.6mm).</p>

    <div class="category-filters" id="cat-filters"></div>

    <div class="controls-row">
      <input type="search" class="search-tags" id="tag-search" placeholder="Filter by name...">
      <button class="btn-outline" onclick="selectAll()">Select All</button>
      <button class="btn-outline" onclick="deselectAll()">Deselect All</button>
      <button class="btn" onclick="window.print()">🖨️ Print Selected</button>
      <span class="count-label" id="count-label"></span>
    </div>
    <a href="index.html" class="back-link">← Back to ArkFarm</a>
  </div>

  <div class="tag-grid" id="tag-grid"></div>

  <script>
    var plants = ${JSON.stringify(plantEntries, null, 2)};
    var categories = ${JSON.stringify(categories)};
    var activeCategory = 'all';

    function generateQR(text) {
      var qr = qrcode(0, 'M');
      qr.addData(text);
      qr.make();
      return qr.createImgTag(4, 0);
    }

    function updateCount() {
      var total = document.querySelectorAll('.tag-wrapper:not([style*="display: none"])').length;
      var selected = document.querySelectorAll('.tag-wrapper:not(.deselected):not([style*="display: none"])').length;
      document.getElementById('count-label').textContent = selected + ' of ' + total + ' selected';
    }

    function selectAll() {
      document.querySelectorAll('.tag-wrapper:not([style*="display: none"])').forEach(function(w) {
        w.classList.remove('deselected');
        w.querySelector('.tag-check').checked = true;
      });
      updateCount();
    }

    function deselectAll() {
      document.querySelectorAll('.tag-wrapper:not([style*="display: none"])').forEach(function(w) {
        w.classList.add('deselected');
        w.querySelector('.tag-check').checked = false;
      });
      updateCount();
    }

    function filterByCategory(cat) {
      activeCategory = cat;
      document.querySelectorAll('.cat-btn').forEach(function(b) {
        b.classList.toggle('active', b.dataset.cat === cat);
      });
      applyFilters();
    }

    function applyFilters() {
      var search = document.getElementById('tag-search').value.toLowerCase().trim();
      document.querySelectorAll('.tag-wrapper').forEach(function(w) {
        var name = w.dataset.name.toLowerCase();
        var cat = w.dataset.category;
        var matchCat = activeCategory === 'all' || cat === activeCategory;
        var matchSearch = !search || name.includes(search);
        w.style.display = (matchCat && matchSearch) ? '' : 'none';
      });
      updateCount();
    }

    function renderCategoryFilters() {
      var container = document.getElementById('cat-filters');
      var allBtn = '<button class="cat-btn active" data-cat="all" onclick="filterByCategory(\\'all\\')">All (' + plants.length + ')</button>';
      var catBtns = categories.map(function(c) {
        var count = plants.filter(function(p) { return p.category === c; }).length;
        return '<button class="cat-btn" data-cat="' + c + '" onclick="filterByCategory(\\'' + c.replace(/'/g, "\\\\'") + '\\')">' + c + ' (' + count + ')</button>';
      }).join('');
      container.innerHTML = allBtn + catBtns;
    }

    function renderTags() {
      var grid = document.getElementById('tag-grid');
      plants.forEach(function(plant, i) {
        var wrapper = document.createElement('div');
        wrapper.className = 'tag-wrapper';
        wrapper.dataset.name = plant.name;
        wrapper.dataset.category = plant.category;

        var imgHtml = plant.image
          ? '<img class="tag-image" src="' + plant.image + '" alt="' + plant.name + '">'
          : '<div class="tag-no-image">🌱</div>';

        wrapper.innerHTML =
          '<input type="checkbox" class="tag-check" checked onchange="this.parentElement.classList.toggle(\\'deselected\\', !this.checked); updateCount();">' +
          '<div class="plant-tag">' +
            '<div class="tag-side-logo">🌳 ARKFARM</div>' +
            '<div class="tag-hole"><div class="tag-hole-dot"></div></div>' +
            imgHtml +
            '<div class="tag-info">' +
              '<div class="tag-name">' + plant.name + '</div>' +
              '<div class="tag-scientific">' + plant.scientific + '</div>' +
            '</div>' +
            '<div class="tag-bottom">' +
              '<div class="tag-qr">' + generateQR(plant.url) + '</div>' +
            '</div>' +
          '</div>';

        grid.appendChild(wrapper);
      });
      updateCount();
    }

    document.addEventListener('DOMContentLoaded', function() {
      renderCategoryFilters();
      renderTags();
      document.getElementById('tag-search').addEventListener('input', applyFilters);
    });
  <\/script>
</body>
</html>
`;

fs.writeFileSync('print-tags.html', html, 'utf8');
console.log('Generated print-tags.html with ' + plantEntries.length + ' plants');
console.log('  With images: ' + plantEntries.filter(p => p.image).length);
console.log('  Without images: ' + plantEntries.filter(p => !p.image).length);
console.log('  Categories: ' + categories.join(', '));
