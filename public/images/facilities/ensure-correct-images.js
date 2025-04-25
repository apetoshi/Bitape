// This script ensures we have the correct facility images, creating symbolic links when needed
const fs = require('fs');
const path = require('path');

// Directory where facility images are stored
const facilitiesDir = path.join(__dirname, '../../../public/images/facilities');

// Make sure the directory exists
if (!fs.existsSync(facilitiesDir)) {
  console.log('Creating facilities directory...');
  fs.mkdirSync(facilitiesDir, { recursive: true });
}

// Mapping of old images to new images
const imageMapping = {
  'bedroom.png': 'level-1.png',
  'treehouse.png': 'level-2.png',
  'penthouse.png': 'level-3.png',
  'mansion.png': 'level-4.png'
};

// Create the correct image files
Object.entries(imageMapping).forEach(([oldName, newName]) => {
  const oldPath = path.join(facilitiesDir, oldName);
  const newPath = path.join(facilitiesDir, newName);
  
  // If the old file exists but the new one doesn't, create a symbolic link or copy
  if (fs.existsSync(oldPath) && !fs.existsSync(newPath)) {
    console.log(`Creating symbolic link from ${oldName} to ${newName}...`);
    try {
      // Try to create a symbolic link first (works on Unix-like systems)
      fs.symlinkSync(oldPath, newPath);
    } catch (error) {
      // If symbolic link fails (e.g., on Windows without admin rights), copy the file
      console.log(`Symbolic link failed, copying ${oldName} to ${newName}...`);
      fs.copyFileSync(oldPath, newPath);
    }
  } 
  // If the new file exists but the old one doesn't, create a symbolic link or copy
  else if (!fs.existsSync(oldPath) && fs.existsSync(newPath)) {
    console.log(`Creating symbolic link from ${newName} to ${oldName}...`);
    try {
      // Try to create a symbolic link first
      fs.symlinkSync(newPath, oldPath);
    } catch (error) {
      // If symbolic link fails, copy the file
      console.log(`Symbolic link failed, copying ${newName} to ${oldName}...`);
      fs.copyFileSync(newPath, oldPath);
    }
  }
  // If neither exists, create a placeholder image
  else if (!fs.existsSync(oldPath) && !fs.existsSync(newPath)) {
    console.log(`Warning: Neither ${oldName} nor ${newName} exists in the facilities directory.`);
    console.log('Please add facility images to public/images/facilities/');
  }
});

console.log('Facility image check completed successfully!'); 