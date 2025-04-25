'use client';

import { useEffect } from 'react';

// A simplified client component that handles basic image name mapping without attempting contract queries
export default function FacilityImageHandler() {
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    console.log('🏠 FacilityImageHandler: Checking for old facility image names');

    // Image mapping from old to new naming conventions
    const imageMapping = {
      'bedroom.png': 'level-1.png',
      'treehouse.png': 'level-2.png',
      'penthouse.png': 'level-3.png',
      'mansion.png': 'level-4.png'
    };

    // Check DOM for old image references and fix them
    const fixImages = () => {
      console.log('🏠 Checking for old image naming patterns');
      const images = document.querySelectorAll('img');
      let fixedAny = false;
      
      images.forEach(img => {
        // Check for old naming convention
        for (const [oldName, newName] of Object.entries(imageMapping)) {
          if (img.src.includes(oldName)) {
            // Use the new naming convention
            const basePath = '/images/facilities/';
            const timestamp = Date.now(); // Add cache busting
            const newSrc = `${basePath}${newName}?t=${timestamp}`;
            
            console.log(`🏠 Updating image path from ${oldName} to ${newName}`);
            img.src = newSrc;
            fixedAny = true;
          }
        }
      });
      
      return fixedAny;
    };
    
    // Run immediately
    fixImages();
    
    // Run again after DOM content fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fixImages);
    }
    
    // Also run after a slight delay to catch images loaded after initial render
    const timeoutId = setTimeout(() => fixImages(), 1000);
    
    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      if (document.readyState === 'loading') {
        document.removeEventListener('DOMContentLoaded', fixImages);
      }
    };
  }, []);

  // This component doesn't render anything
  return null;
} 