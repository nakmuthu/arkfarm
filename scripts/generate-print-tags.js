#!/usr/bin/env node
/**
 * Generate print-tags.html from plants.json with:
 * - Sticky header with controls in one line
 * - Multi-select category dropdown
 * - Tamil/English toggle for plant names
 * - Search filter
 * - Select all / deselect all
 */
const fs = require('fs');
const path = require('path');

const plants = JSON.parse(fs.readFileSync('data/plants.json', 'utf8'));

// Load Tamil names from per-plant files and global dict
const globalTa = JSON.parse(fs.readFileSync('data/i18n-ta.json', 'utf8'));

const plantEntries = plants.map(p => {
  const htmlPath = p.url.replace('/arkfarm/', '');
  let image = '';
  if (fs.existsSync(htmlPath)) {
    const html = fs.readFileSync(htmlPath, 'utf8');
    const match = html.match(/class="section top-card[^"]*"[^>]*>[\s\S]{0,100}<img\s+src="([^"]+)"/i);
    if (match) {
      let imgSrc = match[1];
      // Convert relative path to absolute GitHub Pages URL
      if (imgSrc.startsWith('../../')) imgSrc = 'https://nakmuthu.github.io/arkfarm/' + imgSrc.replace('../../', '');
      image = imgSrc;
    }
  }

  // Get Tamil name — prefer global dict, fall back to per-plant file
  const slug = p.url.split('/').pop().replace('.html', '');
  let tamilName = globalTa[`plant_name_${slug}`] || '';
  // Only use per-plant file if global dict doesn't have it
  if (!tamilName) {
    const tamilFile = `data/i18n-ta-${slug}.json`;
    if (fs.existsSync(tamilFile)) {
      const td = JSON.parse(fs.readFileSync(tamilFile, 'utf8'));
      tamilName = td.plant_name || '';
    }
  }

  return {
    name: p.name,
    tamilName: tamilName,
    scientific: p.scientific,
    category: p.category,
    url: 'https://nakmuthu.github.io' + p.url,
    image,
    keywords: (p.keywords || []).join(' ').toLowerCase()
  };
});

// ─── Fauna entries (scanned from fauna/ directories) ─────────────────────────
const FAUNA_DIRS = {
  'insects-pollinators': 'Insects & Pollinators',
  'birds': 'Birds',
  'reptiles-amphibians': 'Reptiles & Amphibians',
  'mammals': 'Mammals',
  'arachnids': 'Arachnids',
  'soil-decomposers': 'Soil & Decomposers',
  'aquatic-fauna': 'Aquatic Fauna',
};

for (const [dir, category] of Object.entries(FAUNA_DIRS)) {
  const faunaDir = 'fauna/' + dir;
  if (!fs.existsSync(faunaDir)) continue;
  for (const file of fs.readdirSync(faunaDir).filter(f => f.endsWith('.html'))) {
    const slug = file.replace('.html', '');
    const htmlPath = faunaDir + '/' + file;
    const html = fs.readFileSync(htmlPath, 'utf8');

    // Extract name from <h1>
    const nameMatch = html.match(/<h1[^>]*>([^<]+)</);
    const name = nameMatch ? nameMatch[1].trim() : slug;

    // Extract scientific name from <em> after h1
    const sciMatch = html.match(/<h1[^>]*>[^<]*<\/h1>\s*<p><em>([^<]+)/);
    const scientific = sciMatch ? sciMatch[1].trim() : '';

    // Extract image
    let image = '';
    const imgMatch = html.match(/class="section top-card[^"]*"[^>]*>[\s\S]{0,100}<img\s+src="([^"]+)"/i);
    if (imgMatch) {
      let imgSrc = imgMatch[1];
      if (imgSrc.startsWith('../../')) imgSrc = 'https://nakmuthu.github.io/arkfarm/' + imgSrc.replace('../../', '');
      image = imgSrc;
    }

    // Tamil name — from per-fauna file or global dict
    let tamilName = globalTa['fauna_name_' + slug] || '';
    if (!tamilName) {
      const tamilFile = 'data/i18n-fauna-' + slug + '.json';
      if (fs.existsSync(tamilFile)) {
        const td = JSON.parse(fs.readFileSync(tamilFile, 'utf8'));
        tamilName = td.fauna_name || '';
      }
    }

    plantEntries.push({
      name: name,
      tamilName: tamilName,
      scientific: scientific,
      category: '🦋 ' + category,
      url: 'https://nakmuthu.github.io/arkfarm/' + htmlPath,
      image,
      keywords: [slug, name.toLowerCase(), scientific.toLowerCase(), category.toLowerCase()].join(' ')
    });
  }
}

const categories = [...new Set(plantEntries.map(p => p.category))].sort();

// Sort by name
plantEntries.sort((a, b) => a.name.localeCompare(b.name));

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Plant Name Tags - ArkFarm</title>
  <script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js"><\/script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      background: #f4f8f4; color: #333; padding-top: 60px;
    }

    /* Sticky header */
    .controls {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      background: #fff; border-bottom: 2px solid #e0e0e0;
      padding: 10px 15px;
      display: flex; flex-wrap: wrap; align-items: center; gap: 8px;
    }
    .controls .logo { color: #2e7d32; font-weight: 700; font-size: 15px; white-space: nowrap; }
    .controls select {
      padding: 6px 10px; border: 1.5px solid #4caf50; border-radius: 6px;
      font-size: 13px; min-width: 160px; max-width: 220px;
    }
    .controls input[type="search"] {
      padding: 6px 10px; border: 1.5px solid #4caf50; border-radius: 6px;
      font-size: 13px; width: 160px; outline: none;
    }
    .controls input:focus { border-color: #2e7d32; }
    .btn {
      background: #2e7d32; color: #fff; border: none;
      padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; white-space: nowrap;
    }
    .btn:hover { background: #1b5e20; }
    .btn-outline {
      background: #fff; color: #2e7d32; border: 1.5px solid #2e7d32;
      padding: 5px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; white-space: nowrap;
    }
    .btn-outline:hover { background: #e8f5e9; }
    .btn-outline.active { background: #2e7d32; color: #fff; }
    .count-label { font-size: 12px; color: #666; margin-left: auto; white-space: nowrap; }
    .back-link { font-size: 12px; color: #2e7d32; white-space: nowrap; }

    /* Tag grid */
    .tag-grid {
      display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; padding: 20px;
    }

    .tag-wrapper { position: relative; display: inline-block; }
    .tag-check {
      position: absolute; top: 4px; right: 4px; z-index: 10;
      width: 18px; height: 18px; cursor: pointer; accent-color: #2e7d32;
    }
    .tag-wrapper.deselected { opacity: 0.3; }

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
      body { padding-top: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .controls { display: none; }
      .tag-check { display: none; }
      .tag-wrapper.deselected { display: none !important; }
      .tag-grid { gap: 5mm; justify-content: flex-start; padding: 5mm; }
      .plant-tag { page-break-inside: avoid; width: 54mm !important; height: 85.6mm !important; }
      .tag-image { height: 28mm !important; }
      .tag-no-image { height: 28mm !important; }
      .tag-hole { height: 8mm !important; }
      .tag-qr { width: 22mm !important; height: 22mm !important; }
      .tag-name { font-size: 15pt !important; }
      .tag-scientific { font-size: 7.5pt !important; }
      @page { size: A4; margin: 10mm; }
    }

    @media (max-width: 600px) {
      .controls { gap: 6px; }
      .controls select, .controls input { width: 120px; min-width: auto; }
    }
  </style>
</head>
<body>

  <div class="controls">
    <span class="logo">🌳 ArkFarm Tags</span>
    <select id="cat-filter" onchange="applyFilters()">
      <option value="all">All Categories (${plantEntries.length})</option>
      ${categories.map(c => {
        const count = plantEntries.filter(p => p.category === c).length;
        return `<option value="${c}">${c} (${count})</option>`;
      }).join('\n      ')}
    </select>
    <input type="search" id="tag-search" placeholder="Filter..." oninput="applyFilters()">
    <button class="btn-outline" id="lang-btn" onclick="toggleLang()">தமிழ்</button>
    <button class="btn-outline" onclick="selectAll()">All</button>
    <button class="btn-outline" onclick="deselectAll()">None</button>
    <button class="btn" onclick="printRegular()">🖨️ Print</button>
    <button class="btn-outline" onclick="printDuplex()">🖨️ Duplex EN/TA</button>
    <span class="count-label" id="count-label"></span>
    <a href="index.html" class="back-link">← Back</a>
  </div>

  <div class="tag-grid" id="tag-grid"></div>

  <script>
    var plants = ${JSON.stringify(plantEntries)};
    var currentLang = 'en';

    function generateQR(text) {
      var qr = qrcode(0, 'M');
      qr.addData(text);
      qr.make();
      return qr.createImgTag(4, 0);
    }

    function toggleLang() {
      currentLang = currentLang === 'en' ? 'ta' : 'en';
      document.getElementById('lang-btn').textContent = currentLang === 'en' ? 'தமிழ்' : 'English';
      document.querySelectorAll('.tag-name').forEach(function(el) {
        var en = el.getAttribute('data-en');
        var ta = el.getAttribute('data-ta');
        el.textContent = currentLang === 'ta' && ta ? ta : en;
      });
    }

    function updateCount() {
      var visible = document.querySelectorAll('.tag-wrapper:not([style*="display: none"])');
      var selected = 0;
      visible.forEach(function(w) { if (!w.classList.contains('deselected')) selected++; });
      document.getElementById('count-label').textContent = selected + '/' + visible.length;
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

    function applyFilters() {
      var cat = document.getElementById('cat-filter').value;
      var search = document.getElementById('tag-search').value.toLowerCase().trim();
      document.querySelectorAll('.tag-wrapper').forEach(function(w) {
        var name = w.dataset.name.toLowerCase();
        var tamil = (w.dataset.tamil || '').toLowerCase();
        var scientific = (w.dataset.scientific || '').toLowerCase();
        var keywords = (w.dataset.keywords || '').toLowerCase();
        var wCat = w.dataset.category;
        var matchCat = cat === 'all' || wCat === cat;
        var matchSearch = !search ||
          name.includes(search) ||
          tamil.includes(search) ||
          scientific.includes(search) ||
          keywords.includes(search);
        w.style.display = (matchCat && matchSearch) ? '' : 'none';
      });
      updateCount();
    }

    function renderTags() {
      var grid = document.getElementById('tag-grid');
      plants.forEach(function(p) {
        var wrapper = document.createElement('div');
        wrapper.className = 'tag-wrapper';
        wrapper.dataset.name = p.name;
        wrapper.dataset.tamil = p.tamilName || '';
        wrapper.dataset.scientific = p.scientific || '';
        wrapper.dataset.keywords = p.keywords || '';
        wrapper.dataset.category = p.category;

        var imgHtml = p.image
          ? '<img class="tag-image" src="' + p.image + '" alt="' + p.name + '">'
          : '<div class="tag-no-image">🌱</div>';

        wrapper.innerHTML =
          '<input type="checkbox" class="tag-check" checked onchange="this.parentElement.classList.toggle(\\'deselected\\', !this.checked); updateCount();">' +
          '<div class="plant-tag">' +
            // '<div class="tag-side-logo">🌳 ARKFARM</div>' +
            '<div class="tag-hole"><div class="tag-hole-dot"></div></div>' +
            imgHtml +
            '<div class="tag-info">' +
              '<div class="tag-name" data-en="' + p.name.replace(/"/g, '&quot;') + '" data-ta="' + (p.tamilName || '').replace(/"/g, '&quot;') + '">' + p.name + '</div>' +
              '<div class="tag-scientific">' + p.scientific + '</div>' +
            '</div>' +
            '<div class="tag-bottom">' +
              '<div class="tag-qr">' + generateQR(p.url) + '</div>' +
            '</div>' +
          '</div>';

        grid.appendChild(wrapper);
      });
      updateCount();
    }

    function printRegular() { openPrintWindow(false); }
    function printDuplex()  { openPrintWindow(true);  }

    function openPrintWindow(duplex) {
      var wrappers = Array.from(document.querySelectorAll('.tag-wrapper'))
        .filter(function(w) { return w.style.display !== 'none' && !w.classList.contains('deselected'); });

      var COLS = 3, ROWS = 3, PER_PAGE = COLS * ROWS;
      var pages = [];
      for (var i = 0; i < wrappers.length; i += PER_PAGE) pages.push(wrappers.slice(i, i + PER_PAGE));

      function tagHtml(w, lang) {
        var tag = w.querySelector('.plant-tag');
        var imgEl = tag.querySelector('.tag-image');
        var imgHtml = imgEl ? '<img class="tag-image" src="' + imgEl.src + '" alt="">' : '<div class="tag-no-image">🌱</div>';
        var nameEl = tag.querySelector('.tag-name');
        var name = lang === 'ta' ? (nameEl.getAttribute('data-ta') || nameEl.getAttribute('data-en')) : nameEl.getAttribute('data-en');
        var sci = tag.querySelector('.tag-scientific').textContent;
        var qrHtml = tag.querySelector('.tag-qr').innerHTML;
        return '<div class="plant-tag">' +
          '<div class="tag-hole"><div class="tag-hole-dot"></div></div>' +
          imgHtml +
          '<div class="tag-info"><div class="tag-name">' + name + '</div><div class="tag-scientific">' + sci + '</div></div>' +
          '<div class="tag-bottom"><div class="tag-qr">' + qrHtml + '</div></div>' +
          '</div>';
      }

      function buildPage(cells, reversed) {
        var html = '<div class="print-page">';
        for (var r = 0; r < ROWS; r++) {
          var row = cells.slice(r * COLS, r * COLS + COLS);
          while (row.length < COLS) row.push('');
          if (reversed) row = row.slice().reverse();
          html += '<div class="print-row">';
          row.forEach(function(cell) { html += '<div class="print-cell">' + cell + '</div>'; });
          html += '</div>';
        }
        return html + '</div>';
      }

      var extraCss = [
        'body{margin:0;padding:0;}',
        '#pages .print-page{width:190mm;display:flex;flex-direction:column;align-items:center;padding-top:5.1mm;page-break-before:always;break-before:page;}',
        '#pages .print-page:first-child{page-break-before:avoid;break-before:avoid;}',
        '.print-row{display:flex;justify-content:center;gap:5mm;margin-bottom:5mm;}',
        '.print-row:last-child{margin-bottom:0;}',
        '.print-cell{width:54mm;height:85.6mm;flex-shrink:0;}',
        '.plant-tag{width:54mm!important;height:85.6mm!important;}',
        '.tag-image{height:28mm!important;}',
        '.tag-no-image{height:28mm!important;}',
        '.tag-hole{height:8mm!important;}',
        '.tag-qr{width:22mm!important;height:22mm!important;}',
        '.tag-name{font-size:15pt!important;}',
        '.tag-scientific{font-size:7.5pt!important;}',
        '@page{size:A4;margin:10mm;}'
      ].join('\\n');

      var bodyHtml = '';
      var pageIdx = 0;
      if (duplex) {
        pages.forEach(function(page) {
          var en = page.map(function(w) { return tagHtml(w, 'en'); });
          while (en.length < PER_PAGE) en.push('');
          bodyHtml += buildPage(en, false);
          var ta = page.map(function(w) { return tagHtml(w, 'ta'); });
          while (ta.length < PER_PAGE) ta.push('');
          bodyHtml += buildPage(ta, true);
        });
      } else {
        pages.forEach(function(page) {
          var cells = page.map(function(w) { return tagHtml(w, currentLang); });
          while (cells.length < PER_PAGE) cells.push('');
          bodyHtml += buildPage(cells, false);
        });
      }

      var css = document.querySelector('style').textContent;
      var title = duplex ? 'ArkFarm Duplex Tags' : 'ArkFarm Tags';
      var win = window.open('', '_blank');
      win.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>' + title + '</title>' +
        '<script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js"><\\/script>' +
        '<style>' + css + extraCss + '</style></head>' +
        '<body><div id="pages">' + bodyHtml + '</div>' +
        '<script>window.onload=function(){window.print();}<\\/script></body></html>');
      win.document.close();
    }

    document.addEventListener('DOMContentLoaded', renderTags);
  <\/script>
</body>
</html>
`;

fs.writeFileSync('print-tags.html', html, 'utf8');
console.log('Generated print-tags.html with ' + plantEntries.length + ' plants');
console.log('  With images: ' + plantEntries.filter(p => p.image).length);
console.log('  With Tamil names: ' + plantEntries.filter(p => p.tamilName).length);
console.log('  Categories: ' + categories.join(', '));
