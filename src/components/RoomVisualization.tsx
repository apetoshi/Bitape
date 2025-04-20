import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useContractRead, useContractReads } from 'wagmi';
import { CONTRACT_ADDRESSES, MAIN_CONTRACT_ABI, MAIN_CONTRACT_ABI_EXTENDED } from '../config/contracts';
import { MINERS, MinerType, getMinerById } from '../config/miners';
import { Address, zeroAddress } from 'viem';
import StarterMinerModal from './StarterMinerModal';

// Set debug logging to false to remove miner type overlays
const DEBUG_MINERS = false;

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

export function RoomVisualization({
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
  const [selectedTile, setSelectedTile] = useState<{x: number, y: number}>();
  const [isStarterMinerModalOpen, setIsStarterMinerModalOpen] = useState(false);
  const [previewMinerType, setPreviewMinerType] = useState<MinerType>(MinerType.BANANA_MINER);
  const [contractMiners, setContractMiners] = useState<PlayerMiner[]>([]);
  const [isLoadingMiners, setIsLoadingMiners] = useState(false);
  
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
    contracts: playerMinerIds && Array.isArray(playerMinerIds) && playerMinerIds.length > 0
      ? playerMinerIds.map(id => ({
          address: CONTRACT_ADDRESSES.MAIN,
          abi: MAIN_CONTRACT_ABI_EXTENDED as any, // Type assertion to resolve ABI type issues
          functionName: 'getMiner',
          args: [id]
        }))
      : [],
    query: {
      enabled: Boolean(address) && Boolean(playerMinerIds) && Array.isArray(playerMinerIds) && playerMinerIds.length > 0
    }
  });

  // Convert data to boolean
  const hasActuallyClaimedStarterMiner = Boolean(acquiredStarterMinerData);

  // Use a combined value - either from props or directly from contract
  const effectivelyClaimedStarterMiner = hasClaimedStarterMiner || hasActuallyClaimedStarterMiner;

  // Process direct contract reads
  useEffect(() => {
    if (directMinerReads && Array.isArray(directMinerReads) && directMinerReads.length > 0 && playerMinerIds) {
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
        
        if (processedMiners.length > 0) {
          console.log("Setting miners from direct contract reads:", processedMiners);
          setContractMiners(processedMiners as PlayerMiner[]);
        }
      } catch (error) {
        console.error("Error processing direct miner reads:", error);
      }
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

  // Process raw facility data for logging and debugging
  useEffect(() => {
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

  // Log facility props at component mount
  useEffect(() => {
    console.log('RoomVisualization - Component props received:', {
      hasFacility,
      facilityData,
      address,
      minersCount: miners?.length
    });
  }, [hasFacility, facilityData, address, miners]);

  const handleTileClick = (x: number, y: number) => {
    if (!isGridMode) return;
    setSelectedTile({ x, y });
    if (onTileSelect) {
      onTileSelect(x, y);
    }
  };

  const handleClaimStarterMiner = async (x: number, y: number) => {
    console.log(`Claiming starter miner at position (${x}, ${y})`);
    
    try {
      // If no starter miner handler is provided, log an error
      if (!onGetStarterMiner && !onPurchaseMiner) {
        console.error('No handler function provided for claiming starter miner');
        return;
      }

      // Check which mechanism to use based on what's available
      // Prefer onGetStarterMiner for clearer intent
      if (onGetStarterMiner) {
        console.log('Using onGetStarterMiner to claim starter miner');
        await onGetStarterMiner(x, y);
      } else if (onPurchaseMiner) {
        console.log('Using onPurchaseMiner to claim starter miner');
        await onPurchaseMiner(MinerType.BANANA_MINER, x, y);
      }
      
      console.log('Starter miner claimed successfully');
      setIsStarterMinerModalOpen(false);
      
      // Refetch miner data after claiming
      refetchMinerIds();
      
      // Enable grid mode after claiming to show the user their miner
      if (toggleGridMode && !isGridMode) {
        console.log('Enabling grid mode after claiming miner');
        toggleGridMode();
      }
    } catch (error) {
      console.error('Error claiming starter miner:', error);
    }
  };

  // Process the miners data outside of render to ensure consistent hook calls
  const allMinersData = useMemo(() => {
    console.log('Getting all miner positions');
    
    // Create a combined array of all miners
    let allMiners = [...contractMiners];
    
    // Ensure any on-chain miners are still represented
    if (miners && miners.length > 0) {
      console.log('Processing miners from props:', miners);
      
      miners.forEach(propMiner => {
        const minerX = Number(propMiner.x);
        const minerY = Number(propMiner.y);
        
        // Sanity check for valid grid positions (0,0), (0,1), (1,0), (1,1)
        if (minerX > 1 || minerY > 1) {
          console.warn(`⚠️ Miner at invalid grid position (${minerX}, ${minerY}). Valid positions are (0,0), (0,1), (1,0), and (1,1).`);
          return; // Skip this miner as it has invalid coordinates
        }
        
        // Get the miner type - ensure we're using the contract minerType directly 
        // without any frontend conversion attempts
        const minerType = Number(propMiner.minerType || propMiner.type);
        
        console.log(`Processing miner from props at position (${minerX}, ${minerY}) of type ${minerType} (${MINERS[minerType]?.name || 'Unknown'})`);
        
        // Check if this miner already exists in our list - use strict number type checking
        const exists = allMiners.some(m => {
          const existingX = Number(m.x);
          const existingY = Number(m.y);
          const samePosition = existingX === minerX && existingY === minerY;
          const sameId = m.id === propMiner.id;
          
          if (samePosition) {
            console.log(`Found existing miner at same position (${existingX}, ${existingY})`);
          }
          
          return sameId || samePosition;
        });
        
        if (!exists) {
          console.log(`Adding new miner at position (${minerX}, ${minerY}) of type ${minerType}`);
          
          // Special logging for Monkey Toaster (type 3)
          if (minerType === MinerType.MONKEY_TOASTER) {
            console.log(`🐵 Found Monkey Toaster at position (${minerX}, ${minerY})`);
          }
          
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
    
    // Log out specific type information for debugging
    allMiners.forEach(miner => {
      console.log(`MINER: ID=${miner.id}, Type=${miner.minerType} (${MINERS[miner.minerType]?.name || 'Unknown'}), Position=(${miner.x},${miner.y})`);
      
      // Special logging for problematic types
      if (miner.minerType === 3) {
        console.log(`🐵 FOUND MONKEY TOASTER (type 3) at (${miner.x},${miner.y})`);
      }
    });
    
    // Filter out miners with invalid grid positions
    const filteredMiners = allMiners.filter(m => {
      const x = Number(m.x);
      const y = Number(m.y);
      return x <= 1 && y <= 1 && x >= 0 && y >= 0;
    });
    
    console.log('Final miners list for display:', filteredMiners);
    return filteredMiners;
  }, [miners, contractMiners]);

  // Grid coordinates for the four mining spaces
  // Adjusted grid positions for better visual positioning
  const gridPositions = [
    { x: 0, y: 0, top: '40%', left: '40%', width: '15%', height: '15%' }, // near bed
    { x: 1, y: 0, top: '46%', left: '29%', width: '15%', height: '15%' }, // near banana boxes - adjusted left position
    { x: 0, y: 1, top: '50%', left: '55%', width: '15%', height: '15%' }, // near jukebox
    { x: 1, y: 1, top: '60%', left: '35%', width: '15%', height: '15%' }  // near control panel
  ];

  // Function to adjust positioning for mobile screens
  const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(false);
    
    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
      
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }, []);
    
    return isMobile;
  };
  
  const isMobile = useIsMobile();
  
  // Process miners to ensure they have proper image properties
  const processedMiners = useMemo(() => {
    console.log('Processing miners in RoomVisualization:', miners);
    
    return miners.map(m => {
      // Get the correct miner type from the contract's minerIndex
      const contractMinerType = m.minerType || m.type || 0;
      
      // Use the correct type to get image based on contract values
      const minerType = Number(contractMinerType);
      let minerImage = '/banana-miner.gif'; // Default image
      
      // Map contract miner types to images (using known contract indices)
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
        ...m,
        minerType: minerType,
        image: minerImage,
        x: Number(m.x),
        y: Number(m.y)
      };
    });
  }, [miners]);
  
  // Helper function to get a miner at a specific tile
  const getMinerAtTileLocal = (x: number, y: number) => {
    console.log(`RoomVisualization - Getting miner at tile (${x}, ${y})`);
    const targetX = Number(x);
    const targetY = Number(y);
    
    // If the parent component provided a function, use it
    if (getMinerAtTile) {
      const miner = getMinerAtTile(x, y);
      console.log(`RoomVisualization - Parent provided miner:`, miner);
      
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
          image: minerImage,
          x: Number(miner.x),
          y: Number(miner.y)
        };
      }
      return miner;
    }
    
    // Fallback to our pre-computed combinedMinersData
    return combinedMinersData.find(miner => {
      const minerX = Number(miner.x);
      const minerY = Number(miner.y);
      // Ensure strict number comparison
      return minerX === targetX && minerY === targetY;
    });
  };
  
  // Helper function to check if a tile is occupied by a miner
  const isTileOccupied = (x: number, y: number) => {
    if (selectedTileHasMiner) {
      // Use the passed in function if available
      return selectedTileHasMiner(x, y);
    }
    
    // Fallback to the pre-computed combinedMinersData
    console.log(`RoomVisualization - Checking if tile (${x}, ${y}) is occupied`);
    return combinedMinersData.some(miner => {
      const minerX = Number(miner.x);
      const minerY = Number(miner.y);
      return minerX === x && minerY === y;
    });
  };

  // Combine processedMiners and allMinersData outside any render functions
  // to ensure hooks are called consistently
  const combinedMinersData = useMemo(() => {
    const combined = [...processedMiners];
    
    // Add any miners from allMinersData that aren't already in processedMiners
    allMinersData.forEach(dataMiner => {
      const exists = combined.some(m => 
        (m.id === dataMiner.id) || 
        (Number(m.x) === Number(dataMiner.x) && Number(m.y) === Number(dataMiner.y))
      );
      
      if (!exists) {
        // Ensure all required properties are present and correctly typed
        combined.push({
          ...dataMiner,
          minerType: Number(dataMiner.minerType || dataMiner.type || 0),
          image: dataMiner.image || '/banana-miner.gif', // Ensure image is never undefined
          x: Number(dataMiner.x),
          y: Number(dataMiner.y)
        });
      }
    });
    
    return combined;
  }, [processedMiners, allMinersData]);

  // Function to render the mining spaces overlay and miners
  const renderMiningSpaces = () => {
    // Get grid positions for displaying miners and grid cells
    const gridPositions = [
      { x: 0, y: 0, top: '40%', left: '40%', width: '15%', height: '15%' }, // near bed
      { x: 1, y: 0, top: '46%', left: '29%', width: '15%', height: '15%' }, // near banana boxes - adjusted left position
      { x: 0, y: 1, top: '50%', left: '55%', width: '15%', height: '15%' }, // near jukebox
      { x: 1, y: 1, top: '60%', left: '35%', width: '15%', height: '15%' }  // near control panel
    ];
    
    // Use our pre-computed combinedMinersData (moved outside this function)
    const combinedMiners = combinedMinersData;
    
    // Get miner data for selected tile
    const selectedMiner = selectedTile ? getMinerAtTileLocal(selectedTile.x, selectedTile.y) : null;

    // Check if tile is available for placing a miner (empty and facility exists)
    const isTileAvailableForMiner = (x: number, y: number) => {
      return hasFacility && !isTileOccupied(x, y);
    };

    return (
      <div className="absolute inset-0 pointer-events-none">
        {/* Show loading state if miners are being loaded */}
        {isLoadingMiners && (
          <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 text-white text-xs rounded z-50">
            Loading miners...
          </div>
        )}
        
        {/* Display miners at their grid positions */}
        {combinedMiners.map((miner, index) => {
          console.log(`Processing miner for display: ID=${miner.id}, Type=${miner.minerType}, Position=(${miner.x},${miner.y})`);
          
          // Find the grid position data for this miner
          const pos = gridPositions.find(p => p.x === Number(miner.x) && p.y === Number(miner.y));
          if (!pos) {
            console.warn(`⚠️ No grid position found for miner at (${miner.x}, ${miner.y}) - valid positions are (0,0), (0,1), (1,0), (1,1)`);
            return null;
          }
          
          // Get the correct image and name using safe lookup
          const minerData = getMinerById(Number(miner.minerType));
          const minerImage = miner.image || (minerData?.image || '/banana-miner.gif');
          const minerName = minerData?.name || `Miner #${miner.id}`;
          
          // Special handling for Monkey Toaster (type 3)
          if (Number(miner.minerType) === MinerType.MONKEY_TOASTER) {
            console.log(`🐵 Rendering Monkey Toaster (type ${miner.minerType}) at position (${miner.x},${miner.y})`);
          }
          
          console.log(`Using image for miner: ${minerImage}`);
          
          // Reduce scaling for better positioning and more realistic size
          const scaleValue = isMobile ? '1.4' : '1.6';
          const translateValue = isMobile ? '0%, 0%' : '0%, 0%';
          
          console.log(`✅ Rendering miner at position (${miner.x}, ${miner.y}) with grid position:`, pos);
          
          return (
            <div 
              key={`miner-${index}-${miner.id}-${miner.x}-${miner.y}`}
              className="absolute pointer-events-none z-20"
              style={{
                top: pos.top,
                left: pos.left,
                width: pos.width,
                height: pos.height,
                transform: 'skew(-24deg, 14deg)',
              }}
            >
              <div className="relative w-full h-full">
                <Image
                  src={minerImage}
                  alt={`${minerName} at (${miner.x},${miner.y})`}
                  fill
                  className={`object-contain miner-pulse ${isMobile ? 'mobile-miner' : ''}`}
                  style={{ 
                    transform: `skew(24deg, -14deg) scale(${scaleValue}) translate(${translateValue})`,
                    imageRendering: 'pixelated'
                  }}
                />
                {/* Add debug overlay to show miner type info */}
                {DEBUG_MINERS && (
                  <div className="absolute top-0 left-0 text-xs text-white bg-black/80 px-1 py-0.5 rounded z-50" style={{ transform: 'skew(24deg, -14deg)' }}>
                    Type: {miner.minerType} ({minerName})
                  </div>
                )}
                {/* Remove the miner name label when grid mode is enabled */}
                {false && isGridMode && (
                  <div className="absolute top-0 left-0 text-xs text-white bg-black/70 px-1 rounded" style={{ transform: 'skew(24deg, -14deg)' }}>
                    {minerName}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Only show grid tiles when grid mode is active */}
        {isGridMode && gridPositions.map((pos) => {
          const isSelected = selectedTile?.x === pos.x && selectedTile?.y === pos.y;
          const isOccupied = isTileOccupied(pos.x, pos.y);
          
          // Adjust grid size for mobile
          const width = isMobile ? '20%' : pos.width;
          const height = isMobile ? '20%' : pos.height;

          return (
            <div
              key={`${pos.x}-${pos.y}`}
              onClick={() => handleTileClick(pos.x, pos.y)}
              className={`absolute pointer-events-auto transition-all duration-200 cursor-pointer z-10 ${
                isSelected ? 'ring-2 ring-[#FFD700]' : 'hover:ring-2 hover:ring-[#FFD70066]'
              } ${isOccupied ? 'opacity-70' : ''} ${isMobile ? 'mobile-grid-cell' : ''}`}
              style={{
                top: pos.top,
                left: pos.left,
                width: width,
                height: height,
                background: isSelected ? 'rgba(255, 215, 0, 0.3)' : 'rgba(255, 215, 0, 0.1)',
                transform: 'skew(-24deg, 14deg)',
                borderRadius: '2px'
              }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <>
      <style jsx global>{pulseStyle}</style>
      
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
                console.log('Opening starter miner modal from center button');
                // First make sure we have a default tile selected
                if (!selectedTile) {
                  setSelectedTile({ x: 0, y: 0 });
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
        
        {/* Mining Spaces Overlay - always render this to show miners */}
        {hasFacility && renderMiningSpaces()}
        
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
          selectedTile={selectedTile}
          isProcessing={isGettingStarterMiner}
        />
      )}
    </>
  );
}
