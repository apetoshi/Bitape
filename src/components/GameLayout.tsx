'use client';

import React, { useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { useMiningData } from '@/hooks/useMiningData';
import Header from '../components/Header';
import { ResourcesPanel } from './ResourcesPanel';
import StatsDisplay from '../components/StatsDisplay';
import { MiningClaimSection } from './MiningClaimSection';
import { RoomVisualization } from './RoomVisualization';
import FacilityPurchaseModal from './FacilityPurchaseModal';
import PWAInstallButton from './PWAInstallButton';

type TabType = 'RESOURCES' | 'SPACE' | 'SELECTED_TILE';

const GameLayout: React.FC = () => {
  const gameState = useGameState();
  const [activeTab, setActiveTab] = useState<TabType>('RESOURCES');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePurchaseFacility = async () => {
    setIsModalOpen(true);
    return Promise.resolve();
  };

  const handleConfirmPurchase = async () => {
    await gameState.purchaseFacility();
    setIsModalOpen(false);
  };

  const handleClaimReward = async () => {
    if (!gameState.claimReward) return;
    await gameState.claimReward();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'RESOURCES':
        return (
          <ResourcesPanel 
            apeBalance={gameState.apeBalance}
            bitBalance={gameState.bitBalance}
            spacesLeft={gameState.spacesLeft}
            gigawattsAvailable={gameState.gigawattsAvailable}
          />
        );
      case 'SPACE':
        return (
          <div className="game-panel bg-[#001420] p-4 md:p-6 rounded-lg border-2 border-banana">
            <div className="space-y-4">
              <p className="font-press-start text-white text-xs md:text-sm">- {gameState.hasFacility ? 'MINING SPACE ACTIVE' : 'NO MINING SPACE'}</p>
              <p className="font-press-start text-white text-xs md:text-sm">- {gameState.spacesLeft} TOTAL SPACES</p>
              <p className="font-press-start text-white text-xs md:text-sm">- {gameState.gigawattsAvailable} TOTAL GIGAWATTS</p>
              {!gameState.hasFacility && (
                <p className="font-press-start text-banana text-xs md:text-sm">- CANT MINE WITHOUT SPACE, BUDDY</p>
              )}
            </div>
            {gameState.hasFacility && (
              <button
                onClick={gameState.upgradeFacility}
                disabled={gameState.isUpgradingFacility}
                className="pixel-button mt-6 w-full font-press-start bg-banana text-royal hover:bg-[#FFE55C] disabled:opacity-50 text-xs md:text-sm"
              >
                {gameState.isUpgradingFacility ? 'UPGRADING...' : 'UPGRADE'}
              </button>
            )}
          </div>
        );
      case 'SELECTED_TILE':
        return (
          <div className="game-panel bg-[#001420] p-4 md:p-6 rounded-lg border-2 border-banana">
            <div className="space-y-4">
              {gameState.hasFacility ? (
                <>
                  <p className="font-press-start text-white text-xs md:text-sm">- FACILITY LEVEL: <span className="text-banana">{gameState.facilityData?.level || 0}</span></p>
                  <p className="font-press-start text-white text-xs md:text-sm">- POWER OUTPUT: <span className="text-banana">{gameState.facilityData?.power || 0}</span> WATTS</p>
                  <p className="font-press-start text-white text-xs md:text-sm">- EFFICIENCY: <span className="text-banana">{((gameState.facilityData?.power || 0) / 20 * 100).toFixed(1)}%</span></p>
                </>
              ) : (
                <p className="font-press-start text-banana text-xs md:text-sm">- NO TILE SELECTED</p>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
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
              onPurchaseFacility={handlePurchaseFacility}
              onGetStarterMiner={gameState.getStarterMiner}
              onUpgradeFacility={gameState.upgradeFacility}
              isPurchasingFacility={gameState.isPurchasingFacility}
              isGettingStarterMiner={gameState.isGettingStarterMiner}
              isUpgradingFacility={gameState.isUpgradingFacility}
              hasClaimedStarterMiner={gameState.hasClaimedStarterMiner}
            />
          </div>
          
          {/* Tab content */}
          {renderTabContent()}
          
          {/* Mining claim section */}
          <MiningClaimSection 
            minedBit={gameState.minedBit}
            onClaimReward={handleClaimReward}
            isClaimingReward={gameState.isClaimingReward}
          />
          
          {/* Stats */}
          <StatsDisplay 
            miningRate={gameState.miningRate}
            hashRate={gameState.hashRate}
            blocksUntilHalving={gameState.blocksUntilHalving}
            networkHashRatePercentage={gameState.networkHashRatePercentage}
            totalNetworkHashRate={gameState.totalNetworkHashRate}
            totalMinedBit={gameState.totalMinedBit || '2,211,552.572'}
            burnedBit={gameState.burnedBit || '1,238,626.5'}
            rewardPerBlock={gameState.rewardPerBlock || '2.5'}
          />
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
            
            <StatsDisplay 
              miningRate={gameState.miningRate}
              hashRate={gameState.hashRate}
              blocksUntilHalving={gameState.blocksUntilHalving}
              networkHashRatePercentage={gameState.networkHashRatePercentage}
              totalNetworkHashRate={gameState.totalNetworkHashRate}
              totalMinedBit={gameState.totalMinedBit || '2,211,552.572'}
              burnedBit={gameState.burnedBit || '1,238,626.5'}
              rewardPerBlock={gameState.rewardPerBlock || '2.5'}
            />
            
            <MiningClaimSection 
              minedBit={gameState.minedBit}
              onClaimReward={handleClaimReward}
              isClaimingReward={gameState.isClaimingReward}
            />
          </div>
          
          {/* Right column */}
          <div className="flex flex-col">
            <RoomVisualization 
              hasFacility={gameState.hasFacility}
              onPurchaseFacility={handlePurchaseFacility}
              onGetStarterMiner={gameState.getStarterMiner}
              onUpgradeFacility={gameState.upgradeFacility}
              isPurchasingFacility={gameState.isPurchasingFacility}
              isGettingStarterMiner={gameState.isGettingStarterMiner}
              isUpgradingFacility={gameState.isUpgradingFacility}
              hasClaimedStarterMiner={gameState.hasClaimedStarterMiner}
            />
          </div>
        </div>
      </main>

      <FacilityPurchaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPurchase={handleConfirmPurchase}
        isPurchasing={gameState.isPurchasingFacility}
      />
      
      <PWAInstallButton />
    </div>
  );
};

export default GameLayout;
