import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useContractRead, useContractReads } from 'wagmi';
import { CONTRACT_ADDRESSES, MAIN_CONTRACT_ABI, MAIN_CONTRACT_ABI_EXTENDED } from '../config/contracts';
import { MINERS, MinerType, getMinerById } from '../config/miners';
import { Address, zeroAddress } from 'viem';
import StarterMinerModal from './StarterMinerModal';
import { useGameState } from '../hooks/useGameState';
import { useFacilityLevel } from './FacilityLevelProvider';

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
  
  @keyframes pulse-strong {
    0% { filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.7)); }
    50% { filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.9)); }
    100% { filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.7)); }
  }
  
  .miner-pulse-strong {
    animation: pulse-strong 1.5s infinite;
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

  // Fix the prevMinersDataRef type issue by initializing it properly
  const prevMinersDataRef = useRef<{
    miners: PlayerMiner[];
    contractMiners: PlayerMiner[];
    minersString: string;
    contractMinersString: string;
    result: PlayerMiner[];
  } | null>(null);

  // Add the required state variables for facility tracking
  const [imageRefreshKey, setImageRefreshKey] = useState(Date.now());
  const [contractFacilityLevel, setContractFacilityLevel] = useState<number | null>(null);
  const { facilityLevel: contextFacilityLevel } = useFacilityLevel();
  const { facilityData: gameStateFacilityData } = useGameState();

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
        
        // Get the current facility level
        const facilityLevel = contractFacilityLevel || (facilityData?.level || 1);
        
        // Sanity check for valid grid positions based on facility level
        let isValidCoordinate = false;
        if (facilityLevel >= 2) {
          // For level 2 facilities, valid coordinates are (0-1, 0-3)
          isValidCoordinate = minerX >= 0 && minerX <= 1 && minerY >= 0 && minerY <= 3;
        } else {
          // For level 1 facilities, valid coordinates are (0-1, 0-1)
          isValidCoordinate = minerX >= 0 && minerX <= 1 && minerY >= 0 && minerY <= 1;
        }
        
        if (!isValidCoordinate) {
          if (DEBUG_MINERS) {
            console.log(`Filtering out miner ID ${propMiner.id} with invalid coordinates (${minerX}, ${minerY}) for facility level ${facilityLevel}`);
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
      
      // Get the current facility level
      const facilityLevel = contractFacilityLevel || (facilityData?.level || 1);
      
      // Validate coordinates based on facility level
      let validCoordinates = false;
      if (facilityLevel >= 2) {
        // For level 2 facilities, valid coordinates are (0-1, 0-3)
        validCoordinates = x >= 0 && x <= 1 && y >= 0 && y <= 3 && !isNaN(x) && !isNaN(y);
      } else {
        // For level 1 facilities, valid coordinates are (0-1, 0-1)
        validCoordinates = x >= 0 && x <= 1 && y >= 0 && y <= 1 && !isNaN(x) && !isNaN(y);
      }
      
      if (!validCoordinates && DEBUG_MINERS) {
        console.log(`Filtering out miner ID ${m.id} with invalid coordinates (${x}, ${y}) for facility level ${facilityLevel}`);
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
  }, [miners, contractMiners, DEBUG_MINERS, contractFacilityLevel, facilityData?.level]);
  
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
  
  // Define proper typing for combinedMinersData
  const combinedMinersData = useMemo<PlayerMiner[]>(() => {
    // Create maps to track unique positions and IDs
    const minersByPosition = new Map();
    const minersByIds = new Map();
    const processedItems: PlayerMiner[] = [];
    
    // Debug logging for facility level
    const facilityLevel = contractFacilityLevel || (facilityData?.level || 1);
    console.log(`Processing combinedMinersData with facility level: ${facilityLevel}`);
    
    // Add items from both sources to our maps
    [...(processedMiners || []), ...allMinersData].forEach(miner => {
      if (!miner) return; // Skip null/undefined miners
      
      const x = Number(miner.x);
      const y = Number(miner.y);
      const id = String(miner.id);
      
      // Skip miners with invalid coordinates based on facility level
      let isValidCoordinate = false;
      if (facilityLevel >= 2) {
        isValidCoordinate = x >= 0 && x <= 1 && y >= 0 && y <= 3;
      } else {
        isValidCoordinate = x >= 0 && x <= 1 && y >= 0 && y <= 1;
      }
      
      if (!isValidCoordinate) {
        if (DEBUG_MINERS) {
          console.log(`Filtering out miner ID ${id} with invalid coordinates (${x}, ${y}) for facility level ${facilityLevel}`);
        }
        return;
      }
      
      // Special debug for position (0,2)
      if (x === 0 && y === 2) {
        console.log(`Found miner at (0,2) with ID ${id} while processing combinedMinersData`, miner);
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
    for (const [posKey, miner] of minersByPosition) {
      processedItems.push({
        ...miner,
        minerType: Number(miner.minerType || miner.type || 0),
        image: miner.image || '/banana-miner.gif',
        x: Number(miner.x),
        y: Number(miner.y),
        id: String(miner.id)
      });
      
      // Debug logging for position (0,2)
      if (Number(miner.x) === 0 && Number(miner.y) === 2) {
        console.log(`Added miner at (0,2) to processedItems with image: ${miner.image || '/banana-miner.gif'}`);
      }
    }
    
    return processedItems;
  }, [processedMiners, allMinersData, DEBUG_MINERS, contractFacilityLevel, facilityData?.level]);
  
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
    
    // Check facility level to validate if this is a valid position
    const facilityLevel = contractFacilityLevel || (facilityData?.level || 1);
    
    // For facility level 2, valid coordinates are (0-1, 0-3)
    // For facility level 1, valid coordinates are (0-1, 0-1)
    let isValidPosition = false;
    if (facilityLevel >= 2) {
      isValidPosition = targetX >= 0 && targetX <= 1 && targetY >= 0 && targetY <= 3;
    } else {
      isValidPosition = targetX >= 0 && targetX <= 1 && targetY >= 0 && targetY <= 1;
    }
    
    // Debugging for position (0,2)
    if (targetX === 0 && targetY === 2) {
      console.log(`getMinerAtTileLocal checking (0,2): facilityLevel=${facilityLevel}, isValidPosition=${isValidPosition}`);
    }
    
    // If position is invalid for current facility level, return null
    if (!isValidPosition) {
      if (targetX === 0 && targetY === 2) {
        console.log(`Position (0,2) is invalid for facility level ${facilityLevel}`);
      }
      return null;
    }
    
    // If the parent component provided a function, use it
    if (getMinerAtTile) {
      const miner = getMinerAtTile(targetX, targetY);
      
      // Log for position (0,2)
      if (targetX === 0 && targetY === 2) {
        console.log('getMinerAtTile result for (0,2):', miner);
      }
      
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
    const miner = combinedMinersData.find(miner => {
      const minerX = Number(miner.x);
      const minerY = Number(miner.y);
      // Ensure strict number comparison
      return minerX === targetX && minerY === targetY;
    });
    
    // Log for position (0,2)
    if (targetX === 0 && targetY === 2) {
      console.log('combinedMinersData result for (0,2):', miner || 'not found');
      console.log('All miners in combinedMinersData:', combinedMinersData);
    }
    
    return miner || null;
  }, [getMinerAtTile, combinedMinersData, contractFacilityLevel, facilityData?.level]);

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

  // Define custom positions for the grid spaces to match the blue tiles for each facility level
  const customPositions = useMemo(() => {
    // Default positions for level 1 facility (4 tiles in a 2x2 grid)
    const level1Positions = [
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
    ];
    
    // Level 2 facility positions (8 tiles in a 2x4 grid)
    const level2Positions = [
      // Top row
      { x: 0, y: 0, style: { gridColumn: 2, gridRow: 1 } }, // TOP RIGHT
      { x: 1, y: 0, style: { gridColumn: 1, gridRow: 1 } }, // TOP LEFT
      
      // Second row
      { x: 0, y: 1, style: { gridColumn: 2, gridRow: 2 } }, // SECOND ROW RIGHT
      { x: 1, y: 1, style: { gridColumn: 1, gridRow: 2 } }, // SECOND ROW LEFT
      
      // Third row
      { x: 0, y: 2, style: { gridColumn: 2, gridRow: 3 } }, // THIRD ROW RIGHT
      { x: 1, y: 2, style: { gridColumn: 1, gridRow: 3 } }, // THIRD ROW LEFT
      
      // Bottom row
      { x: 0, y: 3, style: { gridColumn: 2, gridRow: 4 } }, // BOTTOM RIGHT
      { x: 1, y: 3, style: { gridColumn: 1, gridRow: 4 } }  // BOTTOM LEFT
    ];
    
    // Check current facility level
    const facilityLevel = contractFacilityLevel || (facilityData?.level || 1);
    
    // Return the appropriate positions based on the facility level
    switch (facilityLevel) {
      case 2:
        return level2Positions;
      default:
        return level1Positions;
    }
  }, [isMobile, contractFacilityLevel, facilityData?.level]);

  // Define custom positions for the active miners on blue tiles for each facility level
  const minerPositions = useMemo(() => {
    // Default positions for level 1 facility (4 tiles)
    const level1Positions = [
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
    ];

    // Level 2 facility positions (8 tiles in a 2x4 grid)
    const level2Positions = [
      // Top row
      { 
        x: 0, y: 0,
        style: { 
          position: 'absolute' as const,
          top: isMobile ? '40%' : '35%',
          left: isMobile ? '35%' : '30%',
          width: isMobile ? '35px' : '100px',
          height: isMobile ? '35px' : '100px',
          zIndex: 20
        }
      },
      { 
        x: 1, y: 0,
        style: { 
          position: 'absolute' as const,
          top: isMobile ? '45%' : '40%',
          left: isMobile ? '20%' : '15%',
          width: isMobile ? '35px' : '100px',
          height: isMobile ? '35px' : '100px',
          zIndex: 20
        }
      },
      
      // Second row
      { 
        x: 0, y: 1,
        style: { 
          position: 'absolute' as const,
          top: isMobile ? '48%' : '40%',
          left: isMobile ? '52%' : '45%',
          width: isMobile ? '35px' : '100px',
          height: isMobile ? '35px' : '100px',
          zIndex: 20
        }
      },
      { 
        x: 1, y: 1,
        style: { 
          position: 'absolute' as const,
          top: isMobile ? '55%' : '50%',
          left: isMobile ? '35%' : '30%',
          width: isMobile ? '35px' : '100px',
          height: isMobile ? '35px' : '100px',
          zIndex: 20
        }
      },
      
      // Third row
      { 
        x: 0, y: 2,
        style: { 
          position: 'absolute' as const,
          top: isMobile ? '52%' : '47%',
          left: isMobile ? '60%' : '60%',
          width: isMobile ? '45px' : '120px', // Make slightly larger for better visibility
          height: isMobile ? '45px' : '120px',
          zIndex: 25 // Higher z-index to ensure visibility
        }
      },
      { 
        x: 1, y: 2,
        style: { 
          position: 'absolute' as const,
          top: isMobile ? '52%' : '60%',
          left: isMobile ? '30%' : '43%',
          width: isMobile ? '35px' : '100px',
          height: isMobile ? '35px' : '100px',
          zIndex: 20
        }
      },
      
      // Bottom row
      { 
        x: 0, y: 3,
        style: { 
          position: 'absolute' as const,
          top: isMobile ? '62%' : '60%',
          left: isMobile ? '60%' : '55%',
          width: isMobile ? '35px' : '100px',
          height: isMobile ? '35px' : '100px',
          zIndex: 20
        }
      },
      { 
        x: 1, y: 3,
        style: { 
          position: 'absolute' as const,
          top: isMobile ? '62%' : '60%',
          left: isMobile ? '30%' : '25%',
          width: isMobile ? '35px' : '100px',
          height: isMobile ? '35px' : '100px',
          zIndex: 20
        }
      }
    ];
    
    // Check current facility level
    const facilityLevel = contractFacilityLevel || (facilityData?.level || 1);
    
    // Return the appropriate positions based on the facility level
    switch (facilityLevel) {
      case 2:
        return level2Positions;
      default:
        return level1Positions;
    }
  }, [isMobile, contractFacilityLevel, facilityData?.level]);

  // Create a position map from combinedMinersData
  const minersByPosition = useMemo(() => {
    if (!combinedMinersData) return new Map();
    
    const posMap = new Map();
    combinedMinersData.forEach(miner => {
      const key = `${Number(miner.x)}-${Number(miner.y)}`;
      posMap.set(key, miner);
      
      // Debug log when a miner at position (0,2) is found
      if (Number(miner.x) === 0 && Number(miner.y) === 2) {
        console.log('Found miner at position (0,2):', miner);
      }
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

    // Get the facility level for validation
    const facilityLevel = contractFacilityLevel || (facilityData?.level || 1);
    
    // Log positions of all miners for debugging
    if (DEBUG_MINERS && combinedMinersData) {
      combinedMinersData.forEach((miner) => {
        console.log(`Grid miner found: ID=${miner.id}, Type=${miner.minerType}, Position=(${miner.x},${miner.y})`);
      });
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
      
      // Skip positions that are invalid for the current facility level
      let isValidPosition = false;
      if (facilityLevel >= 2) {
        // For level 2 facilities, valid coordinates are (0-1, 0-3)
        isValidPosition = x >= 0 && x <= 1 && y >= 0 && y <= 3;
      } else {
        // For level 1 facilities, valid coordinates are (0-1, 0-1)
        isValidPosition = x >= 0 && x <= 1 && y >= 0 && y <= 1;
      }
      
      if (!isValidPosition) {
        if (DEBUG_MINERS) {
          console.log(`Skipping invalid position (${x},${y}) for facility level ${facilityLevel}`);
        }
        return null;
      }
      
      // Use a local cached variable to avoid calling functions during render
      // This breaks potential render loops by not triggering re-renders
      // Force direct lookup in combinedMinersData for more reliable detection
      let miner = getMinerAtTileLocal(x, y);
      
      // If that fails, try direct lookup in combinedMinersData
      if (!miner && combinedMinersData && combinedMinersData.length > 0) {
        const foundMiner = combinedMinersData.find(m => 
          Number(m.x) === Number(x) && Number(m.y) === Number(y)
        );
        if (foundMiner) {
          miner = foundMiner;
        }
      }
      
      const hasMiner = Boolean(miner);
      
      // Add debug for positions (0,2) and (1,2)
      if ((x === 0 && y === 2) || (x === 1 && y === 2)) {
        console.log(`Grid rendering for position (${x},${y}) - Has miner: ${hasMiner}`, miner);
      }
      
      // Check if this is the special position with APEPAD_MINI
      const isSpecialAPEPAD = hasMiner && miner && 
                          Number(miner.minerType || miner.type || 0) === 3; // APEPAD_MINI is type 3
        
      return (
        <div 
          key={key}
          className={`mining-space ${isSelected ? 'selected' : ''} ${hasMiner ? 'has-miner' : ''} ${isSpecialAPEPAD ? 'apepad-special' : ''}`}
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
            ...(process.env.NODE_ENV === 'development' && DEBUG_MINERS ? { outline: '1px solid rgba(255,255,0,0.3)' } : {}),
            // Make positions stand out more when in grid mode
            ...(hasMiner ? {
              backgroundColor: 'rgba(0, 0, 0, 0.6)', 
              boxShadow: '0 0 10px rgba(255, 221, 0, 0.5)',
              border: '2px solid rgba(255, 221, 0, 0.5)'
            } : {}),
            // Make APEPAD MINI stand out even more
            ...(isSpecialAPEPAD ? {
              backgroundColor: 'rgba(0, 0, 0, 0.6)', 
              boxShadow: '0 0 15px rgba(255, 255, 255, 0.5)',
              border: '2px solid rgba(255, 255, 255, 0.5)'
            } : {})
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
              color: isSpecialAPEPAD ? '#FFFFFF' : '#FFDD00',
              fontFamily: 'monospace',
              zIndex: 30,
              textShadow: '1px 1px 1px rgba(0,0,0,0.8)'
            }}>{x},{y}</div>
          )}

          {/* Show miner in grid if one exists */}
          {hasMiner && miner && isGridMode && (
            <div 
              className={`grid-miner-container ${isSpecialAPEPAD ? 'grid-miner-apepad' : ''}`}
              style={{ 
                position: 'relative',
                width: isSpecialAPEPAD ? '90%' : '80%',
                height: isSpecialAPEPAD ? '90%' : '80%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 25,
                ...(isSpecialAPEPAD ? { filter: 'brightness(1.3) drop-shadow(0 0 10px rgba(255, 255, 255, 0.7))' } : {})
              }}
            >
              <Image
                src={miner.image || '/banana-miner.gif'}
                alt={`Miner ${miner.id}`}
                fill
                className={`object-contain ${isSpecialAPEPAD ? 'miner-pulse-strong' : ''}`}
                priority
              />
              
              {/* For APEPAD at special positions, add a label for better visibility */}
              {isSpecialAPEPAD && (
                <div style={{
                  position: 'absolute',
                  bottom: '-5px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '9px',
                  color: '#ffffff',
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  padding: '1px 4px',
                  borderRadius: '3px',
                  whiteSpace: 'nowrap',
                  zIndex: 30
                }}>
                  APEPAD MINI
                </div>
              )}
            </div>
          )}
        </div>
      );
    }).filter(Boolean); // Filter out null entries (invalid positions)
  }, [isGridMode, DEBUG_MINERS, DEBUG_RENDERS, getMinerAtTileLocal, handleTileClick, customPositions, contractFacilityLevel, facilityData?.level, combinedMinersData]);

  // Function to ensure a miner has the correct image based on its type
  const getMinerImage = useCallback((miner: PlayerMiner) => {
    if (!miner) return '/banana-miner.gif'; // Default fallback
    
    const minerType = Number(miner.minerType || miner.type || 0);
    
    // If the miner already has an image property, use it
    if (miner.image) return miner.image;
    
    // Otherwise map based on miner type
    switch (minerType) {
      case 1: return '/banana-miner.gif'; // BANANA_MINER
      case 2: return '/monkey-toaster.gif'; // MONKEY_TOASTER 
      case 3: return '/apepad.png'; // APEPAD_MINI
      case 4: return '/gorilla-gadget.gif'; // GORILLA_GADGET
      default: return '/banana-miner.gif'; // Default fallback
    }
  }, []);
  
  // Separate function to render active miners on the blue floor tiles
  const renderActiveMiners = useCallback(() => {
    if (!hasFacility || !combinedMinersData) return null;

    // Add debugging to check all miners in combinedMinersData
    if (DEBUG_MINERS) {
      console.log('All miners in combinedMinersData:', combinedMinersData);
      // Check specifically for position (0,2)
      const miner02 = combinedMinersData.find(m => Number(m.x) === 0 && Number(m.y) === 2);
      if (miner02) {
        console.log('Found miner at (0,2) in combinedMinersData:', miner02);
      }
    }

    return minerPositions.map(pos => {
      const { x, y, style } = pos;
      
      // Check if there's a miner at this position using the position map
      // This avoids calling functions during render that might trigger state updates
      const posKey = `${x}-${y}`;
      const miner = minersByPosition.get(posKey);
      
      // Debug for position (0,2)
      if (x === 0 && y === 2) {
        console.log(`Checking miner at position (0,2): ${miner ? 'FOUND' : 'NOT FOUND'}`);
        if (miner) {
          console.log('Miner details:', miner);
        }
      }
      
      // Skip rendering if no miner at this position
      if (!miner) return null;
      
      // Get the proper miner image
      const minerImage = getMinerImage(miner);
      
      // If this is position (0,2), add even more debug
      if (x === 0 && y === 2) {
        console.log(`Rendering miner at (0,2) with image: ${minerImage}`);
        console.log(`Miner type: ${miner.minerType || miner.type}, Position: (${miner.x}, ${miner.y})`);
      }
      
      // Check if this is the special position (0,2) with APEPAD_MINI
      const isSpecialAPEPAD = x === 0 && y === 2 && 
                            Number(miner.minerType || miner.type || 0) === 3; // APEPAD_MINI is type 3
      
      // Apply a special class instead of inline styles to avoid the conflict with "fill"
      const minerClassName = `object-contain ${isSpecialAPEPAD ? 'miner-pulse-strong apepad-mini' : 'miner-pulse'}`;

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
            justifyContent: 'center',
            ...(isSpecialAPEPAD ? { filter: 'brightness(1.3) drop-shadow(0 0 10px rgba(255, 255, 255, 0.7))' } : {})
          }}>
            <Image
              src={minerImage}
              alt={`Miner ${miner.id}`}
              fill
              className={minerClassName}
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
  }, [hasFacility, combinedMinersData, isGridMode, DEBUG_MINERS, getMinerLabel, minerPositions, minersByPosition, getMinerImage]);

  // Add debugging to monitor excessive re-renders in development
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    
    // Count renders for debugging - only log every 5 renders to avoid console flooding
    renderCount.current += 1;
    
    if (renderCount.current % 5 === 0) {
      console.log(`RoomVisualization has re-rendered ${renderCount.current} times`);
    }
    
    // Debug level 2 facility positions for position (0,2)
    const facilityLevel = contractFacilityLevel || (facilityData?.level || 1);
    if (facilityLevel === 2) {
      console.log('Level 2 facility detected - checking for level 2 positions');
      
      // Check customPositions for position (0,2)
      const hasPos02InGrid = customPositions.some(pos => pos.x === 0 && pos.y === 2);
      console.log(`Position (0,2) exists in customPositions: ${hasPos02InGrid}`);
      
      // Check minerPositions for position (0,2)
      const hasPos02InMiners = minerPositions.some(pos => pos.x === 0 && pos.y === 2);
      console.log(`Position (0,2) exists in minerPositions: ${hasPos02InMiners}`);
      
      // Check if a miner exists at position (0,2)
      const miner02 = getMinerAtTileLocal(0, 2);
      console.log(`Miner at position (0,2): ${miner02 ? 'EXISTS' : 'DOES NOT EXIST'}`, miner02);
    }
  }, [customPositions, minerPositions, contractFacilityLevel, facilityData?.level, getMinerAtTileLocal]);

  // Add this function to get the current grid template configuration based on facility level
  const getGridTemplate = useCallback(() => {
    const facilityLevel = contractFacilityLevel || (facilityData?.level || 1);
    
    console.log(`Getting grid template for facility level: ${facilityLevel}`);
    
    switch (facilityLevel) {
      case 2:
        return {
          columns: 'repeat(2, 1fr)',
          rows: 'repeat(4, 1fr)',
          width: isMobile ? '280px' : '330px',
          height: isMobile ? '380px' : '450px', // Increased height for 4 rows
          gridClass: 'level-2-grid',
          extraStyles: `
            .level-2-grid .mining-space:nth-child(5),
            .level-2-grid .mining-space:nth-child(6) {
              position: relative;
            }
            .level-2-grid .mining-space:nth-child(5)::after,
            .level-2-grid .mining-space:nth-child(6)::after {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              border: 1px solid rgba(255, 255, 255, 0.3);
              pointer-events: none;
            }
          `
        };
      default:
        return {
          columns: 'repeat(2, 1fr)',
          rows: 'repeat(2, 1fr)',
          width: isMobile ? '250px' : '300px',
          height: isMobile ? '140px' : '170px',
          gridClass: '',
          extraStyles: ''
        };
    }
  }, [isMobile, contractFacilityLevel, facilityData?.level]);

  // Update the handleClaimStarterMiner function to validate coordinates based on facility level
  const handleClaimStarterMiner = useCallback(async (x: number, y: number) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Claiming starter miner at position (${x}, ${y})`);
    }
    
    // Get the current facility level
    const facilityLevel = contractFacilityLevel || (facilityData?.level || 1);
    
    // Ensure valid coordinates based on facility level
    let isValidCoordinate = false;
    
    switch (facilityLevel) {
      case 2:
        // For level 2 facilities, valid coordinates are (0-1, 0-3)
        isValidCoordinate = x >= 0 && x <= 1 && y >= 0 && y <= 3;
        break;
      default:
        // For level 1 facilities, valid coordinates are (0-1, 0-1)
        isValidCoordinate = x >= 0 && x <= 1 && y >= 0 && y <= 1;
    }
    
    if (!isValidCoordinate) {
      console.error(`Invalid tile coordinates (${x}, ${y}) for facility level ${facilityLevel}`);
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
  }, [isTileOccupied, onGetStarterMiner, onPurchaseMiner, refetchMinerIds, toggleGridMode, isGridMode, contractFacilityLevel, facilityData?.level]);

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

  // Extract facility level from props for direct reference
  const contractLevel = facilityData?.level;

  // Add effect to update contractFacilityLevel when needed
  useEffect(() => {
    // First priority: direct level from props
    if (contractLevel !== undefined) {
      console.log(`🔥 USING DIRECT CONTRACT LEVEL PROP: ${contractLevel}`);
      setContractFacilityLevel(contractLevel);
    }
    // Second priority: context facility level
    else if (contextFacilityLevel) {
      console.log(`🔥 USING CONTEXT FACILITY LEVEL: ${contextFacilityLevel}`);
      setContractFacilityLevel(contextFacilityLevel);
    }
    // Third priority: game state facility data
    else if (gameStateFacilityData && gameStateFacilityData.level) {
      const newLevel = Number(gameStateFacilityData.level);
      console.log(`🔥 DETECTED FACILITY LEVEL FROM GAME STATE: ${newLevel}`);
      
      // Only update if different to avoid re-renders
      if (contractFacilityLevel !== newLevel) {
        setContractFacilityLevel(newLevel);
        console.log(`🔥 UPDATED CONTRACT FACILITY LEVEL TO: ${newLevel}`);
      }
    }
  }, [gameStateFacilityData, contractFacilityLevel, contractLevel, contextFacilityLevel]);

  // Implementation of getFacilityImage function without user identifiers
  const getFacilityImage = useCallback((): string => {
    // Always use a fresh timestamp for strong cache busting
    const timestamp = Date.now();
    
    // STEP 1: Get the facility level - prioritize direct contractLevel prop
    let facilityLevel = 1; // Default level
    
    // First check direct contractLevel prop
    if (contractLevel !== undefined) {
      facilityLevel = contractLevel;
      console.log(`🚨 USING DIRECT CONTRACT LEVEL PROP: ${facilityLevel}`);
    }
    // Then check if we have a confirmed contract level
    else if (contractFacilityLevel) {
      facilityLevel = contractFacilityLevel;
      console.log(`🚨 USING CONFIRMED CONTRACT LEVEL: ${facilityLevel}`);
    }
    // Then check facility data as fallback
    else if (gameStateFacilityData) {
      facilityLevel = Number(gameStateFacilityData.level) || 1;
      console.log(`🚨 USING FACILITY DATA LEVEL: ${facilityLevel}`);
    }
    
    // STEP 2: Special DOM-based detection for level 2 facilities to fix the cache issue
    try {
      // Check DOM for any indicators that we're at level 2
      const atLevel2 = document.querySelector('.level-2-grid') !== null;
      if (atLevel2 && facilityLevel !== 2) {
        console.log(`🔄 DOM indicates we're at level 2 - overriding detected level ${facilityLevel}`);
        facilityLevel = 2;
      }
      
      // Check URL params for any level indicators (helpful for debugging)
      const urlParams = new URLSearchParams(window.location.search);
      const levelParam = urlParams.get('level');
      if (levelParam && !isNaN(Number(levelParam))) {
        console.log(`🔄 URL indicates facility level ${levelParam} - overriding detected level ${facilityLevel}`);
        facilityLevel = Number(levelParam);
      }
    } catch (e) {
      console.error('Error checking DOM for level indicators:', e);
    }
    
    console.log(`🚨🚨🚨 FINAL FACILITY LEVEL DETERMINATION: ${facilityLevel}`);
    
    // STEP 3: Special handling based on detected level
    if (facilityLevel === 2) {
      // Complete bypass of cache for level 2
      const level2Path = `/images/facilities/level-2.png?bypass=${timestamp}&force=true&t=${timestamp}&level=2`;
      console.log(`⚠️ LEVEL 2 FACILITY - LOADING IMAGE: ${level2Path}`);
      
      // Immediately update the DOM to match level 2
      setTimeout(() => {
        try {
          const gridElement = document.querySelector('.mining-grid');
          if (gridElement) {
            gridElement.classList.add('level-2-grid');
            console.log('Added level-2-grid class for level 2 facility');
          }
        } catch (e) {
          console.error('Error updating grid for level 2:', e);
        }
      }, 0);
      
      return level2Path;
    } else if (facilityLevel === 3) {
      const level3Path = `/images/facilities/level-3.png?t=${timestamp}&level=3`;
      console.log(`⚠️ LEVEL 3 FACILITY - LOADING IMAGE: ${level3Path}`);
      return level3Path;
    } else if (facilityLevel === 4) {
      const level4Path = `/images/facilities/level-4.png?t=${timestamp}&level=4`;
      console.log(`⚠️ LEVEL 4 FACILITY - LOADING IMAGE: ${level4Path}`);
      return level4Path;
    } else {
      // Default level 1
      const level1Path = `/images/facilities/level-1.png?t=${timestamp}&level=1`;
      console.log(`⚠️ LEVEL 1 FACILITY - LOADING IMAGE: ${level1Path}`);
      return level1Path;
    }
  }, [gameStateFacilityData, contractFacilityLevel, contractLevel]);

  // Add debug logging for grid layout
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Rendering RoomVisualization with facility level: ${contractFacilityLevel || facilityData?.level || 1}`);
      console.log(`Grid template: ${getGridTemplate().columns} columns, ${getGridTemplate().rows} rows`);
      console.log(`Adding level-2-grid class: ${contractFacilityLevel === 2 || facilityData?.level === 2}`);
    }
  }, [contractFacilityLevel, facilityData?.level, getGridTemplate]);

  return (
    <>
      <style jsx global>{`
        ${pulseStyle}
        .mining-grid {
          display: grid;
          grid-template-columns: ${getGridTemplate().columns};
          grid-template-rows: ${getGridTemplate().rows};
          gap: 4px;
          width: ${getGridTemplate().width};
          height: ${getGridTemplate().height};
          position: absolute;
          top: ${isMobile ? '47%' : '57%'};
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 20;
          pointer-events: ${isGridMode ? 'auto' : 'none'};
          opacity: ${isGridMode ? 1 : 0};
          transition: opacity 0.3s ease;
        }
        
        /* Add specific classes for facility levels */
        .level-2-grid {
          grid-template-columns: repeat(2, 1fr);
          grid-template-rows: repeat(4, 1fr);
        }
        
        .level-3-grid {
          grid-template-columns: repeat(4, 1fr);
          grid-template-rows: repeat(4, 1fr);
        }
        
        .level-4-grid {
          grid-template-columns: repeat(4, 1fr);
          grid-template-rows: repeat(4, 1fr);
        }
        
        /* Additional styles for the APEPAD MINI at (0,2) */
        .apepad-special {
          background-color: rgba(0, 0, 0, 0.6) !important;
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.5) !important;
          border: 2px solid rgba(255, 255, 255, 0.5) !important;
        }
        
        /* Style for APEPAD MINI image */
        .apepad-mini {
          object-fit: contain !important; 
          width: 150% !important;
          height: 150% !important;
          transform: translate(-16%, -16%);
        }
        
        /* Extra styles from getGridTemplate */
        ${getGridTemplate().extraStyles}
        
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
        
        /* Special styling for APEPAD in grid */
        .grid-miner-apepad {
          opacity: 1;
          filter: brightness(1.5) drop-shadow(0 0 10px rgba(255, 255, 255, 0.7));
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
            src={getFacilityImage()} 
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
          <div className="w-full h-full flex items-center justify-center bg-dark-blue">
            <Image 
              src="/bedroom.png" 
              alt="Empty Space" 
              width={690}
              height={690}
              className="opacity-30"
            />
          </div>
        )}
        
        {/* Render the active miners on blue floor tiles - always visible */}
        {renderActiveMiners()}
        
        {/* Mining Grid - For selection and interaction only */}
        {hasFacility && (
          <div className={`mining-grid ${isGridMode ? 'grid-mode' : ''} ${getGridTemplate().gridClass}`}>
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
        
        {/* Initial purchase UI if no facility exists */}
        {!hasFacility && (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <p className="font-press-start text-xs text-[#FFD700] mb-6">You don't have any mining space yet.</p>
            <button
              onClick={onPurchaseFacility}
              disabled={isPurchasingFacility}
              className="bigcoin-button"
            >
              {isPurchasingFacility ? 'PURCHASING...' : 'PURCHASE FACILITY'}
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
          selectedTile={selectedTile || undefined}
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
