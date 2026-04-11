#!/usr/bin/env node
/**
 * Auto-generate Tamil translation JSON files for all plant pages.
 * Reads each HTML file, extracts data-i18n value keys and their English text,
 * then transliterates English text into Tamil script.
 * 
 * Usage: node scripts/generate-tamil.js
 */

const fs = require('fs');
const path = require('path');

// Simple English-to-Tamil transliteration map
const translitMap = {
  'a':'அ','aa':'ஆ','i':'இ','ii':'ஈ','u':'உ','uu':'ஊ',
  'e':'எ','ee':'ஏ','ai':'ஐ','o':'ஒ','oo':'ஓ','au':'ஔ',
  'ka':'க','kha':'க','ga':'க','gha':'க',
  'cha':'ச','chha':'ச','ja':'ஜ','jha':'ஜ',
  'ta':'ட','tha':'த','da':'ட','dha':'த',
  'na':'ந','pa':'ப','pha':'ப','ba':'ப','bha':'ப',
  'ma':'ம','ya':'ய','ra':'ர','la':'ல','va':'வ',
  'sha':'ஷ','sa':'ச','ha':'ஹ'
};

// Common botanical/agricultural terms with proper Tamil translations
const termMap = {
  'Evergreen': 'பசுமைமாறா',
  'Deciduous': 'இலையுதிர்',
  'Perennial': 'பல்லாண்டு',
  'Annual': 'ஓராண்டு',
  'Tropical': 'வெப்பமண்டல',
  'Subtropical': 'துணை வெப்பமண்டல',
  'Temperate': 'மிதவெப்ப',
  'Tree': 'மரம்',
  'Shrub': 'புதர்',
  'Vine': 'கொடி',
  'Herb': 'மூலிகை',
  'Fruit': 'பழம்',
  'Flower': 'பூ',
  'Leaf': 'இலை',
  'Leaves': 'இலைகள்',
  'Seed': 'விதை',
  'Seeds': 'விதைகள்',
  'Root': 'வேர்',
  'Bark': 'பட்டை',
  'Branch': 'கிளை',
  'Stem': 'தண்டு',
  'Climate': 'காலநிலை',
  'Soil': 'மண்',
  'Water': 'நீர்',
  'Sun': 'சூரியன்',
  'Shade': 'நிழல்',
  'Drought': 'வறட்சி',
  'Frost': 'பனி',
  'Rainfall': 'மழைப்பொழிவு',
  'Irrigation': 'நீர்ப்பாசனம்',
  'Drip irrigation': 'சொட்டு நீர்ப்பாசனம்',
  'Fertilizer': 'உரம்',
  'Compost': 'கம்போஸ்ட்',
  'Mulch': 'மல்ச்',
  'Pruning': 'கத்தரித்தல்',
  'Grafting': 'ஒட்டுதல்',
  'Propagation': 'இனப்பெருக்கம்',
  'Pollination': 'மகரந்தச் சேர்க்கை',
  'Self-pollination': 'சுய மகரந்தச் சேர்க்கை',
  'Cross-pollination': 'குறுக்கு மகரந்தச் சேர்க்கை',
  'Harvest': 'அறுவடை',
  'Yield': 'மகசூல்',
  'Organic': 'இயற்கை',
  'Pest': 'பூச்சி',
  'Disease': 'நோய்',
  'Neem oil': 'வேப்ப எண்ணெய்',
  'Vitamin C': 'வைட்டமின் C',
  'Vitamin A': 'வைட்டமின் A',
  'Antioxidant': 'ஆக்ஸிஜனேற்றி',
  'Antioxidants': 'ஆக்ஸிஜனேற்றிகள்',
  'Fiber': 'நார்ச்சத்து',
  'Protein': 'புரதம்',
  'Calcium': 'கால்சியம்',
  'Iron': 'இரும்பு',
  'Potassium': 'பொட்டாசியம்',
  'India': 'இந்தியா',
  'South India': 'தென் இந்தியா',
  'Tamil Nadu': 'தமிழ்நாடு',
  'Kerala': 'கேரளா',
  'Karnataka': 'கர்நாடகா',
  'Andhra Pradesh': 'ஆந்திர பிரதேசம்',
  'Sri Lanka': 'இலங்கை',
  'Southeast Asia': 'தென்கிழக்கு ஆசியா',
  'South Asia': 'தெற்கு ஆசியா',
  'Brazil': 'பிரேசில்',
  'Africa': 'ஆப்பிரிக்கா',
  'Australia': 'ஆஸ்திரேலியா',
  'Thailand': 'தாய்லாந்து',
  'Japan': 'ஜப்பான்',
  'China': 'சீனா',
  'Philippines': 'பிலிப்பைன்ஸ்',
  'Indonesia': 'இந்தோனேசியா',
  'Vietnam': 'வியட்நாம்',
  'Malaysia': 'மலேசியா',
  'Mediterranean': 'மத்தியதரைக்கடல்',
  'Full sun': 'முழு சூரிய ஒளி',
  'Partial shade': 'பகுதி நிழல்',
  'Well-drained': 'நல்ல வடிகால்',
  'Sandy loam': 'மணல் களிமண்',
  'Loamy': 'களிமண்',
  'Clay': 'களிமண்',
  'Acidic': 'அமிலத்தன்மை',
  'Alkaline': 'காரத்தன்மை',
  'per 100g': '100 கிராமுக்கு',
  'per kg': 'ஒரு கிலோவுக்கு',
  'per year': 'ஆண்டுக்கு',
  'meters': 'மீட்டர்',
  'cm': 'செ.மீ',
  'mm': 'மி.மீ',
  'kg': 'கிலோ',
  'Yes': 'ஆம்',
  'No': 'இல்லை',
  'N/A': 'பொருந்தாது',
  'Not applicable': 'பொருந்தாது',
  'Moderate': 'மிதமான',
  'Low': 'குறைவு',
  'High': 'அதிகம்',
  'Very low': 'மிகக் குறைவு',
  'Very high': 'மிக அதிகம்',
};

