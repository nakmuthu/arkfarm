#!/usr/bin/env node
/**
 * Generate fallback Tamil translation files for pages that don't have
 * data-i18n on value cells. Extracts plant name and scientific name only.
 */
const fs = require('fs');
const path = require('path');

const plantDirs = ['plants/fruit-trees', 'plants/spices-herbs', 'plants/medicinal-plants', 'plants/flowering-plants', 'plants/timber-trees'];
let created = 0;

for (const dir of plantDirs) {
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
  
  for (const file of files) {
    const slug = file.replace('.html', '');
    const tamilFile = `data/i18n-ta-${slug}.json`;
    
    if (fs.existsSync(tamilFile)) continue;
    
    const html = fs.readFileSync(path.join(dir, file), 'utf8');
    const t = {};
    
    // Extract plant name from <h1> or <title>
    let nameMatch = html.match(/<h1[^>]*>([^<]+)</);
    if (nameMatch) t.plant_name = nameMatch[1].trim();
    
    // Extract scientific name from <em>
    let sciMatch = html.match(/<em[^>]*>([^<]+)</);
    if (sciMatch) t.scientific_name = sciMatch[1].trim();
    
    // Extract all text from second <td> in each row (the values)
    const rowRegex = /<tr>\s*<td[^>]*><strong[^>]*>[^<]*<\/strong><\/td>\s*<td[^>]*>([^<]*)<\/td>/g;
    let m;
    const keys = [
      'growth_habit_val','plant_size_val','leaves_val','flowers_val','flower_char_val',
      'fruit_val','fruit_color_val','seed_char_val','root_system_val',
      'climate_val','temp_range_val','rainfall_val','soil_type_val','soil_ph_val',
      'sun_req_val','spacing_val','irrigation_val','water_req_val','can_pots_val',
      'fert_schedule_val','organic_fert_val','pest_freq_val','organic_pest_val',
      'mulching_val','training_val','pruning_time_val','how_prune_val',
      'common_pests_val','common_diseases_val','disease_prev_val',
      'flowering_months_val','fruiting_season_val','days_harvest_val',
      'harvest_ind_val','avg_yield_val','poll_type_val','poll_notes_val',
      'poll_details_val','prop_seeds_val','prop_cuttings_val','prop_grafting_val',
      'water_usage_val','soil_conserv_val','organic_prac_val','companion_val','biodiv_val',
      'commercial_val','market_uses_val','processing_val','market_value_val',
      'symbolism_val','traditional_val',
      'calories_val','fiber_val','vitc_val','vita_val','iron_val','potassium_val',
      'antioxidants_val','other_nutrients_val',
      'anxiety_val','immune_val','antiinflam_val','heart_val','digestive_val'
    ];
    
    let ki = 0;
    while ((m = rowRegex.exec(html)) !== null && ki < keys.length) {
      const val = m[1].trim();
      if (val) t[keys[ki]] = val;
      ki++;
    }
    
    // Also try extracting key-grid values
    const kgRegex = /<strong[^>]*>[^<]*:<\/strong>\s*(?:<span[^>]*>)?([^<]+)/g;
    const kgKeys = ['common_names_val','local_name_val','family_val','origin_val','plant_type_val','variety_val','avg_lifespan_val'];
    let kgi = 0;
    while ((m = kgRegex.exec(html)) !== null && kgi < kgKeys.length) {
      const val = m[1].trim();
      if (val) t[kgKeys[kgi]] = val;
      kgi++;
    }
    
    if (Object.keys(t).length > 0) {
      fs.writeFileSync(tamilFile, JSON.stringify(t, null, 2) + '\n', 'utf8');
      created++;
    }
  }
}
console.log(`Created ${created} fallback Tamil files`);
console.log(`Total Tamil files: ${fs.readdirSync('data').filter(f => f.startsWith('i18n-ta-') && f.endsWith('.json')).length}`);
