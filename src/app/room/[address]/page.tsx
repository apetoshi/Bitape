'use client';

import React, { useState, useEffect } from 'react';
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
  power: bigint;
  miners: bigint;
  capacity: bigint;
  used: bigint;
  resources: bigint;
  spaces: bigint;
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
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [selectedTile, setSelectedTile] = useState<SelectedTile | null>(null);
  const [showMinerModal, setShowMinerModal] = useState(false);
  const [isGridModeActive, setIsGridModeActive] = useState(false);
  const isMounted = useIsMounted();

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
  const facility = facilityData as FacilityData | undefined;
  
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
  const selectedTileHasMiner = (x: number, y: number): boolean => {
    if (!gameState.hasClaimedStarterMiner) {
      return false;
    }
    
    // Check localStorage for miner position
    if (typeof window !== 'undefined') {
      const savedPositionStr = localStorage.getItem('claimedMinerPosition');
      if (savedPositionStr) {
        try {
          const position = JSON.parse(savedPositionStr);
          return position.x === x && position.y === y;
        } catch (e) {
          console.error("Error parsing miner position:", e);
        }
      }
    }
    
    // Fallback check based on facility miners count
    const hasFacilityWithMiner = 
      gameState.facilityData !== null && 
      gameState.facilityData !== undefined &&
      typeof gameState.facilityData === 'object' &&
      'miners' in gameState.facilityData &&
      gameState.facilityData.miners > 0;
    
    return hasFacilityWithMiner && playerMiners.length > 0;
  };

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
    if (!gameState.hasFacility) {
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
                {facility && !isNaN(Number(facility.capacity)) ? Number(facility.capacity) : 4} SPACES
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="bigcoin-text">GIGAWATTS AVAILABLE</span>
              <span className="bigcoin-value font-press-start">
                {facility && !isNaN(Number(facility.power)) ? Number(facility.power) : 28} GW
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
                {facility && !isNaN(Number(facility.capacity)) ? Number(facility.capacity) : 4} SPACES
              </span>
            </div>
            
            <div className="flex justify-between items-center pb-2">
              <span className="bigcoin-text">TOTAL GIGAWATTS</span>
              <span className="bigcoin-value font-press-start">
                {facility && !isNaN(Number(facility.power)) ? Number(facility.power) : 28} GW
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
        return (
          <div className="p-3">
            {selectedTile ? (
              <div className="space-y-2">
                <div className="text-center pb-2 border-b border-white/20">
                  <h3 className="bigcoin-text mb-1">GRID SPACE X:{selectedTile.x} Y:{selectedTile.y}</h3>
                </div>
                
                {selectedTileHasMiner(selectedTile.x, selectedTile.y) ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center border-b border-white/20 pb-2">
                      <span className="bigcoin-text">MINER TYPE</span>
                      <span className="bigcoin-value font-press-start">BASIC MINER</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/20 pb-2">
                      <span className="bigcoin-text">HASHRATE</span>
                      <span className="bigcoin-value font-press-start">100 H/s</span>
                    </div>
                    <div className="flex justify-between items-center pb-2">
                      <span className="bigcoin-text">POWER USAGE</span>
                      <span className="bigcoin-value font-press-start">1 GW</span>
                    </div>
                    <button
                      className="w-full mt-2 bigcoin-button"
                    >
                      UPGRADE MINER
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-center bigcoin-text opacity-70">This space is empty. Add a miner to start mining BIT.</p>
                    <button
                      onClick={() => setShowMinerModal(true)}
                      className="w-full mt-3 bigcoin-button"
                    >
                      BUY MINER
                    </button>
                  </div>
                )}
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
          <div className="bigcoin-panel mb-5" id="actions-tab-content">
            <div className="flex border-b-2 border-banana">
              <button
                className={`px-3 py-1 flex-1 bigcoin-tab ${activeTab === 'resources' ? 'active' : ''}`}
                onClick={() => setActiveTab('resources')}
              >
                RESOURCES
              </button>
              <button
                className={`px-3 py-1 flex-1 bigcoin-tab ${activeTab === 'space' ? 'active' : ''}`}
                onClick={() => setActiveTab('space')}
              >
                SPACE
              </button>
              <button
                className={`px-3 py-1 flex-1 bigcoin-tab ${activeTab === 'selectedTile' ? 'active' : ''}`}
                onClick={() => setActiveTab('selectedTile')}
              >
                SELECTED TILE
              </button>
            </div>
            {renderTabContent()}
          </div>
        );
        
      case 'stats':
        return (
          <div className="bigcoin-panel mb-5" id="stats-tab-content">
            <div className="flex border-b-2 border-[#FFD700] p-2">
              <button className="bigcoin-text mr-4 bigcoin-value">SIMPLE</button>
              <button className="bigcoin-text opacity-50">/</button>
              <button className="bigcoin-text ml-4 opacity-50">PRO</button>
            </div>
            <div className="p-3 space-y-2 font-press-start">
              <p className="bigcoin-text">- YOU ARE MINING <span className="bigcoin-value">{gameState.miningRate || 0} BIT</span> A DAY</p>
              <p className="bigcoin-text">- YOUR HASH RATE IS <span className="bigcoin-value">{gameState.hashRate || 0} GH/S</span></p>
              <p className="bigcoin-text">- <span className="bigcoin-value">{gameState.blocksUntilHalving || 0} BLOCKS</span> UNTIL NEXT HALVENING</p>
              <p className="bigcoin-text">- YOU HAVE <span className="bigcoin-value">{gameState.networkHashRatePercentage || 0}%</span> OF THE TOTAL NETWORK HASH RATE (<span className="bigcoin-value">{gameState.totalNetworkHashRate || 0} GH/S</span>)</p>
            </div>
          </div>
        );
        
      case 'mining':
        return (
          <div className="bigcoin-panel mb-5" id="mining-tab-content">
            <div className="flex border-b-2 border-[#FFD700] p-2">
              <span className="bigcoin-text bigcoin-value">MINED BIT</span>
            </div>
            <div className="p-3 text-center">
              <p className="bigcoin-text mb-3">YOU HAVE MINED <span className="bigcoin-value">{gameState.minedBit || 0} BIT</span></p>
              <button 
                onClick={() => gameState.claimReward()}
                disabled={gameState.isClaimingReward || !gameState.hasFacility}
                className="w-full bigcoin-button"
              >
                CLAIM MINED BIT
              </button>
            </div>
          </div>
        );
        
      default:
        return <div className="bigcoin-panel">Select a tab</div>;
    }
  };

  const getLocationDescription = (tile: SelectedTile) => {
    if (tile.x === 0 && tile.y === 0) return "NEAR BED";
    if (tile.x === 1 && tile.y === 0) return "NEAR BANANA BOXES";
    if (tile.x === 0 && tile.y === 1) return "NEAR JUKEBOX";
    if (tile.x === 1 && tile.y === 1) return "NEAR CONTROL PANEL";
    return "UNKNOWN LOCATION";
  };

  const handleTileSelect = (x: number, y: number) => {
    setSelectedTile({ x, y });
    setActiveTab('selectedTile');
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
    await gameState.getStarterMiner(selectedTile.x, selectedTile.y);
    setIsBuyModalOpen(false);
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
              facilityData={facility ? {
                power: Number(facility.power),
                level: Number(facility.level),
                miners: Number(facility.miners),
                capacity: Number(facility.capacity),
                used: Number(facility.used),
                resources: Number(facility.resources),
                spaces: Number(facility.spaces)
              } : undefined}
              onPurchaseFacility={handlePurchaseFacility}
              onGetStarterMiner={gameState.getStarterMiner}
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
                facilityData={facility ? {
                  power: Number(facility.power),
                  level: Number(facility.level),
                  miners: Number(facility.miners),
                  capacity: Number(facility.capacity),
                  used: Number(facility.used),
                  resources: Number(facility.resources),
                  spaces: Number(facility.spaces)
                } : undefined}
                onPurchaseFacility={handlePurchaseFacility}
                onGetStarterMiner={gameState.getStarterMiner}
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