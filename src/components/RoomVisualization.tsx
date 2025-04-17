import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useContractRead } from 'wagmi';
import { CONTRACT_ADDRESSES, MAIN_CONTRACT_ABI } from '../config/contracts';
import { Address, zeroAddress } from 'viem';
import { Button } from '@/components/ui/button';
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
  hasClaimedStarterMiner
}: RoomVisualizationProps) {
  const [selectedTile, setSelectedTile] = useState<{x: number, y: number}>();
  const [isStarterMinerModalOpen, setIsStarterMinerModalOpen] = useState(false);

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
    
    await onGetStarterMiner(x, y);
    setIsStarterMinerModalOpen(false);
    // Enable grid mode after claiming to show the user their miner
    if (toggleGridMode && !isGridMode) {
      toggleGridMode();
    }
  };

  // Function to render the mining spaces overlay
  const renderMiningSpaces = () => {
    if (!isGridMode) return null;

    // Grid coordinates for the four mining spaces
    // x:0 y:0 = top right
    // x:1 y:0 = top left
    // x:0 y:1 = bottom right
    // x:1 y:1 = bottom left
    const gridPositions = [
      { x: 0, y: 0, top: '47%', left: '40%', width: '10%', height: '10%' }, // top right
      { x: 1, y: 0, top: '55%', left: '30%', width: '10%', height: '10%' }, // top left
      { x: 0, y: 1, top: '53%', left: '55%', width: '10%', height: '10%' }, // bottom right
      { x: 1, y: 1, top: '65%', left: '35%', width: '10%', height: '10%' }  // bottom left
    ];

    // Get all claimed miner positions 
    const claimedPositions = hasClaimedStarterMiner && facilityData && facilityData.miners > 0
      ? getClaimedMinerPositions()
      : [];

    return (
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid tiles */}
        {gridPositions.map((pos) => {
          const isSelected = selectedTile?.x === pos.x && selectedTile?.y === pos.y;
          
          return (
            <div
              key={`${pos.x}-${pos.y}`}
              onClick={() => handleTileClick(pos.x, pos.y)}
              className={`absolute pointer-events-auto transition-all duration-200 cursor-pointer z-10 ${
                isSelected ? 'ring-2 ring-banana' : 'hover:ring-2 hover:ring-[#FFD70066]'
              }`}
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
        {claimedPositions.map((minerPos, index) => {
          // Find the grid position data for this miner
          const pos = gridPositions.find(p => p.x === minerPos.x && p.y === minerPos.y);
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
                  src="/banana-miner.gif"
                  alt="Banana Miner"
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
        {selectedTile && !hasClaimedStarterMiner && (
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
                      src="/banana-miner.gif"
                      alt="Banana Miner Preview"
                      fill
                      className="object-contain miner-preview"
                      style={{ 
                        transform: 'skew(24deg, -14deg) scale(2.5) translate(-10%, -15%)',
                        imageRendering: 'pixelated',
                        opacity: 0.7, // Make it slightly transparent to indicate it's a preview
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-banana/60 text-royal px-2 py-1 text-xs font-press-start rounded transform -rotate-12">
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

  // Function to get the positions of claimed miners
  // In a full implementation, this would come from contract data
  const getClaimedMinerPositions = () => {
    // For now, we'll use local storage to persist the chosen position
    // In production, this would come from contract data
    if (typeof window !== 'undefined' && hasClaimedStarterMiner) {
      const savedPositionStr = localStorage.getItem('claimedMinerPosition');
      if (savedPositionStr) {
        try {
          return [JSON.parse(savedPositionStr)];
        } catch (e) {
          console.error("Error parsing miner position:", e);
        }
      }
    }
    
    // Default fallback position if nothing is stored yet
    return [{x: 0, y: 0}]; // Default to top right position
  };

  return (
    <>
      <style jsx global>{pulseStyle}</style>
      <div className="relative w-full h-[690px] bg-[#001420] rounded-lg border-2 border-banana overflow-hidden">
        {hasFacility ? (
          <div className="relative w-full h-full flex flex-col">
            <div className="relative flex-grow">
              <Image
                src="/bedroom.png"
                alt="Mining Facility"
                fill
                style={{ 
                  objectFit: 'contain',
                  objectPosition: 'center',
                  imageRendering: 'pixelated'
                }}
                priority
              />
              {renderMiningSpaces()}
            </div>
            <div className="relative w-full bg-[#001420] border-t-2 border-banana p-4">
              <div className="flex justify-between items-center">
                <button
                  onClick={toggleGridMode}
                  className={`pixel-button font-press-start ${
                    isGridMode 
                      ? 'bg-banana text-royal' 
                      : 'bg-transparent text-banana border-2 border-banana hover:bg-banana hover:text-royal'
                  }`}
                  disabled={isPurchasingFacility || isGettingStarterMiner || isUpgradingFacility}
                >
                  {isGridMode ? 'HIDE GRID' : 'SHOW GRID'}
                </button>
                {!hasClaimedStarterMiner && (
                  <button
                    onClick={() => setIsStarterMinerModalOpen(true)}
                    className="pixel-button font-press-start bg-banana text-royal hover:bg-[#FFE55C] mx-2"
                    disabled={isGettingStarterMiner}
                  >
                    {isGettingStarterMiner ? 'CLAIMING...' : 'CLAIM FREE MINER'}
                  </button>
                )}
                <button
                  onClick={onUpgradeFacility}
                  className={`pixel-button font-press-start ${
                    isUpgradingFacility 
                      ? 'bg-gray-500 text-white cursor-not-allowed' 
                      : 'bg-banana text-royal hover:bg-[#FFE55C]'
                  }`}
                  disabled={isPurchasingFacility || isGettingStarterMiner || isUpgradingFacility}
                >
                  {isUpgradingFacility ? 'UPGRADING...' : 'UPGRADE'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <p className="font-press-start text-banana mb-6">You don't have any mining space yet.</p>
            <button
              onClick={onPurchaseFacility}
              disabled={isPurchasingFacility}
              className={`pixel-button font-press-start ${
                isPurchasingFacility 
                  ? 'bg-gray-500 text-white cursor-not-allowed' 
                  : 'bg-banana text-royal hover:bg-[#FFE55C]'
              }`}
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
