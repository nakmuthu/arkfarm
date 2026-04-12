#!/usr/bin/env node
/**
 * Clean global i18n-ta.json to keep only:
 * 1. Original global keys (site labels, navigation, etc.)
 * 2. Common keys that appear in ALL 118 plants
 * 
 * Remove plant-specific keys that should only be in per-plant dictionaries
 */
const fs = require('fs');
const path = require('path');

const globalDict = JSON.parse(fs.readFileSync('data/i18n-ta.json', 'utf8'));
const dataDir = 'data';
const files = fs.readdirSync(dataDir).filter(f => f.startsWith('i18n-ta-') && f.endsWith('.json') && f !== 'i18n-ta.json');

console.log(`Analyzing ${files.length} per-plant dictionaries...\n`);

// Find keys that appear in ALL plants
const keyCountMap = new Map();

files.forEach(file => {
  const plantDict = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
  Object.keys(plantDict).forEach(key => {
    keyCountMap.set(key, (keyCountMap.get(key) || 0) + 1);
  });
});

// Identify common keys (in all plants)
const commonKeys = new Set();
keyCountMap.forEach((count, key) => {
  if (count === files.length) {
    commonKeys.add(key);
  }
});

console.log(`Common keys (in all ${files.length} plants): ${commonKeys.size}`);
console.log(`  ${Array.from(commonKeys).join(', ')}\n`);