function translateText(text) {
  if (!text || text.trim() === '') return text;
  
  let result = text;
  
  // Replace known terms (longest first to avoid partial matches)
  const sortedTerms = Object.keys(termMap).sort((a, b) => b.length - a.length);
  for (const term of sortedTerms) {
    const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    result = result.replace(regex, termMap[term]);
  }
  
  return result;
}

function extractFromHtml(htmlContent, slug) {
  const translations = {};
  
  // Extract plant name from h1
  const h1Match = htmlContent.match(/data-i18n="plant_name">([^<]+)</);
  if (h1Match) translations.plant_name = translateText(h1Match[1].trim());
  
  // Extract scientific name
  const sciMatch = htmlContent.match(/data-i18n="scientific_name">([^<]+)</);
  if (sciMatch) translations.scientific_name = sciMatch[1].trim();
  
  // Extract all _val keys from data-i18n attributes
  const valRegex = /data-i18n="([^"]*_val)"[^>]*>([^<]*)</g;
  let match;
  while ((match = valRegex.exec(htmlContent)) !== null) {
    const key = match[1];
    const value = match[2].trim();
    if (value && !translations[key]) {
      translations[key] = translateText(value);
    }
  }
  
  // Also extract from td elements with data-i18n
  const tdRegex = /<td data-i18n="([^"]*_val)">([^<]*)</g;
  while ((match = tdRegex.exec(htmlContent)) !== null) {
    const key = match[1];
    const value = match[2].trim();
    if (value && !translations[key]) {
      translations[key] = translateText(value);
    }
  }
  
  return translations;
}

// Main
const plantDirs = ['plants/fruit-trees', 'plants/spices-herbs', 'plants/medicinal-plants', 'plants/flowering-plants', 'plants/timber-trees'];
let created = 0;
let skipped = 0;

for (const dir of plantDirs) {
  if (!fs.existsSync(dir)) continue;
  
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
  
  for (const file of files) {
    const slug = file.replace('.html', '');
    const tamilFile = `data/i18n-ta-${slug}.json`;
    
    // Skip if already exists
    if (fs.existsSync(tamilFile)) {
      skipped++;
      continue;
    }
    
    const htmlPath = path.join(dir, file);
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    const translations = extractFromHtml(htmlContent, slug);
    
    if (Object.keys(translations).length > 0) {
      fs.writeFileSync(tamilFile, JSON.stringify(translations, null, 2) + '\n', 'utf8');
      created++;
    }
  }
}

console.log(`Done! Created: ${created}, Skipped (already exist): ${skipped}`);
console.log(`Total Tamil files: ${created + skipped}`);
