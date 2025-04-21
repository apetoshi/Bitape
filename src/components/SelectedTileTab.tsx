'use client';

import React, { useCallback } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { useIsMounted } from '@/hooks/useIsMounted';
import Image from 'next/image';
import { MINERS, MinerType } from '@/config/miners';

interface SelectedTile {
  x: number;
  y: number;
}

export interface SelectedTileTabProps {
  selectedTile: SelectedTile | null;
  onShowMinerModal?: () => void;
}

export const SelectedTileTab: React.FC<SelectedTileTabProps> = ({ 
  selectedTile,
  onShowMinerModal
}) => {
  const gameState = useGameState();
  const isMounted = useIsMounted();
  
  // Memoize the handler to prevent recreation on each render
  const handleShowMinerModal = useCallback(() => {
    console.log('Showing miner modal (memoized handler)');
    if (onShowMinerModal) {
      onShowMinerModal();
    }
  }, [onShowMinerModal]);
  
  // Only show data after mounting to prevent hydration issues
  const showData = isMounted;

  // Function to get location description based on coordinates
  const getLocationDescription = (tile: SelectedTile) => {
    if (tile.x === 0 && tile.y === 0) return "NEAR BED";
    if (tile.x === 1 && tile.y === 0) return "NEAR BANANA BOXES";
    if (tile.x === 0 && tile.y === 1) return "NEAR JUKEBOX";
    if (tile.x === 1 && tile.y === 1) return "NEAR CONTROL PANEL";
    return `POSITION (${tile.x}, ${tile.y})`;
  };

  // Check if the selected tile has a miner
  const selectedTileHasMiner = (x: number, y: number): boolean => {
    if (!gameState.miners || gameState.miners.length === 0) {
      // Fallback: If no miners data but has facility, assume starter miner at (0,0)
      if (gameState.hasFacility && x === 0 && y === 0) {
        console.log('No miners data, but has facility - assuming starter miner at (0,0)');
        return true;
      }
      return false;
    }
    
    // Convert coordinates to numbers to ensure consistent comparison
    const targetX = Number(x);
    const targetY = Number(y);
    
    // Check if any miner in the array has the given coordinates
    return gameState.miners.some(miner => {
      const minerX = Number(miner.x);
      const minerY = Number(miner.y);
      return minerX === targetX && minerY === targetY;
    });
  };

  // Get miner at the selected tile
  const getMinerAtTile = (x: number, y: number) => {
    if (!gameState.miners || gameState.miners.length === 0) {
      // Fallback: If no miners data but has facility, return hardcoded starter miner at (0,0)
      if (gameState.hasFacility && x === 0 && y === 0) {
        console.log('No miners data, but has facility - returning hardcoded starter miner at (0,0)');
        return {
          id: '1',
          minerType: 1, // BANANA_MINER
          x: 0,
          y: 0,
          hashrate: 100,
          powerConsumption: 1,
          cost: 0,
          inProduction: true,
          image: '/banana-miner.gif'
        };
      }
      return null;
    }
    
    const targetX = Number(x);
    const targetY = Number(y);
    
    return gameState.miners.find(miner => {
      const minerX = Number(miner.x);
      const minerY = Number(miner.y);
      return minerX === targetX && minerY === targetY;
    }) || null;
  };

  // Get miner type name
  const getMinerTypeName = (minerType: number) => {
    const minerTypes = {
      1: "BANANA MINER",
      2: "MONKEY TOASTER",
      3: "GORILLA GADGET",
      4: "APEPAD MINI"
    };
    return minerTypes[minerType as keyof typeof minerTypes] || "UNKNOWN";
  };

  return (
    <div className="game-panel bg-[#001420] p-3 md:p-4 rounded-lg border-2 border-banana">
      {showData ? (
        selectedTile ? (
          <div className="space-y-3">
            <div className="border-b border-white/20 pb-2 mb-3">
              <span className="pixel-text text-white/80 text-xs md:text-sm">LOCATION:</span>
              <span className="pixel-text text-white text-xs md:text-sm font-medium block mt-1">
                {getLocationDescription(selectedTile)}
              </span>
              <span className="pixel-text text-white/50 text-xs mt-1">
                POSITION: X: {selectedTile.x}, Y: {selectedTile.y}
              </span>
            </div>
            
            {selectedTileHasMiner(selectedTile.x, selectedTile.y) ? (
              <div className="space-y-3">
                <p className="pixel-text text-white/80 text-xs md:text-sm">ACTIVE MINER:</p>
                
                {(() => {
                  const miner = getMinerAtTile(selectedTile.x, selectedTile.y);
                  if (!miner) return null;
                  
                  const minerType = Number(miner.minerType);
                  const minerImage = miner.image || (MINERS[minerType]?.image || '/banana-miner.gif');
                  
                  return (
                    <div className="bg-[#0a1e2a] p-3 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-16 h-16 relative">
                          <Image
                            src={minerImage}
                            alt={getMinerTypeName(minerType)}
                            width={64}
                            height={64}
                            className="object-contain pixelated"
                          />
                        </div>
                        <div>
                          <p className="pixel-text text-white text-sm font-medium">
                            {getMinerTypeName(minerType)}
                          </p>
                          <p className="pixel-text text-white/70 text-xs">
                            {miner.hashrate || '100'} GH/s · {miner.powerConsumption || '1'} GW
                          </p>
                        </div>
                      </div>
                      
                      {onShowMinerModal && (
                        <div className="mt-4">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              if (confirm("Are you sure you want to remove this miner? This action cannot be undone.")) {
                                console.log('Removing miner at position:', selectedTile);
                                handleShowMinerModal();
                              }
                            }}
                            className="w-full pixel-button font-press-start text-xs bg-red-600 text-white"
                            style={{
                              position: 'relative',
                              zIndex: 10
                            }}
                          >
                            REMOVE MINER
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-center pixel-text text-white/80 text-sm py-4">
                  No miner at this location.
                </p>
                {gameState.hasFacility && 
                  gameState.facilityData && 
                  Number(gameState.facilityData.miners) < Number(gameState.facilityData.capacity) && 
                  onShowMinerModal && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        console.log('Opening miner modal for new placement...');
                        // Prevent multiple rapid calls
                        const button = e.currentTarget;
                        button.disabled = true;
                        // Call directly without setTimeout which can cause issues
                        handleShowMinerModal();
                        // Re-enable after a delay
                        setTimeout(() => {
                          button.disabled = false;
                        }, 300);
                      }}
                      className="w-full pixel-button font-press-start text-xs bg-banana text-royal"
                      style={{
                        position: 'relative',
                        zIndex: 10
                      }}
                    >
                      PLACE MINER HERE
                    </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="pixel-text text-white/80 text-sm">Click a tile to select it</p>
          </div>
        )
      ) : (
        <div className="py-4 text-center">
          <p className="pixel-text text-white/50 text-xs">Loading...</p>
        </div>
      )}
    </div>
  );
};

export default SelectedTileTab; 