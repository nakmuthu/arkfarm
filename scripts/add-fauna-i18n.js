#!/usr/bin/env node
const fs = require('fs');
const https = require('https');

function translate(text) {
  return new Promise((resolve) => {
    const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ta&dt=t&q=' + encodeURIComponent(text);
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 8000 }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)[0].map(x => x[0]).join('')); }
        catch(e) { resolve(text); }
      });
    });
    req.on('error', () => resolve(text));
    req.on('timeout', () => { req.destroy(); resolve(text); });
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const LABEL_KEYS = [
  ['identification',           'Identification'],
  ['habitat_behaviour',        'Habitat & Behaviour'],
  ['lifecycle',                'Lifecycle'],
  ['orchard_impact',           'Orchard Impact'],
  ['pest_status_safety',       'Pest Status & Safety'],
  ['prevention_control',       'Prevention & Control'],
  ['conservation',             'Conservation & Encouragement'],
  ['appearance',               'Appearance'],
  ['colour',                   'Colour'],
  ['distinguishing_features',  'Distinguishing Features'],
  ['similar_species',          'Similar Species'],
  ['sound',                    'Sound'],
  ['eggs_label',               'Eggs'],
  ['larva_appearance',         'Larva Appearance'],
  ['pupa',                     'Pupa'],
  ['habitat',                  'Habitat'],
  ['behaviour',                'Behaviour'],
  ['activity_pattern',         'Activity Pattern'],
  ['diet',                     'Diet'],
  ['seasonal_presence',        'Seasonal Presence'],
  ['host_plants',              'Host Plants'],
  ['egg_stage',                'Egg Stage'],
  ['nymph_stage',              'Nymph Stage'],
  ['larval_stage',             'Larval Stage'],
  ['pupal_stage',              'Pupal Stage'],
  ['adult_stage',              'Adult Stage'],
  ['generations_per_year',     'Generations per Year'],
  ['overwintering',            'Overwintering'],
  ['impact_type',              'Impact Type'],
  ['crops_affected',           'Crops Affected'],
  ['damage_description',       'Damage Description'],
  ['damage_severity',          'Damage Severity'],
  ['benefit',                  'Benefit'],
  ['ecosystem_role',           'Ecosystem Role'],
  ['pest_classification',      'Pest Classification'],
  ['danger_to_humans',         'Danger to Humans'],
  ['danger_to_livestock',      'Danger to Livestock'],
  ['disease_risk',             'Disease Risk'],
  ['invasive_status',          'Invasive Status'],
  ['physical_control',         'Physical Control'],
  ['pheromone_traps',          'Pheromone Traps'],
  ['biological_control',       'Biological Control'],
  ['organic_sprays',           'Organic Sprays'],
  ['threshold',                'Threshold'],
  ['early_warning_signs',      'Early Warning Signs'],
  ['personal_protection',      'Personal Protection'],
  ['habitat_management',       'Habitat Management'],
  ['night_work',               'Night Work'],
  ['if_bitten',                'If Bitten'],
  ['control_needed',           'Control Needed'],
  ['lighting',                 'Lighting'],
  ['how_to_encourage',         'How to Encourage'],
  ['threats',                  'Threats'],
  ['conservation_status',      'Conservation Status'],
  ['significance',             'Significance'],
  ['risk',                     'Risk'],
  ['wingspan',                 'Wingspan'],
  ['adult_appearance',         'Adult Appearance'],
];

async function main() {
  const ta = JSON.parse(fs.readFileSync('data/i18n-ta.json', 'utf8'));
  let added = 0;
  for (const [key, en] of LABEL_KEYS) {
    if (ta[key]) { process.stdout.write('-'); continue; }
    const val = await translate(en);
    ta[key] = val;
    added++;
    process.stdout.write('.');
    await sleep(300);
  }
  fs.writeFileSync('data/i18n-ta.json', JSON.stringify(ta, null, 2));
  console.log('\nAdded ' + added + ' new keys');
}

main().catch(console.error);
