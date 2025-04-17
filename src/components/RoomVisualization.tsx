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
    // Save position to local storage for UI persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('claimedMinerPosition', JSON.stringify({x, y}));
    }
    
    if (onPurchaseMiner) {
      await onPurchaseMiner(MinerType.BANANA_MINER, x, y);
    } else {
      await onGetStarterMiner(x, y);
    }
    
    setIsStarterMinerModalOpen(false);
    // Enable grid mode after claiming to show the user their miner
    if (toggleGridMode && !isGridMode) {
      toggleGridMode();
    }
  };

  // Function to get all miner positions, either from contract or localStorage (for starter miner)
  const getAllMinerPositions = () => {
    // Get miners from props (contract data)
    const contractMiners = miners.map(miner => ({
      ...miner,
      image: MINERS[miner.minerType]?.image || '/banana-miner.gif'
    }));
    
    // If no contract miners but user has claimed starter miner, try getting from localStorage
    if (contractMiners.length === 0 && hasClaimedStarterMiner && typeof window !== 'undefined') {
      const savedPositionStr = localStorage.getItem('claimedMinerPosition');
      if (savedPositionStr) {
        try {
          const position = JSON.parse(savedPositionStr);
          return [{
            id: 0,
            minerType: MinerType.BANANA_MINER,
            x: position.x,
            y: position.y,
            image: MINERS[MinerType.BANANA_MINER].image
          }];
        } catch (e) {
          console.error("Error parsing miner position:", e);
        }
      }
      
      // Default fallback for starter miner if nothing in localStorage
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

  // Function to render the mining spaces overlay
  const renderMiningSpaces = () => {
    if (!isGridMode) return null;

    // Grid coordinates for the four mining spaces
    // Adjusted grid positions for better mobile compatibility
    const gridPositions = [
      { x: 0, y: 0, top: '42%', left: '40%', width: '15%', height: '15%' }, // top right
      { x: 1, y: 0, top: '50%', left: '30%', width: '15%', height: '15%' }, // top left
      { x: 0, y: 1, top: '50%', left: '55%', width: '15%', height: '15%' }, // bottom right
      { x: 1, y: 1, top: '62%', left: '35%', width: '15%', height: '15%' }  // bottom left
    ];

    // Get all claimed miner positions 
    const allMiners = getAllMinerPositions();
    
    // Check if a tile is occupied by a miner
    const isTileOccupied = (x: number, y: number) => {
      return allMiners.some(miner => miner.x === x && miner.y === y);
    };
    
    // Get miner at a specific tile
    const getMinerAtTile = (x: number, y: number) => {
      return allMiners.find(miner => miner.x === x && miner.y === y);
    };

    return (
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid tiles */}
        {gridPositions.map((pos) => {
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
        
        {/* Show existing miners on the grid */}
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
        
        {/* Show preview of miner on selection (only when not already claimed) */}
        {selectedTile && !isTileOccupied(selectedTile.x, selectedTile.y) && (
          <>
            {/* Find the selected grid position */}
            {(() => {
              const pos = gridPositions.find(p => p.x === selectedTile.x && p.y === selectedTile.y);
              if (!pos) return null;
              
              return (
                <div 
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
                      src={MINERS[previewMinerType].image}
                      alt="Miner Preview"
                      fill
                      className="object-contain miner-preview"
                      style={{ 
                        transform: 'skew(24deg, -14deg) scale(2.5) translate(-10%, -15%)',
                        imageRendering: 'pixelated',
                        opacity: 0.7, // Make it slightly transparent to indicate it's a preview
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-[#FFD700]/60 text-[#0c1c31] px-2 py-1 text-xs font-press-start rounded transform -rotate-12">
                        Preview
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </>
        )}
      </div>
    );
  };

  return (
    <>
      <style jsx global>{pulseStyle}</style>
      <div className="relative w-full aspect-square overflow-hidden bg-[#0c1c31] pb-12">
        {hasFacility ? (
          <div className="relative w-full h-full flex flex-col">
            <div className="relative flex-grow">
              <Image
                src="/bedroom.png"
                alt="Mining Facility"
                fill
                style={{ 
                  objectFit: 'cover',
                  objectPosition: 'center',
                  imageRendering: 'pixelated'
                }}
                priority
              />
              {renderMiningSpaces()}
            </div>
            
            {/* Bottom control panel */}
            <div className="absolute left-0 right-0 bottom-0 flex justify-between">
              <div>
                <button
                  onClick={toggleGridMode}
                  className="bigcoin-button"
                >
                  {isGridMode ? 'HIDE GRID' : 'SHOW GRID'}
                </button>
              </div>
              
              <div className="flex">
                {!hasClaimedStarterMiner && (
                  <button
                    onClick={() => setIsStarterMinerModalOpen(true)}
                    className="bigcoin-button mx-1"
                    disabled={isGettingStarterMiner}
                  >
                    {isGettingStarterMiner ? 'CLAIMING...' : 'CLAIM FREE MINER'}
                  </button>
                )}
                <button
                  onClick={onUpgradeFacility}
                  className="bigcoin-button"
                  disabled={isUpgradingFacility}
                >
                  {isUpgradingFacility ? 'UPGRADING...' : 'UPGRADE FACILITY'}
                </button>
              </div>
            </div>
          </div>
        ) : (
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
