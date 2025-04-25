// Handle the actual facility upgrade from the modal
const processFacilityUpgrade = async () => {
  try {
    console.log('Processing facility upgrade');
    
    // Close the modal first to prevent multiple submissions
    setIsUpgradeModalOpen(false);
    
    // Call the gameState function to upgrade the facility
    const success = await gameState.upgradeFacility();
    
    if (success) {
      console.log('Facility upgraded successfully, refreshing data');
      
      // Force refresh all game data
      if (gameState.refetch) {
        await gameState.refetch();
        
        // Aggressive approach to force image refresh
        if (typeof window !== 'undefined') {
          console.log('Triggering aggressive UI refresh after facility upgrade');
          
          // Force image cache refreshing
          try {
            // 1. Try to clear image cache if supported by browser
            if ('caches' in window) {
              const cacheNames = await window.caches.keys();
              for (const cacheName of cacheNames) {
                if (cacheName.includes('image') || cacheName.includes('next')) {
                  console.log(`🏠 Clearing cache: ${cacheName}`);
                  await window.caches.delete(cacheName);
                }
              }
            }
          } catch (cacheError) {
            console.log('Error clearing image cache:', cacheError);
            // Continue with other methods even if cache clearing fails
          }
          
          // 2. Clear any image caches by manipulating DOM directly
          const images = document.querySelectorAll('img');
          const timestamp = Date.now();
          
          images.forEach(img => {
            if (img.src.includes('/images/facilities/')) {
              // Get current level after upgrade (should be at least 2)
              const newLevel = parsedFacility?.level ? Number(parsedFacility.level) + 1 : 2;
              // After upgrade, ALWAYS use treehouse.png
              const correctPath = `/images/facilities/treehouse.png?force=${timestamp}`;
              
              console.log(`🏠 Resetting facility image to treehouse: ${correctPath}`);
              
              // Force the browser to reload the image
              img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // blank gif
              
              // Use setTimeout to delay the actual image update
              setTimeout(() => {
                img.src = correctPath;
              }, 100);
            }
          });
          
          // 3. Force a re-render by updating state
          setUpgradeCompleted(Date.now());
        }
      }
    }
  } catch (error) {
    console.error('Error upgrading facility:', error);
    alert('Failed to upgrade facility. Please try again.');
  }
}; 