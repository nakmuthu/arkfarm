const fs = require('fs');
const globalTa = JSON.parse(fs.readFileSync('data/i18n-ta.json', 'utf8'));

const fixes = {
  'plant_name_adathodai':       'ஆடாதோடை',
  'plant_name_vasambu':         'வசம்பு',
  'plant_name_vathanarayanan':  'வாதநாராயணன்',
  'plant_name_karunochi':       'கருநொச்சி',
  'plant_name_maha-vilvam':     'வில்வம்',
  'plant_name_vetiver':         'வெட்டிவேர்',
  'plant_name_aloe-vera':       'கற்றாழை',
  'plant_name_aloe-vera-red':   'சிவப்பு கற்றாழை',
  'plant_name_ranakalli':       'ரணகள்ளி',
  'plant_name_pirandai':        'பிரண்டை',
  'plant_name_elumbu-otti-ilai':'எலும்பு ஒட்டி இலை',
  'plant_name_thippili':        'திப்பிலி',
  'plant_name_poonai-meesai':   'பூனை மீசை',
  'plant_name_murungai-kalyana':'கல்யாண முருங்கை',
  'plant_name_murungai-karumbu':'கரும்பு முருங்கை',
  'plant_name_chitharathai':    'சித்தரத்தை',
};

for (const [k, v] of Object.entries(fixes)) globalTa[k] = v;
fs.writeFileSync('data/i18n-ta.json', JSON.stringify(globalTa, null, 2), 'utf8');

// Also fix per-plant files
for (const [k, v] of Object.entries(fixes)) {
  const slug = k.replace('plant_name_', '');
  const path = 'data/i18n-ta-' + slug + '.json';
  if (fs.existsSync(path)) {
    const td = JSON.parse(fs.readFileSync(path, 'utf8'));
    td.plant_name = v;
    fs.writeFileSync(path, JSON.stringify(td, null, 2), 'utf8');
  }
}
console.log('Fixed', Object.keys(fixes).length, 'medicinal plant Tamil names.');
