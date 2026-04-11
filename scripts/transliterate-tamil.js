#!/usr/bin/env node
/**
 * Regenerate Tamil translation files for all plants.
 * Strategy:
 *   1. Keep hand-crafted files (passion-fruit, malkova-mango, etc.) untouched
 *   2. Keep plant_name from fix-tamil-names.js
 *   3. For all _val content: transliterate entire English text to Tamil script
 *   4. Use proper Tamil words where a known mapping exists
 *   5. Transliterate remaining English words letter-by-letter into Tamil script
 */
const fs = require('fs');
const path = require('path');

// Hand-crafted files - skip entirely
const handCrafted = new Set([
  'passion-fruit', 'malkova-mango', 'paneer-rose', 'moringa-tree', 'jasmine'
]);

// Known English-to-Tamil word translations (whole words)
const wordMap = {
  // Common botanical terms
  'evergreen': 'பசுமைமாறா',
  'deciduous': 'இலையுதிர்',
  'semi-deciduous': 'அரை-இலையுதிர்',
  'perennial': 'பல்லாண்டு',
  'annual': 'ஓராண்டு',
  'tropical': 'வெப்பமண்டல',
  'subtropical': 'துணை வெப்பமண்டல',
  'temperate': 'மிதவெப்ப',
  'tree': 'மரம்',
  'shrub': 'புதர்',
  'bush': 'புதர்',
  'vine': 'கொடி',
  'herb': 'மூலிகை',
  'climber': 'படர் கொடி',
  'climbing': 'படரும்',
  'non-climbing': 'படராத',
  'compact': 'கச்சிதமான',
  'dwarf': 'குட்டை',
  'tall': 'உயரமான',
  'small': 'சிறிய',
  'medium': 'நடுத்தர',
  'large': 'பெரிய',
  'very': 'மிக',
  'fruit': 'பழம்',
  'fruits': 'பழங்கள்',
  'flower': 'பூ',
  'flowers': 'பூக்கள்',
  'flowering': 'பூக்கும்',
  'leaf': 'இலை',
  'leaves': 'இலைகள்',
  'seed': 'விதை',
  'seeds': 'விதைகள்',
  'root': 'வேர்',
  'roots': 'வேர்கள்',
  'bark': 'பட்டை',
  'branch': 'கிளை',
  'branches': 'கிளைகள்',
  'stem': 'தண்டு',
  'trunk': 'உடல்',
  'canopy': 'மேற்கூரை',
  'crown': 'கிரீடம்',
  'spreading': 'பரவும்',
  'upright': 'நிமிர்ந்த',
  'dense': 'அடர்ந்த',
  'open': 'திறந்த',
  'rounded': 'உருண்டை',
  'oval': 'நீள்வட்ட',
  'oblong': 'நீள்சதுர',
  'alternate': 'மாற்றிலை',
  'opposite': 'எதிரிலை',
  'simple': 'எளிய',
  'compound': 'கூட்டு',
  'pinnate': 'சிறகிலை',
  'glossy': 'பளபளப்பான',
  'dark': 'அடர்',
  'light': 'வெளிர்',
  'green': 'பச்சை',
  'red': 'சிவப்பு',
  'yellow': 'மஞ்சள்',
  'white': 'வெள்ளை',
  'purple': 'ஊதா',
  'orange': 'ஆரஞ்சு',
  'pink': 'இளஞ்சிவப்பு',
  'brown': 'பழுப்பு',
  'black': 'கருப்பு',
  'fragrant': 'நறுமணமுள்ள',
  'aromatic': 'நறுமணமிக்க',
  'sweet': 'இனிப்பு',
  'sour': 'புளிப்பு',
  'bitter': 'கசப்பு',
  'spicy': 'காரமான',
  'edible': 'உண்ணக்கூடிய',
  'ripe': 'பழுத்த',
  'unripe': 'பழுக்காத',
  'mature': 'முதிர்ந்த',
  'young': 'இளம்',
  'fresh': 'புதிய',
  'dried': 'உலர்ந்த',
  'raw': 'பச்சை',
  // Growing conditions
  'climate': 'காலநிலை',
  'soil': 'மண்',
  'water': 'நீர்',
  'sun': 'சூரியன்',
  'sunlight': 'சூரிய ஒளி',
  'shade': 'நிழல்',
  'full sun': 'முழு சூரிய ஒளி',
  'partial shade': 'பகுதி நிழல்',
  'drought': 'வறட்சி',
  'drought-tolerant': 'வறட்சி தாங்கும்',
  'frost': 'பனி',
  'frost-sensitive': 'பனிக்கு உணர்திறன்',
  'rainfall': 'மழைப்பொழிவு',
  'irrigation': 'நீர்ப்பாசனம்',
  'drip irrigation': 'சொட்டு நீர்ப்பாசனம்',
  'well-drained': 'நல்ல வடிகால்',
  'sandy': 'மணல்',
  'loam': 'களிமண்',
  'loamy': 'களிமண்',
  'clay': 'களிமண்',
  'acidic': 'அமிலத்தன்மை',
  'alkaline': 'காரத்தன்மை',
  'organic': 'இயற்கை',
  'rich': 'வளமான',
  'poor': 'வளமற்ற',
  'moderate': 'மிதமான',
  'low': 'குறைவு',
  'high': 'அதிகம்',
  // Cultivation
  'fertilizer': 'உரம்',
  'compost': 'கம்போஸ்ட்',
  'manure': 'எரு',
  'mulch': 'மல்ச்',
  'mulching': 'மல்ச்சிங்',
  'pruning': 'கத்தரித்தல்',
  'grafting': 'ஒட்டுதல்',
  'propagation': 'இனப்பெருக்கம்',
  'cuttings': 'வெட்டுகள்',
  'seedlings': 'நாற்றுகள்',
  'pollination': 'மகரந்தச் சேர்க்கை',
  'self-pollination': 'சுய மகரந்தச் சேர்க்கை',
  'cross-pollination': 'குறுக்கு மகரந்தச் சேர்க்கை',
  'harvest': 'அறுவடை',
  'yield': 'மகசூல்',
  'pest': 'பூச்சி',
  'pests': 'பூச்சிகள்',
  'disease': 'நோய்',
  'diseases': 'நோய்கள்',
  'neem oil': 'வேப்ப எண்ணெய்',
  'neem': 'வேப்பம்',
  'vermicompost': 'மண்புழு உரம்',
  'bone meal': 'எலும்புத் தூள்',
  // Measurements
  'meters': 'மீட்டர்',
  'meter': 'மீட்டர்',
  'cm': 'செ.மீ',
  'mm': 'மி.மீ',
  'kg': 'கிலோ',
  'per': 'ஒரு',
  'year': 'ஆண்டு',
  'years': 'ஆண்டுகள்',
  'month': 'மாதம்',
  'months': 'மாதங்கள்',
  'days': 'நாட்கள்',
  'daily': 'தினமும்',
  'weekly': 'வாரந்தோறும்',
  'annually': 'ஆண்டுக்கு',
  'yes': 'ஆம்',
  'no': 'இல்லை',
  'and': 'மற்றும்',
  'or': 'அல்லது',
  'with': 'உடன்',
  'from': 'இருந்து',
  'to': 'வரை',
  'in': 'இல்',
  'for': 'க்கு',
  'the': '',
  'a': '',
  'an': '',
  'is': '',
  'are': '',
  'can': 'முடியும்',
  'not': 'இல்லை',
  'also': 'மேலும்',
  // Countries/regions
  'india': 'இந்தியா',
  'south india': 'தென் இந்தியா',
  'tamil nadu': 'தமிழ்நாடு',
  'kerala': 'கேரளா',
  'karnataka': 'கர்நாடகா',
  'sri lanka': 'இலங்கை',
  'brazil': 'பிரேசில்',
  'africa': 'ஆப்பிரிக்கா',
  'australia': 'ஆஸ்திரேலியா',
  'thailand': 'தாய்லாந்து',
  'japan': 'ஜப்பான்',
  'china': 'சீனா',
  'indonesia': 'இந்தோனேசியா',
  'vietnam': 'வியட்நாம்',
  'malaysia': 'மலேசியா',
  'philippines': 'பிலிப்பைன்ஸ்',
};

