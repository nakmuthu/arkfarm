#!/usr/bin/env node
/**
 * Generate aquatic plant HTML pages from plant data.
 * Run: node scripts/generate-aquatic-pages.js
 */

const fs = require('fs');
const path = require('path');

const plants = [
  { name:"Ludwigia sedioides", scientific:"Ludwigia sedioides", category:"Floating-leaf (Surface)", features:["Ornamental","Mosaic pattern","Needs direct sun"], light:"High", slug:"ludwigia-sedioides", family:"Onagraceae", origin:"Brazil, South America", type:"Floating-leaf aquatic perennial", desc:"Floating mosaic rosettes with diamond-shaped leaves in geometric patterns on water surface" },
  { name:"Water Poppy", scientific:"Hydrocleys nymphoides", category:"Floating-leaf (Emergent)", features:["Yellow flowers","Shade provider","Runner spreader"], light:"High", slug:"water-poppy", family:"Alismataceae", origin:"Central and South America", type:"Floating-leaf emergent aquatic", desc:"Floating aquatic with round leaves and bright yellow three-petaled flowers" },
  { name:"Azolla caroliniana", scientific:"Azolla caroliniana", category:"Floating (Surface)", features:["Nitrogen-fixing","Algae control","Fish shelter"], light:"Medium", slug:"azolla-caroliniana", family:"Salviniaceae", origin:"Americas (tropical and temperate)", type:"Free-floating aquatic fern", desc:"Tiny floating fern that fixes nitrogen and controls algae growth" },
  { name:"Spirodela polyrhiza", scientific:"Spirodela polyrhiza", category:"Floating (Surface)", features:["Nutrient absorber","Fish shelter","Fast multiplier"], light:"Medium", slug:"spirodela-polyrhiza-greater-duckweed", family:"Araceae (Lemnoideae)", origin:"Cosmopolitan", type:"Free-floating aquatic", desc:"Greater duckweed that rapidly absorbs excess nutrients from water" },
  { name:"Salvinia natans", scientific:"Salvinia natans", category:"Floating (Surface)", features:["Shade provider","Nutrient absorber","Textured leaves"], light:"Medium", slug:"salvinia-natans", family:"Salviniaceae", origin:"Europe, Asia, Africa", type:"Free-floating aquatic fern", desc:"Floating fern with textured water-repellent leaves providing shade cover" },
  { name:"Dwarf Hairgrass", scientific:"Eleocharis acicularis", category:"Carpeting (Submerged)", features:["Oxygenating","Dense carpet","Runner spreader"], light:"High", slug:"dwarf-hairgrass", family:"Cyperaceae", origin:"Cosmopolitan", type:"Submerged carpeting aquatic", desc:"Fine grass-like aquatic that forms dense green carpets via runners" },
  { name:"Eleocharis parvula Japanese", scientific:"Eleocharis parvula", category:"Carpeting (Submerged)", features:["Oxygenating","Ultra-short","Dense mat"], light:"Med-High", slug:"elocharis-parvula-japanese-mini-hair-grass", family:"Cyperaceae", origin:"Japan, Americas", type:"Submerged carpeting aquatic", desc:"Extra-short carpeting plant forming ultra-dense mats" },
  { name:"Staurogyne spatulata", scientific:"Staurogyne spatulata", category:"Foreground (Submerged)", features:["Oxygenating","Compact","Slow spreader"], light:"Med-High", slug:"staurogyne-spatulata", family:"Acanthaceae", origin:"South America", type:"Submerged foreground aquatic", desc:"Compact bushy foreground plant with spatula-shaped leaves" },
  { name:"Staurogyne sp. Brown", scientific:"Staurogyne sp.", category:"Foreground (Submerged)", features:["Oxygenating","Brown tones","Compact"], light:"Med-High", slug:"staurogyne-sp-brown", family:"Acanthaceae", origin:"South America", type:"Submerged foreground aquatic", desc:"Compact foreground plant with distinctive brownish-toned leaves for contrast" },
  { name:"Ammannia sp. Bonsai", scientific:"Ammannia sp. Bonsai", category:"Foreground Stem", features:["Oxygenating","Red/orange","Compact"], light:"High", slug:"ammania-sp-bonsai", family:"Lythraceae", origin:"Southeast Asia", type:"Submerged stem aquatic", desc:"Compact red-orange accent stem plant ideal for foreground placement" },
  { name:"Alternanthera reineckii Mini", scientific:"Alternanthera reineckii Mini", category:"Foreground Stem", features:["Oxygenating","Vivid red","Compact"], light:"High", slug:"alternanthera-reineckii-mini", family:"Amaranthaceae", origin:"South America", type:"Submerged stem aquatic", desc:"Vivid red-purple compact stem plant adding striking foreground color" },
  { name:"Hygrophila Araguaia", scientific:"Hygrophila sp. Araguaia", category:"Foreground Stem", features:["Oxygenating","Compact bushy","Reddish"], light:"Med-High", slug:"hygrophila-araguaia", family:"Acanthaceae", origin:"Brazil (Araguaia River)", type:"Submerged stem aquatic", desc:"Compact reddish bushy stem plant from the Araguaia River region" },
  { name:"Lysimachia nummularia", scientific:"Lysimachia nummularia", category:"Creeping Stem", features:["Oxygenating","Creeping","Golden leaves"], light:"Medium", slug:"lysimachia-nummularia", family:"Primulaceae", origin:"Europe", type:"Creeping aquatic/semi-aquatic", desc:"Creeping Jenny with golden round leaves, adaptable creeping stem plant" },
  { name:"Sagittaria sp. Narrow Leaf", scientific:"Sagittaria subulata", category:"Rosette/Grass-like", features:["Oxygenating","Grass-like","Easy spreader"], light:"Medium", slug:"sagittaria-sp-narrow-leaf", family:"Alismataceae", origin:"Americas", type:"Submerged rosette aquatic", desc:"Grass-like spreading aquatic forming dense underwater meadows" },
  { name:"Java Moss", scientific:"Taxiphyllum barbieri", category:"Moss (Submerged)", features:["Oxygenating","Fish fry shelter","Very hardy","Low light OK"], light:"Low-Med", slug:"java-moss", family:"Hypnaceae", origin:"Southeast Asia", type:"Aquatic moss", desc:"Hardy aquatic moss that attaches to rocks and driftwood, sheltering fish fry" },
  { name:"Bacopa Caroliniana", scientific:"Bacopa caroliniana", category:"Stem (Emergent)", features:["Oxygenating","Lemon-scented","Can emerge"], light:"Medium", slug:"bacopa-caroliniana", family:"Plantaginaceae", origin:"Southern USA", type:"Emergent stem aquatic", desc:"Lemon-scented stem plant that can grow both submerged and emergent" },
  { name:"Bacopa monnieri", scientific:"Bacopa monnieri", category:"Stem (Emergent)", features:["Oxygenating","Medicinal (Brahmi)","Emergent flowers"], light:"Medium", slug:"bacopa-monnieri", family:"Plantaginaceae", origin:"India, tropical regions", type:"Emergent stem aquatic", desc:"Brahmi - medicinal aquatic herb with small white flowers above water" },
  { name:"Bacopa Salzmannii Purple", scientific:"Bacopa salzmannii", category:"Stem (Emergent)", features:["Oxygenating","Purple color","Slow grower"], light:"Med-High", slug:"bacopa-salzmannii-purple-sg", family:"Plantaginaceae", origin:"South America", type:"Emergent stem aquatic", desc:"Purple-toned Bacopa variety adding color contrast to aquascapes" },
  { name:"Ludwigia Repens", scientific:"Ludwigia repens", category:"Stem (Emergent)", features:["Oxygenating","Red-green","Easy grower"], light:"Med-High", slug:"ludwigia-repens", family:"Onagraceae", origin:"Americas", type:"Emergent stem aquatic", desc:"Easy red-green bicolor stem plant, versatile and fast-growing" },
  { name:"Ludwigia ovalis", scientific:"Ludwigia ovalis", category:"Stem (Emergent)", features:["Oxygenating","Orange-red","Oval leaves"], light:"Med-High", slug:"ludwigia-ovalis", family:"Onagraceae", origin:"Japan, East Asia", type:"Emergent stem aquatic", desc:"Oval-leaved Ludwigia that develops beautiful orange-red coloration under high light" },
  { name:"Ludwigia glandulosa", scientific:"Ludwigia glandulosa", category:"Stem (Submerged)", features:["Oxygenating","Deep red/purple","Slow grower"], light:"High", slug:"ludwigia-glandulosa", family:"Onagraceae", origin:"Southern USA", type:"Submerged stem aquatic", desc:"Deep red-purple accent stem plant, slow-growing and demanding" },
  { name:"Ludwigia palustris Hi Red", scientific:"Ludwigia palustris", category:"Stem (Emergent)", features:["Oxygenating","Intense red","Versatile"], light:"High", slug:"ludwigia-palustris-hi-red", family:"Onagraceae", origin:"Americas, Europe", type:"Emergent stem aquatic", desc:"Intensely red Ludwigia variety, versatile in both submerged and emergent growth" },
  { name:"Ludwigia Atlantis Dark Orange", scientific:"Ludwigia sp. Atlantis", category:"Stem (Submerged)", features:["Oxygenating","Dark orange","Moderate grower"], light:"High", slug:"ludwigia-atlantis-dark-orange", family:"Onagraceae", origin:"Cultivar", type:"Submerged stem aquatic", desc:"Dark orange-toned Ludwigia cultivar with warm autumn colors" },
  { name:"Rotala Rotundifolia Hi Red", scientific:"Rotala rotundifolia Hi Red", category:"Stem (Submerged)", features:["Oxygenating","Intense red","Fine leaves"], light:"High", slug:"rotala-rotundifolia-hi-red", family:"Lythraceae", origin:"Southeast Asia", type:"Submerged stem aquatic", desc:"Intense red Rotala with fine leaves, best planted in groups" },
  { name:"Rotala Macrandra Mini Butterfly", scientific:"Rotala macrandra Mini", category:"Stem (Submerged)", features:["Oxygenating","Pink/red","Demanding"], light:"High", slug:"rotala-macrandra-mini-butterfly", family:"Lythraceae", origin:"India", type:"Submerged stem aquatic", desc:"Striking pink-red miniature Rotala, demanding but highly rewarding focal plant" },
  { name:"Rotala Wallichii", scientific:"Rotala wallichii", category:"Stem (Submerged)", features:["Oxygenating","Feathery","Pink needles"], light:"High", slug:"rotala-wallichii", family:"Lythraceae", origin:"Southeast Asia", type:"Submerged stem aquatic", desc:"Feathery pink needle-leaved stem plant creating soft texture in aquascapes" },
  { name:"Rotala Wallichii Mexicana", scientific:"Rotala wallichii Mexicana", category:"Stem (Submerged)", features:["Oxygenating","Fine needles","Pink/red"], light:"High", slug:"rotala-wallichii-mexicana", family:"Lythraceae", origin:"Mexico/Southeast Asia", type:"Submerged stem aquatic", desc:"Fine pink-red needle-leaved variety of Rotala wallichii" },
  { name:"Echinodorus Muricatus Green", scientific:"Echinodorus muricatus", category:"Rosette (Emergent)", features:["Oxygenating","Large leaves","Can emerge"], light:"Medium", slug:"echinodorus-muricatus-green", family:"Alismataceae", origin:"South America", type:"Rosette aquatic (emergent)", desc:"Large sword plant with broad green leaves, excellent focal point" },
  { name:"Echinodorus Cordifolius Marble Queen", scientific:"Echinodorus cordifolius", category:"Rosette (Emergent)", features:["Oxygenating","Heart-shaped","Large specimen"], light:"Medium", slug:"echinodorus-cordifolius-marble-queen-green", family:"Alismataceae", origin:"Americas", type:"Rosette aquatic (emergent)", desc:"Large heart-shaped marbled specimen plant, striking centerpiece" },
  { name:"Juncus repens", scientific:"Juncus repens", category:"Grass-like (Submerged)", features:["Oxygenating","Grass-like","Reddish tones"], light:"Med-High", slug:"juncus-repens", family:"Juncaceae", origin:"Southern USA", type:"Submerged grass-like aquatic", desc:"Grass-textured aquatic developing attractive reddish tones under high light" },
  { name:"Cardamine lyrata", scientific:"Cardamine lyrata", category:"Stem (Emergent)", features:["Oxygenating","Round leaves","Aerial roots"], light:"Medium", slug:"cardamine-lyrata", family:"Brassicaceae", origin:"East Asia", type:"Emergent stem aquatic", desc:"Delicate stem plant with round leaves and characteristic aerial roots" },
  { name:"Lindernia rotundifolia", scientific:"Lindernia rotundifolia", category:"Stem (Submerged)", features:["Oxygenating","Round leaves","Moderate grower"], light:"Med-High", slug:"lindernia-rotundifolia", family:"Linderniaceae", origin:"Southeast Asia", type:"Submerged stem aquatic", desc:"Compact round-leaved stem plant with moderate growth rate" },
  { name:"Hygrophila polysperma Rosanervig", scientific:"Hygrophila polysperma Rosanervig", category:"Stem (Submerged)", features:["Oxygenating","Pink veined","Very fast"], light:"Med-High", slug:"hygrophila-polysperma-rosanervig", family:"Acanthaceae", origin:"India (cultivar)", type:"Submerged stem aquatic", desc:"Fast-growing stem plant with distinctive pink-white veined leaves" },
  { name:"Pogostemon stellatus Dassen", scientific:"Pogostemon stellatus Dassen", category:"Stem (Submerged)", features:["Oxygenating","Star leaves","Purple"], light:"High", slug:"pogostemon-stellatus-dassen-purple", family:"Lamiaceae", origin:"Southeast Asia, India", type:"Submerged stem aquatic", desc:"Purple star-shaped whorled leaves creating dramatic vertical accents" },
  { name:"Cyperus Helferi", scientific:"Cyperus helferi", category:"Grass-like (Emergent)", features:["Oxygenating","Flowing","Graceful"], light:"Medium", slug:"cyperus-helferi", family:"Cyperaceae", origin:"Thailand", type:"Emergent grass-like aquatic", desc:"Long flowing grass-like leaves creating graceful underwater movement" },
  { name:"Vallisneria nana", scientific:"Vallisneria nana", category:"Rosette/Grass-like", features:["Oxygenating","Ribbon leaves","Runner spreader"], light:"Medium", slug:"vallisneria-nana", family:"Hydrocharitaceae", origin:"Australia", type:"Submerged rosette aquatic", desc:"Compact ribbon-leaved Vallisneria forming flowing background curtains via runners" },
  { name:"Hygrophila difformis", scientific:"Hygrophila difformis", category:"Stem (Emergent)", features:["Oxygenating","Fast grower","Nutrient absorber","Lacy leaves"], light:"Medium", slug:"hygrophila-difformis", family:"Acanthaceae", origin:"India, Southeast Asia", type:"Emergent stem aquatic", desc:"Water Wisteria - fast-growing lacy-leaved plant excellent at absorbing excess nutrients" },
  { name:"Hygrophila Quadrivalvis Needle Leaf", scientific:"Hygrophila sp. Quadrivalvis", category:"Stem (Emergent)", features:["Oxygenating","Needle leaves","Fast grower"], light:"Medium", slug:"hygrophila-sp-quadrivalvis-needle-leaf", family:"Acanthaceae", origin:"India", type:"Emergent stem aquatic", desc:"Narrow needle-leaved Hygrophila with fast growth and vertical habit" },
  { name:"Hygrophila balsamica", scientific:"Hygrophila balsamica", category:"Stem (Emergent)", features:["Oxygenating","Feathery","Fast grower"], light:"Med-High", slug:"hygrophila-balsamica", family:"Acanthaceae", origin:"India", type:"Emergent stem aquatic", desc:"Tall feathery stem plant with rapid growth, excellent background plant" },
  { name:"Limnophila hippuridoides", scientific:"Limnophila hippuridoides", category:"Stem (Submerged)", features:["Oxygenating","Purple/green","Aromatic"], light:"Med-High", slug:"limnophila-hippuridoides", family:"Plantaginaceae", origin:"Southeast Asia", type:"Submerged stem aquatic", desc:"Purple-green whorled aromatic stem plant for background placement" },
  { name:"Limnophila Aromatica Green", scientific:"Limnophila aromatica", category:"Stem (Emergent)", features:["Oxygenating","Aromatic/edible","Serrated leaves"], light:"Med-High", slug:"limnophila-aromatica-green", family:"Plantaginaceae", origin:"Southeast Asia", type:"Emergent stem aquatic", desc:"Aromatic edible aquatic herb with serrated leaves, used in Vietnamese cuisine" },
  { name:"Limnophila aquatica Giant Red", scientific:"Limnophila aquatica", category:"Stem (Submerged)", features:["Excellent oxygenator","Giant feathery","Red tones"], light:"High", slug:"limnophila-aquatica-giant-red", family:"Plantaginaceae", origin:"India, Sri Lanka", type:"Submerged stem aquatic", desc:"Giant ambulia with feathery whorled leaves and red tones, excellent oxygenator" },
  { name:"Polygonum sp. Pink", scientific:"Persicaria sp. Pink", category:"Stem (Emergent)", features:["Oxygenating","Pink color","Fast and tall"], light:"High", slug:"polygonum-sp-pink", family:"Polygonaceae", origin:"South America", type:"Emergent stem aquatic", desc:"Fast tall-growing pink-colored stem plant for dramatic background effect" },
  { name:"Polygonum sp. Sao Paulo", scientific:"Persicaria sp. Sao Paulo", category:"Stem (Emergent)", features:["Oxygenating","Pink-purple","Fast grower"], light:"High", slug:"polygonum-sp-sao-paulo", family:"Polygonaceae", origin:"Brazil (São Paulo)", type:"Emergent stem aquatic", desc:"Pink-purple tall stem plant from São Paulo region, vigorous grower" },
  { name:"Myriophyllum Aquaticum", scientific:"Myriophyllum aquaticum", category:"Stem (Emergent)", features:["Excellent oxygenator","Feathery","Nutrient absorber"], light:"Med-High", slug:"myriophyllum-aquaticum", family:"Haloragaceae", origin:"South America", type:"Emergent stem aquatic", desc:"Parrots Feather - excellent oxygenator with feathery whorled leaves above and below water" },
  { name:"Red Cabomba", scientific:"Cabomba furcata", category:"Stem (Submerged)", features:["Excellent oxygenator","Red feathery","Fine leaves"], light:"High", slug:"red-cabomba-cabomba-furcata", family:"Cabombaceae", origin:"South America", type:"Submerged stem aquatic", desc:"Fine feathery red submerged stem plant, excellent water oxygenator" },
  { name:"Hyptis Lorentziana", scientific:"Hyptis lorentziana", category:"Stem (Emergent)", features:["Oxygenating","Square stems","Aromatic"], light:"High", slug:"hyptis-lorentziana", family:"Lamiaceae", origin:"South America", type:"Emergent stem aquatic", desc:"Unique square-stemmed aromatic aquatic plant, tall growing background specimen" },
  { name:"Cyperus papyrus", scientific:"Cyperus papyrus", category:"Emergent/Marginal", features:["Architectural","Umbrella tops","3-5 ft tall"], light:"High", slug:"cyperus-papyrus", family:"Cyperaceae", origin:"Africa (Nile region)", type:"Emergent marginal aquatic", desc:"Tall papyrus with iconic umbrella-like tops, architectural pond edge plant" },
  { name:"Juncus effusus Pencil Grass", scientific:"Juncus effusus", category:"Emergent/Marginal", features:["Architectural","Vertical accent","Above water"], light:"Med-High", slug:"juncus-effusus-pencil-grass", family:"Juncaceae", origin:"Cosmopolitan", type:"Emergent marginal aquatic", desc:"Upright cylindrical stems providing vertical architectural accent at pond edges" }
];

