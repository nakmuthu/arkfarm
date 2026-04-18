/* Ark Farm - Client-side Search */
(function () {
  let plantData = [];

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

  function renderResults(results, query) {
    const list = document.getElementById('search-results');
    if (!list) return;
    list.innerHTML = '';

    if (!query) { list.innerHTML = '<li class="no-results">Type a plant name, category, or keyword to search.</li>'; return; }
    if (results.length === 0) { list.innerHTML = '<li class="no-results">No plants found for "' + query + '"</li>'; return; }

    results.forEach(function (p) {
      const li = document.createElement('li');
      const imgUrl = getImageUrl(p);
      li.innerHTML =
        '<a class="search-result-link" href="' + p.url + '">' +
          (imgUrl ? '<img class="search-result-img" src="' + imgUrl + '" alt="' + p.name + '" onerror="this.style.display=\'none\'">' : '') +
          '<div class="search-result-body">' +
            '<span class="search-result-name">' + p.name + '</span>' +
            (p.scientific ? '<em class="search-result-sci">' + p.scientific + '</em>' : '') +
            '<span class="category-tag">' + p.category + '</span>' +
            (p.description ? '<small class="search-result-desc">' + p.description + '</small>' : '') +
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

  document.addEventListener('DOMContentLoaded', function () {
    loadPlantData();
    const input = document.getElementById('search-input');
    if (input) {
      input.addEventListener('input', function () {
        renderResults(search(this.value), this.value);
      });
    }
  });
})();
