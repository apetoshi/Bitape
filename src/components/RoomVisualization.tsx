import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useContractRead } from 'wagmi';
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
  id: number;
  minerType: MinerType;
  x: number;
  y: number;
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

  // Check if user has claimed their free miner
  const { data: minerData } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'getPlayerFacility',
    args: [address || zeroAddress],
    query: {
      enabled: Boolean(address)
    }
  });

  // Show starter miner modal if facility exists but no miner has been claimed
  useEffect(() => {
    if (hasFacility && !hasClaimedStarterMiner && !isGridMode) {
      // Only show the prompt if they haven't toggled grid mode yet
      setIsStarterMinerModalOpen(true);
    }
  }, [hasFacility, hasClaimedStarterMiner, isGridMode]);

  const handleTileClick = (x: number, y: number) => {
    if (!isGridMode) return;
    setSelectedTile({ x, y });
    if (onTileSelect) {
      onTileSelect(x, y);
    }
  };

  const handleClaimStarterMiner = async (x: number, y: number) => {
    console.log(`Claiming starter miner at position (${x}, ${y})`);
    
    // Save position to local storage for UI persistence
    if (typeof window !== 'undefined') {
      const positionData = { x: Number(x), y: Number(y) };
      localStorage.setItem('claimedMinerPosition', JSON.stringify(positionData));
      console.log('Saved miner position to localStorage:', positionData);
    }
    
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
      
      // Enable grid mode after claiming to show the user their miner
      if (toggleGridMode && !isGridMode) {
        console.log('Enabling grid mode after claiming miner');
        toggleGridMode();
      }
    } catch (error) {
      console.error('Error claiming starter miner:', error);
    }
  };

  // Function to get all miner positions, either from contract or localStorage (for starter miner)
  const getAllMinerPositions = () => {
    console.log('Getting all miner positions in RoomVisualization');
    console.log('Miners from props:', miners);
    console.log('Has claimed starter miner:', hasClaimedStarterMiner);
    
    // Get miners from props (contract data)
    const contractMiners = miners.map(miner => {
      console.log('Processing miner:', miner);
      return {
        ...miner,
        x: Number(miner.x), // Ensure x is a number
        y: Number(miner.y), // Ensure y is a number
        image: MINERS[miner.minerType]?.image || '/banana-miner.gif'
      };
    });
    
    console.log('Processed contract miners:', contractMiners);
    
    // If no contract miners but user has claimed starter miner, try getting from localStorage
    if (contractMiners.length === 0 && hasClaimedStarterMiner && typeof window !== 'undefined') {
      console.log('No contract miners, checking localStorage');
      const savedPositionStr = localStorage.getItem('claimedMinerPosition');
      console.log('Saved position from localStorage:', savedPositionStr);
      
      if (savedPositionStr) {
        try {
          const position = JSON.parse(savedPositionStr);
          console.log('Parsed position from localStorage:', position);
          return [{
            id: 0,
            minerType: MinerType.BANANA_MINER,
            x: Number(position.x), // Ensure x is a number
            y: Number(position.y), // Ensure y is a number
            image: MINERS[MinerType.BANANA_MINER].image
          }];
        } catch (e) {
          console.error("Error parsing miner position:", e);
        }
      }
      
      // Default fallback for starter miner if nothing in localStorage
      console.log('Using default fallback position for starter miner');
      return [{
        id: 0,
        minerType: MinerType.BANANA_MINER,
        x: 0, 
        y: 0,
        image: MINERS[MinerType.BANANA_MINER].image
      }];
    }
    
    return contractMiners;
  };

  // Grid coordinates for the four mining spaces
  // Adjusted grid positions for better mobile compatibility
  const gridPositions = [
    { x: 0, y: 0, top: '42%', left: '40%', width: '15%', height: '15%' }, // top right
    { x: 1, y: 0, top: '50%', left: '30%', width: '15%', height: '15%' }, // top left
    { x: 0, y: 1, top: '50%', left: '55%', width: '15%', height: '15%' }, // bottom right
    { x: 1, y: 1, top: '62%', left: '35%', width: '15%', height: '15%' }  // bottom left
  ];

  // Function to render the mining spaces overlay and miners
  const renderMiningSpaces = () => {
    // Get all claimed miner positions 
    const allMiners = getAllMinerPositions();
    
    // Check if a tile is occupied by a miner
    const isTileOccupied = (x: number, y: number) => {
      console.log(`Checking if tile (${x}, ${y}) is occupied`);
      const targetX = Number(x);
      const targetY = Number(y);
      
      const result = allMiners.some(miner => {
        const minerX = Number(miner.x);
        const minerY = Number(miner.y);
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
        return minerX === targetX && minerY === targetY;
      });
      
      console.log(`Miner at tile (${x}, ${y}):`, miner);
      return miner;
    };

    return (
      <div className="absolute inset-0 pointer-events-none">
        {/* Always show miners, regardless of grid mode */}
        {allMiners.map((miner, index) => {
          // Find the grid position data for this miner
          const pos = gridPositions.find(p => p.x === miner.x && p.y === miner.y);
          if (!pos) return null;
          
          return (
            <div 
              key={`miner-${index}`}
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
                  src={miner.image}
                  alt={`Miner at ${miner.x},${miner.y}`}
                  fill
                  className="object-contain miner-pulse"
                  style={{ 
                    transform: 'skew(24deg, -14deg) scale(2.5) translate(-10%, -15%)',
                    imageRendering: 'pixelated'
                  }}
                />
              </div>
            </div>
          );
        })}

        {/* Only show grid tiles when grid mode is active */}
        {isGridMode && gridPositions.map((pos) => {
          const isSelected = selectedTile?.x === pos.x && selectedTile?.y === pos.y;
          const isOccupied = isTileOccupied(pos.x, pos.y);
          
          return (
            <div
              key={`${pos.x}-${pos.y}`}
              onClick={() => handleTileClick(pos.x, pos.y)}
              className={`absolute pointer-events-auto transition-all duration-200 cursor-pointer z-10 ${
                isSelected ? 'ring-2 ring-[#FFD700]' : 'hover:ring-2 hover:ring-[#FFD70066]'
              } ${isOccupied ? 'opacity-70' : ''}`}
              style={{
                top: pos.top,
                left: pos.left,
                width: pos.width,
                height: pos.height,
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
        {/* Room Background */}
        <Image 
          src="/bedroom.png" 
          alt="Mining Room" 
          fill
          priority
          className="object-contain"
        />
        
        {/* Grid Mode Toggle Button (Top Left Corner) */}
        {hasFacility && toggleGridMode && (
          <button
            onClick={toggleGridMode}
            className={`absolute top-2 left-2 z-30 px-2 py-1 font-press-start text-xs transition-all ${
              isGridMode ? 'bg-banana text-royal' : 'bg-transparent text-banana border border-banana'
            }`}
          >
            {isGridMode ? 'HIDE GRID' : 'SHOW GRID'}
          </button>
        )}
        
        {/* Upgrade Button (Top Right Corner) */}
        {hasFacility && (
          <button
            onClick={onUpgradeFacility}
            disabled={isUpgradingFacility}
            className="absolute top-2 right-2 z-30 px-2 py-1 font-press-start text-xs bg-transparent text-banana border border-banana hover:bg-banana hover:text-royal transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpgradingFacility ? 'UPGRADING...' : 'UPGRADE FACILITY'}
          </button>
        )}
        
        {/* Get Starter Miner Button (Bottom Center) - Only if has facility but no starter miner */}
        {hasFacility && !hasClaimedStarterMiner && (
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

      {/* Starter Miner Modal */}
      <StarterMinerModal
        isOpen={isStarterMinerModalOpen}
        onClose={() => setIsStarterMinerModalOpen(false)}
        onClaim={handleClaimStarterMiner}
        selectedTile={selectedTile}
        isProcessing={isGettingStarterMiner}
      />
    </>
  );
}
