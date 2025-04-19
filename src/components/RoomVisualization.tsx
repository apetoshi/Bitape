import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useContractRead, useContractReads } from 'wagmi';
import { CONTRACT_ADDRESSES, MAIN_CONTRACT_ABI } from '../config/contracts';
import { MINERS, MinerType } from '../config/miners';
import { Address, zeroAddress } from 'viem';
import StarterMinerModal from './StarterMinerModal';

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
  onPurchaseMiner
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
    abi: [...MAIN_CONTRACT_ABI,
      {
        inputs: [{ name: 'player', type: 'address' }],
        name: 'getPlayerMiners',
        outputs: [{ name: '', type: 'uint256[]' }],
        stateMutability: 'view',
        type: 'function'
      }
    ] as const,
    functionName: 'getPlayerMiners',
    args: [address || zeroAddress],
    query: {
      enabled: Boolean(address) && hasFacility
    }
  });

  // Convert data to boolean
  const hasActuallyClaimedStarterMiner = Boolean(acquiredStarterMinerData);

  // Use a combined value - either from props or directly from contract
  const effectivelyClaimedStarterMiner = hasClaimedStarterMiner || hasActuallyClaimedStarterMiner;

  // Fetch detailed miner data for each miner ID
  useEffect(() => {
    if (!address || !playerMinerIds || !Array.isArray(playerMinerIds) || playerMinerIds.length === 0) {
      return;
    }
    
    console.log("Found miner IDs to fetch:", playerMinerIds);
    
    // Instead of using custom fetch, we'll directly use the miners passed as props
    // This ensures we keep using the application's existing data flow
    if (miners && miners.length > 0) {
      console.log("Using miners from props:", miners);
      // Process miners to ensure they have all required properties
      const processedMiners = miners.map(miner => {
        // Make sure we have a minerType (either direct or from type)
        const minerType = miner.minerType !== undefined 
          ? miner.minerType 
          : (miner.type !== undefined ? miner.type : MinerType.BANANA_MINER);
        
        // Ensure x and y are numbers
        const x = Number(miner.x);
        const y = Number(miner.y);
        
        // Get the correct image from the MINERS config using the 1-based index
        const minerImage = MINERS[minerType]?.image || '/banana-miner.gif';
        
        console.log(`Processing miner of type ${minerType} (${MINERS[minerType]?.name}) at position (${x},${y})`);
        
        // Create a consistent miner object
        return {
          ...miner,
          minerType: minerType as MinerType,
          x,
          y,
          image: minerImage
        };
      });
      
      console.log("Processed miners for display:", processedMiners);
      setContractMiners(processedMiners);
      
      // Log special cases like Monkey Toaster (now index 3 not 2)
      const monkeyToaster = processedMiners.find(m => m.minerType === MinerType.MONKEY_TOASTER);
      if (monkeyToaster) {
        console.log(`Found Monkey Toaster at position (${monkeyToaster.x},${monkeyToaster.y}) from contract!`);
      }
      
      // Also log if we found the free starter miner (now index 1 not 0)
      const bananaMiner = processedMiners.find(m => m.minerType === MinerType.BANANA_MINER);
      if (bananaMiner) {
        console.log(`Found Banana Miner at position (${bananaMiner.x},${bananaMiner.y}) from contract!`);
      }
    }
  }, [address, playerMinerIds, miners, effectivelyClaimedStarterMiner]);

  // Show starter miner modal if facility exists but no miner has been claimed
  useEffect(() => {
    // Only show the modal initially if:
    // 1. User has a facility
    // 2. User has NOT claimed starter miner (according to contract)
    if (hasFacility && !effectivelyClaimedStarterMiner) {
      console.log('Opening starter miner modal. Contract says claimed:', hasActuallyClaimedStarterMiner);
      setIsStarterMinerModalOpen(true);
    } else {
      // Close the modal if user has already claimed (in case it was open)
      if (effectivelyClaimedStarterMiner && isStarterMinerModalOpen) {
        console.log('Closing starter miner modal because miner already claimed');
        setIsStarterMinerModalOpen(false);
      }
    }
  }, [hasFacility, effectivelyClaimedStarterMiner, hasActuallyClaimedStarterMiner, isStarterMinerModalOpen]);

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
      if (onPurchaseMiner) {
        console.log('Using onPurchaseMiner to claim starter miner');
        await onPurchaseMiner(MinerType.BANANA_MINER, x, y);
      } else {
        console.log('Using onGetStarterMiner to claim starter miner');
        await onGetStarterMiner(x, y);
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

  // Function to get all miner positions from contract data
  const getAllMinerPositions = () => {
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
        
        // Get the miner type - either minerType directly or from type property
        const minerType = propMiner.minerType !== undefined 
          ? propMiner.minerType 
          : (propMiner.type !== undefined ? propMiner.type : MinerType.BANANA_MINER);
        
        console.log(`Processing miner from props at position (${minerX}, ${minerY}) of type ${minerType} (${MINERS[minerType]?.name})`);
        
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
          
          // Special handling for the specific tile we're having issues with
          if (minerX === 1 && minerY === 0) {
            console.log('📍 Special handling for miner at position (1, 0)');
          }
          
          // Get the image from the correct config using 1-based indices
          const minerImage = MINERS[minerType]?.image || '/banana-miner.gif';
          
          allMiners.push({
            ...propMiner,
            x: minerX,
            y: minerY,
            minerType: minerType as MinerType,
            image: minerImage
          });
        }
      });
    }
    
    // Double-check for specific positions - useful for debugging
    const hasPosition1_0 = allMiners.some(m => Number(m.x) === 1 && Number(m.y) === 0);
    console.log(`Position (1,0) miner present: ${hasPosition1_0}`);
    
    // Log miners at valid grid positions only
    const validMiners = allMiners.filter(m => Number(m.x) <= 1 && Number(m.y) <= 1);
    console.log('Valid miners for grid positions:', validMiners);
    
    // Add clear console logging for all miners
    allMiners.forEach(miner => {
      console.log(`MINER: ID=${miner.id}, Type=${miner.minerType} (${MINERS[miner.minerType]?.name}), Position=(${miner.x},${miner.y}), Image=${miner.image}`);
    });
    
    // Filter out miners with invalid grid positions
    const filteredMiners = allMiners.filter(m => Number(m.x) <= 1 && Number(m.y) <= 1);
    
    console.log('Final miners list for display:', filteredMiners);
    return filteredMiners;
  };

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

  // Function to render the mining spaces overlay and miners
  const renderMiningSpaces = () => {
    // Get all claimed miner positions 
    const allMiners = getAllMinerPositions();
    
    // Debug - log grid positions and miner data
    console.log("Grid positions:", gridPositions);
    console.log("All miners for rendering:", allMiners);
    
    // Check if a tile is occupied by a miner
    const isTileOccupied = (x: number, y: number) => {
      console.log(`Checking if tile (${x}, ${y}) is occupied`);
      const targetX = Number(x);
      const targetY = Number(y);
      
      const result = allMiners.some(miner => {
        const minerX = Number(miner.x);
        const minerY = Number(miner.y);
        // Ensure strict number comparison
        const matches = minerX === targetX && minerY === targetY;
        console.log(`Comparing miner at (${minerX}, ${minerY}) with target (${targetX}, ${targetY}): ${matches}`);
        return matches;
      });
      
      console.log(`Tile (${x}, ${y}) occupied: ${result}`);
      return result;
    };
    
    // Get miner at a specific tile
    const getMinerAtTile = (x: number, y: number) => {
      console.log(`Getting miner at tile (${x}, ${y})`);
      const targetX = Number(x);
      const targetY = Number(y);
      
      const miner = allMiners.find(miner => {
        const minerX = Number(miner.x);
        const minerY = Number(miner.y);
        // Ensure strict number comparison
        return minerX === targetX && minerY === targetY;
      });
      
      console.log(`Miner at tile (${x}, ${y}):`, miner);
      return miner;
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
        {allMiners.map((miner, index) => {
          console.log(`Processing miner for display: ID=${miner.id}, Type=${miner.minerType}, Position=(${miner.x},${miner.y})`);
          
          // Find the grid position data for this miner
          const pos = gridPositions.find(p => p.x === Number(miner.x) && p.y === Number(miner.y));
          if (!pos) {
            console.warn(`⚠️ No grid position found for miner at (${miner.x}, ${miner.y}) - valid positions are (0,0), (0,1), (1,0), (1,1)`);
            return null;
          }
          
          // Get the correct image from the config
          const minerImage = miner.image || MINERS[miner.minerType]?.image || '/banana-miner.gif';
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
                  alt={`${MINERS[miner.minerType]?.name || "Miner"} at (${miner.x},${miner.y})`}
                  fill
                  className={`object-contain miner-pulse ${isMobile ? 'mobile-miner' : ''}`}
                  style={{ 
                    transform: `skew(24deg, -14deg) scale(${scaleValue}) translate(${translateValue})`,
                    imageRendering: 'pixelated'
                  }}
                />
                {isGridMode && (
                  <div className="absolute top-0 left-0 text-xs text-white bg-black/70 px-1 rounded" style={{ transform: 'skew(24deg, -14deg)' }}>
                    {MINERS[miner.minerType]?.name || `Miner #${miner.id}`}
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
        
        {/* Get Starter Miner Button (Bottom Center) - Only if has facility but no starter miner */}
        {hasFacility && !effectivelyClaimedStarterMiner && (
          <button
            onClick={() => setIsStarterMinerModalOpen(true)}
            disabled={isGettingStarterMiner}
            className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-30 px-4 py-2 font-press-start text-xs bg-banana text-royal hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGettingStarterMiner ? 'CLAIMING...' : 'CLAIM STARTER MINER'}
          </button>
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
      
      {/* Starter Miner Modal - Only show if user hasn't claimed starter miner according to contract */}
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
