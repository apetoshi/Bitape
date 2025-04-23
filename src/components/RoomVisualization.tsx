import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useContractRead, useContractReads } from 'wagmi';
import { CONTRACT_ADDRESSES, MAIN_CONTRACT_ABI, MAIN_CONTRACT_ABI_EXTENDED } from '../config/contracts';
import { MINERS, MinerType, getMinerById } from '../config/miners';
import { Address, zeroAddress } from 'viem';
import StarterMinerModal from './StarterMinerModal';

// Set debug logging to false to remove miner type overlays
const DEBUG_MINERS = false;
const DEBUG_RENDERS = false;

// Extract useIsMobile hook outside of component to prevent re-render cycles
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    
    // Optimize by using a throttled resize listener
    let resizeTimeout: NodeJS.Timeout;
    const throttledResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkMobile, 200); // Throttle to 200ms
    };
    
    window.addEventListener('resize', throttledResize);
    return () => {
      window.removeEventListener('resize', throttledResize);
      if (resizeTimeout) clearTimeout(resizeTimeout);
    };
  }, []);
  
  return isMobile;
};

// Add keyframes for the pulse animation
const pulseStyle = `
  @keyframes pulse {
    0% { filter: drop-shadow(0 0 1px #FFDD00); }
    50% { filter: drop-shadow(0 0 8px #FFDD00); }
    100% { filter: drop-shadow(0 0 1px #FFDD00); }
  }

  .miner-pulse {
    animation: pulse 2s infinite;
  }

  @keyframes preview-pulse {
    0% { filter: drop-shadow(0 0 1px #FFDD00); opacity: 0.7; }
    50% { filter: drop-shadow(0 0 12px #FFDD00); opacity: 0.9; }
    100% { filter: drop-shadow(0 0 1px #FFDD00); opacity: 0.7; }
  }

  .miner-preview {
    animation: preview-pulse 1.5s infinite;
  }
`;

interface PlayerMiner {
  id: string | number;
  minerType: MinerType | number;
  x: number;
  y: number;
  hashrate?: number;
  powerConsumption?: number;
  cost?: number;
  inProduction?: boolean;
  image?: string;
  type?: number;
  rewardDebt?: number | bigint;
}

export interface RoomVisualizationProps {
  hasFacility: boolean;
  facilityData?: {
    power: number;
    level: number;
    miners: number;
    capacity: number;
    used: number;
    resources: number;
    spaces: number;
  };
  onPurchaseFacility: () => Promise<void>;
  onGetStarterMiner: (x: number, y: number) => Promise<void>;
  onUpgradeFacility: () => Promise<void>;
  isPurchasingFacility: boolean;
  isGettingStarterMiner: boolean;
  isUpgradingFacility: boolean;
  onTileSelect?: (x: number, y: number) => void;
  address?: Address;
  isGridMode?: boolean;
  toggleGridMode?: () => void;
  hasClaimedStarterMiner?: boolean;
  miners?: PlayerMiner[];
  onPurchaseMiner?: (minerType: MinerType, x: number, y: number) => Promise<void>;
  selectedTileHasMiner?: (x: number, y: number) => boolean;
  getMinerAtTile?: (x: number, y: number) => PlayerMiner | null;
}

