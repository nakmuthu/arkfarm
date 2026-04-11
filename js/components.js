/* Shared header and footer components */
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
    '<ul class="nav-links">' +
    '<li><a href="' + base + '/index.html" data-i18n="home">Home</a></li>' +
    '<li><a href="' + base + '/categories/fruit-trees.html" data-i18n="fruit_trees">Fruit Trees</a></li>' +
    '<li><a href="' + base + '/categories/spices-herbs.html" data-i18n="spices_herbs">Spices & Herbs</a></li>' +
    '<li><a href="' + base + '/categories/medicinal-plants.html" data-i18n="medicinal_plants">Medicinal Plants</a></li>' +
    '<li><a href="' + base + '/categories/flowering-plants.html" data-i18n="flowering_plants">Flowering Plants</a></li>' +
    '<li><a href="' + base + '/categories/vegetables.html" data-i18n="vegetables">Vegetables</a></li>' +
    '<li><a href="' + base + '/categories/greens.html" data-i18n="greens">Greens</a></li>' +
    '<li><a href="' + base + '/categories/cactus.html" data-i18n="cactus">Cactus</a></li>' +
    '<li><a href="' + base + '/categories/ornamental-plants.html" data-i18n="ornamental_plants">Ornamental Plants</a></li>' +
    '<li><a href="' + base + '/categories/timber-trees.html" data-i18n="timber_trees">Timber Trees</a></li>' +
    '</ul>' +
    '</div></header>';
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
  var btn = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav-links');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }
  // Do NOT call applyTranslations here — it's called by i18n.js after this
}

document.addEventListener('DOMContentLoaded', function () {
  var headerEl = document.getElementById('site-header');
  var footerEl = document.getElementById('site-footer');
  if (headerEl) headerEl.innerHTML = renderHeader();
  if (footerEl) footerEl.innerHTML = renderFooter();

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
