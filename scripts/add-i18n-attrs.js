#!/usr/bin/env node
/**
 * Add data-i18n attributes to value <td> and <span> elements
 * in plant pages that are missing them.
 */
const fs = require('fs');
const path = require('path');

// Map of label text -> value key suffix
const labelToKey = {
  'Growth Habit': 'growth_habit_val',
  'Plant Size': 'plant_size_val',
  'Leaves': 'leaves_val',
  'Flowers': 'flowers_val',
  'Flower Characteristics': 'flower_char_val',
  'Fruit': 'fruit_val',
  'Fruit Color': 'fruit_color_val',
  'Seed Characteristics': 'seed_char_val',
  'Root System': 'root_system_val',
  'Climate': 'climate_val',
  'Temperature Range': 'temp_range_val',
  'Rainfall Requirement': 'rainfall_val',
  'Soil Type': 'soil_type_val',
  'Soil pH Preference': 'soil_ph_val',
  'Sun Requirement': 'sun_req_val',
  'Spacing': 'spacing_val',
  'Irrigation Method': 'irrigation_val',
  'Water Requirement': 'water_req_val',
  'Can it Grow in Pots?': 'can_pots_val',
  'Fertilizer Schedule': 'fert_schedule_val',
  'Recommended Organic Fertilizers': 'organic_fert_val',
  'Pesticide Frequency': 'pest_freq_val',
  'Recommended Organic Pesticides': 'organic_pest_val',
  'Mulching Practice': 'mulching_val',
  'Training System': 'training_val',
  'Pruning Time': 'pruning_time_val',
  'How to Prune': 'how_prune_val',
  'Common Pests': 'common_pests_val',
  'Common Diseases': 'common_diseases_val',
  'Disease Prevention & Remedies': 'disease_prev_val',
  'Disease Prevention &amp; Remedies': 'disease_prev_val',
  'Flowering Months': 'flowering_months_val',
  'Fruiting Season': 'fruiting_season_val',
  'Days to Harvest': 'days_harvest_val',
  'Harvest Indicators': 'harvest_ind_val',
  'Average Yield per Plant': 'avg_yield_val',
  'Pollination Type': 'poll_type_val',
  'Pollination Notes': 'poll_notes_val',
  'Pollination Details': 'poll_details_val',
  'Propagation by Seeds': 'prop_seeds_val',
  'Propagation by Cuttings': 'prop_cuttings_val',
  'Propagation by Grafting': 'prop_grafting_val',
  'Water Usage': 'water_usage_val',
  'Soil Conservation Practices': 'soil_conserv_val',
  'Organic Practices Used': 'organic_prac_val',
  'Companion Plants': 'companion_val',
  'Biodiversity Benefits': 'biodiv_val',
  'Commercial Production Regions': 'commercial_val',
  'Market Uses': 'market_uses_val',
  'Processing Uses': 'processing_val',
  'Market Value (Approx.)': 'market_value_val',
  'Symbolism': 'symbolism_val',
  'Traditional Uses': 'traditional_val',
  'Calories': 'calories_val',
  'Dietary Fiber': 'fiber_val',
  'Vitamin C': 'vitc_val',
  'Vitamin A': 'vita_val',
  'Iron': 'iron_val',
  'Potassium': 'potassium_val',
  'Antioxidants': 'antioxidants_val',
  'Other Key Nutrients': 'other_nutrients_val',
  'Anxiety & Sleep': 'anxiety_val',
  'Anxiety &amp; Sleep': 'anxiety_val',
  'Immune Support': 'immune_val',
  'Anti-inflammatory Properties': 'anti_inflammatory_val',
  'Heart Health': 'heart_val',
  'Digestive Health': 'digestive_val',
};

// Key-grid label -> value key
const keyGridMap = {
  'Common Names:': 'common_names_val',
  'Local Name:': 'local_name_val',
  'Family:': 'family_val',
  'Origin:': 'origin_val',
  'Plant Type:': 'plant_type_val',
  'Variety:': 'variety_val',
  'Average Lifespan:': 'avg_lifespan_val',
};

const dirs = ['plants/fruit-trees', 'plants/spices-herbs', 'plants/medicinal-plants', 'plants/flowering-plants', 'plants/timber-trees'];
let fixed = 0;

for (const dir of dirs) {
  if (!fs.existsSync(dir)) continue;
  for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.html'))) {
    const fp = path.join(dir, file);
    let html = fs.readFileSync(fp, 'utf8');
    
    // Skip if already has _val attributes
    if (/data-i18n="[^"]*_val"/.test(html)) continue;
    
    let changed = false;
    
    // Add data-i18n to value <td> cells
    // Pattern: <td><strong>Label</strong></td><td>Value</td>
    for (const [label, key] of Object.entries(labelToKey)) {
      // Match: <strong...>Label</strong></td><td>Value</td>
      const regex = new RegExp(
        '(<strong[^>]*>' + label.replace(/[.*+?^${}()|[\]\\&]/g, '\\$&') + '</strong></td>\\s*<td)(?! data-i18n)(>)',
        'g'
      );
      if (regex.test(html)) {
        html = html.replace(regex, '$1 data-i18n="' + key + '"$2');
        changed = true;
      }
    }
    
    // Add data-i18n to key-grid value spans
    // Pattern: <strong>Label:</strong> Value</p>
    for (const [label, key] of Object.entries(keyGridMap)) {
      const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // If value is not already wrapped in span with data-i18n
      const regex = new RegExp(
        '(<strong[^>]*>' + escapedLabel + '</strong>)\\s+(?!<span data-i18n)([^<]+)(</p>)',
        'g'
      );
      if (regex.test(html)) {
        html = html.replace(regex, '$1 <span data-i18n="' + key + '">$2</span>$3');
        changed = true;
      }
    }
    
    if (changed) {
      fs.writeFileSync(fp, html, 'utf8');
      fixed++;
    }
  }
}

console.log(`Added data-i18n _val attributes to ${fixed} HTML files`);