// Wrap the component with React.memo for better performance
export const RoomVisualization = React.memo(function RoomVisualization({
  hasFacility,
  facilityData,
  onPurchaseFacility,
  onGetStarterMiner,
  onUpgradeFacility,
  isPurchasingFacility,
  isGettingStarterMiner,
  isUpgradingFacility,
  onTileSelect,
  address,
  isGridMode,
  toggleGridMode,
  hasClaimedStarterMiner,
  miners = [],
  onPurchaseMiner,
  selectedTileHasMiner,
  getMinerAtTile
}: RoomVisualizationProps) {
  // Use ref for selectedTile to avoid unnecessary re-renders
  const selectedTileRef = useRef<{x: number, y: number} | null>(null);
  const [selectedTile, setSelectedTile] = useState<{x: number, y: number} | null>(null);
  const [isStarterMinerModalOpen, setIsStarterMinerModalOpen] = useState(false);
  const [previewMinerType, setPreviewMinerType] = useState<MinerType>(MinerType.BANANA_MINER);
  const [contractMiners, setContractMiners] = useState<PlayerMiner[]>([]);
  const [isLoadingMiners, setIsLoadingMiners] = useState(false);
  
  // Added missing variables
  const [disableSelection, setDisableSelection] = useState(false);
  
  // Track the last time a tile was selected to debounce clicks
  const lastTileSelectTime = useRef(0);
  
  // Get isMobile flag using our custom hook
  const isMobile = useIsMobile();
  
  // Add a render counter for debugging
  const renderCount = useRef(0);
  
  // Use refs to track if callbacks have been made
  const tileSelectCallbackMade = useRef(false);
  
  // Check if user has claimed their free miner directly from the contract
  const { data: acquiredStarterMinerData } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'acquiredStarterMiner',
    args: [address || zeroAddress],
    query: {
      enabled: Boolean(address)
    }
  });

  // Get all player miner IDs from the contract
  const { data: playerMinerIds, isLoading: isLoadingMinerIds, refetch: refetchMinerIds } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI_EXTENDED,
    functionName: 'getPlayerMinersPaginated',
    args: [address || zeroAddress, BigInt(0), BigInt(100)], // Get up to 100 miners starting at index 0
    query: {
      enabled: Boolean(address) && hasFacility,
      select: (data) => {
        // Extract just the IDs from the paginated data
        if (data && Array.isArray(data) && data.length > 0) {
          return data.map(miner => miner[1]); // The ID is at index 1 in each miner tuple
        }
        return [];
      }
    }
  });

  // Direct contract read for each miner using contract calls
  const { data: directMinerReads, isLoading: isDirectMinerLoading } = useContractReads({
    contracts: (playerMinerIds && Array.isArray(playerMinerIds) && playerMinerIds.length > 0)
      ? (Array.from(playerMinerIds).map(id => {
          return {
            address: CONTRACT_ADDRESSES.MAIN,
            abi: MAIN_CONTRACT_ABI_EXTENDED as any,
            functionName: 'getMiner',
            args: [id as any]
          } as const;
        }))
      : [],
    query: {
      enabled: Boolean(address) && Boolean(playerMinerIds) && Array.isArray(playerMinerIds) && playerMinerIds.length > 0
    }
  } as any);

  // Convert data to boolean
  const hasActuallyClaimedStarterMiner = Boolean(acquiredStarterMinerData);

  // Use a combined value - either from props or directly from contract
  const effectivelyClaimedStarterMiner = useMemo(() => {
    return hasClaimedStarterMiner || hasActuallyClaimedStarterMiner;
  }, [hasClaimedStarterMiner, hasActuallyClaimedStarterMiner]);

  // Process direct contract reads - add memoization to prevent unnecessary processing
  useEffect(() => {
    if (!directMinerReads || !Array.isArray(directMinerReads) || directMinerReads.length === 0 || !playerMinerIds) {
      return;
    }
    
      try {
        const processedMiners = directMinerReads
          .map((minerData, index) => {
            if (!minerData || !minerData.result) return null;
            
            // Get the ID from the playerMinerIds array
            const id = playerMinerIds[index];
            const result = minerData.result as any;
            
            if (Array.isArray(result)) {
              const minerType = Number(result[0] || 0);
              const x = Number(result[1] || 0);
              const y = Number(result[2] || 0);
              
              if (DEBUG_MINERS) {
                console.log(`Direct contract read for miner ${id}: Type=${minerType}, Position=(${x},${y})`);
                
                // Log miner type information
                if (minerType === MinerType.BANANA_MINER) {
                  console.log(`🍌 Found Banana Miner (Starter) via direct contract read at (${x},${y})`);
                } else if (minerType === MinerType.MONKEY_TOASTER) {
                  console.log(`🐵 Found Monkey Toaster via direct contract read at (${x},${y})`);
                } else if (minerType === MinerType.GORILLA_GADGET) {
                  console.log(`🦍 Found Gorilla Gadget via direct contract read at (${x},${y})`);
                }
              }
              
              // Import getMinerById to safely get miner data
              const minerData = getMinerById(minerType);
              const minerImage = minerData?.image || '/banana-miner.gif';
              
              return {
                id: String(id),
                minerType,
                x,
                y,
                image: minerImage,
                hashrate: Number(result[3] || 0),
                powerConsumption: Number(result[4] || 0),
                inProduction: Boolean(result[7] || false)
              };
            }
            return null;
          })
          .filter(Boolean);
        
      // Only update the state if the data has actually changed
        if (processedMiners.length > 0) {
        // Use a stable comparison to avoid unnecessary updates
        const minersJSON = JSON.stringify(processedMiners);
        const currentMinersJSON = JSON.stringify(contractMiners);
        const hasChanged = minersJSON !== currentMinersJSON;
        
        if (hasChanged) {
          if (process.env.NODE_ENV === 'development') {
            console.log("Setting miners from direct contract reads:", processedMiners.length);
          }
          setContractMiners(processedMiners as PlayerMiner[]);
        }
        }
      } catch (error) {
        console.error("Error processing direct miner reads:", error);
    }
  }, [directMinerReads, playerMinerIds]);

  // Add direct contract read for facility data
  const { data: rawFacilityData } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'ownerToFacility',
    args: [address || zeroAddress],
    query: {
      enabled: Boolean(address),
    }
  });

  // Process raw facility data for logging and debugging - only in development
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    
    if (rawFacilityData && Array.isArray(rawFacilityData) && rawFacilityData.length >= 7) {
      console.log('RoomVisualization - Raw facility data received:', rawFacilityData);
      
      try {
        // [facilityIndex, maxMiners, currMiners, totalPowerOutput, currPowerOutput, x, y]
        const facilityProcessed = {
          facilityIndex: Number(rawFacilityData[0] || 0),
          maxMiners: Number(rawFacilityData[1] || 0),
          currMiners: Number(rawFacilityData[2] || 0),
          totalPowerOutput: Number(rawFacilityData[3] || 0),
          currPowerOutput: Number(rawFacilityData[4] || 0),
          x: Number(rawFacilityData[5] || 0),
          y: Number(rawFacilityData[6] || 0)
        };
        
        console.log('RoomVisualization - Processed facility data:', facilityProcessed);
      } catch (error) {
        console.error('Error processing facility data in RoomVisualization:', error);
      }
    }
  }, [rawFacilityData]);

  // Log facility props at component mount - only log once on mount and only in development
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    
    console.log('RoomVisualization - Component mounted with props:', {
      hasFacility,
      hasMiners: Boolean(miners?.length),
      minersCount: miners?.length
    });
  }, []); // Empty dependency array to run only once

  // Create a ref to track previous miner data to avoid unnecessary rerenders
  const prevMinersDataRef = useRef(null);

  // Process the miners data outside of render to ensure consistent hook calls
  // Use stable object references with useMemo and implement deeper comparison
  const allMinersData = useMemo(() => {
    // Skip reprocessing if miners and contractMiners haven't changed
    if (prevMinersDataRef.current && 
        prevMinersDataRef.current.miners === miners && 
        prevMinersDataRef.current.contractMiners === contractMiners) {
      return prevMinersDataRef.current.result;
    }

    // Create a string representation of current miners for comparison
    const currentMinersString = JSON.stringify(miners);
    const currentContractMinersString = JSON.stringify(contractMiners);
    
    // Compare with previous strings
    if (prevMinersDataRef.current && 
        prevMinersDataRef.current.minersString === currentMinersString && 
        prevMinersDataRef.current.contractMinersString === currentContractMinersString) {
      return prevMinersDataRef.current.result;
    }
    
    // Create a combined array of all miners
    let allMiners = [...contractMiners];
    
    // Ensure any on-chain miners are still represented
    if (miners && miners.length > 0) {
      const existingIds = new Set(contractMiners.map(m => String(m.id)));
      const existingPositions = new Set(contractMiners.map(m => `${Number(m.x)}-${Number(m.y)}`));
      
      miners.forEach(propMiner => {
        const minerX = Number(propMiner.x);
        const minerY = Number(propMiner.y);
        
        // Sanity check for valid grid positions (0,0), (0,1), (1,0), (1,1)
        if (minerX > 1 || minerY > 1 || minerX < 0 || minerY < 0) {
          if (DEBUG_MINERS) {
            console.log(`Filtering out miner ID ${propMiner.id} with invalid coordinates (${minerX}, ${minerY})`);
          }
          return; // Skip this miner as it has invalid coordinates
        }
        
        // Get the miner type
        const minerType = Number(propMiner.minerType || propMiner.type);
        const minerId = String(propMiner.id);
        const positionKey = `${minerX}-${minerY}`;
        
        // Check if this miner already exists in our list - use strict number type checking
        if (!existingIds.has(minerId) && !existingPositions.has(positionKey)) {
          // Get the image directly without attempting to convert types
          const minerImage = MINERS[minerType]?.image || '/banana-miner.gif';
          
          allMiners.push({
            ...propMiner,
            x: minerX,
            y: minerY,
            minerType,
            image: minerImage
          });
        }
      });
    }
    
    // Store the inputs and result for future comparison
    const result = allMiners.filter(m => {
      const x = Number(m.x);
      const y = Number(m.y);
      const validCoordinates = x <= 1 && y <= 1 && x >= 0 && y >= 0 && !isNaN(x) && !isNaN(y);
      if (!validCoordinates && DEBUG_MINERS) {
        console.log(`Mapping miner ID ${m.id} with type ${m.minerType} at position (${x}, ${y})`);
        console.log(`Validated miner ID ${m.id} at (${x}, ${y})`);
        console.log(`Filtering out miner ID ${m.id} with invalid coordinates (${x}, ${y})`);
      }
      return validCoordinates;
    });
    
    prevMinersDataRef.current = {
      miners,
      contractMiners,
      minersString: currentMinersString,
      contractMinersString: currentContractMinersString,
      result
    };
    
    return result;
  }, [miners, contractMiners, DEBUG_MINERS]);
  
  // Filter out miners with non-zero rewardDebt
  const processedMiners = useMemo(() => {
    return miners?.filter(miner => {
      // Check if rewardDebt property exists and is non-zero
      if (miner.rewardDebt !== undefined && Number(miner.rewardDebt) > 0) {
        return false;
      }
      return true;
    });
  }, [miners]);
  
  // Combine processedMiners and allMinersData outside any render functions
  // to ensure hooks are called consistently - use stable object comparison
  const combinedMinersData = useMemo(() => {
    // Create maps to track unique positions and IDs
    const minersByPosition = new Map();
    const minersByIds = new Map();
    const processedItems = [];
    
    // Add items from both sources to our maps
    [...(processedMiners || []), ...allMinersData].forEach(miner => {
      if (!miner) return; // Skip null/undefined miners
      
      const x = Number(miner.x);
      const y = Number(miner.y);
      const id = String(miner.id);
      
      // Skip miners with invalid coordinates
      if (x > 1 || y > 1 || x < 0 || y < 0) {
        return;
      }
      
      // Use position and ID as unique keys
      const posKey = `${x}-${y}`;
      
      // If it's a new position or new ID, add it
      if (!minersByPosition.has(posKey) && !minersByIds.has(id)) {
        minersByPosition.set(posKey, miner);
        minersByIds.set(id, miner);
      }
    });
    
    // Extract values from position map to create final array
    for (const [_, miner] of minersByPosition) {
      processedItems.push({
        ...miner,
        minerType: Number(miner.minerType || miner.type || 0),
        image: miner.image || '/banana-miner.gif',
        x: Number(miner.x),
        y: Number(miner.y),
        id: String(miner.id)
      });
    }
    
    return processedItems;
  }, [processedMiners, allMinersData]);
  
  // Helper function to check if a tile is occupied by a miner - make stable with useCallback
  const isTileOccupied = useCallback((x: number, y: number) => {
    // Use the passed in function if available
    if (selectedTileHasMiner) {
      return selectedTileHasMiner(x, y);
    }
    
    // Fallback to the pre-computed combinedMinersData
    return combinedMinersData.some(miner => {
      const minerX = Number(miner.x);
      const minerY = Number(miner.y);
      return minerX === x && minerY === y;
    });
  }, [selectedTileHasMiner, combinedMinersData]);
  
  // Helper function to get a miner at a specific tile - make stable with useCallback
  const getMinerAtTileLocal = useCallback((x: number, y: number) => {
    const targetX = Number(x);
    const targetY = Number(y);
    
    // If the parent component provided a function, use it
    if (getMinerAtTile) {
      const miner = getMinerAtTile(targetX, targetY);
      
      // If the parent provided a miner, process it to ensure it has the right properties
      if (miner) {
        const minerType = Number(miner.minerType || miner.type || 0);
        let minerImage = '/banana-miner.gif'; // Default image
        
        // Map contract miner types to images
        if (minerType === 1) {
          minerImage = '/banana-miner.gif'; // BANANA_MINER
        } else if (minerType === 2) {
          minerImage = '/gorilla-gadget.gif'; // GORILLA_GADGET
        } else if (minerType === 3) {
          minerImage = '/monkey-toaster.gif'; // MONKEY_TOASTER
        } else if (minerType === 4) {
          minerImage = '/apepad.png'; // APEPAD_MINI
        }
        
        return {
          ...miner,
          minerType: minerType,
          image: miner.image || minerImage,
          x: Number(miner.x),
          y: Number(miner.y)
        };
      }
      return null;
    }
    
    // Fallback to our pre-computed combinedMinersData if getMinerAtTile function is not provided
    return combinedMinersData.find(miner => {
      const minerX = Number(miner.x);
      const minerY = Number(miner.y);
      // Ensure strict number comparison
      return minerX === targetX && minerY === targetY;
    }) || null;
  }, [getMinerAtTile, combinedMinersData]);

  // Add a function to get a display label for miners - moved up before it's used
  const getMinerLabel = (miner: any) => {
    return `Miner #${miner.id || 'unknown'}`;
  };

  // Grid coordinates for the four mining spaces
  // Adjusted grid positions for better visual positioning
  const gridPositions = useMemo(() => [
      { x: 0, y: 0, top: '40%', left: '40%', width: '15%', height: '15%' }, // near bed
      { x: 1, y: 0, top: '46%', left: '29%', width: '15%', height: '15%' }, // near banana boxes - adjusted left position
      { x: 0, y: 1, top: '50%', left: '55%', width: '15%', height: '15%' }, // near jukebox
      { x: 1, y: 1, top: '60%', left: '35%', width: '15%', height: '15%' }  // near control panel
  ], []);

  // Function to check if a selected tile has a miner - use our local implementation consistently
  const selectedTileHasMinerInternal = useCallback((x: number, y: number) => {
    if (!selectedTile) return false;
    
    return selectedTile.x === x && selectedTile.y === y && Boolean(getMinerAtTileLocal(x, y));
  }, [selectedTile, getMinerAtTileLocal]);

  // Handle tile selection
  const handleTileClick = useCallback((x: number, y: number) => {
    if (disableSelection) return;
    
    // Prevent interaction on tiles that already have miners
    if (isTileOccupied(x, y) && !selectedTileHasMiner) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`Tile (${x}, ${y}) already has a miner. Ignoring click.`);
      }
      return;
    }
    
    // Add debounce to prevent duplicate calls in a short time span
    const now = Date.now();
    if (now - lastTileSelectTime.current < 300) { // 300ms debounce
      return;
    }
    lastTileSelectTime.current = now;
    
    if (isGridMode) {
      // Only update state if it actually changes to avoid re-renders
      if (!selectedTile || selectedTile.x !== x || selectedTile.y !== y) {
        // Update refs first (doesn't trigger re-render)
        selectedTileRef.current = { x, y };
        
        // Then update state
        setSelectedTile({ x, y });
        
        // Call the parent callback only once when selection changes
        if (onTileSelect && !tileSelectCallbackMade.current) {
          tileSelectCallbackMade.current = true;
          
          // Use setTimeout to break the potential render cycle
          setTimeout(() => {
            if (onTileSelect) {
              onTileSelect(x, y);
            }
            // Reset the flag after a safe delay
            setTimeout(() => {
              tileSelectCallbackMade.current = false;
            }, 0);
          }, 0);
        }
      }
    } else if (onTileSelect) {
      // Non-grid mode - call handler directly
      onTileSelect(x, y);
    }
  }, [isGridMode, onTileSelect, selectedTile, disableSelection, isTileOccupied, selectedTileHasMiner]);

  // Add memoized values at the component top level - before useCallback functions
  // Define custom positions for the grid spaces to match the blue tiles
  const customPositions = useMemo(() => [
    { 
      x: 0, y: 0, // TOP RIGHT
      style: { 
        gridColumn: 2, 
        gridRow: 1,
        ...(isMobile && {
          margin: '0 0 0 10px' // Add some spacing for mobile
        })
      }
    },
    { 
      x: 1, y: 0, // TOP LEFT
      style: { 
        gridColumn: 1, 
        gridRow: 1,
        ...(isMobile && {
          margin: '0 10px 0 0' // Add some spacing for mobile
        })
      }
    },
    { 
      x: 0, y: 1, // BOTTOM RIGHT
      style: { 
        gridColumn: 2, 
        gridRow: 2,
        ...(isMobile && {
          margin: '10px 0 0 10px' // Add some spacing for mobile
        })
      }
    },
    { 
      x: 1, y: 1, // BOTTOM LEFT
      style: { 
        gridColumn: 1, 
        gridRow: 2,
        ...(isMobile && {
          margin: '10px 10px 0 0' // Add some spacing for mobile
        })
      }
    }
  ], [isMobile]);

  // Define custom positions for the active miners on blue tiles
  const minerPositions = useMemo(() => [
    { 
      x: 0, y: 0, // TOP RIGHT
      style: { 
        position: 'absolute' as const,
        top: isMobile ? '42%' : '40%',
        left: isMobile ? '45%' : '35%',
        width: isMobile ? '40px' : '150px',
        height: isMobile ? '90px' : '150px',
        zIndex: 20
      }
    },
    { 
      x: 1, y: 0, // TOP LEFT
      style: { 
        position: 'absolute' as const,
        top: isMobile ? '50%' : '47%',
        left: isMobile ? '30%' : '20%',
        width: isMobile ? '40px' : '150px',
        height: isMobile ? '90px' : '150px',
        zIndex: 20
      }
    },
    { 
      x: 0, y: 1, // BOTTOM RIGHT
      style: { 
        position: 'absolute' as const,
        top: isMobile ? '50%' : '46%',
        left: isMobile ? '60%' : '50%',
        width: isMobile ? '40px' : '150px',
        height: isMobile ? '90px' : '150px',
        zIndex: 20
      }
    },
    { 
      x: 1, y: 1, // BOTTOM LEFT
      style: { 
        position: 'absolute' as const,
        top: isMobile ? '56%' : '55%',
        left: isMobile ? '45%' : '35%',
        width: isMobile ? '40px' : '150px',
        height: isMobile ? '90px' : '150px',
        zIndex: 20
      }
    }
  ], [isMobile]);

  // Create a position map from combinedMinersData
  const minersByPosition = useMemo(() => {
    if (!combinedMinersData) return new Map();
    
    const posMap = new Map();
    combinedMinersData.forEach(miner => {
      const key = `${Number(miner.x)}-${Number(miner.y)}`;
      posMap.set(key, miner);
    });
    return posMap;
  }, [combinedMinersData]);

  // Function to render the mining grid spaces - for selection and interaction only
  const renderMiningSpaces = useCallback(() => {
    // Debug counter to track re-renders
    if (DEBUG_RENDERS) {
      renderCount.current++;
      console.log(`renderMiningSpaces called (${renderCount.current} times)`);
    }

    return customPositions.map(pos => {
      const { x, y, style } = pos;
      
      // Check if this tile is selected - use the ref for comparison
      // This prevents unnecessary re-renders when selection changes
      const isSelected = selectedTileRef.current && 
                         selectedTileRef.current.x === x && 
                         selectedTileRef.current.y === y;
      
      // Create a unique key for this tile
      const key = `tile-${x}-${y}`;
      
      // Use a local cached variable to avoid calling functions during render
      // This breaks potential render loops by not triggering re-renders
      const miner = getMinerAtTileLocal(x, y);
      const hasMiner = miner !== null;
          
          return (
            <div 
          key={key}
          className={`mining-space ${isSelected ? 'selected' : ''} ${hasMiner ? 'has-miner' : ''}`}
          onClick={() => handleTileClick(x, y)}
              style={{
            ...style,
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            // Add debug outline when in development
            ...(process.env.NODE_ENV === 'development' && DEBUG_MINERS ? { outline: '1px solid rgba(255,255,0,0.3)' } : {})
          }}
        >
          {/* Display coordinates when grid mode is active */}
          {isGridMode && (
            <div className="coordinates" style={{
              position: 'absolute',
              top: '5px',
              left: '5px',
              fontSize: '10px',
              fontWeight: 'bold',
              color: '#FFDD00',
              fontFamily: 'monospace',
              zIndex: 30,
              textShadow: '1px 1px 1px rgba(0,0,0,0.8)'
            }}>{x},{y}</div>
          )}

          {/* Show miner in grid if one exists */}
          {hasMiner && isGridMode && (
            <div 
              className="grid-miner-container" 
                  style={{ 
                position: 'relative',
                width: '80%',
                height: '80%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 25
              }}
            >
              <Image
                src={miner.image || '/banana-miner.gif'}
                alt={`Miner ${miner.id}`}
                fill
                className="object-contain"
                priority
              />
                  </div>
                )}
            </div>
          );
    });
  }, [isGridMode, DEBUG_MINERS, DEBUG_RENDERS, getMinerAtTileLocal, handleTileClick, customPositions]);

  // Separate function to render active miners on the blue floor tiles
  const renderActiveMiners = useCallback(() => {
    if (!hasFacility || !combinedMinersData) return null;

    return minerPositions.map(pos => {
      const { x, y, style } = pos;
      
      // Check if there's a miner at this position using the position map
      // This avoids calling functions during render that might trigger state updates
      const posKey = `${x}-${y}`;
      const miner = minersByPosition.get(posKey);
      
      // Skip rendering if no miner at this position
      if (!miner) return null;
      
      // Different miner sizes depending on their type
      const getMinerSize = () => {
        const minerType = Number(miner.minerType || miner.type || 0);
        switch (minerType) {
          case 1: return { width: '130%', height: '130%' }; // BANANA_MINER
          case 2: return { width: '140%', height: '140%' }; // GORILLA_GADGET
          case 3: return { width: '135%', height: '135%' }; // MONKEY_TOASTER
          case 4: return { width: '130%', height: '130%' }; // APEPAD_MINI
          default: return { width: '130%', height: '130%' };
        }
      };

          return (
            <div
          key={`active-miner-${x}-${y}`}
          className="active-miner-container" 
              style={{
            ...style,
            opacity: isGridMode ? 0 : 1,
            transition: 'opacity 0.3s ease'
          }}
        >
          <div className="active-miner" style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Image
              src={miner.image || '/banana-miner.gif'}
              alt={`Miner ${miner.id}`}
              fill
              className="object-contain miner-pulse"
              priority
            />
            {DEBUG_MINERS && (
              <div className="miner-indicator" style={{
                position: 'absolute',
                bottom: '2px',
                right: '2px',
                fontSize: '10px',
                color: '#FFDD00',
                background: 'rgba(0,0,0,0.7)',
                padding: '1px 3px',
                borderRadius: '2px'
              }}>
                {getMinerLabel(miner)}
              </div>
            )}
          </div>
      </div>
    );
    }).filter(Boolean); // Filter out null entries (positions without miners)
  }, [hasFacility, combinedMinersData, isGridMode, DEBUG_MINERS, getMinerLabel, minerPositions, minersByPosition]);

  // Add debugging to monitor excessive re-renders in development
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    
    // Count renders for debugging - only log every 5 renders to avoid console flooding
    renderCount.current += 1;
    
    if (renderCount.current % 5 === 0) {
      console.log(`RoomVisualization has re-rendered ${renderCount.current} times`);
    }
  });

  const handleClaimStarterMiner = useCallback(async (x: number, y: number) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Claiming starter miner at position (${x}, ${y})`);
    }
    
    // Ensure valid coordinates
    if (x < 0 || x > 1 || y < 0 || y > 1) {
      console.error(`Invalid tile coordinates (${x}, ${y}). Valid ranges are 0-1.`);
      return;
    }
    
    // Check if tile is already occupied
    if (isTileOccupied(x, y)) {
      console.error(`Tile (${x}, ${y}) is already occupied by a miner.`);
      return;
    }
    
    try {
      // If no starter miner handler is provided, log an error
      if (!onGetStarterMiner && !onPurchaseMiner) {
        console.error('No handler function provided for claiming starter miner');
        return;
      }

      // Check which mechanism to use based on what's available
      // Prefer onGetStarterMiner for clearer intent
      if (onGetStarterMiner) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Using onGetStarterMiner to claim starter miner');
        }
        await onGetStarterMiner(x, y);
      } else if (onPurchaseMiner) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Using onPurchaseMiner to claim starter miner');
        }
        await onPurchaseMiner(MinerType.BANANA_MINER, x, y);
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Starter miner claimed successfully');
      }
      setIsStarterMinerModalOpen(false);
      
      // Refetch miner data after claiming
      if (refetchMinerIds) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Refetching miner IDs after claim');
        }
        refetchMinerIds();
      }
      
      // Enable grid mode after claiming to show the user their miner
      if (toggleGridMode && !isGridMode) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Enabling grid mode after claiming miner');
        }
        toggleGridMode();
      }
    } catch (error) {
      console.error('Error claiming starter miner:', error);
    }
  }, [isTileOccupied, onGetStarterMiner, onPurchaseMiner, refetchMinerIds, toggleGridMode, isGridMode]);

  // Define isGridEnabled to use consistently instead of directly using isGridMode
  const isGridEnabled = useMemo(() => {
    return Boolean(isGridMode);
  }, [isGridMode]);

  // Cleanup any pending timers on unmount
  useEffect(() => {
    return () => {
      // Clear any pending timeouts to prevent memory leaks
      tileSelectCallbackMade.current = false;
    };
  }, []);

  return (
    <>
      <style jsx global>{`
        ${pulseStyle}
        .mining-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          grid-template-rows: repeat(2, 1fr);
          gap: 4px;
          width: ${isMobile ? '250px' : '300px'};
          height: ${isMobile ? '140px' : '170px'};
          position: absolute;
          top: ${isMobile ? '47%' : '57%'};
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 20;
          pointer-events: ${isGridMode ? 'auto' : 'none'};
          opacity: ${isGridMode ? 1 : 0};
          transition: opacity 0.3s ease;
        }
        
        .grid-mode {
          opacity: 1;
        }
        
        .mining-space {
          background-color: ${isGridMode ? 'rgba(0, 0, 0, 0.3)' : 'transparent'};
          backdrop-filter: ${isGridMode ? 'blur(2px)' : 'none'};
          border: ${isGridMode ? '1px dashed rgba(255, 221, 0, 0.3)' : 'none'};
        }
        
        .mining-space.selected {
          border-color: #FFDD00 !important;
          box-shadow: 0 0 10px #FFDD00;
        }
        
        .mining-space.has-miner {
          background-color: ${isGridMode ? 'rgba(0, 0, 0, 0.5)' : 'transparent'};
        }
        
        .active-miner-container {
          pointer-events: none;
          transition: opacity 0.3s ease;
        }
        
        /* Grid miner styling */
        .grid-miner-container {
          opacity: 0.9;
          filter: brightness(1.2);
        }
        
        /* Animation for miners */
        @keyframes pulse {
          0% { filter: brightness(1) drop-shadow(0 0 6px rgba(255, 221, 0, 0.7)); }
          50% { filter: brightness(1.2) drop-shadow(0 0 10px rgba(255, 221, 0, 0.9)); }
          100% { filter: brightness(1) drop-shadow(0 0 6px rgba(255, 221, 0, 0.7)); }
        }
        
        .miner-pulse {
          animation: pulse 2s infinite ease-in-out;
        }
      `}</style>
      
      <div className="relative w-full h-full">
        {/* Room Background - Only show if hasFacility is true */}
        {hasFacility ? (
          <Image 
            src="/bedroom.png" 
            alt="Mining Room" 
            fill
            priority
            className={`object-contain ${isMobile ? 'mobile-room-bg' : ''}`}
            style={{
              objectFit: 'contain',
              maxWidth: '100%',
              maxHeight: '100%'
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Image 
              src="/bedroom.png" 
              alt="Empty Space" 
              width={690}
              height={690}
              className="absolute inset-0 object-contain w-full h-full"
            />
            {/* Enhanced overlay with improved visibility and consistency across devices */}
            {isMobile && (
              <div className="absolute inset-0 flex items-center justify-center z-40">
                <div className={`max-w-md p-2 bg-transparent backdrop-blur-sm rounded-lg border-2 border-banana shadow-lg relative overflow-hidden ${isMobile ? 'w-11/12' : ''}`}>
                  {/* FREE Miner Badge */}
                  <div className="absolute -right-12 top-3 bg-green-500 text-white font-press-start text-[8px] py-0.5 px-8 transform rotate-45 shadow-lg z-50">
                    FREE MINER
                  </div>
                  
                  <p className={`font-press-start text-white ${isMobile ? 'text-xs' : 'text-lg'} mb-1.5`}>Start Your Mining Operation Now!</p>
                  
                  {/* Free Miner Promotion */}
                  <div className="bg-[#001420]/60 p-1.5 rounded-md mb-2 border-2 border-yellow-400 flex items-center">
                    <div className={`relative ${isMobile ? 'w-10 h-10 mr-1.5' : 'w-24 h-24 mr-4'}`}>
                      <Image 
                        src={MINERS[MinerType.BANANA_MINER].image}
                        alt="Free Banana Miner" 
                        width={isMobile ? 40 : 96}
                        height={isMobile ? 40 : 96}
                        className="object-contain"
                        unoptimized={true}
                      />
                    </div>
                    <div>
                      <p className={`text-yellow-400 font-press-start ${isMobile ? 'text-[10px]' : 'text-base'} mb-0.5`}>FREE BANANA MINER</p>
                      <p className={`text-white font-press-start ${isMobile ? 'text-[8px]' : 'text-sm'} mb-0.5`}>
                        • {MINERS[MinerType.BANANA_MINER].hashrate} GH/s Hashrate
                      </p>
                      <p className={`text-white font-press-start ${isMobile ? 'text-[8px]' : 'text-sm'} mb-0.5`}>
                        • {MINERS[MinerType.BANANA_MINER].energyConsumption} WATTS Energy
                      </p>
                      <p className={`text-banana font-press-start ${isMobile ? 'text-[8px]' : 'text-sm'}`}>
                        • Start mining immediately!
                      </p>
                    </div>
                  </div>
                  
                  {/* Combined purchase button with cost indicator */}
                  <div className="flex flex-col items-center">
                    <button 
                      onClick={onPurchaseFacility}
                      disabled={isPurchasingFacility}
                      className={`font-press-start ${isMobile ? 'text-[10px] px-2 py-1.5' : 'px-8 py-4 text-base'} w-full bg-gradient-to-r from-[#F0B90B] to-[#FFDD00] text-black hover:opacity-90 transition-opacity rounded-md shadow-md font-bold border-none flex items-center justify-center`}
                    >
                      {isPurchasingFacility ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-1.5 h-2.5 w-2.5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          PURCHASING...
                        </span>
                      ) : (
                        <>
                          <span>BUY FACILITY</span>
                          <div className="flex items-center ml-1.5 bg-blue-600 rounded-full px-1 py-0.5">
                            {isMobile ? (
                              // For mobile: use text only (more reliable)
                              <span className="text-white text-[8px] font-bold mr-0.5">10</span>
                            ) : (
                              // For desktop: use the ApeCoin logo image
                              <div className="w-4 h-4 flex-shrink-0 mr-1 relative">
                                <img 
                                  src="/apecoin.png" 
                                  alt="APE" 
                                  className="w-full h-full object-contain"
                                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                                />
                              </div>
                            )}
                            <span className="text-white font-bold text-[8px]">{isMobile ? "" : "10 "}APE</span>
                          </div>
                        </>
                      )}
                    </button>
                    <p className="text-white text-[8px] mt-0.5 opacity-80">(Initial facility includes a FREE Miner)</p>
                    
                    {/* ApeCoin Powered Text */}
                    <div className="flex items-center justify-center mt-2">
                      <div className="w-3 h-3 mr-1">
                        <img 
                          src="/apecoin.png" 
                          alt="ApeCoin Logo" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span className="text-banana font-press-start text-[8px]">Powered by ApeCoin</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Render the active miners on blue floor tiles - always visible */}
        {renderActiveMiners()}
        
        {/* Mining Grid - For selection and interaction only */}
        {hasFacility && (
          <div className={`mining-grid ${isGridMode ? 'grid-mode' : ''}`}>
            {renderMiningSpaces()}
          </div>
        )}
        
        {/* Grid Mode Toggle Button (Top Left Corner) */}
        {hasFacility && toggleGridMode && (
        <button 
            onClick={toggleGridMode}
            className={`absolute top-2 left-2 z-30 px-2 py-1 font-press-start text-xs transition-all ${
              isGridMode ? 'bg-banana text-royal' : 'bg-transparent text-banana border border-banana'
            } ${isMobile ? 'mobile-grid-btn' : ''}`}
          >
            {isGridMode ? 'HIDE GRID' : 'SHOW GRID'}
        </button>
        )}
        
        {/* Upgrade Button (Top Right Corner) */}
        {hasFacility && (
        <button 
          onClick={onUpgradeFacility}
          disabled={isUpgradingFacility}
            className={`absolute top-2 right-2 z-30 px-2 py-1 font-press-start text-xs bg-transparent text-banana border border-banana hover:bg-banana hover:text-royal transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isMobile ? 'mobile-upgrade-btn' : ''}`}
          >
            {isUpgradingFacility ? 'UPGRADING...' : 'UPGRADE FACILITY'}
          </button>
        )}
        
        {/* CLAIM STARTER MINER Button - Prominent center position */}
        {hasFacility && !effectivelyClaimedStarterMiner && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40">
            <button
              onClick={() => {
                // First make sure we have a default tile selected
                if (!selectedTile) {
                  setSelectedTile({ x: 0, y: 0 });
                  selectedTileRef.current = { x: 0, y: 0 };
                }
                // Then open the modal
                setIsStarterMinerModalOpen(true);
              }}
              disabled={isGettingStarterMiner}
              className="px-4 py-3 font-press-start text-base bg-banana text-royal hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-md shadow-lg animate-pulse"
            >
              {isGettingStarterMiner ? 'CLAIMING...' : 'CLAIM FREE STARTER MINER'}
            </button>
          </div>
        )}
      </div>
      
      {/* Starter Miner Modal - With auto-open when conditions are met */}
      {!hasActuallyClaimedStarterMiner && (
        <StarterMinerModal
          isOpen={isStarterMinerModalOpen}
          onClose={() => setIsStarterMinerModalOpen(false)}
          onClaim={handleClaimStarterMiner}
          selectedTile={selectedTile}
          isProcessing={isGettingStarterMiner}
        />
      )}
    </>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function to prevent unnecessary re-renders
  // Only re-render when these specific props change
  return (
    prevProps.hasFacility === nextProps.hasFacility &&
    prevProps.isGridMode === nextProps.isGridMode &&
    prevProps.hasClaimedStarterMiner === nextProps.hasClaimedStarterMiner &&
    prevProps.isPurchasingFacility === nextProps.isPurchasingFacility &&
    prevProps.isGettingStarterMiner === nextProps.isGettingStarterMiner &&
    prevProps.isUpgradingFacility === nextProps.isUpgradingFacility &&
    // Compare miners arrays by length rather than identity to reduce re-renders
    (!prevProps.miners || !nextProps.miners || prevProps.miners.length === nextProps.miners.length)
  );
});
