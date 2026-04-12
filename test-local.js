// Simulate the i18n.js behavior
const fs = require('fs');

const tamilDict = JSON.parse(fs.readFileSync('data/i18n-ta.json', 'utf8'));

console.log('Testing translation keys:');
console.log('');

const tests = [
  { key: 'plant_name_clove', expected: 'கிராம்பு' },
  { key: 'plant_scientific_clove', expected: 'Syzygium aromaticum' },
  { key: 'plant_desc_clove', contains: 'நறுமண' },
  { key: 'plant_name_coconut', expected: 'தேங்காய்' },
  { key: 'plant_desc_coconut', contains: 'வெப்பமண்டல' }
];

let passed = 0;
let failed = 0;

tests.forEach(test => {
  const value = tamilDict[test.key];
  let result = false;
  
  if (test.expected && value === test.expected) {
    result = true;
    console.log(`✓ PASS: ${test.key}`);
    console.log(`  Value: ${value}`);
  } else if (test.contains && value && value.includes(test.contains)) {
    result = true;
    console.log(`✓ PASS: ${test.key}`);
    console.log(`  Contains: ${test.contains}`);
    console.log(`  Value: ${value.substring(0, 60)}...`);
  } else {
    console.log(`✗ FAIL: ${test.key}`);
    console.log(`  Expected: ${test.expected || 'contains: ' + test.contains}`);
    console.log(`  Got: ${value}`);
  }
  
  if (result) passed++;
  else failed++;
  console.log('');
});

console.log(`Results: ${passed} passed, ${failed} failed`);
