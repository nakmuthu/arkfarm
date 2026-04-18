#!/usr/bin/env node
/**
 * Auto-generate category pages from plants.json
 */
const fs = require('fs');
const plants = JSON.parse(fs.readFileSync('data/plants.json', 'utf8'));

const categories = {
  'Fruit Trees': { file: 'categories/fruit-trees.html', emoji: '🍎', slug: 'fruit-trees', i18nTitle: 'cat_fruit_title', i18nIntro: 'cat_fruit_intro', intro: 'Tropical and subtropical fruit varieties grown at ArkFarm.' },
  'Spices & Herbs': { file: 'categories/spices-herbs.html', emoji: '🌶️', slug: 'spices-herbs', i18nTitle: 'cat_spices_title', i18nIntro: 'cat_spices_intro', intro: 'Aromatic spices, culinary herbs, and fragrant leaves grown at ArkFarm.' },
  'Medicinal Plants': { file: 'categories/medicinal-plants.html', emoji: '🌿', slug: 'medicinal-plants', i18nTitle: 'cat_medicinal_title', i18nIntro: 'cat_medicinal_intro', intro: 'Healing plants and traditional remedies grown at ArkFarm.' },
  'Flowering Plants': { file: 'categories/flowering-plants.html', emoji: '🌸', slug: 'flowering-plants', i18nTitle: 'cat_flowering_title', i18nIntro: 'cat_flowering_intro', intro: 'Fragrant and beautiful flowering plants from ArkFarm.' },
  'Timber Trees': { file: 'categories/timber-trees.html', emoji: '🪵', slug: 'timber-trees', i18nTitle: 'cat_timber_title', i18nIntro: 'cat_timber_intro', intro: 'Valuable hardwood and timber species at ArkFarm.' },
  'Vegetables': { file: 'categories/vegetables.html', emoji: '🥬', slug: 'vegetables', i18nTitle: 'cat_vegetables_title', i18nIntro: 'cat_vegetables_intro', intro: 'Fresh organic vegetables from ArkFarm.' },
  'Greens': { file: 'categories/greens.html', emoji: '🥗', slug: 'greens', i18nTitle: 'cat_greens_title', i18nIntro: 'cat_greens_intro', intro: 'Leafy greens and nutritious garden staples.' },
  'Ornamental Plants': { file: 'categories/ornamental-plants.html', emoji: '🌺', slug: 'ornamental-plants', i18nTitle: 'cat_ornamental_title', i18nIntro: 'cat_ornamental_intro', intro: 'Decorative plants for landscaping and beauty.' },
};

for (const [catName, cat] of Object.entries(categories)) {
  const catPlants = plants.filter(p => p.category === catName).sort((a, b) => a.name.localeCompare(b.name));
  
  let cards = '';
  if (catPlants.length > 0) {
    cards = catPlants.map(p => {
      const href = '../' + p.url.replace('/arkfarm/', '');
      const slug = p.url.split('/').pop().replace('.html', '');
      const nameKey = `plant_name_${slug}`;
      const scientificKey = `plant_scientific_${slug}`;
      const descKey = `plant_desc_${slug}`;

      // Extract hero image from plant HTML
      const htmlPath = p.url.replace('/arkfarm/', '');
      let imgTag = '';
      if (fs.existsSync(htmlPath)) {
        const html = fs.readFileSync(htmlPath, 'utf8');
        const match = html.match(/class="section top-card[^"]*"[^>]*>[\s\S]{0,100}<img\s+src="([^"]+)"/i);
        if (match) {
          let imgSrc = match[1];
          // Convert relative path from plant page depth (../../images/...) to category page depth (../images/...)
          if (imgSrc.startsWith('../../')) imgSrc = imgSrc.replace('../../', '../');
          imgTag = `\n        <img src="${imgSrc}" alt="${p.name}">`;
        }
      }

      return `      <a class="card" href="${href}">${imgTag}
        <div class="card-body">
          <h3 data-i18n="${nameKey}" data-en="${p.name}">${p.name}</h3>
          <p><em data-i18n="${scientificKey}" data-en="${p.scientific}">${p.scientific}</em></p>
          <p data-i18n="${descKey}" data-en="${p.description}">${p.description}</p>
        </div>
      </a>`;
    }).join('\n');
  } else {
    cards = `      <p>Coming soon.</p>`;
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${catName} - ArkFarm</title>
  <meta name="description" content="Browse ${catName.toLowerCase()} at ArkFarm.">
  <link rel="canonical" href="https://nakmuthu.github.io/arkfarm/categories/${cat.slug}.html">
  <link rel="stylesheet" href="../css/style.css">
</head>
<body>
  <div id="site-header"></div>
  <div class="container">
    <div class="breadcrumb"><a href="../index.html" data-i18n="home">Home</a> / ${catName}</div>
    <h1 style="color:#2e7d32;" data-i18n="${cat.i18nTitle}">${cat.emoji} ${catName}</h1>
    <p style="margin-bottom:20px;" data-i18n="${cat.i18nIntro}">${cat.intro}</p>
    <div class="card-grid">
${cards}
    </div>
  </div>
  <div id="site-footer"></div>
  <script src="../js/i18n.js"></script>
  <script src="../js/components.js"></script>
  <script src="../js/nav.js"></script>
</body>
</html>
`;

  fs.writeFileSync(cat.file, html, 'utf8');
  console.log(`${cat.file}: ${catPlants.length} plants`);
}
