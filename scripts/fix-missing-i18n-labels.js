#!/usr/bin/env node
/**
 * Add data-i18n to <summary> and <strong> tags that are missing them.
 */
const fs = require('fs');
const path = require('path');

const summaryMap = {
  '🌿 Botanical Description': 'botanical_desc',
  '☀ Growing Conditions': 'growing_conditions',
  '🌾 Cultivation &amp; Care': 'cultivation_care',
  '🌾 Cultivation & Care': 'cultivation_care',
  '🌸 Flowering &amp; Fruiting': 'flowering_fruiting',
  '🌸 Flowering & Fruiting': 'flowering_fruiting',
  '🌱 Pollination &amp; Propagation': 'pollination_propagation',
  '🌱 Pollination & Propagation': 'pollination_propagation',
  '💧 Environmental Impact &amp; Sustainability': 'environmental_impact',
  '💧 Environmental Impact & Sustainability': 'environmental_impact',
  '💧 Environmental Impact': 'environmental_impact',
  '💰 Economic Importance': 'economic_importance',
  '🌿 Cultural Significance': 'cultural_significance',
  '🍈 Nutritional Information': 'nutritional_info',
  '🌿 Medicinal Uses': 'medicinal_uses',
  '📸 Photo Gallery': 'photo_gallery',
  '📝 Orchard Observation Notes': 'observation_notes',
};

const strongMap = {
  'Growth Habit': 'growth_habit',
  'Plant Size': 'plant_size',
  'Leaves': 'leaves',
  'Flowers': 'flowers',
  'Flower Characteristics': 'flower_characteristics',
  'Fruit': 'fruit',
  'Fruit Color': 'fruit_color',
  'Seed Characteristics': 'seed_characteristics',
  'Root System': 'root_system',
  'Climate': 'climate',
  'Temperature Range': 'temperature_range',
  'Rainfall Requirement': 'rainfall',
  'Soil Type': 'soil_type',
  'Soil pH Preference': 'soil_ph',
  'Sun Requirement': 'sun_requirement',
  'Spacing': 'spacing',
  'Irrigation Method': 'irrigation',
  'Water Requirement': 'water_requirement',
  'Can it Grow in Pots?': 'can_grow_pots',
  'Fertilizer Schedule': 'fertilizer_schedule',
  'Recommended Organic Fertilizers': 'organic_fertilizers',
  'Pesticide Frequency': 'pesticide_frequency',
  'Recommended Organic Pesticides': 'organic_pesticides',
  'Mulching Practice': 'mulching',
  'Training System': 'training_system',
  'Pruning Time': 'pruning_time',
  'How to Prune': 'how_to_prune',
  'Common Pests': 'common_pests',
  'Common Diseases': 'common_diseases',
  'Disease Prevention &amp; Remedies': 'disease_prevention',
  'Disease Prevention & Remedies': 'disease_prevention',
  'Flowering Months': 'flowering_months',
  'Fruiting Season': 'fruiting_season',
  'Days to Harvest': 'days_to_harvest',
  'Harvest Indicators': 'harvest_indicators',
  'Average Yield per Plant': 'avg_yield',
  'Pollination Type': 'pollination_type',
  'Pollination Notes': 'pollination_notes',
  'Pollination Details': 'pollination_details',
  'Propagation by Seeds': 'prop_seeds',
  'Propagation by Cuttings': 'prop_cuttings',
  'Propagation by Grafting': 'prop_grafting',
  'Water Usage': 'water_usage',
  'Soil Conservation Practices': 'soil_conservation',
  'Organic Practices Used': 'organic_practices',
  'Companion Plants': 'companion_plants',
  'Biodiversity Benefits': 'biodiversity',
  'Commercial Production Regions': 'commercial_regions',
  'Market Uses': 'market_uses',
  'Processing Uses': 'processing_uses',
  'Market Value (Approx.)': 'market_value',
  'Symbolism': 'symbolism',
  'Traditional Uses': 'traditional_uses',
  'Calories': 'calories',
  'Dietary Fiber': 'dietary_fiber',
  'Vitamin C': 'vitamin_c',
  'Vitamin A': 'vitamin_a',
  'Iron': 'iron',
  'Potassium': 'potassium',
  'Antioxidants': 'antioxidants',
  'Other Key Nutrients': 'other_nutrients',
  'Anxiety &amp; Sleep': 'anxiety_sleep',
  'Anxiety & Sleep': 'anxiety_sleep',
  'Immune Support': 'immune_support',
  'Anti-inflammatory Properties': 'anti_inflammatory',
  'Heart Health': 'heart_health',
  'Digestive Health': 'digestive_health',
  'Common Names:': 'common_names',
  'Local Name:': 'local_name',
  'Family:': 'family',
  'Origin:': 'origin',
  'Plant Type:': 'plant_type',
  'Variety:': 'variety',
  'Average Lifespan:': 'avg_lifespan',
};

const dirs = ['plants/fruit-trees', 'plants/spices-herbs', 'plants/medicinal-plants', 'plants/flowering-plants', 'plants/timber-trees'];
let fixed = 0;

for (const dir of dirs) {
  if (!fs.existsSync(dir)) continue;
  for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.html'))) {
    const fp = path.join(dir, file);
    let html = fs.readFileSync(fp, 'utf8');
    let changed = false;

    // Fix summary tags without data-i18n
    for (const [text, key] of Object.entries(summaryMap)) {
      const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp('<summary>(' + escaped + ')</summary>', 'g');
      if (regex.test(html)) {
        html = html.replace(regex, '<summary data-i18n="' + key + '">$1</summary>');
        changed = true;
      }
    }

    // Fix strong tags without data-i18n
    for (const [text, key] of Object.entries(strongMap)) {
      const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp('<strong>(' + escaped + ')</strong>', 'g');
      if (regex.test(html)) {
        html = html.replace(regex, '<strong data-i18n="' + key + '">$1</strong>');
        changed = true;
      }
    }

    // Fix disclaimer without data-i18n
    if (html.includes('Disclaimer:') && !html.includes('data-i18n="disclaimer"')) {
      html = html.replace(
        /<p([^>]*)>(Disclaimer:[^<]*)<\/p>/,
        '<p$1 data-i18n="disclaimer">$2</p>'
      );
      changed = true;
    }

    // Fix observation placeholder
    if (html.includes('Add your field observations') && !html.includes('data-i18n="observation_placeholder"')) {
      html = html.replace(
        /<p>(Add your field observations[^<]*)<\/p>/,
        '<p data-i18n="observation_placeholder">$1</p>'
      );
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(fp, html, 'utf8');
      fixed++;
      console.log('Fixed:', file);
    }
  }
}
console.log('\nTotal fixed:', fixed);
