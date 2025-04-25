'use client';

import React, { useState, useEffect } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { useMiningData } from '@/hooks/useMiningData';
import Header from '../components/Header';
import { ResourcesPanel } from './ResourcesPanel';
import SpaceTab from './SpaceTab';
import SelectedTileTab from './SelectedTileTab';
import StatsDisplay from '../components/StatsDisplay';
import { MiningClaimSection } from './MiningClaimSection';
import { EnhancedMiningClaimSection } from './EnhancedMiningClaimSection';
import { RoomVisualization } from './RoomVisualization';
import FacilityPurchaseModal from './FacilityPurchaseModal';
import PWAInstallButton from './PWAInstallButton';
import { formatEther } from 'viem';
import { MINERS, MinerType } from '@/config/miners';
import ViewModeToggle, { ViewMode } from './ViewModeToggle';

type TabType = 'RESOURCES' | 'SPACE' | 'SELECTED_TILE';

const GameLayout: React.FC = () => {
  const gameState = useGameState();
  const [activeTab, setActiveTab] = useState<TabType>('RESOURCES');
  const [viewMode, setViewMode] = useState<ViewMode>('SIMPLE');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedTile, setSelectedTile] = useState<{x: number, y: number} | null>(null);
  const [showMinerModal, setShowMinerModal] = useState(false);

  // Helper function to safely convert values to BigInt
  const safeBigInt = (value: any, defaultValue: bigint): bigint => {
    try {
      if (typeof value === 'bigint') return value;
      if (typeof value === 'number') return BigInt(Math.floor(value));
      if (typeof value === 'string') {
        // Remove commas if present
        const cleanValue = value.replace(/,/g, '');
        // Try to convert to number first (to handle scientific notation etc.)
        const numberValue = Number(cleanValue);
        if (!isNaN(numberValue)) {
          return BigInt(Math.floor(numberValue));
        }
      }
      return defaultValue;
    } catch (e) {
      console.error(`Error converting to BigInt: ${value}`, e);
      return defaultValue;
    }
  };

  // Ensure component is mounted before rendering to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePurchaseFacility = async () => {
    setIsModalOpen(true);
    return Promise.resolve();
  };

  const handleConfirmPurchase = async () => {
    await gameState.purchaseFacility();
    setIsModalOpen(false);
  };

  const handleClaimRewards = async () => {
    if (!gameState.claimReward) return;
    await gameState.claimReward();
  };

  // Calculate power capacity and usage
  const powerCapacity = gameState.facilityData?.power || 0;
  const powerUsed = gameState.facilityData?.used || 0;
  const powerPercentage = powerCapacity > 0 ? Math.min(100, (powerUsed / powerCapacity) * 100) : 0;

  // Calculate space capacity and usage
  const spaceCapacity = gameState.facilityData?.capacity || 0;
  const spacesUsed = gameState.facilityData?.miners || 0;
  const spacePercentage = spaceCapacity > 0 ? Math.min(100, (spacesUsed / spaceCapacity) * 100) : 0;

  // Get miner name from type
  const getMinerName = (minerType: number): string => {
    switch (minerType) {
      case 1: return 'BANANA MINER';
      case 2: return 'GORILLA GADGET';
      case 3: return 'MONKEY TOASTER';
      default: return 'UNKNOWN MINER';
    }
  };

  // Handle tile selection from the RoomVisualization component
  const handleTileSelect = (x: number, y: number) => {
    setSelectedTile({ x, y });
    setActiveTab('SELECTED_TILE');
  };

  const renderTabContent = () => {
    if (!mounted) return null;
    
    switch (activeTab) {
      case 'RESOURCES':
        return <ResourcesPanel />;
      case 'SPACE':
        return <SpaceTab />;
      case 'SELECTED_TILE':
        return (
          <SelectedTileTab 
            selectedTile={selectedTile} 
            onShowMinerModal={() => setShowMinerModal(true)} 
          />
        );
      default:
        return null;
    }
  };

  // Toggle between simple and pro view modes
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  return (
    <div className="min-h-screen flex flex-col bg-royal">
      <Header />
      
      <main className="flex-grow p-3 md:p-4 lg:p-6 relative overflow-x-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '16px 16px',
            imageRendering: 'pixelated'
          }}
        />
        
        {/* View Mode Toggle */}
        <div className="flex justify-end mb-3 max-w-7xl mx-auto relative z-10">
          <ViewModeToggle 
            viewMode={viewMode} 
            onChange={handleViewModeChange} 
          />
        </div>
        
        {/* Mobile Layout (1 column stacked) */}
        <div className="mobile-container lg:hidden flex flex-col gap-3 md:gap-4 max-w-7xl mx-auto relative z-10">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {(['RESOURCES', 'SPACE', 'SELECTED_TILE'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pixel-button font-press-start text-xs md:text-sm ${
                  activeTab === tab 
                    ? 'bg-banana text-royal' 
                    : 'bg-transparent text-banana border-2 border-banana hover:bg-banana hover:text-royal'
                }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>
          
          {/* Visualization (First for mobile) */}
          <div className="w-full">
            <RoomVisualization 
              hasFacility={gameState.hasFacility}
              facilityData={gameState.facilityData || undefined}
              onPurchaseFacility={handlePurchaseFacility}
              onGetStarterMiner={gameState.getStarterMiner}
              onUpgradeFacility={gameState.upgradeFacility}
              isPurchasingFacility={gameState.isPurchasingFacility}
              isGettingStarterMiner={gameState.isGettingStarterMiner}
              isUpgradingFacility={gameState.isUpgradingFacility}
              hasClaimedStarterMiner={gameState.hasClaimedStarterMiner}
              onPurchaseMiner={gameState.purchaseMiner}
              miners={gameState.miners}
              address={gameState.address as `0x${string}`}
              onTileSelect={handleTileSelect}
            />
          </div>
          
          {/* Tab content */}
          {renderTabContent()}
          
          {/* Only show full stats in PRO view */}
          {viewMode === 'PRO' && (
            <div className="mt-4 shadow-lg">
              <StatsDisplay 
                miningRateData={gameState.stats ? gameState.stats.miningRate : BigInt(2500000000000000000)}
                hashRateData={gameState.stats ? gameState.stats.hashRate : BigInt(100)}
                blocksUntilHalvingData={safeBigInt(gameState.blocksUntilHalving, BigInt(1800000))}
                networkShareData={gameState.stats ? gameState.stats.networkShare : BigInt(200)}
                totalNetworkHashrateData={safeBigInt(gameState.totalNetworkHashRate, BigInt(5000))}
                totalSupplyData={safeBigInt(
                  gameState.totalMinedBit ? Number(gameState.totalMinedBit) * 10**18 : null, 
                  BigInt(12500000000000000000000)
                )}
                burnedBitData={safeBigInt(
                  gameState.burnedBit ? Number(gameState.burnedBit) * 10**18 : null,
                  BigInt(1238626500000000000000)
                )}
                currentBitApePerBlockData={safeBigInt(
                  gameState.rewardPerBlock ? Number(gameState.rewardPerBlock) * 10**18 : null,
                  BigInt(2500000000000000000)
                )}
                isMiningRateLoading={false}
                isHashRateLoading={false}
                isNetworkShareLoading={false}
                isTotalNetworkHashrateLoading={false}
              />
            </div>
          )}
        </div>
        
        {/* Desktop Layout (2 columns) */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-4 md:gap-6 max-w-7xl mx-auto relative z-10">
          {/* Left column */}
          <div className="flex flex-col space-y-4 md:space-y-6">
            <div className="flex flex-wrap gap-2">
              {(['RESOURCES', 'SPACE', 'SELECTED_TILE'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pixel-button font-press-start text-xs md:text-sm ${
                    activeTab === tab 
                      ? 'bg-banana text-royal' 
                      : 'bg-transparent text-banana border-2 border-banana hover:bg-banana hover:text-royal'
                  }`}
                >
                  {tab.replace('_', ' ')}
                </button>
              ))}
            </div>
            
            {renderTabContent()}
            
            {/* Only show full stats in PRO view */}
            {viewMode === 'PRO' && (
              <div className="mt-4 shadow-lg">
                <StatsDisplay 
                  miningRateData={gameState.stats ? gameState.stats.miningRate : BigInt(2500000000000000000)}
                  hashRateData={gameState.stats ? gameState.stats.hashRate : BigInt(100)}
                  blocksUntilHalvingData={safeBigInt(gameState.blocksUntilHalving, BigInt(1800000))}
                  networkShareData={gameState.stats ? gameState.stats.networkShare : BigInt(200)}
                  totalNetworkHashrateData={safeBigInt(gameState.totalNetworkHashRate, BigInt(5000))}
                  totalSupplyData={safeBigInt(
                    gameState.totalMinedBit ? Number(gameState.totalMinedBit) * 10**18 : null, 
                    BigInt(12500000000000000000000)
                  )}
                  burnedBitData={safeBigInt(
                    gameState.burnedBit ? Number(gameState.burnedBit) * 10**18 : null,
                    BigInt(1238626500000000000000)
                  )}
                  currentBitApePerBlockData={safeBigInt(
                    gameState.rewardPerBlock ? Number(gameState.rewardPerBlock) * 10**18 : null,
                    BigInt(2500000000000000000)
                  )}
                  isMiningRateLoading={false}
                  isHashRateLoading={false}
                  isNetworkShareLoading={false}
                  isTotalNetworkHashrateLoading={false}
                />
              </div>
            )}
          </div>
          
          {/* Right column */}
          <div className="flex flex-col">
            <RoomVisualization 
              hasFacility={gameState.hasFacility}
              facilityData={gameState.facilityData || undefined}
              onPurchaseFacility={handlePurchaseFacility}
              onGetStarterMiner={gameState.getStarterMiner}
              onUpgradeFacility={gameState.upgradeFacility}
              isPurchasingFacility={gameState.isPurchasingFacility}
              isGettingStarterMiner={gameState.isGettingStarterMiner}
              isUpgradingFacility={gameState.isUpgradingFacility}
              hasClaimedStarterMiner={gameState.hasClaimedStarterMiner}
              onPurchaseMiner={gameState.purchaseMiner}
              miners={gameState.miners}
              address={gameState.address as `0x${string}`}
              onTileSelect={handleTileSelect}
            />
          </div>
        </div>
      </main>

      <FacilityPurchaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPurchase={handleConfirmPurchase}
        isPurchasing={gameState.isPurchasingFacility}
        facilityLevel={gameState.facilityData?.level}
      />
      
      <PWAInstallButton />
    </div>
  );
};

export default GameLayout;
