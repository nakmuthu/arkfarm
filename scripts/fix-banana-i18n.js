const fs = require('fs');
const globalTa = JSON.parse(fs.readFileSync('data/i18n-ta.json', 'utf8'));

const fixes = {
  'plant_name_banana-karpuravalli': 'கற்பூரவல்லி வாழை',
  'plant_name_banana-nendran':      'நேந்திரன் வாழை',
  'plant_name_banana-peyan':        'பேயன் வாழை',
  'plant_name_banana-poongathali':  'பூங்கதலி வாழை',
  'plant_name_banana-poovan':       'பூவன் வாழை',
  'plant_name_banana-rasthali':     'ரஸ்தாலி வாழை',
  'plant_name_banana-red':          'சிவப்பு வாழை',
  'plant_name_banana-yelakki':      'ஏலக்கி வாழை',
  'plant_name_banana-sirumalai':    'சிருமலை வாழை',
  'plant_name_cashew-nut':          'முந்திரி',
  'plant_name_dragon-fruit-purple': 'டிராகன் பழம் - ஊதா',
  'plant_name_dragon-fruit-yellow': 'டிராகன் பழம் - மஞ்சள்',
  'plant_name_fig-brown-turkey':    'அத்தி - பிரவுன் டர்க்கி',
  'plant_name_fig-elephant-ear':    'அத்தி - யானை காது',
  'plant_name_fig-pune-red':        'அத்தி - புனே சிவப்பு',
  'plant_name_orange-kamala':       'கமலா ஆரஞ்சு',
  'plant_name_pomegranate':         'மாதுளை',
  'plant_name_sweet-tamarind':      'இனிப்பு புளி',
  'plant_name_cat-eye-fruit':       'பூலி நொண்டி',
  'plant_name_grape-black':         'கருப்பு திராட்சை',
  'plant_name_allamanda-purple':    'அல்லமண்டா - ஊதா',
  'plant_name_allamanda-yellow':    'அல்லமண்டா - மஞ்சள்',
  'plant_name_bougainvillea-red':   'பூகன்வில்லா - சிவப்பு',
  'plant_name_bougainvillea-white': 'பூகன்வில்லா - வெள்ளை',
  'plant_name_butterfly-pea':       'சங்கு பூ',
  'plant_name_cypress-vine':        'மயில் மணிக்கம்',
  'plant_name_hibiscus-red':        'செம்பருத்தி',
  'plant_name_manoranjitham':       'மனோரஞ்சிதம்',
  'plant_name_petrea-creeper':      'நீல மலர் கொடி',
  'plant_name_touch-me-not':        'தொட்டால் சிணுங்கி',
  'plant_name_neem-tree':           'வேப்ப மரம்',
  'plant_name_purple-heart':        'ஊதா இலை செடி',
  'plant_name_areca-palm':          'அரேக்கா பனை',
  'plant_name_norfolk-island-pine': 'நார்ஃபோக் தீவு பைன்',
  'plant_name_curtain-creeper':     'திரை கொடி',
  'plant_name_rubber-plant':        'ரப்பர் செடி',
  'plant_name_mint':                'புதினா',
  'plant_name_coriander':           'கொத்தமல்லி',
  'plant_name_sweet-basil':         'திருநீற்றுப் பச்சிலை',
  'plant_name_basil-black':         'கரு துளசி',
  'plant_name_karpuravalli':        'கற்பூரவல்லி',
};

for (const [key, val] of Object.entries(fixes)) {
  globalTa[key] = val;
}

fs.writeFileSync('data/i18n-ta.json', JSON.stringify(globalTa, null, 2), 'utf8');
console.log('Fixed', Object.keys(fixes).length, 'Tamil name keys.');
