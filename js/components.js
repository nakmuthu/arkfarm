/* Shared header and footer components */
function toggleNavGroup(el) {
  el.classList.toggle('open');
  var items = el.nextElementSibling;
  if (items) items.classList.toggle('open');
}

function getBasePath() {
  var path = window.location.pathname;
  var parts = path.replace('/arkfarm/', '').split('/').filter(Boolean);
  var depth = parts.length - 1;
  if (depth <= 0) return '.';
  return Array(depth).fill('..').join('/');
}

function renderHeader() {
  var base = getBasePath();
  var lang = (window.ArkI18n && window.ArkI18n.getLang()) || localStorage.getItem('arkfarm-lang') || 'en';
  var btnLabel = lang === 'en' ? 'தமிழ்' : 'English';
  return '<header class="site-header">' +
    '<div class="container">' +
    '<a href="' + base + '/index.html" class="logo">🌳 Ark<span>Farm</span></a>' +
    '<div class="nav-right">' +
    '<a href="' + base + '/search.html" class="header-search" aria-label="Search">🔍</a>' +
    '<button id="lang-toggle" class="lang-toggle" onclick="window.ArkI18n.setLang(window.ArkI18n.getLang()===\'en\'?\'ta\':\'en\')">' + btnLabel + '</button>' +
    '<button class="nav-toggle" aria-label="Toggle navigation">☰</button>' +
    '</div>' +
    '</div></header>' +
    '<div class="nav-overlay" id="nav-overlay"></div>' +
    '<ul class="nav-links" id="nav-links">' +
    '<div class="nav-drawer-header">' +
      '<span class="nav-drawer-title">🌳 ArkFarm</span>' +
      '<button class="nav-close-btn" aria-label="Close menu">✕</button>' +
    '</div>' +
    '<li class="nav-home-link"><a href="' + base + '/index.html" data-i18n="home">Home</a></li>' +

    '<li>' +
      '<div class="nav-group-toggle" onclick="toggleNavGroup(this)"><span>🌿 Flora</span><span class="nav-arrow">▼</span></div>' +
      '<ul class="nav-group-items">' +
        '<li><a href="' + base + '/categories/aquatic-plants.html" data-i18n="aquatic_plants">Aquatic Plants</a></li>' +
        '<li><a href="' + base + '/categories/flowering-plants.html" data-i18n="flowering_plants">Flowering Plants</a></li>' +
        '<li><a href="' + base + '/categories/fruit-trees.html" data-i18n="fruit_trees">Fruit Trees</a></li>' +
        '<li><a href="' + base + '/categories/greens.html" data-i18n="greens">Greens</a></li>' +
        '<li><a href="' + base + '/categories/medicinal-plants.html" data-i18n="medicinal_plants">Medicinal Plants</a></li>' +
        '<li><a href="' + base + '/categories/ornamental-plants.html" data-i18n="ornamental_plants">Ornamental Plants</a></li>' +
        '<li><a href="' + base + '/categories/spices-herbs.html" data-i18n="spices_herbs">Spices & Herbs</a></li>' +
        '<li><a href="' + base + '/categories/timber-trees.html" data-i18n="timber_trees">Timber Trees</a></li>' +
        '<li><a href="' + base + '/categories/vegetables.html" data-i18n="vegetables">Vegetables</a></li>' +
      '</ul>' +
    '</li>' +

    '<li>' +
      '<div class="nav-group-toggle" onclick="toggleNavGroup(this)"><span>🦋 Fauna</span><span class="nav-arrow">▼</span></div>' +
      '<ul class="nav-group-items">' +
        '<li><a href="' + base + '/categories/arachnids.html">Arachnids</a></li>' +
        '<li><a href="' + base + '/categories/aquatic-fauna.html">Aquatic Fauna</a></li>' +
        '<li><a href="' + base + '/categories/birds.html">Birds</a></li>' +
        '<li><a href="' + base + '/categories/insects-pollinators.html">Insects & Pollinators</a></li>' +
        '<li><a href="' + base + '/categories/mammals.html">Mammals</a></li>' +
        '<li><a href="' + base + '/categories/reptiles-amphibians.html">Reptiles & Amphibians</a></li>' +
        '<li><a href="' + base + '/categories/soil-decomposers.html">Soil & Decomposers</a></li>' +
      '</ul>' +
    '</li>' +

    '</ul>';
}

function renderFooter() {
  return '<footer class="site-footer">' +
    '<span data-i18n="footer">© 2026 ArkFarm | Digital Biodiversity Orchard Documentation</span>' +
    '</footer>';
}

function renderHeaderNav() {
  var headerEl = document.getElementById('site-header');
  var footerEl = document.getElementById('site-footer');
  if (headerEl) headerEl.innerHTML = renderHeader();
  if (footerEl) footerEl.innerHTML = renderFooter();
  wireNav();
  // Do NOT call applyTranslations here — it's called by i18n.js after this
}

function wireNav() {
  var btn = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav-links');
  var overlay = document.getElementById('nav-overlay');
  var closeBtn = document.querySelector('.nav-close-btn');

  function openNav() { nav.classList.add('open'); overlay.classList.add('open'); }
  function closeNav() { nav.classList.remove('open'); overlay.classList.remove('open'); }

  if (btn) btn.addEventListener('click', openNav);
  if (overlay) overlay.addEventListener('click', closeNav);
  if (closeBtn) closeBtn.addEventListener('click', closeNav);
  if (nav) {
    nav.querySelectorAll('a').forEach(function(a) {
      a.addEventListener('click', closeNav);
    });
  }
}

document.addEventListener('DOMContentLoaded', function () {
  var headerEl = document.getElementById('site-header');
  var footerEl = document.getElementById('site-footer');
  if (headerEl) headerEl.innerHTML = renderHeader();
  if (footerEl) footerEl.innerHTML = renderFooter();
  wireNav();

  // Add share button on plant pages (pages with data-plant attribute)
  if (document.querySelector('[data-plant]')) {
    var shareBtn = document.createElement('button');
    shareBtn.className = 'share-btn';
    shareBtn.innerHTML = '📤';
    shareBtn.setAttribute('aria-label', 'Share this plant');
    shareBtn.onclick = function () {
      var title = document.querySelector('h1') ? document.querySelector('h1').textContent : 'ArkFarm Plant';
      var text = title + ' - ArkFarm Digital Orchard';
      var url = window.location.href;

      if (navigator.share) {
        navigator.share({ title: title, text: text, url: url }).catch(function () {});
      } else {
        navigator.clipboard.writeText(url).then(function () {
          shareBtn.innerHTML = '✓';
          setTimeout(function () { shareBtn.innerHTML = '📤'; }, 2000);
        }).catch(function () {
          prompt('Copy this link:', url);
        });
      }
    };
    document.body.appendChild(shareBtn);
  }
});
