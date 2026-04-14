#!/usr/bin/env node
// Generates admin/config.yml for Decap CMS from plants.json
const fs = require('fs');
const plants = JSON.parse(fs.readFileSync('data/plants.json', 'utf8'));

// Common fields for all plant translation files
const fields = `        fields:
          - {label: "Plant Name (Tamil)", name: plant_name, widget: string, required: false, hint: "Tamil name e.g. தேங்காய்"}
          - {label: "Common Names (Tamil)", name: common_names_val, widget: string, required: false}
          - {label: "Local Name (Tamil)", name: local_name_val, widget: string, required: false}
          - {label: "Family (Tamil)", name: family_val, widget: string, required: false}
          - {label: "Origin (Tamil)", name: origin_val, widget: string, required: false}
          - {label: "Plant Type (Tamil)", name: plant_type_val, widget: string, required: false}
          - {label: "Variety (Tamil)", name: variety_val, widget: string, required: false}
          - {label: "Average Lifespan (Tamil)", name: avg_lifespan_val, widget: string, required: false}
          - {label: "Growth Habit (Tamil)", name: growth_habit_val, widget: text, required: false}
          - {label: "Plant Size (Tamil)", name: plant_size_val, widget: string, required: false}
          - {label: "Leaves (Tamil)", name: leaves_val, widget: text, required: false}
          - {label: "Flowers (Tamil)", name: flowers_val, widget: text, required: false}
          - {label: "Fruit (Tamil)", name: fruit_val, widget: text, required: false}
          - {label: "Fruit Color (Tamil)", name: fruit_color_val, widget: string, required: false}
          - {label: "Root System (Tamil)", name: root_system_val, widget: text, required: false}
          - {label: "Climate (Tamil)", name: climate_val, widget: string, required: false}
          - {label: "Temperature Range (Tamil)", name: temp_range_val, widget: string, required: false}
          - {label: "Rainfall (Tamil)", name: rainfall_val, widget: string, required: false}
          - {label: "Soil Type (Tamil)", name: soil_type_val, widget: string, required: false}
          - {label: "Soil pH (Tamil)", name: soil_ph_val, widget: string, required: false}
          - {label: "Sun Requirement (Tamil)", name: sun_req_val, widget: string, required: false}
          - {label: "Spacing (Tamil)", name: spacing_val, widget: string, required: false}
          - {label: "Water Requirement (Tamil)", name: water_req_val, widget: text, required: false}
          - {label: "Can Grow in Pots? (Tamil)", name: can_pots_val, widget: string, required: false}
          - {label: "Fertilizer Schedule (Tamil)", name: fert_schedule_val, widget: text, required: false}
          - {label: "Organic Fertilizers (Tamil)", name: organic_fert_val, widget: text, required: false}
          - {label: "Common Pests (Tamil)", name: common_pests_val, widget: text, required: false}
          - {label: "Common Diseases (Tamil)", name: common_diseases_val, widget: text, required: false}
          - {label: "Disease Prevention (Tamil)", name: disease_prev_val, widget: text, required: false}
          - {label: "Flowering Months (Tamil)", name: flowering_months_val, widget: string, required: false}
          - {label: "Fruiting Season (Tamil)", name: fruiting_season_val, widget: string, required: false}
          - {label: "Days to Harvest (Tamil)", name: days_harvest_val, widget: string, required: false}
          - {label: "Average Yield (Tamil)", name: avg_yield_val, widget: string, required: false}
          - {label: "Pollination Type (Tamil)", name: poll_type_val, widget: string, required: false}
          - {label: "Propagation by Seeds (Tamil)", name: prop_seeds_val, widget: text, required: false}
          - {label: "Propagation by Cuttings (Tamil)", name: prop_cuttings_val, widget: text, required: false}
          - {label: "Propagation by Grafting (Tamil)", name: prop_grafting_val, widget: text, required: false}
          - {label: "Water Usage (Tamil)", name: water_usage_val, widget: text, required: false}
          - {label: "Biodiversity Benefits (Tamil)", name: biodiv_val, widget: text, required: false}
          - {label: "Market Uses (Tamil)", name: market_uses_val, widget: text, required: false}
          - {label: "Market Value (Tamil)", name: market_value_val, widget: string, required: false}
          - {label: "Traditional Uses (Tamil)", name: traditional_val, widget: text, required: false}
          - {label: "Medicinal - Digestive Health (Tamil)", name: digestive_val, widget: text, required: false}
          - {label: "Medicinal - Anti-inflammatory (Tamil)", name: anti_inflammatory_val, widget: text, required: false}
          - {label: "Medicinal - Immune Support (Tamil)", name: immune_val, widget: text, required: false}
          - {label: "Observation Notes (Tamil)", name: observation_placeholder, widget: text, required: false}`;

// Group plants by category for the files list
const fileEntries = plants.map(p => {
  const slug = p.url.split('/').pop().replace('.html', '');
  return `      - label: "${p.name} (${p.category})"\n        name: ${slug}\n        file: data/i18n-ta-${slug}.json\n${fields}`;
}).join('\n');

const config = `backend:
  name: github
  repo: nakmuthu/arkfarm
  branch: main
  auth_endpoint: auth
  base_url: https://sveltia-cms-auth.pages.dev

media_folder: images/categories/plants
public_folder: /arkfarm/images/categories/plants

locale: en

collections:
  - name: plant_translations
    label: "🌿 Plant Translations (Tamil)"
    description: "Edit Tamil translations for each plant. Changes are committed directly to GitHub."
    files:
${fileEntries}
`;

fs.writeFileSync('admin/config.yml', config, 'utf8');
console.log('Generated admin/config.yml with', plants.length, 'plant entries.');