const DIR = 'plants/aquatic-plants';

function generatePage(p) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${p.name} - ${p.scientific} | ArkFarm</title>
  <meta name="description" content="${p.desc}">
  <meta name="keywords" content="${p.slug.replace(/-/g, ', ')}, aquatic plant, pond plant, ${p.scientific.toLowerCase()}">
  <link rel="canonical" href="https://nakmuthu.github.io/arkfarm/plants/aquatic-plants/${p.slug}.html">
  <link rel="stylesheet" href="../../css/style.css?v=2">
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"Article","name":"${p.name}","description":"${p.desc}","url":"https://nakmuthu.github.io/arkfarm/plants/aquatic-plants/${p.slug}.html"}
  </script>
</head>
<body data-plant="${p.slug}">
  <div id="site-header"></div>
  <div class="container">
    <div class="breadcrumb"><a href="../../index.html" data-i18n="home">Home</a> / <a href="../../categories/aquatic-plants.html">Aquatic Plants</a> / ${p.name}</div>

    <div class="section top-card">
      <img src="../../images/categories/plants/aquatic-plants/${p.slug}.jpg" alt="${p.name}" style="width:100%;border-radius:12px;margin-bottom:10px;">
      <h1 data-i18n="plant_name">${p.name}</h1>
      <p><em data-i18n="scientific_name">${p.scientific}</em></p>
      <div class="key-grid">
        <p><strong data-i18n="common_names">Common Names:</strong> <span data-i18n="common_names_val">${p.name}</span></p>
        <p><strong data-i18n="local_name">Local Name:</strong> <span data-i18n="local_name_val">—</span></p>
        <p><strong data-i18n="family">Family:</strong> <span data-i18n="family_val">${p.family}</span></p>
        <p><strong data-i18n="origin">Origin:</strong> <span data-i18n="origin_val">${p.origin}</span></p>
        <p><strong data-i18n="plant_type">Plant Type:</strong> <span data-i18n="plant_type_val">${p.type}</span></p>
        <p><strong data-i18n="variety">Variety:</strong> <span data-i18n="variety_val">${p.category}</span></p>
        <p><strong data-i18n="avg_lifespan">Average Lifespan:</strong> <span data-i18n="avg_lifespan_val">Perennial in tropical climates</span></p>
      </div>
    </div>

    <details open>
      <summary data-i18n="botanical_desc">🌿 Botanical Description</summary>
      <table>
        <tr><td><strong data-i18n="growth_habit">Growth Habit</strong></td><td data-i18n="growth_habit_val">${p.desc}</td></tr>
        <tr><td><strong data-i18n="plant_size">Plant Size</strong></td><td data-i18n="plant_size_val">${p.type}</td></tr>
        <tr><td><strong data-i18n="leaves">Leaves</strong></td><td data-i18n="leaves_val">${p.features.join(', ')}</td></tr>
      </table>
    </details>

    <details>
      <summary data-i18n="growing_conditions">☀ Growing Conditions</summary>
      <table>
        <tr><td><strong data-i18n="climate">Climate</strong></td><td data-i18n="climate_val">Tropical to subtropical; frost-sensitive</td></tr>
        <tr><td><strong data-i18n="sun_requirement">Sun Requirement</strong></td><td data-i18n="sun_req_val">${p.light} light</td></tr>
        <tr><td><strong data-i18n="water_requirement">Water Requirement</strong></td><td data-i18n="water_req_val">Fully aquatic</td></tr>
        <tr><td><strong data-i18n="soil_type">Soil Type</strong></td><td data-i18n="soil_type_val">Aquatic substrate or pond soil</td></tr>
        <tr><td><strong data-i18n="soil_ph">Soil pH Preference</strong></td><td data-i18n="soil_ph_val">6.0–7.5</td></tr>
        <tr><td><strong data-i18n="can_grow_pots">Can it Grow in Pots?</strong></td><td data-i18n="can_pots_val">Yes, in submerged containers or water gardens</td></tr>
      </table>
    </details>

    <details>
      <summary data-i18n="cultivation_care">🌾 Cultivation & Care</summary>
      <table>
        <tr><td><strong data-i18n="fertilizer_schedule">Fertilizer Schedule</strong></td><td data-i18n="fert_schedule_val">Root tabs or liquid fertilizer monthly during growing season</td></tr>
        <tr><td><strong data-i18n="organic_fertilizers">Recommended Organic Fertilizers</strong></td><td data-i18n="organic_fert_val">Aquatic plant root tabs, clay-based fertilizers</td></tr>
        <tr><td><strong data-i18n="common_pests">Common Pests</strong></td><td data-i18n="common_pests_val">Algae, snails, aphids on emergent parts</td></tr>
        <tr><td><strong data-i18n="common_diseases">Common Diseases</strong></td><td data-i18n="common_diseases_val">Leaf rot, melting in poor water conditions</td></tr>
        <tr><td><strong data-i18n="disease_prevention">Disease Prevention & Remedies</strong></td><td data-i18n="disease_prev_val">Maintain clean water, adequate light, remove dead leaves</td></tr>
      </table>
    </details>

    <details>
      <summary data-i18n="pollination_propagation">🌱 Pollination & Propagation</summary>
      <table>
        <tr><td><strong data-i18n="prop_cuttings">Propagation by Cuttings</strong></td><td data-i18n="prop_cuttings_val">Stem cuttings or division; plant directly in substrate</td></tr>
      </table>
    </details>

    <details>
      <summary data-i18n="environmental_impact">💧 Environmental Impact & Sustainability</summary>
      <table>
        <tr><td><strong data-i18n="water_usage">Water Usage</strong></td><td data-i18n="water_usage_val">Fully aquatic; helps maintain water quality</td></tr>
        <tr><td><strong data-i18n="biodiversity">Biodiversity Benefits</strong></td><td data-i18n="biodiv_val">Oxygenates water, provides shelter for aquatic life, absorbs excess nutrients</td></tr>
      </table>
    </details>

    <details>
      <summary data-i18n="observation_notes">📝 Orchard Observation Notes</summary>
      <p data-i18n="observation_placeholder">Add your field observations here.</p>
    </details>
  </div>
  <div id="site-footer"></div>
  <script src="../../js/i18n.js?v=2"></script>
  <script src="../../js/components.js?v=7"></script>
  <script src="../../js/nav.js?v=2"></script>
</body>
</html>
`;
}

// Generate all pages
let created = 0;
for (const p of plants) {
  const filePath = path.join(DIR, p.slug + '.html');
  if (fs.existsSync(filePath)) {
    console.log(`⏭️  Skipping ${p.slug} (already exists)`);
    continue;
  }
  fs.writeFileSync(filePath, generatePage(p));
  console.log(`✅ Created ${filePath}`);
  created++;
}
console.log(`\n🎉 Done! Created ${created} new aquatic plant pages.`);
