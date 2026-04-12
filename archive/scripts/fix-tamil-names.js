#!/usr/bin/env node
/**
 * Fix plant_name in all Tamil translation files with proper Tamil names.
 * Uses actual Tamil names where known, transliterates only when no Tamil word exists.
 */
const fs = require('fs');

// Proper Tamil plant names - actual Tamil words, not transliterations
const tamilNames = {
  // Fruit Trees
  'passion-fruit': 'பாஷன் பழம்',
  'malkova-mango': 'மாம்பழம் - மால்கோவா',
  'coconut': 'தேங்காய்',
  'lemon-native': 'எலுமிச்சை - நாட்டு',
  'sweet-lime-nagpur': 'சாத்துக்குடி - நாக்பூர்',
  'sweet-lime-vietnam': 'சாத்துக்குடி - வியட்நாம்',
  'sweet-lime-bali': 'சாத்துக்குடி - பாலி',
  'mango-kalapadi': 'மாம்பழம் - கலப்பாடி',
  'mango-himam-pasand': 'மாம்பழம் - இமாம் பசந்த்',
  'mango-banganapalli': 'மாம்பழம் - பங்கனபள்ளி',
  'mango-bangalore': 'மாம்பழம் - பெங்களூர்',
  'mango-neelam': 'மாம்பழம் - நீலம்',
  'mango-nam-doc-mai-gold': 'மாம்பழம் - நாம் டாக் மாய் கோல்ட்',
  'mango-sweet-katimon': 'மாம்பழம் - ஸ்வீட் கட்டிமோன்',
  'mango-kotturkonam': 'மாம்பழம் - கொட்டூர்கோணம்',
  'mango-miyazaki': 'மாம்பழம் - மியாசாகி',
  'mango-all-season': 'மாம்பழம் - அனைத்து பருவம்',
  'apple-malayan': 'மலாய் ஆப்பிள்',
  'apple-rose': 'ரோஸ் ஆப்பிள் / பன்னீர்',
  'apple-velvet': 'வெல்வெட் ஆப்பிள்',
  'apple-wood': 'விளா மரம்',
  'apple-sweet-wood': 'வில்வம்',
  'apple-water-green': 'நீர் ஆப்பிள் (பச்சை)',
  'apple-water-dahai': 'நீர் ஆப்பிள் (தாஹாய் / சம்பா)',
  'apple-star': 'பால் பழம் (ஊதா)',
  'apple-ber-red': 'ஆப்பிள் பேர் (சிவப்பு)',
  'apple-ber-green': 'இலந்தை (பச்சை)',
  'plum-coco': 'கோகோ பிளம்',
  'plum-natal': 'நேட்டல் பிளம்',
  'plum-governor': 'கவர்னர் பிளம்',
  'plum-santa-rosa': 'சாண்டா ரோசா பிளம்',
  'plum-rain-forest': 'மழைக்காடு பிளம்',
  'plum-loquat': 'லோக்வாட்',
  'cherry-surinam-black': 'சூரினாம் செர்ரி (கருப்பு)',
  'cherry-red-surinam': 'சூரினாம் செர்ரி (சிவப்பு)',
  'cherry-manila-tennis-ball': 'தேன் பழம்',
  'cherry-cedar-bay': 'சீடர் பே செர்ரி',
  'cherry-rio-grande': 'ரியோ கிராண்டே செர்ரி',
  'cherry-barbados': 'பார்படாஸ் செர்ரி',
  'cherry-grumichama': 'குருமிச்சாமா',
  'cherry-savannah': 'சவன்னா செர்ரி',
  'cherry-baraba': 'பாரபா / எலுமிச்சை மாங்கோஸ்டீன்',
  'guava-purple-forest': 'கொய்யா - ஊதா காடு',
  'guava-taiwan-pink': 'கொய்யா - தைவான் பிங்க்',
  'guava-small-beetroot': 'கொய்யா - பீட்ரூட்',
  'guava-grape': 'கொய்யா - திராட்சை',
  'guava-l49': 'கொய்யா - எல்-49',
  'guava-native': 'கொய்யா - நாட்டு',
  'guava-strawberry': 'கொய்யா - ஸ்ட்ராபெர்ரி',
  'berry-blackberry': 'கருப்பு பெர்ரி',
  'berry-star-gooseberry': 'அருநெல்லி',
  'berry-strawberry': 'ஸ்ட்ராபெர்ரி',
  'berry-blueberry': 'ப்ளூபெர்ரி',
  'berry-mulberry': 'முசுக்கட்டை',
  'berry-long-mulberry': 'நீள முசுக்கட்டை',
  'berry-himalayan-mulberry': 'இமயமலை முசுக்கட்டை',
  'berry-pakistan-mulberry': 'பாகிஸ்தான் முசுக்கட்டை',
  'berry-brazilian-long-mulberry': 'பிரேசில் நீள முசுக்கட்டை',
  'berry-red-gooseberry': 'நெல்லிக்காய்',
  'jamun-killi-naval': 'நாவல் - கிள்ளி நாவல்',
  'jamun-thai-king': 'நாவல் - தாய் கிங்',
  'jamun-white': 'நாவல் - வெள்ளை',
  'jamun-jumbo-bardoli': 'நாவல் - ஜம்போ பர்டோலி',
  'custard-apple-ram-seetha': 'சீதாப்பழம் - ராம சீதா',
  'custard-apple-purple': 'சீதாப்பழம் - ஊதா',
  'custard-apple-atemoya': 'சீதாப்பழம் - அட்டிமோயா',
  'custard-apple-soursop': 'முள்ளு சீதாப்பழம்',
  'jackfruit-j33': 'பலாப்பழம் - ஜே-33',
  'jackfruit-vietnam-super-early': 'பலாப்பழம் - வியட்நாம் சூப்பர் ஏர்லி',
  'jackfruit-honey-red': 'பலாப்பழம் - தேன் சிவப்பு',
  'jackfruit-panruti': 'பலாப்பழம் - பண்ருட்டி',
  'jackfruit-nongadak': 'பலாப்பழம் - நோங்கடாக்',
  'sapota-thai-king': 'சப்போட்டா - தாய் கிங்',
  'orange-dekopon': 'ஆரஞ்சு - டெகோபான்',
  'longan-diamond-river': 'லோங்கன் - டயமண்ட் ரிவர்',
  'longan-all-season': 'லோங்கன் - அனைத்து பருவம்',
  'longan-ruby': 'லோங்கன் - ரூபி',
  'pomelo-bablimas': 'பம்பளிமாசு - பப்லிமாஸ்',
  'avocado-arka-supreme': 'வெண்ணெய் பழம் - அர்கா சுப்ரீம்',
  'avocado-kendil': 'வெண்ணெய் பழம் - கெண்டில்',
  'star-fruit-sweet': 'நட்சத்திர பழம் - இனிப்பு',
  'star-fruit-regular': 'நட்சத்திர பழம்',
  'sea-grape': 'கடல் திராட்சை',
  'bilimbi': 'புளிச்சிக்காய்',
  'sweet-luvi': 'இனிப்பு லூவி',
  'rambutan-rongrien': 'ரம்புட்டான் - ரோங்ரியன்',
  'ambalam': 'அம்பலம்',
  'ambalam-sweet': 'அம்பலம் (இனிப்பு)',
  'lipote': 'லிபோட்',
  'jaboticaba': 'ஜபோடிகாபா / பிரேசில் திராட்சை',
  'araza-boi': 'அராசா போய்',
  'litchi': 'லிச்சி',
  'abiu': 'அபியூ',
  'kodakapuli': 'கொடுக்காப்புளி',
  'egg-fruit': 'முட்டை பழம்',
  'ice-cream-bean': 'ஐஸ்கிரீம் பீன்',
  'miracle-fruit': 'அதிசய பழம்',
  'sweet-santol': 'இனிப்பு சாண்டோல்',
  'bignay': 'பிக்னே',
  'olosapo': 'ஒலோசாபோ',

  // Spices & Herbs
  'clove': 'கிராம்பு',
  'bay-leaf': 'பிரிஞ்சி இலை',
  'allspice': 'சர்வ மசாலா',
  'cinnamon': 'இலவங்கப்பட்டை',
  'cardamom': 'ஏலக்காய்',
  'nutmeg': 'ஜாதிக்காய்',
  'pepper-panniyur': 'மிளகு - பண்ணியூர்',
  'pepper-karimunda': 'மிளகு - கரிமுண்டா',
  'pepper-bush': 'மிளகு - புதர்',
  'pandan': 'ரம்பை இலை / பாண்டன்',
  'curry-leaf': 'கறிவேப்பிலை',
  'lemongrass': 'எலுமிச்சை புல்',
  'avarampoo': 'ஆவாரம்பூ',
  'henna': 'மருதாணி',

  // Medicinal Plants
  'moringa-tree': 'முருங்கை மரம்',

  // Flowering Plants
  'paneer-rose': 'பன்னீர் ரோஜா',
  'jasmine': 'மல்லிகை',

  // Timber Trees
  'mahogany': 'மகாகனி மரம்',
};

let fixed = 0;
const files = fs.readdirSync('data').filter(f => f.startsWith('i18n-ta-') && f.endsWith('.json'));

for (const file of files) {
  const slug = file.replace('i18n-ta-', '').replace('.json', '');
  const tamilName = tamilNames[slug];
  if (!tamilName) continue;

  const filePath = 'data/' + file;
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (data.plant_name !== tamilName) {
    data.plant_name = tamilName;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    fixed++;
  }
}

console.log(`Fixed ${fixed} Tamil plant names out of ${files.length} files`);
