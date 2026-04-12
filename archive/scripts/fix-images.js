#!/usr/bin/env node
/**
 * Fix plant pages that have placeholder image paths (images/plants/...)
 * by removing the broken img tags. The pages will show without images
 * rather than broken image icons.
 * 
 * For pages with onerror="this.style.display='none'" the broken images
 * are already hidden, but let's clean them up properly.
 */
const fs = require('fs');
const path = require('path');

const plantDirs = ['plants/fruit-trees', 'plants/spices-herbs', 'plants/medicinal-plants', 'plants/flowering-plants', 'plants/timber-trees'];
let fixed = 0;

for (const dir of plantDirs) {
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    let html = fs.readFileSync(filePath, 'utf8');
    
    // Check if it has placeholder image paths
    if (html.includes('../../images/plants/') && !html.includes('upload.wikimedia.org')) {
      // Remove broken hero image tags
      html = html.replace(/<img[^>]*src="\.\.\/\.\.\/images\/plants\/[^"]*"[^>]*>\s*/g, '');
      
      // Remove broken gallery image tags  
      html = html.replace(/<img[^>]*src="\.\.\/\.\.\/images\/plants\/[^"]*"[^>]*>\s*/g, '');
      
      fs.writeFileSync(filePath, html, 'utf8');
      fixed++;
    }
  }
}

console.log(`Fixed ${fixed} pages (removed broken placeholder images)`);
