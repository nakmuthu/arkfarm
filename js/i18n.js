/* ArkFarm i18n - English/Tamil translation engine */
(function () {
  var tamilDict = null;
  var plantDict = null;
  var currentLang = localStorage.getItem('arkfarm-lang') || 'en';
  var isApplying = false; // prevent re-entrant calls

  function getLang() { return currentLang; }

  async function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('arkfarm-lang', lang);
    document.documentElement.lang = lang === 'ta' ? 'ta' : 'en';
    // Ensure dicts are loaded before applying
    await loadTamil();
    await loadPlantDict();
    applyTranslations();
    updateToggleBtn();
  }

  function updateToggleBtn() {
    var btn = document.getElementById('lang-toggle');
    if (btn) btn.textContent = currentLang === 'en' ? 'தமிழ்' : 'English';
  }

  async function loadTamil() {
    if (tamilDict) return tamilDict;
    try {
      var res = await fetch('/arkfarm/data/i18n-ta.json?v=' + Date.now());
      tamilDict = await res.json();
    } catch (e) {
      console.error('Could not load Tamil translations:', e);
      tamilDict = {};
    }
    return tamilDict;
  }

  async function loadPlantDict() {
    if (plantDict) return plantDict;
    // Support both data-plant (flora) and data-fauna (fauna)
    var el = document.querySelector('[data-plant]') || document.querySelector('[data-fauna]');
    if (!el) return null;
    var slug = el.getAttribute('data-plant') || el.getAttribute('data-fauna');
    if (!slug) return null;
    var prefix = el.hasAttribute('data-fauna') ? 'i18n-fauna-' : 'i18n-ta-';
    try {
      var res = await fetch('/arkfarm/data/' + prefix + slug + '.json');
      plantDict = await res.json();
    } catch (e) {
      console.warn('No Tamil file for: ' + slug);
      plantDict = {};
    }
    return plantDict;
  }

  function t(key) {
    if (currentLang === 'en') return null;
    if (plantDict && plantDict[key]) return plantDict[key];
    if (tamilDict && tamilDict[key]) return tamilDict[key];
    return null;
  }

  function applyTranslations() {
    if (isApplying) return; // prevent infinite loop
    isApplying = true;

    // Re-render header/footer first (they contain data-i18n elements)
    if (typeof renderHeaderNav === 'function') renderHeaderNav();

    // Now translate all data-i18n elements in the page
    var els = document.querySelectorAll('[data-i18n]');
    els.forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var enText = el.getAttribute('data-en');
      if (!enText) {
        el.setAttribute('data-en', el.textContent);
        enText = el.textContent;
      }
      if (currentLang === 'ta') {
        var translated = t(key);
        if (translated) el.textContent = translated;
      } else {
        el.textContent = enText;
      }
    });

    // Handle placeholders
    var inputs = document.querySelectorAll('[data-i18n-placeholder]');
    inputs.forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      var enPh = el.getAttribute('data-en-placeholder');
      if (!enPh) {
        el.setAttribute('data-en-placeholder', el.placeholder);
        enPh = el.placeholder;
      }
      if (currentLang === 'ta') {
        var translated = t(key);
        if (translated) el.placeholder = translated;
      } else {
        el.placeholder = enPh;
      }
    });

    isApplying = false;
  }

  window.ArkI18n = {
    getLang: getLang,
    setLang: setLang,
    loadTamil: loadTamil,
    loadPlantDict: loadPlantDict,
    applyTranslations: applyTranslations,
    t: t
  };

  document.addEventListener('DOMContentLoaded', async function () {
    await loadTamil();
    await loadPlantDict();
    if (currentLang === 'ta') {
      document.documentElement.lang = 'ta';
    }
    applyTranslations();
    updateToggleBtn();
  });
})();
