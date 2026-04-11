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

  function renderResults(results, query) {
    const list = document.getElementById('search-results');
    if (!list) return;
    list.innerHTML = '';

    if (!query) { list.innerHTML = '<li class="no-results">Type a plant name, category, or keyword to search.</li>'; return; }
    if (results.length === 0) { list.innerHTML = '<li class="no-results">No plants found for "' + query + '"</li>'; return; }

    results.forEach(function (p) {
      const li = document.createElement('li');
      li.innerHTML = '<a href="' + p.url + '">' + p.name + '</a>' +
        (p.scientific ? ' <em>(' + p.scientific + ')</em>' : '') +
        '<span class="category-tag">' + p.category + '</span>' +
        (p.description ? '<br><small>' + p.description + '</small>' : '');
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
