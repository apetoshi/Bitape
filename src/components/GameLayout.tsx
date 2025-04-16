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
          <div className="game-panel bg-[#001420] p-6 rounded-lg border-2 border-banana">
            <div className="space-y-4">
              <p className="font-press-start text-white">- {gameState.hasFacility ? 'MINING SPACE ACTIVE' : 'NO MINING SPACE'}</p>
              <p className="font-press-start text-white">- {gameState.spacesLeft} TOTAL SPACES</p>
              <p className="font-press-start text-white">- {gameState.gigawattsAvailable} TOTAL GIGAWATTS</p>
              {!gameState.hasFacility && (
                <p className="font-press-start text-banana">- CANT MINE WITHOUT SPACE, BUDDY</p>
              )}
            </div>
            {gameState.hasFacility && (
              <button
                onClick={gameState.upgradeFacility}
                disabled={gameState.isUpgradingFacility}
                className="pixel-button mt-6 w-full font-press-start bg-banana text-royal hover:bg-[#FFE55C] disabled:opacity-50"
              >
                {gameState.isUpgradingFacility ? 'UPGRADING...' : 'UPGRADE'}
              </button>
            )}
          </div>
        );
      case 'SELECTED_TILE':
        return (
          <div className="game-panel bg-[#001420] p-6 rounded-lg border-2 border-banana">
            <div className="space-y-4">
              {gameState.hasFacility ? (
                <>
                  <p className="font-press-start text-white">- FACILITY LEVEL: <span className="text-banana">{gameState.facilityData?.level || 0}</span></p>
                  <p className="font-press-start text-white">- POWER OUTPUT: <span className="text-banana">{gameState.facilityData?.power || 0}</span> WATTS</p>
                  <p className="font-press-start text-white">- EFFICIENCY: <span className="text-banana">{((gameState.facilityData?.power || 0) / 20 * 100).toFixed(1)}%</span></p>
                </>
              ) : (
                <p className="font-press-start text-banana">- NO TILE SELECTED</p>
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
      
      <main className="flex-grow p-4 md:p-6 lg:p-8 relative">
        {/* Grid Background */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px',
            imageRendering: 'pixelated'
          }}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto relative z-10">
          {/* Left column */}
          <div className="flex flex-col space-y-6">
            <div className="flex space-x-2">
              {(['RESOURCES', 'SPACE', 'SELECTED_TILE'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pixel-button font-press-start ${
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
    </div>
  );
};

export default GameLayout;
