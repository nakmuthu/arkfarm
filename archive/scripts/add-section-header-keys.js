#!/usr/bin/env node
/**
 * Add section header keys to global i18n-ta.json
 * Maps label keys to their Tamil translations
 */
const fs = require('fs');

const globalDict = JSON.parse(fs.readFileSync('data/i18n-ta.json', 'utf8'));

// Map of label keys to their corresponding _val keys
const labelMappings = {
  'botanical_desc': 'botanical_description_val',
  'growing_conditions': 'growing_conditions_val',
  'cultivation_care': 'cultivation_care_val',
  'flowering_fruiting': 'flowering_fruiting_val',
  'pollination_propagation': 'pollination_propagation_val',
  'environmental_impact': 'environmental_impact_val',
  'economic_importance': 'economic_importance_val',
  'cultural_significance': 'cultural_significance_val',
  'nutritional_info': 'nutritional_info_val',
  'medicinal_uses': 'medicinal_uses_val',
  'photo_gallery': 'photo_gallery_val',
  'observation_notes': 'observation_notes_val',
  'disclaimer': 'disclaimer_val',
  'growth_habit': 'growth_habit_val',
  'plant_size': 'plant_size_val',
  'leaves': 'leaves_val',
  'flowers': 'flowers_val',
  'flower_characteristics': 'flower_char_val',
  'fruit': 'fruit_val',
  'fruit_color': 'fruit_color_val',
  'seed_characteristics': 'seed_char_val',
  'root_system': 'root_system_val',
  'climate': 'climate_val',
  'temperature_range': 'temp_range_val',
  'rainfall': 'rainfall_val',
  'soil_type': 'soil_type_val',
  'soil_ph': 'soil_ph_val',
  'sun_requirement': 'sun_req_val',
  'spacing': 'spacing_val',
  'irrigation': 'irrigation_val',
  'water_requirement': 'water_req_val',
  'can_grow_pots': 'can_pots_val',
  'fertilizer_schedule': 'fert_schedule_val',
  'organic_fertilizers': 'organic_fert_val',
  'pesticide_frequency': 'pest_freq_val',
  'organic_pesticides': 'organic_pest_val',
  'mulching': 'mulching_val',
  'training_system': 'training_val',
  'pruning_time': 'pruning_time_val',
  'how_to_prune': 'how_prune_val',
  'common_pests': 'common_pests_val',
  'common_diseases': 'common_diseases_val',
  'disease_prevention': 'disease_prev_val',
  'flowering_months': 'flowering_months_val',
  'fruiting_season': 'fruiting_season_val',
  'days_to_harvest': 'days_harvest_val',
  'harvest_indicators': 'harvest_ind_val',
  'avg_yield': 'avg_yield_val',
  'pollination_type': 'poll_type_val',
  'pollination_notes': 'poll_notes_val',
  'pollination_details': 'poll_details_val',
  'prop_seeds': 'prop_seeds_val',
  'prop_cuttings': 'prop_cuttings_val',
  'prop_grafting': 'prop_grafting_val',
  'water_usage': 'water_usage_val',
  'soil_conservation': 'soil_conserv_val',
  'organic_practices': 'organic_prac_val',
  'companion_plants': 'companion_val',
  'biodiversity': 'biodiv_val',
  'commercial_regions': 'commercial_val',
  'market_uses': 'market_uses_val',
  'processing_uses': 'processing_val',
  'market_value': 'market_value_val',
  'symbolism': 'symbolism_val',
  'traditional_uses': 'traditional_val',
  'anxiety_sleep': 'anxiety_val',
  'immune_support': 'immune_val',
  'anti_inflammatory': 'antiinflam_val',
  'heart_health': 'heart_val',
  'digestive_health': 'digestive_val'
};

let keysAdded = 0;

Object.entries(labelMappings).forEach(([labelKey, valueKey]) => {
  if (!(labelKey in globalDict) && (valueKey in globalDict)) {
    globalDict[labelKey] = globalDict[valueKey];
    keysAdded++;
  }
});

// Write updated global dictionary
fs.writeFileSync('data/i18n-ta.json', JSON.stringify(globalDict, null, 2), 'utf8');

console.log(`✓ Complete!`);
console.log(`  Label keys added: ${keysAdded}`);
console.log(`  Total keys in global dict: ${Object.keys(globalDict).length}`);
console.log(`  Updated: data/i18n-ta.json`);
