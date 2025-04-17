/**
 * This script generates PWA icons in multiple sizes from a source icon
 * Run with: node scripts/generate-pwa-icons.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SOURCE_ICON = path.join(__dirname, '../public/icons/icon-512x512.png');
const OUTPUT_DIR = path.join(__dirname, '../public/icons');

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Icon sizes needed for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Process each size
async function generateIcons() {
  console.log('Generating PWA icons...');
  
  for (const size of sizes) {
    const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
    
    // Skip if the file already exists
    if (fs.existsSync(outputPath)) {
      console.log(`Icon ${size}x${size} already exists, skipping...`);
      continue;
    }
    
    try {
      // Resize the source icon to the target size
      await sharp(SOURCE_ICON)
        .resize(size, size)
        .toFile(outputPath);
      
      console.log(`Generated icon: ${size}x${size}`);
    } catch (error) {
      console.error(`Error generating ${size}x${size} icon:`, error);
    }
  }
  
  console.log('Icon generation complete!');
}

// Run the generator
generateIcons().catch(console.error); 