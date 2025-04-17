'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAccount, useContractRead } from 'wagmi';
import { zeroAddress } from 'viem';
import { useGameState } from '@/hooks/useGameState';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { CONTRACT_ADDRESSES, MAIN_CONTRACT_ABI } from '@/config/contracts';
import { MinerType } from '@/config/miners';
import BuyFacilityModal from '@/components/BuyFacilityModal';
import AccountModal from '@/components/AccountModal';
import ReferralModal from '@/components/ReferralModal';
import { RoomVisualization } from '@/components/RoomVisualization';
import { ResourcesPanel } from '@/components/ResourcesPanel';
import { MiningClaimSection } from '@/components/MiningClaimSection';
import { useIsMounted } from '@/hooks/useIsMounted';
import FacilityPurchaseModal from '@/components/FacilityPurchaseModal';
import MinerPurchaseModal from '@/components/MinerPurchaseModal';
import { Address } from 'viem';

// Mobile tabs for bottom navigation
type MobileTab = 'actions' | 'stats' | 'mining';
// Desktop tabs for resources panel
type Tab = 'resources' | 'space' | 'selectedTile';

interface SelectedTile {
  x: number;
  y: number;
}

interface FacilityData {
  level: bigint;
  capacity: bigint;
  miners: bigint;
  power: bigint;
  used: bigint;
  x: bigint;
  y: bigint;
}