// English letter to Tamil transliteration (for words not in the dictionary)
const consonantMap = {
  'k': 'க்', 'kh': 'க்', 'g': 'க்', 'gh': 'க்',
  'ch': 'ச்', 'j': 'ஜ்',
  'th': 'த்', 'd': 'ட்', 'dh': 'த்',
  'n': 'ந்', 'nh': 'ண்',
  'p': 'ப்', 'ph': 'ப்', 'b': 'ப்', 'bh': 'ப்',
  'm': 'ம்', 'y': 'ய்', 'r': 'ர்', 'l': 'ல்',
  'v': 'வ்', 'w': 'வ்',
  'sh': 'ஷ்', 's': 'ஸ்', 'h': 'ஹ்',
  'f': 'ஃப்', 'z': 'ஸ்',
  't': 'ட்', 'x': 'க்ஸ்', 'q': 'க்',
  'c': 'க்',
};

const vowelMap = {
  'a': 'அ', 'aa': 'ஆ', 'i': 'இ', 'ee': 'ஈ', 'u': 'உ', 'oo': 'ஊ',
  'e': 'எ', 'ai': 'ஐ', 'o': 'ஒ', 'au': 'ஔ',
};

const vowelSignMap = {
  'a': '', 'aa': 'ா', 'i': 'ி', 'ee': 'ீ', 'u': 'ு', 'oo': 'ூ',
  'e': 'ெ', 'ai': 'ை', 'o': 'ொ', 'au': 'ௌ',
};

