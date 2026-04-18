/* Ark Farm - Client-side Search */
(function () {
  let plantData = [];
  let lastQuery = '';

  async function loadPlantData() {
    try {
      const res = await fetch('/arkfarm/data/plants.json');
      plantData = await res.json();
    } catch (e) {
      console.error('Could not load plant data:', e);
    }
  }

  function getImageUrl(p) {
    // Derive image path from plant URL: /arkfarm/plants/<cat>/<slug>.html
    const match = p.url.match(/\/plants\/([^/]+)\/([^/]+)\.html$/);
    if (!match) return '';
    return '/arkfarm/images/categories/plants/' + match[1] + '/' + match[2] + '.jpg';
  }

  function getSlug(p) {
    const match = p.url.match(/\/([^/]+)\.html$/);
    return match ? match[1] : '';
  }

  function translated(key, fallback) {
    if (window.ArkI18n && window.ArkI18n.getLang() === 'ta') {
      const val = window.ArkI18n.t(key);
      if (val) return val;
    }
    return fallback;
  }

  function renderResults(results, query) {
    const list = document.getElementById('search-results');
    if (!list) return;
    list.innerHTML = '';

    if (!query) {
      list.innerHTML = '<li class="no-results">' + translated('search_hint', 'Type a plant name, category, or keyword to search.') + '</li>';
      return;
    }
    if (results.length === 0) {
      list.innerHTML = '<li class="no-results">No plants found for "' + query + '"</li>';
      return;
    }

    results.forEach(function (p) {
      const slug = getSlug(p);
      const imgUrl = getImageUrl(p);
      const name = translated('plant_name_' + slug, p.name);
      const desc = translated('plant_desc_' + slug, p.description || '');

      const li = document.createElement('li');
      li.innerHTML =
        '<a class="search-result-link" href="' + p.url + '">' +
          (imgUrl ? '<img class="search-result-img" src="' + imgUrl + '" alt="' + p.name + '" onerror="this.style.display=\'none\'">' : '') +
          '<div class="search-result-body">' +
            '<span class="search-result-name">' + name + '</span>' +
            (p.scientific ? '<em class="search-result-sci">' + p.scientific + '</em>' : '') +
            '<span class="category-tag">' + p.category + '</span>' +
            (desc ? '<small class="search-result-desc">' + desc + '</small>' : '') +
          '</div>' +
        '</a>';
      list.appendChild(li);
    });
  }

  function search(query) {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return plantData.filter(function (p) {
      return p.name.toLowerCase().includes(q) ||
        (p.scientific && p.scientific.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q) ||
        (p.keywords && p.keywords.some(function (k) { return k.toLowerCase().includes(q); })) ||
        (p.description && p.description.toLowerCase().includes(q));
    });
  }

  function rerender() {
    if (lastQuery) renderResults(search(lastQuery), lastQuery);
  }

  document.addEventListener('DOMContentLoaded', function () {
    loadPlantData();
    const input = document.getElementById('search-input');
    if (input) {
      input.addEventListener('input', function () {
        lastQuery = this.value;
        renderResults(search(lastQuery), lastQuery);
      });
    }

    // Re-render results when language is toggled
    const langBtn = document.getElementById('lang-toggle');
    if (langBtn) {
      langBtn.addEventListener('click', function () {
        // Small delay to let ArkI18n finish switching
        setTimeout(rerender, 50);
      });
    }
  });
})();
