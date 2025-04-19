// Fixed Miner Map utility
// This helper persists miner positions and ensures they're correctly displayed

const MINER_MAP_KEY = 'BITAPE_MINER_MAP';

// Retrieve the stored miner map for a specific address
export const getMinerMap = (address) => {
  if (typeof window === 'undefined') return {};
  
  try {
    const storedMap = localStorage.getItem(MINER_MAP_KEY);
    const allMaps = storedMap ? JSON.parse(storedMap) : {};
    return allMaps[address] || {};
  } catch (err) {
    console.error('Error retrieving miner map:', err);
    return {};
  }
};

// Add a miner to the map
export const addMinerToMap = (address, position, minerId) => {
  if (typeof window === 'undefined') return;
  
  try {
    const storedMap = localStorage.getItem(MINER_MAP_KEY);
    const allMaps = storedMap ? JSON.parse(storedMap) : {};
    
    // Initialize address map if it doesn't exist
    if (!allMaps[address]) {
      allMaps[address] = {};
    }
    
    // Convert position to string key (x,y format)
    const posKey = `${position.x},${position.y}`;
    
    // Store the miner
    allMaps[address][posKey] = minerId;
    
    // Save back to localStorage
    localStorage.setItem(MINER_MAP_KEY, JSON.stringify(allMaps));
    
    console.log(`Miner ${minerId} added at position ${posKey} for address ${address}`);
  } catch (err) {
    console.error('Error adding miner to map:', err);
  }
};

// Get a miner at a specific position
export const getMinerAtPosition = (address, x, y) => {
  if (typeof window === 'undefined') return null;
  
  try {
    const minerMap = getMinerMap(address);
    const posKey = `${x},${y}`;
    return minerMap[posKey] || null;
  } catch (err) {
    console.error('Error getting miner at position:', err);
    return null;
  }
};

// Clear the miner map for testing/debugging
export const clearMinerMap = (address) => {
  if (typeof window === 'undefined') return;
  
  try {
    const storedMap = localStorage.getItem(MINER_MAP_KEY);
    const allMaps = storedMap ? JSON.parse(storedMap) : {};
    
    if (address) {
      // Clear only the specified address
      delete allMaps[address];
    } else {
      // Clear all maps
      Object.keys(allMaps).forEach(key => {
        delete allMaps[key];
      });
    }
    
    localStorage.setItem(MINER_MAP_KEY, JSON.stringify(allMaps));
    console.log(`Miner map cleared for ${address ? address : 'all addresses'}`);
  } catch (err) {
    console.error('Error clearing miner map:', err);
  }
}; 