function transliterateWord(word) {
  if (!word) return word;
  // Keep numbers and special chars as-is
  if (/^[\d.,;:°–\-\/₹%+()]+$/.test(word)) return word;
  // Already Tamil
  if (/[\u0B80-\u0BFF]/.test(word)) return word;
  
  // Check word map first (case-insensitive)
  const lower = word.toLowerCase();
  if (wordMap[lower]) return wordMap[lower];
  
  // Simple phonetic transliteration
  let result = '';
  let i = 0;
  const w = lower;
  
  while (i < w.length) {
    // Try 2-char combinations first
    const two = w.substring(i, i + 2);
    const one = w[i];
    
    if (i === 0 || result === '' || /[\s\-]/.test(w[i-1])) {
      // Word start - use full vowel
      if (vowelMap[two] && i + 2 <= w.length) {
        result += vowelMap[two];
        i += 2;
        continue;
      }
      if (vowelMap[one]) {
        result += vowelMap[one];
        i++;
        continue;
      }
    }
    
    // Consonant + vowel
    let cons = null;
    let consLen = 0;
    if (consonantMap[two]) { cons = consonantMap[two]; consLen = 2; }
    else if (consonantMap[one]) { cons = consonantMap[one]; consLen = 1; }
    
    if (cons) {
      // Check for following vowel
      const afterCons = w.substring(i + consLen);
      let vowelSign = null;
      let vowelLen = 0;
      
      for (const [v, sign] of Object.entries(vowelSignMap).sort((a, b) => b[0].length - a[0].length)) {
        if (afterCons.startsWith(v)) {
          vowelSign = sign;
          vowelLen = v.length;
          break;
        }
      }
      
      if (vowelSign !== null) {
        // Remove the pulli (்) from consonant and add vowel sign
        result += cons.replace('்', '') + vowelSign;
        i += consLen + vowelLen;
      } else {
        result += cons;
        i += consLen;
      }
      continue;
    }
    
    // Fallback: keep character
    result += one;
    i++;
  }
  
  return result;
}

function translateSentence(text) {
  if (!text || typeof text !== 'string') return text;
  // Keep numbers, measurements, scientific notation as-is within the flow
  // Split by spaces, translate/transliterate each word
  const words = text.split(/(\s+|[,;:()\/])/);
  return words.map(w => {
    if (/^\s+$/.test(w) || /^[,;:()\/]$/.test(w)) return w;
    // Check multi-word phrases first
    const lower = w.toLowerCase();
    if (wordMap[lower]) return wordMap[lower];
    // Keep numbers and measurements
    if (/^[\d.,°–\-]+$/.test(w)) return w;
    if (/^\d+[\-–]\d+$/.test(w)) return w;
    // Transliterate
    return transliterateWord(w);
  }).join('');
}

// Main
const plantDirs = ['plants/fruit-trees', 'plants/spices-herbs', 'plants/medicinal-plants', 'plants/flowering-plants', 'plants/timber-trees'];
let processed = 0;

for (const dir of plantDirs) {
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
  
  for (const file of files) {
    const slug = file.replace('.html', '');
    if (handCrafted.has(slug)) continue;
    
    const tamilFile = `data/i18n-ta-${slug}.json`;
    if (!fs.existsSync(tamilFile)) continue;
    
    const data = JSON.parse(fs.readFileSync(tamilFile, 'utf8'));
    const html = fs.readFileSync(path.join(dir, file), 'utf8');
    
    // Extract all data-i18n value keys and their English text
    const valRegex = /data-i18n="([^"]*_val)"[^>]*>([^<]+)</g;
    let match;
    while ((match = valRegex.exec(html)) !== null) {
      const key = match[1];
      const enText = match[2].trim();
      if (enText && !data[key]) {
        data[key] = translateSentence(enText);
      }
    }
    
    // Also from td elements
    const tdRegex = /<td data-i18n="([^"]*_val)">([^<]+)</g;
    while ((match = tdRegex.exec(html)) !== null) {
      const key = match[1];
      const enText = match[2].trim();
      if (enText && !data[key]) {
        data[key] = translateSentence(enText);
      }
    }
    
    // span values in key-grid
    const spanRegex = /<span data-i18n="([^"]*_val)">([^<]+)<\/span>/g;
    while ((match = spanRegex.exec(html)) !== null) {
      const key = match[1];
      const enText = match[2].trim();
      if (enText && !data[key]) {
        data[key] = translateSentence(enText);
      }
    }
    
    fs.writeFileSync(tamilFile, JSON.stringify(data, null, 2) + '\n', 'utf8');
    processed++;
  }
}

console.log(`Processed ${processed} Tamil files with transliterated content`);