// Original global keys that should always be kept (site-wide labels)
const originalGlobalKeys = new Set([
  'site_title', 'welcome', 'welcome_desc', 'browse_category', 'quick_search',
  'looking_for', 'search_all', 'search_plants', 'search_placeholder', 'search_hint',
  'no_results', 'home', 'fruit_trees', 'medicinal_plants', 'flowering_plants',
  'vegetables', 'greens', 'cactus', 'ornamental_plants', 'timber_trees', 'spices_herbs',
  'search', 'footer', 'cat_fruit_desc', 'cat_medicinal_desc', 'cat_flowering_desc',
  'cat_vegetables_desc', 'cat_greens_desc', 'cat_cactus_desc', 'cat_ornamental_desc',
  'cat_timber_desc', 'coming_soon_vegetables', 'coming_soon_greens', 'coming_soon_cactus',
  'coming_soon_ornamental', 'coming_soon_timber', 'cat_fruit_title', 'cat_fruit_intro',
  'cat_medicinal_title', 'cat_medicinal_intro', 'cat_flowering_title', 'cat_flowering_intro',
  'cat_spices_title', 'cat_spices_desc', 'cat_spices_intro',
  // Category card translations (added earlier)
  'plant_name_passion-fruit', 'plant_scientific_passion-fruit', 'plant_desc_passion-fruit',
  'plant_name_malkova-mango', 'plant_scientific_malkova-mango', 'plant_desc_malkova-mango',
  'plant_name_apple-water-green', 'plant_scientific_apple-water-green', 'plant_desc_apple-water-green',
  'plant_name_apple-water-dahai', 'plant_scientific_apple-water-dahai', 'plant_desc_apple-water-dahai',
  'plant_name_apple-star', 'plant_scientific_apple-star', 'plant_desc_apple-star',
  'plant_name_apple-ber-red', 'plant_scientific_apple-ber-red', 'plant_desc_apple-ber-red',
  'plant_name_apple-ber-green', 'plant_scientific_apple-ber-green', 'plant_desc_apple-ber-green',
  'plant_name_plum-coco', 'plant_scientific_plum-coco', 'plant_desc_plum-coco',
  'plant_name_plum-natal', 'plant_scientific_plum-natal', 'plant_desc_plum-natal',
  'plant_name_plum-governor', 'plant_scientific_plum-governor', 'plant_desc_plum-governor',
  'plant_name_plum-santa-rosa', 'plant_scientific_plum-santa-rosa', 'plant_desc_plum-santa-rosa',
  'plant_name_plum-rain-forest', 'plant_scientific_plum-rain-forest', 'plant_desc_plum-rain-forest',
  'plant_name_plum-loquat', 'plant_scientific_plum-loquat', 'plant_desc_plum-loquat',
  'plant_name_cherry-surinam-black', 'plant_scientific_cherry-surinam-black', 'plant_desc_cherry-surinam-black',
  'plant_name_paneer-rose', 'plant_scientific_paneer-rose', 'plant_desc_paneer-rose',
  'plant_name_moringa-tree', 'plant_scientific_moringa-tree', 'plant_desc_moringa-tree',
  'plant_name_jasmine', 'plant_scientific_jasmine', 'plant_desc_jasmine',
  'plant_name_clove', 'plant_scientific_clove', 'plant_desc_clove',
  'plant_name_bay-leaf', 'plant_scientific_bay-leaf', 'plant_desc_bay-leaf',
  'plant_name_allspice', 'plant_scientific_allspice', 'plant_desc_allspice',
  'plant_name_cinnamon', 'plant_scientific_cinnamon', 'plant_desc_cinnamon',
  'plant_name_cardamom', 'plant_scientific_cardamom', 'plant_desc_cardamom',
  'plant_name_nutmeg', 'plant_scientific_nutmeg', 'plant_desc_nutmeg',
  'plant_name_pepper-panniyur', 'plant_scientific_pepper-panniyur', 'plant_desc_pepper-panniyur',
  'plant_name_pepper-karimunda', 'plant_scientific_pepper-karimunda', 'plant_desc_pepper-karimunda',
  'plant_name_pepper-bush', 'plant_scientific_pepper-bush', 'plant_desc_pepper-bush',
  'plant_name_pandan', 'plant_scientific_pandan', 'plant_desc_pandan',
  'plant_name_curry-leaf', 'plant_scientific_curry-leaf', 'plant_desc_curry-leaf',
  'plant_name_lemongrass', 'plant_scientific_lemongrass', 'plant_desc_lemongrass',
  'plant_name_avarampoo', 'plant_scientific_avarampoo', 'plant_desc_avarampoo',
  'plant_name_henna', 'plant_scientific_henna', 'plant_desc_henna',
  'plant_name_mahogany', 'plant_scientific_mahogany', 'plant_desc_mahogany',
  'plant_name_coconut', 'plant_scientific_coconut', 'plant_desc_coconut',
  'plant_name_lemon-native', 'plant_scientific_lemon-native', 'plant_desc_lemon-native',
  'plant_name_sweet-lime-nagpur', 'plant_scientific_sweet-lime-nagpur', 'plant_desc_sweet-lime-nagpur',
  'plant_name_sweet-lime-vietnam', 'plant_scientific_sweet-lime-vietnam', 'plant_desc_sweet-lime-vietnam',
  'plant_name_sweet-lime-bali', 'plant_scientific_sweet-lime-bali', 'plant_desc_sweet-lime-bali',
  'plant_name_mango-kalapadi', 'plant_scientific_mango-kalapadi', 'plant_desc_mango-kalapadi',
  'plant_name_mango-himam-pasand', 'plant_scientific_mango-himam-pasand', 'plant_desc_mango-himam-pasand',
  'plant_name_mango-banganapalli', 'plant_scientific_mango-banganapalli', 'plant_desc_mango-banganapalli',
  'plant_name_mango-bangalore', 'plant_scientific_mango-bangalore', 'plant_desc_mango-bangalore',
  'plant_name_mango-neelam', 'plant_scientific_mango-neelam', 'plant_desc_mango-neelam',
  'plant_name_mango-nam-doc-mai', 'plant_scientific_mango-nam-doc-mai', 'plant_desc_mango-nam-doc-mai',
  'plant_name_mango-sweet-katimon', 'plant_scientific_mango-sweet-katimon', 'plant_desc_mango-sweet-katimon',
  'plant_name_mango-kotturkonam', 'plant_scientific_mango-kotturkonam', 'plant_desc_mango-kotturkonam',
  'plant_name_mango-miyazaki', 'plant_scientific_mango-miyazaki', 'plant_desc_mango-miyazaki',
  'plant_name_mango-all-season', 'plant_scientific_mango-all-season', 'plant_desc_mango-all-season',
  'plant_name_apple-malayan', 'plant_scientific_apple-malayan', 'plant_desc_apple-malayan',
  'plant_name_apple-rose', 'plant_scientific_apple-rose', 'plant_desc_apple-rose',
  'plant_name_apple-velvet', 'plant_scientific_apple-velvet', 'plant_desc_apple-velvet',
  'plant_name_apple-wood', 'plant_scientific_apple-wood', 'plant_desc_apple-wood',
  'plant_name_apple-sweet-wood', 'plant_scientific_apple-sweet-wood', 'plant_desc_apple-sweet-wood',
  'plant_name_cherry-red-surinam', 'plant_scientific_cherry-red-surinam', 'plant_desc_cherry-red-surinam',
  'plant_name_cherry-manila', 'plant_scientific_cherry-manila', 'plant_desc_cherry-manila',
  'plant_name_cherry-cedar-bay', 'plant_scientific_cherry-cedar-bay', 'plant_desc_cherry-cedar-bay',
  'plant_name_cherry-rio-grande', 'plant_scientific_cherry-rio-grande', 'plant_desc_cherry-rio-grande',
  'plant_name_cherry-barbados', 'plant_scientific_cherry-barbados', 'plant_desc_cherry-barbados',
  'plant_name_cherry-grumichama', 'plant_scientific_cherry-grumichama', 'plant_desc_cherry-grumichama',
  'plant_name_cherry-savannah', 'plant_scientific_cherry-savannah', 'plant_desc_cherry-savannah',
  'plant_name_cherry-baraba', 'plant_scientific_cherry-baraba', 'plant_desc_cherry-baraba',
  'plant_name_guava-purple-forest', 'plant_scientific_guava-purple-forest', 'plant_desc_guava-purple-forest',
  'plant_name_guava-taiwan-pink', 'plant_scientific_guava-taiwan-pink', 'plant_desc_guava-taiwan-pink',
  'plant_name_guava-small-beetroot', 'plant_scientific_guava-small-beetroot', 'plant_desc_guava-small-beetroot',
  'plant_name_guava-grape', 'plant_scientific_guava-grape', 'plant_desc_guava-grape',
  'plant_name_guava-l49', 'plant_scientific_guava-l49', 'plant_desc_guava-l49',
  'plant_name_guava-native', 'plant_scientific_guava-native', 'plant_desc_guava-native',
  'plant_name_guava-strawberry', 'plant_scientific_guava-strawberry', 'plant_desc_guava-strawberry',
  'plant_name_berry-blackberry', 'plant_scientific_berry-blackberry', 'plant_desc_berry-blackberry',
  'plant_name_berry-star-gooseberry', 'plant_scientific_berry-star-gooseberry', 'plant_desc_berry-star-gooseberry',
  'plant_name_berry-strawberry', 'plant_scientific_berry-strawberry', 'plant_desc_berry-strawberry',
  'plant_name_berry-blueberry', 'plant_scientific_berry-blueberry', 'plant_desc_berry-blueberry',
  'plant_name_berry-mulberry', 'plant_scientific_berry-mulberry', 'plant_desc_berry-mulberry',
  'plant_name_berry-long-mulberry', 'plant_scientific_berry-long-mulberry', 'plant_desc_berry-long-mulberry',
  'plant_name_berry-himalayan-mulberry', 'plant_scientific_berry-himalayan-mulberry', 'plant_desc_berry-himalayan-mulberry',
  'plant_name_berry-pakistan-mulberry', 'plant_scientific_berry-pakistan-mulberry', 'plant_desc_berry-pakistan-mulberry',
  'plant_name_berry-brazilian-mulberry', 'plant_scientific_berry-brazilian-mulberry', 'plant_desc_berry-brazilian-mulberry',
  'plant_name_berry-red-gooseberry', 'plant_scientific_berry-red-gooseberry', 'plant_desc_berry-red-gooseberry',
  'plant_name_jamun-killi-naval', 'plant_scientific_jamun-killi-naval', 'plant_desc_jamun-killi-naval',
  'plant_name_jamun-thai-king', 'plant_scientific_jamun-thai-king', 'plant_desc_jamun-thai-king',
  'plant_name_jamun-white', 'plant_scientific_jamun-white', 'plant_desc_jamun-white',
  'plant_name_jamun-jumbo-bardoli', 'plant_scientific_jamun-jumbo-bardoli', 'plant_desc_jamun-jumbo-bardoli',
  'plant_name_custard-apple-ram-seetha', 'plant_scientific_custard-apple-ram-seetha', 'plant_desc_custard-apple-ram-seetha',
  'plant_name_custard-apple-purple', 'plant_scientific_custard-apple-purple', 'plant_desc_custard-apple-purple',
  'plant_name_custard-apple-atemoya', 'plant_scientific_custard-apple-atemoya', 'plant_desc_custard-apple-atemoya',
  'plant_name_custard-apple-soursop', 'plant_scientific_custard-apple-soursop', 'plant_desc_custard-apple-soursop',
  'plant_name_jackfruit-j33', 'plant_scientific_jackfruit-j33', 'plant_desc_jackfruit-j33',
  'plant_name_jackfruit-vietnam-super-early', 'plant_scientific_jackfruit-vietnam-super-early', 'plant_desc_jackfruit-vietnam-super-early',
  'plant_name_jackfruit-honey-red', 'plant_scientific_jackfruit-honey-red', 'plant_desc_jackfruit-honey-red',
  'plant_name_jackfruit-panruti', 'plant_scientific_jackfruit-panruti', 'plant_desc_jackfruit-panruti',
  'plant_name_jackfruit-nongadak', 'plant_scientific_jackfruit-nongadak', 'plant_desc_jackfruit-nongadak',
  'plant_name_sapota-thai-king', 'plant_scientific_sapota-thai-king', 'plant_desc_sapota-thai-king',
  'plant_name_orange-dekopon', 'plant_scientific_orange-dekopon', 'plant_desc_orange-dekopon',
  'plant_name_longan-diamond-river', 'plant_scientific_longan-diamond-river', 'plant_desc_longan-diamond-river',
  'plant_name_longan-all-season', 'plant_scientific_longan-all-season', 'plant_desc_longan-all-season',
  'plant_name_longan-ruby', 'plant_scientific_longan-ruby', 'plant_desc_longan-ruby',
  'plant_name_pomelo-bablimas', 'plant_scientific_pomelo-bablimas', 'plant_desc_pomelo-bablimas',
  'plant_name_avocado-arka-supreme', 'plant_scientific_avocado-arka-supreme', 'plant_desc_avocado-arka-supreme',
  'plant_name_avocado-kendil', 'plant_scientific_avocado-kendil', 'plant_desc_avocado-kendil',
  'plant_name_star-fruit-sweet', 'plant_scientific_star-fruit-sweet', 'plant_desc_star-fruit-sweet',
  'plant_name_star-fruit-regular', 'plant_scientific_star-fruit-regular', 'plant_desc_star-fruit-regular',
  'plant_name_sea-grape', 'plant_scientific_sea-grape', 'plant_desc_sea-grape',
  'plant_name_bilimbi', 'plant_scientific_bilimbi', 'plant_desc_bilimbi',
  'plant_name_sweet-luvi', 'plant_scientific_sweet-luvi', 'plant_desc_sweet-luvi',
  'plant_name_rambutan-rongrien', 'plant_scientific_rambutan-rongrien', 'plant_desc_rambutan-rongrien',
  'plant_name_ambalam', 'plant_scientific_ambalam', 'plant_desc_ambalam',
  'plant_name_ambalam-sweet', 'plant_scientific_ambalam-sweet', 'plant_desc_ambalam-sweet',
  'plant_name_lipote', 'plant_scientific_lipote', 'plant_desc_lipote',
  'plant_name_jaboticaba', 'plant_scientific_jaboticaba', 'plant_desc_jaboticaba',
  'plant_name_araza-boi', 'plant_scientific_araza-boi', 'plant_desc_araza-boi',
  'plant_name_litchi', 'plant_scientific_litchi', 'plant_desc_litchi',
  'plant_name_abiu', 'plant_scientific_abiu', 'plant_desc_abiu',
  'plant_name_kodakapuli', 'plant_scientific_kodakapuli', 'plant_desc_kodakapuli',
  'plant_name_egg-fruit', 'plant_scientific_egg-fruit', 'plant_desc_egg-fruit',
  'plant_name_ice-cream-bean', 'plant_scientific_ice-cream-bean', 'plant_desc_ice-cream-bean',
  'plant_name_miracle-fruit', 'plant_scientific_miracle-fruit', 'plant_desc_miracle-fruit',
  'plant_name_sweet-santol', 'plant_scientific_sweet-santol', 'plant_desc_sweet-santol',
  'plant_name_bignay', 'plant_scientific_bignay', 'plant_desc_bignay',
  'plant_name_olosapo', 'plant_scientific_olosapo', 'plant_desc_olosapo'
]);

// Keep only original global keys + common keys
const keysToKeep = new Set([...originalGlobalKeys, ...commonKeys]);

// Remove plant-specific keys
let keysRemoved = 0;
const keysToRemove = [];

Object.keys(globalDict).forEach(key => {
  if (!keysToKeep.has(key)) {
    keysToRemove.push(key);
    keysRemoved++;
  }
});

keysToRemove.forEach(key => delete globalDict[key]);

// Write cleaned global dictionary
fs.writeFileSync('data/i18n-ta.json', JSON.stringify(globalDict, null, 2), 'utf8');

console.log(`✓ Complete!`);
console.log(`  Keys removed (plant-specific): ${keysRemoved}`);
console.log(`  Keys kept: ${Object.keys(globalDict).length}`);
console.log(`  Updated: data/i18n-ta.json`);