interface MinerData {
  minerIndex: bigint;
  id: bigint;
  x: bigint;
  y: bigint;
  hashrate: bigint;
  powerConsumption: bigint;
  cost: bigint;
}

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const gameState = useGameState();
  const { apeBalance, bitBalance } = useTokenBalance();
  const [activeTab, setActiveTab] = useState<Tab>('resources');
  const [activeMobileTab, setActiveMobileTab] = useState<MobileTab>('actions');
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);
  const [isStarterMinerModalOpen, setIsStarterMinerModalOpen] = useState<boolean>(false);
  const [isPurchaseMinerModalOpen, setIsPurchaseMinerModalOpen] = useState<boolean>(false);
  const [selectedTile, setSelectedTile] = useState<SelectedTile | null>(null);
  const [showMinerModal, setShowMinerModal] = useState(false);
  const [isGridModeActive, setIsGridModeActive] = useState(false);
  const isMounted = useIsMounted();
  const [statsView, setStatsView] = useState<'simple' | 'pro'>('simple');

  // Get player facility data directly from contract
  const { data: facilityData } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'getPlayerFacility',
    args: [address || zeroAddress],
    query: {
      enabled: Boolean(address)
    }
  });

  // Get player miners - currently mocked since not in ABI
  const playerMiners: bigint[] = [];

  // Get free miner data (index 1) - currently mocked since not in ABI
  const freeMinerData: MinerData = {
    minerIndex: BigInt(1),
    id: BigInt(0),
    x: BigInt(0),
    y: BigInt(0),
    hashrate: BigInt(100),
    powerConsumption: BigInt(1),
    cost: BigInt(0)
  };

  // Process facility data
  const facility = facilityData as bigint[] | undefined;
  
  // Create a parsed version of facility data with proper Number conversions
  const parsedFacility = facility ? {
    level: Number(facility[0]),         // level
    capacity: Number(facility[1]),      // maxMiners
    miners: Number(facility[2]),        // currMiners
    power: Number(facility[3]),         // totalPowerOutput
    used: Number(facility[4]),          // currPowerOutput
    x: Number(facility[5]),             // grid X
    y: Number(facility[6])              // grid Y
  } : null;

  // Create a compatible version for RoomVisualization component
  const compatibleFacilityData = parsedFacility ? {
    level: parsedFacility.level,
    capacity: parsedFacility.capacity,
    miners: parsedFacility.miners,
    power: parsedFacility.power,
    used: parsedFacility.used,
    resources: 0,                       // Not used but required by the component
    spaces: parsedFacility.capacity     // For backward compatibility
  } : undefined;

  // Calculate derived values for displaying in UI
  const spacesLeft = parsedFacility ? 
    (parsedFacility.capacity - parsedFacility.miners) : 0;

  const gigawattsAvailable = parsedFacility ? 
    (parsedFacility.power - parsedFacility.used) : 0;

  // Check if facility is initialized by using initializedStarterFacility function result
  const { data: initializedFacility } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'initializedStarterFacility',
    args: [address || zeroAddress],
    query: {
      enabled: Boolean(address)
    }
  });

  // Explicitly convert to boolean
  const hasFacility = Boolean(initializedFacility);

  // Check if selected tile has a miner
  const selectedTileHasMiner = useCallback((x: number, y: number): boolean => {
    // Add debugging to understand the state of miners
    console.log('Checking for miner at position:', { x, y });
    console.log('Available miners:', gameState.miners);
    
    if (!gameState.miners || gameState.miners.length === 0) {
      console.log('No miners available in gameState');
      
      // Fallback check using localStorage for starter miner
      if (gameState.hasClaimedStarterMiner && typeof window !== 'undefined') {
        try {
          const savedPositionStr = localStorage.getItem('claimedMinerPosition');
          if (savedPositionStr) {
            const position = JSON.parse(savedPositionStr);
            const matches = Number(position.x) === Number(x) && Number(position.y) === Number(y);
            console.log(`Fallback check using localStorage. Match: ${matches}`);
            return matches;
          }
        } catch (e) {
          console.error("Error parsing miner position:", e);
        }
      }
      
      return false;
    }
    
    // Convert coordinates to numbers to ensure consistent comparison
    const targetX = Number(x);
    const targetY = Number(y);
    
    // Check if any miner in the array has the given coordinates
    const hasMiner = gameState.miners.some(miner => {
      const minerX = Number(miner.x);
      const minerY = Number(miner.y);
      const matches = minerX === targetX && minerY === targetY;
      console.log(`Miner at (${minerX}, ${minerY}) matches selected (${targetX}, ${targetY}): ${matches}`);
      return matches;
    });
    
    console.log(`Result: ${hasMiner ? 'Miner found' : 'No miner found'} at (${targetX}, ${targetY})`);
    return hasMiner;
  }, [gameState.miners, gameState.hasClaimedStarterMiner]);

  // Get miner at selected tile
  const getMinerAtTile = useCallback((x: number, y: number) => {
    if (!gameState.miners || gameState.miners.length === 0) {
      console.log('No miners available in gameState, checking localStorage fallback');
      
      // Fallback for starter miner using localStorage
      if (gameState.hasClaimedStarterMiner && typeof window !== 'undefined') {
        try {
          const savedPositionStr = localStorage.getItem('claimedMinerPosition');
          if (savedPositionStr) {
            const position = JSON.parse(savedPositionStr);
            if (Number(position.x) === Number(x) && Number(position.y) === Number(y)) {
              console.log('Found miner in localStorage');
              return {
                id: 0,
                minerType: MinerType.BANANA_MINER,
                x: Number(position.x),
                y: Number(position.y)
              };
            }
          }
        } catch (e) {
          console.error("Error parsing miner position:", e);
        }
      }
      
      return null;
    }
    
    // Convert coordinates to numbers to ensure consistent comparison
    const targetX = Number(x);
    const targetY = Number(y);
    
    // Find the miner at the specified coordinates
    const miner = gameState.miners.find(miner => 
      Number(miner.x) === targetX && Number(miner.y) === targetY
    );
    
    console.log('Found miner at selected position:', miner);
    return miner || null;
  }, [gameState.miners, gameState.hasClaimedStarterMiner]);

  // Add global debugging object to persist across renders
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore - Add debug object to window
      window.__BITAPE_DEBUG = window.__BITAPE_DEBUG || {};
      // @ts-ignore - Track miners
      window.__BITAPE_DEBUG.miners = gameState.miners;
      // @ts-ignore - Track selected tile
      window.__BITAPE_DEBUG.selectedTile = selectedTile;
    }
  }, [gameState.miners, selectedTile]);

  // Add a useEffect to log miners whenever they change
  useEffect(() => {
    if (gameState.miners && gameState.miners.length > 0) {
      console.log('Miners updated:', gameState.miners);
    }
  }, [gameState.miners]);

  // Force a re-render when selectedTile or miners change
  useEffect(() => {
    if (selectedTile) {
      console.log('Selected tile or miners changed, checking for miner...');
      const hasMiner = selectedTileHasMiner(selectedTile.x, selectedTile.y);
      console.log(`Selected tile has miner: ${hasMiner}`);
      
      // Force re-render by updating state slightly
      setSelectedTile(prev => prev ? {...prev} : null);
    }
  }, [selectedTile, gameState.miners, gameState.hasClaimedStarterMiner, selectedTileHasMiner]);

  // Force a check after component mount to make sure we're detecting miners
  useEffect(() => {
    const checkTimer = setTimeout(() => {
      if (selectedTile) {
        console.log('⭐ Delayed check for miner at selected tile');
        const hasMiner = selectedTileHasMiner(selectedTile.x, selectedTile.y);
        console.log(`⭐ Has miner: ${hasMiner}`);
        
        // Get detailed miner info
        if (hasMiner) {
          const miner = getMinerAtTile(selectedTile.x, selectedTile.y);
          console.log('⭐ Miner details:', miner);
        }
        
        // Refresh the UI
        setSelectedTile(prev => prev ? {...prev} : null);
      }
    }, 1000);
    
    return () => clearTimeout(checkTimer);
  }, [selectedTile, selectedTileHasMiner, getMinerAtTile]);

  // Redirect if not connected or trying to access someone else's room
  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    } else if (address && params?.address && 
      (typeof params.address === 'string') && 
      address.toLowerCase() !== params.address.toLowerCase()) {
      router.push(`/room/${address}`);
    }
  }, [isConnected, address, params?.address, router]);

  if (!isConnected || !address) {
    return null;
  }

  const renderTabContent = () => {
    if (!gameState.hasFacility && !hasFacility) {
      return (
        <div className="text-center p-4">
          <p className="bigcoin-text">Purchase a facility to view details</p>
          <div className="mt-6">
            <button 
              onClick={() => setIsBuyModalOpen(true)}
              className="bigcoin-button"
            >
              BUY FACILITY
            </button>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'resources':
        return (
          <div className="p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="bigcoin-text">APE BALANCE</span>
              <span className="bigcoin-value font-press-start">{apeBalance || '0'} APE</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="bigcoin-text">BIT BALANCE</span>
              <span className="bigcoin-value font-press-start">{bitBalance || '0'} BIT</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="bigcoin-text">SPACES LEFT</span>
              <span className="bigcoin-value font-press-start">
                {parsedFacility ? `${parsedFacility.capacity - parsedFacility.miners} SPACES` : '0 SPACES'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="bigcoin-text">GIGAWATTS AVAILABLE</span>
              <span className="bigcoin-value font-press-start">
                {parsedFacility ? `${parsedFacility.power - parsedFacility.used} GW` : '0 GW'}
              </span>
            </div>
          </div>
        );
        
      case 'space':
        return (
          <div className="p-3 space-y-2">
            <div className="flex justify-between items-center border-b border-white/20 pb-2">
              <span className="bigcoin-text">YOUR MINING ROOM</span>
              <span className="bigcoin-value font-press-start">1</span>
            </div>
            
            <div className="flex justify-between items-center border-b border-white/20 pb-2">
              <span className="bigcoin-text">TOTAL SPACES</span>
              <span className="bigcoin-value font-press-start">
                {parsedFacility ? `${parsedFacility.capacity} SPACES` : '0 SPACES'}
              </span>
            </div>
            
            <div className="flex justify-between items-center border-b border-white/20 pb-2">
              <span className="bigcoin-text">USED SPACES</span>
              <span className="bigcoin-value font-press-start">
                {parsedFacility ? `${parsedFacility.miners} SPACES` : '0 SPACES'}
              </span>
            </div>
            
            <div className="flex justify-between items-center pb-2">
              <span className="bigcoin-text">TOTAL GIGAWATTS</span>
              <span className="bigcoin-value font-press-start">
                {parsedFacility ? `${parsedFacility.power} GW` : '0 GW'}
              </span>
            </div>

            <div className="mt-3">
              <button
                onClick={() => setIsUpgradeModalOpen(true)}
                className="w-full bigcoin-button"
              >
                UPGRADE FACILITY
              </button>
            </div>
          </div>
        );
        
      case 'selectedTile':
        // Additional debugging to understand what's happening during render
        console.log('Rendering selectedTile tab. Selected tile:', selectedTile);
        if (selectedTile) {
          console.log('Checking for miner at selected tile during render');
          const hasMiner = selectedTileHasMiner(selectedTile.x, selectedTile.y);
          console.log('Has miner during render:', hasMiner);
          if (hasMiner) {
            const miner = getMinerAtTile(selectedTile.x, selectedTile.y);
            console.log('Miner details during render:', miner);
          }
        }

        return (
          <div className="p-3 space-y-2">
            {selectedTile ? (
              <div>
                <div className="border-b border-white/20 pb-2 mb-3">
                  <span className="bigcoin-text">LOCATION:</span>
                  <span className="bigcoin-value block mt-1">{getLocationDescription(selectedTile)}</span>
                  <span className="bigcoin-text text-xs mt-1">POSITION: X: {selectedTile.x}, Y: {selectedTile.y}</span>
                </div>
                
                {(() => {
                  // DIRECT LOCALSTORAGE CHECK (highest priority)
                  let minerFromLocalStorage = null;
                  
                  // Only do this if the user has claimed a starter miner but we don't have it in gameState
                  if (gameState.hasClaimedStarterMiner && 
                     (!gameState.miners || gameState.miners.length === 0) && 
                     typeof window !== 'undefined') {
                    try {
                      const savedPositionStr = localStorage.getItem('claimedMinerPosition');
                      console.log('Direct localStorage check, saved position:', savedPositionStr);
                      
                      if (savedPositionStr) {
                        const position = JSON.parse(savedPositionStr);
                        console.log('Comparing localStorage position with selected tile:', {
                          positionX: Number(position.x),
                          positionY: Number(position.y),
                          selectedX: Number(selectedTile.x),
                          selectedY: Number(selectedTile.y)
                        });
                        
                        if (Number(position.x) === Number(selectedTile.x) && 
                            Number(position.y) === Number(selectedTile.y)) {
                          console.log('MATCH FOUND in localStorage!');
                          minerFromLocalStorage = {
                            id: 0,
                            minerType: MinerType.BANANA_MINER,
                            x: Number(position.x),
                            y: Number(position.y)
                          };
                        }
                      }
                    } catch (e) {
                      console.error("Error accessing localStorage:", e);
                    }
                  }
                  
                  // Get miner using our helper method
                  const miner = getMinerAtTile(selectedTile.x, selectedTile.y);
                  console.log('Miner found by getMinerAtTile:', miner);
                  
                  // Use either the contract miner or localStorage miner
                  const finalMiner = miner || minerFromLocalStorage;
                  console.log('Final miner to display:', finalMiner);
                  
                  if (finalMiner) {
                    return (
                      <div className="space-y-3">
                        <p className="bigcoin-text">MINER DETAILS:</p>
                        <p className="bigcoin-text text-xs">Source: {miner ? 'Contract Data' : 'LocalStorage'}</p>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-16 relative">
                            <Image
                              src="/banana-miner.gif"
                              alt="Banana Miner"
                              fill
                              className="object-contain"
                            />
                          </div>
                          <div>
                            <p className="bigcoin-value">{getMinerTypeName(finalMiner.minerType)}</p>
                            <p className="bigcoin-text text-xs opacity-80">HASH RATE: {getMinerHashRate(finalMiner.minerType)} GH/s</p>
                            <p className="bigcoin-text text-xs opacity-80">ENERGY: {getMinerPowerConsumption(finalMiner.minerType)} WATTS</p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <button
                            onClick={() => setShowMinerModal(true)}
                            className="w-full bigcoin-button"
                          >
                            UPGRADE MINER
                          </button>
                        </div>
                      </div>
                    );
                  } else {
                    // No miner found at this location
                    return (
                      <div>
                        <p className="bigcoin-text mb-3">NO MINER INSTALLED</p>
                        {hasFacility && (
                          <div className="mt-4">
                            <button
                              onClick={() => setShowMinerModal(true)}
                              className="w-full bigcoin-button"
                            >
                              BUY MINER
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  }
                })()}
              </div>
            ) : (
              <div className="text-center p-2">
                <p className="bigcoin-text opacity-80">Select a tile to view or add miners</p>
                <p className="bigcoin-text opacity-50 mt-2">Click GRID button then select a space</p>
              </div>
            )}
          </div>
        );
        
      default:
        return <div>Select a tab</div>;
    }
  };

  // Render content based on the active mobile tab
  const renderMobileTabContent = () => {
    switch (activeMobileTab) {
      case 'actions':
        return (
          <div className="p-4">
            <div className="grid grid-cols-1 gap-4">
              <button
                className="bigcoin-button"
                onClick={() => setIsUpgradeModalOpen(true)}
              >
                UPGRADE FACILITY
              </button>
              {!gameState.hasClaimedStarterMiner && (
                <button
                  className="bigcoin-button"
                  onClick={() => setIsStarterMinerModalOpen(true)}
                  disabled={gameState.isGettingStarterMiner}
                >
                  {gameState.isGettingStarterMiner ? "PROCESSING..." : "CLAIM STARTER MINER"}
                </button>
              )}
              <button
                className="bigcoin-button"
                onClick={() => setIsPurchaseMinerModalOpen(true)}
              >
                PURCHASE MINER
              </button>
            </div>
          </div>
        );
      case 'stats':
        return (
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="bigcoin-text">APE BALANCE</span>
              <span className="bigcoin-value font-press-start">{apeBalance || '0'} APE</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="bigcoin-text">BIT BALANCE</span>
              <span className="bigcoin-value font-press-start">{bitBalance || '0'} BIT</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="bigcoin-text">SPACES LEFT</span>
              <span className="bigcoin-value font-press-start">
                {parsedFacility ? `${parsedFacility.capacity - parsedFacility.miners} SPACES` : '0 SPACES'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="bigcoin-text">GIGAWATTS AVAILABLE</span>
              <span className="bigcoin-value font-press-start">
                {parsedFacility ? `${parsedFacility.power - parsedFacility.used} GW` : '0 GW'}
              </span>
            </div>
          </div>
        );
      case 'mining':
        return (
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="bigcoin-text">TOTAL SPACES</span>
              <span className="bigcoin-value font-press-start">
                {parsedFacility ? `${parsedFacility.capacity} SPACES` : '0 SPACES'}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="bigcoin-text">USED SPACES</span>
              <span className="bigcoin-value font-press-start">
                {parsedFacility ? `${parsedFacility.miners} SPACES` : '0 SPACES'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="bigcoin-text">TOTAL GIGAWATTS</span>
              <span className="bigcoin-value font-press-start">
                {parsedFacility ? `${parsedFacility.power} GW` : '0 GW'}
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-bold mb-2">Your Miners</h3>
              {gameState.miners && gameState.miners.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {gameState.miners.map((miner, index) => (
                    <div key={index} className="border border-white/20 p-3 rounded">
                      <div className="flex justify-between items-center">
                        <span>Miner #{miner.id}</span>
                        <span>Type: {getMinerTypeName(miner.minerType)}</span>
                      </div>
                      <div className="mt-2">
                        <span>Mining rate: {getMinerMiningRate(miner.minerType)} BIT/day</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">No miners yet</div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getMinerTypeName = (minerType: number) => {
    const minerTypes = {
      0: "BANANA MINER",
      1: "APE MINER",
      2: "ROYAL APE MINER"
    };
    return minerTypes[minerType as keyof typeof minerTypes] || "UNKNOWN";
  };

  const getMinerMiningRate = (minerType: number) => {
    const miningRates = {
      0: "1",
      1: "10",
      2: "100"
    };
    return miningRates[minerType as keyof typeof miningRates] || "0";
  };

  const getLocationDescription = (tile: SelectedTile) => {
    if (tile.x === 0 && tile.y === 0) return "NEAR BED";
    if (tile.x === 1 && tile.y === 0) return "NEAR BANANA BOXES";
    if (tile.x === 0 && tile.y === 1) return "NEAR JUKEBOX";
    if (tile.x === 1 && tile.y === 1) return "NEAR CONTROL PANEL";
    return "UNKNOWN LOCATION";
  };

  const handleTileSelect = (x: number, y: number) => {
    console.log(`Tile selected at (${x}, ${y})`);
    setSelectedTile({ x, y });
    setActiveTab('selectedTile');
    
    // Check if there's a miner at this position immediately after selection
    const hasMiner = selectedTileHasMiner(x, y);
    console.log(`Tile has miner: ${hasMiner}`);
  };

  const handlePurchaseFacility = async () => {
    setIsBuyModalOpen(true);
    return Promise.resolve();
  };

  const handleUpgradeFacility = async () => {
    setIsUpgradeModalOpen(true);
  };

  const handleMinerPurchase = async (minerType: MinerType, x: number, y: number) => {
    if (!selectedTile) return;
    await gameState.purchaseMiner(minerType, x, y);
    setShowMinerModal(false);
  };
  
  const toggleGridMode = () => {
    setIsGridModeActive(!isGridModeActive);
  };

  const handleGetStarterMiner = async () => {
    if (!selectedTile) return;
    
    console.log('Claiming starter miner at position:', selectedTile);
    
    // Save position to localStorage for UI persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('claimedMinerPosition', JSON.stringify({
        x: selectedTile.x,
        y: selectedTile.y
      }));
      console.log('Saved miner position to localStorage');
      
      // Add to our debug object for inspection
      // @ts-ignore
      window.__BITAPE_DEBUG = window.__BITAPE_DEBUG || {};
      // @ts-ignore
      window.__BITAPE_DEBUG.claimedPosition = {
        x: selectedTile.x, 
        y: selectedTile.y
      };
    }
    
    try {
      // Call the contract method to claim the starter miner
      await gameState.getStarterMiner(selectedTile.x, selectedTile.y);
      console.log('Starter miner claimed successfully');
      
      // Force refresh game state to update miners list
      if (gameState.refetch) {
        console.log('Refreshing game state after claiming miner');
        await gameState.refetch();
      }
      
      // Manually update miners array if needed as a fallback
      const newMiner = {
        id: gameState.miners?.length ? gameState.miners.length : 0,
        minerType: MinerType.BANANA_MINER,
        x: selectedTile.x,
        y: selectedTile.y
      };
      
      // Debug log the new miner
      console.log('Created new miner object:', newMiner);
      
      setIsBuyModalOpen(false);
      
      // Re-check if the tile has a miner after the operation
      const hasMinerNow = selectedTileHasMiner(selectedTile.x, selectedTile.y);
      console.log(`Tile has miner after claiming: ${hasMinerNow}`);
      
      // Force a re-render by updating the selected tile (with the same values)
      setSelectedTile({...selectedTile});
      
      // Wait a moment and then check again (async refresh might take time)
      setTimeout(() => {
        console.log('Delayed check for miner presence');
        const hasMinerDelayed = selectedTileHasMiner(selectedTile.x, selectedTile.y);
        console.log(`Tile has miner after delay: ${hasMinerDelayed}`);
        
        // Force another re-render if needed
        setSelectedTile({...selectedTile});
      }, 2000);
    } catch (error) {
      console.error('Error claiming starter miner:', error);
    }
  };

  const getMinerHashRate = (minerType: number) => {
    const hashRates = {
      0: "100",
      1: "1000",
      2: "10000"
    };
    return hashRates[minerType as keyof typeof hashRates] || "0";
  };

  const getMinerPowerConsumption = (minerType: number) => {
    const powerConsumptions = {
      0: "1",
      1: "10",
      2: "100"
    };
    return powerConsumptions[minerType as keyof typeof powerConsumptions] || "0";
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col grid-background overflow-hidden">
      {/* Mobile layout */}
      <div className="md:hidden mobile-dashboard">
        {/* Header with logo and menu */}
        <div className="mobile-dashboard-header">
          <Link href="/">
            <Image
              src="/bitape.png"
              alt="BitApe Logo"
              width={40}
              height={40}
              className="hover:opacity-80 transition-opacity"
              priority
            />
          </Link>
          <button 
            onClick={() => setIsProfileModalOpen(true)}
            className="bigcoin-button"
          >
            PROFILE
          </button>
        </div>
        
        {/* Main content area - add padding-bottom to account for fixed footer */}
        <div className="mobile-dashboard-content pb-24">
          {/* Mobile tab content */}
          {renderMobileTabContent()}
          
          {/* Room visualization */}
          <div className="bigcoin-panel">
            <RoomVisualization 
              hasFacility={hasFacility}
              facilityData={compatibleFacilityData}
              onPurchaseFacility={handlePurchaseFacility}
              onGetStarterMiner={handleGetStarterMiner}
              onUpgradeFacility={handleUpgradeFacility}
              onPurchaseMiner={gameState.purchaseMiner}
              isPurchasingFacility={gameState.isPurchasingFacility}
              isGettingStarterMiner={gameState.isGettingStarterMiner}
              isUpgradingFacility={gameState.isUpgradingFacility}
              onTileSelect={handleTileSelect}
              address={address as Address}
              isGridMode={isGridModeActive}
              toggleGridMode={toggleGridMode}
              hasClaimedStarterMiner={gameState.hasClaimedStarterMiner}
              miners={gameState.miners}
            />
          </div>
        </div>
        
        {/* Bottom tab navigation */}
        <div className="mobile-dashboard-footer">
          <button 
            className={`mobile-dashboard-tab ${activeMobileTab === 'actions' ? 'active' : ''}`}
            onClick={() => setActiveMobileTab('actions')}
          >
            ACTIONS
          </button>
          <button 
            className={`mobile-dashboard-tab ${activeMobileTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveMobileTab('stats')}
          >
            STATS
          </button>
          <button 
            className={`mobile-dashboard-tab ${activeMobileTab === 'mining' ? 'active' : ''}`}
            onClick={() => setActiveMobileTab('mining')}
          >
            MINING
          </button>
        </div>
      </div>
      
      {/* Desktop layout - hidden on mobile */}
      <div className="hidden md:flex flex-col h-screen bg-royal overflow-hidden">
        {/* Header */}
        <header className="nav-bar flex justify-between items-center px-4 py-2">
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/bitape.png"
                alt="BitApe Logo"
                width={64}
                height={64}
                className="hover:opacity-80 transition-opacity"
                priority
              />
            </Link>
          </div>
          <nav className="flex items-center gap-2">
            <Link href="/about" className="font-press-start text-sm text-white hover:text-banana">
              ABOUT
            </Link>
            <Link href="/trade" className="font-press-start text-sm text-white hover:text-banana">
              TRADE $BIT
            </Link>
            <Link href="/leaderboard" className="font-press-start text-sm text-[#4A5568] hover:text-banana">
              LEADERBOARD
            </Link>
            <button className="font-press-start text-sm text-banana border-2 border-banana px-3 py-1 hover:bg-banana hover:text-royal pixel-button">
              ANNOUNCEMENTS
            </button>
            <button 
              onClick={() => setIsReferralModalOpen(true)}
              className="font-press-start text-sm text-banana border-2 border-banana px-3 py-1 hover:bg-banana hover:text-royal pixel-button"
            >
              REFER A FRIEND
            </button>
            <button 
              onClick={() => setIsProfileModalOpen(true)}
              className="font-press-start text-sm text-banana border-2 border-banana px-3 py-1 hover:bg-banana hover:text-royal pixel-button"
            >
              PROFILE
            </button>
          </nav>
        </header>

        {/* Main content - fills available height */}
        <div className="flex-grow grid grid-cols-12 gap-2 p-2 max-h-[calc(100vh-56px)] overflow-hidden">
          {/* Left Column */}
          <div className="col-span-4 flex flex-col gap-2 overflow-y-auto">
            {/* Tabs */}
            <div className="bg-royal border-2 border-banana rounded-lg overflow-hidden">
              <div className="flex border-b-2 border-banana">
                <button
                  className={`px-3 py-1 flex-1 font-press-start text-xs ${activeTab === 'resources' ? 'bg-banana text-royal' : 'text-banana'}`}
                  onClick={() => setActiveTab('resources')}
                >
                  RESOURCES
                </button>
                <button
                  className={`px-3 py-1 flex-1 font-press-start text-xs ${activeTab === 'space' ? 'bg-banana text-royal' : 'text-banana'}`}
                  onClick={() => setActiveTab('space')}
                >
                  SPACE
                </button>
                <button
                  className={`px-3 py-1 flex-1 font-press-start text-xs ${activeTab === 'selectedTile' ? 'bg-banana text-royal' : 'text-banana'}`}
                  onClick={() => setActiveTab('selectedTile')}
                >
                  SELECTED TILE
                </button>
              </div>
              {renderTabContent()}
            </div>

            {/* Stats Panel */}
            <div className="bg-royal border-2 border-banana rounded-lg overflow-hidden">
              <div className="flex border-b-2 border-banana px-3 py-1">
                <button className="font-press-start text-xs text-banana mr-4">SIMPLE</button>
                <button className="font-press-start text-xs text-[#4A5568]">PRO</button>
              </div>
              <div className="p-3 space-y-1 font-press-start text-white text-xs">
                <p>- YOU ARE MINING {gameState.miningRate || 0} BIT A DAY</p>
                <p>- YOUR HASH RATE IS {gameState.hashRate || 0} GH/S</p>
                <p>- {gameState.blocksUntilHalving || 0} BLOCKS UNTIL NEXT HALVENING</p>
                <p>- YOU HAVE {gameState.networkHashRatePercentage || 0}% OF THE TOTAL NETWORK HASH RATE ({gameState.totalNetworkHashRate || 0} GH/S)</p>
              </div>
            </div>

            {/* Mining Panel */}
            <div className="bg-royal border-2 border-banana rounded-lg overflow-hidden">
              <div className="p-3 text-center font-press-start">
                <p className="text-white mb-2 text-sm">YOU HAVE MINED {gameState.minedBit || 0} BIT</p>
                <button 
                  onClick={() => gameState.claimReward()}
                  disabled={gameState.isClaimingReward || !gameState.hasFacility}
                  className="w-full bg-dark-blue text-banana py-1 px-3 text-sm hover:bg-opacity-80 disabled:opacity-50 border-2 border-banana"
                >
                  CLAIM MINED BIT
                </button>
              </div>
            </div>
          </div>

          {/* Main Room Area */}
          <div className="col-span-8 flex flex-col items-center justify-center">
            <div className="relative w-[700px] h-[700px] border border-banana overflow-hidden p-1.5">
              <RoomVisualization 
                hasFacility={hasFacility}
                facilityData={compatibleFacilityData}
                onPurchaseFacility={handlePurchaseFacility}
                onGetStarterMiner={handleGetStarterMiner}
                onUpgradeFacility={handleUpgradeFacility}
                onPurchaseMiner={gameState.purchaseMiner}
                isPurchasingFacility={gameState.isPurchasingFacility}
                isGettingStarterMiner={gameState.isGettingStarterMiner}
                isUpgradingFacility={gameState.isUpgradingFacility}
                onTileSelect={handleTileSelect}
                address={address as Address}
                isGridMode={isGridModeActive}
                toggleGridMode={toggleGridMode}
                hasClaimedStarterMiner={gameState.hasClaimedStarterMiner}
                miners={gameState.miners}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <BuyFacilityModal 
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        onConfirm={() => {
          setIsBuyModalOpen(false);
          gameState.refetch?.();
        }}
      />

      {/* Profile Modal */}
      {isConnected && address && (
        <AccountModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          address={address}
          apeBalance={apeBalance}
          bitBalance={bitBalance}
        />
      )}

      {/* Referral Modal */}
      <ReferralModal
        isOpen={isReferralModalOpen}
        onClose={() => setIsReferralModalOpen(false)}
        totalReferrals={gameState.totalReferrals || 0}
        totalBitEarned={gameState.totalBitEarned || '0.00'}
      />

      {/* Miner Purchase Modal */}
      <MinerPurchaseModal
        isOpen={showMinerModal}
        onClose={() => setShowMinerModal(false)}
        onPurchase={handleMinerPurchase}
        selectedTile={selectedTile || undefined}
        isPurchasing={gameState.isPurchasingMiner}
        bitBalance={bitBalance}
        hasClaimedStarterMiner={gameState.hasClaimedStarterMiner}
      />

      {/* Upgrade Facility Modal */}
      <FacilityPurchaseModal 
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onPurchase={() => {
          setIsUpgradeModalOpen(false);
          gameState.upgradeFacility();
        }}
        isPurchasing={gameState.isUpgradingFacility}
      />
    </div>
  );
} 