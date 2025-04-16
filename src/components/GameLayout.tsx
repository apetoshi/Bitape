'use client';

import React, { useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { useMiningData } from '@/hooks/useMiningData';
import Header from '../components/Header';
import ResourcesPanel from '../components/ResourcesPanel';
import StatsDisplay from '../components/StatsDisplay';
import MiningClaimSection from '../components/MiningClaimSection';
import RoomVisualization from '../components/RoomVisualization';
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
          <div className="game-panel">
            <div className="space-y-2">
              <p className="game-text">- {gameState.hasFacility ? 'MINING SPACE ACTIVE' : 'NO MINING SPACE'}</p>
              <p className="game-text">- {gameState.spacesLeft} TOTAL SPACES</p>
              <p className="game-text">- {gameState.gigawattsAvailable} TOTAL GIGAWATTS</p>
              {!gameState.hasFacility && (
                <p className="game-text">- CANT MINE WITHOUT SPACE, BUDDY</p>
              )}
            </div>
            {gameState.hasFacility && (
              <button
                onClick={gameState.upgradeFacility}
                disabled={gameState.isUpgradingFacility}
                className="game-button mt-4"
              >
                UPGRADE
              </button>
            )}
          </div>
        );
      case 'SELECTED_TILE':
        return (
          <div className="game-panel">
            <div className="space-y-2">
              {gameState.hasFacility ? (
                <>
                  <p className="game-text">- FACILITY LEVEL: <span className="game-value">{gameState.facilityData?.level || 0}</span></p>
                  <p className="game-text">- POWER OUTPUT: <span className="game-value">{gameState.facilityData?.power || 0}</span> WATTS</p>
                  <p className="game-text">- EFFICIENCY: <span className="game-value">{((gameState.facilityData?.power || 0) / 20 * 100).toFixed(1)}%</span></p>
                </>
              ) : (
                <p className="game-text">- NO TILE SELECTED</p>
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
      
      <main className="flex-grow p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
          {/* Left column */}
          <div className="flex flex-col space-y-6">
            <div className="flex space-x-2">
              {(['RESOURCES', 'SPACE', 'SELECTED_TILE'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`game-button ${activeTab === tab ? 'bg-banana text-royal' : ''}`}
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
