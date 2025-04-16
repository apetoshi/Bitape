'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAccount, useContractRead } from 'wagmi';
import { Address, zeroAddress } from 'viem';
import { useGameState } from '@/hooks/useGameState';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { CONTRACT_ADDRESSES, MAIN_CONTRACT_ABI } from '@/config/contracts';
import BuyFacilityModal from '@/components/BuyFacilityModal';
import AccountModal from '@/components/AccountModal';
import ReferralModal from '@/components/ReferralModal';
import RoomVisualization from '@/components/RoomVisualization';
import FacilityStats from '@/components/FacilityStats';
import ResourcesPanel from '@/components/ResourcesPanel';
import { useIsMounted } from '@/hooks/useIsMounted';
import { formatEther } from 'viem/utils';
import Modal from '../../../components/Modal';
import FacilityPurchaseModal from '@/components/FacilityPurchaseModal';

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
    if (!playerMiners || playerMiners.length === 0) {
      return false;
    }
    // Implementation would check if any miner exists at the given coordinates
    return false;
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
          <p>Purchase a facility to view details</p>
          <div className="mt-6">
            <button 
              onClick={() => setIsBuyModalOpen(true)}
              className="pixel-button"
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
          <ResourcesPanel
            apeBalance={apeBalance}
            bitBalance={bitBalance}
            spacesLeft={facility && !isNaN(Number(facility.capacity)) ? Number(facility.capacity) : 4}
            gigawattsAvailable={facility && !isNaN(Number(facility.power)) ? Number(facility.power) : 28}
          />
        );
        
      case 'space':
        return (
          <div className="p-2 space-y-3">
            <div className="flex justify-between items-center py-1 border-b border-white/20">
              <span className="text-white/80 text-sm">YOUR MINING ROOM</span>
              <span className="text-white font-semibold text-sm">1</span>
            </div>
            
            <div className="flex justify-between items-center py-1 border-b border-white/20">
              <span className="text-white/80 text-sm">TOTAL SPACES</span>
              <span className="text-white font-semibold text-sm">
                {facility && !isNaN(Number(facility.capacity)) ? Number(facility.capacity) : 4} SPACES
              </span>
            </div>
            
            <div className="flex justify-between items-center py-1">
              <span className="text-white/80 text-sm">TOTAL GIGAWATTS</span>
              <span className="text-white font-semibold text-sm">
                {facility && !isNaN(Number(facility.power)) ? Number(facility.power) : 28} GW
              </span>
            </div>

            <div className="mt-3">
              <button
                onClick={() => setIsUpgradeModalOpen(true)}
                className="w-full pixel-button bg-royal text-white text-xs py-1"
              >
                UPGRADE FACILITY
              </button>
            </div>
          </div>
        );
        
      case 'selectedTile':
        return (
          <div className="p-2">
            {selectedTile ? (
              <div className="space-y-2">
                <div className="text-center">
                  <h3 className="text-base font-press-start font-semibold mb-1">GRID SPACE X:{selectedTile.x} Y:{selectedTile.y}</h3>
                </div>
                
                {selectedTileHasMiner(selectedTile.x, selectedTile.y) ? (
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between items-center py-1 border-b border-white/20">
                      <span className="text-white/80">MINER TYPE</span>
                      <span className="text-white font-semibold">BASIC MINER</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-white/20">
                      <span className="text-white/80">HASHRATE</span>
                      <span className="text-white font-semibold">100 H/s</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-white/80">POWER USAGE</span>
                      <span className="text-white font-semibold">1 GW</span>
                    </div>
                    <button
                      className="w-full mt-2 pixel-button bg-banana text-royal text-xs py-1"
                    >
                      UPGRADE MINER
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-center text-white/80 text-xs">This space is empty. Add a miner to start mining $BIT.</p>
                    <button
                      onClick={() => setShowMinerModal(true)}
                      className="w-full mt-1 pixel-button bg-banana text-royal text-xs py-1"
                    >
                      BUY MINER
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-2">
                <p className="text-sm">Select a tile to view or add miners</p>
                <p className="text-xs text-white/60 mt-1">Click GRID button then select a space</p>
              </div>
            )}
          </div>
        );
        
      default:
        return <div>Select a tab</div>;
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

  const handleMinerPurchase = async (x: number, y: number) => {
    if (!selectedTile) return;
    await gameState.getStarterMiner(x, y);
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
    <div className="h-screen flex flex-col bg-royal overflow-hidden">
      {/* Header - smaller and more compact */}
      <header className="nav-bar flex justify-between items-center px-4 py-2">
        <div className="flex items-center">
          <Image
            src="/bitape-logo.svg"
            alt="BitApe Logo"
            width={24}
            height={24}
            className="mr-2 pixel-art"
          />
          <span className="font-press-start text-banana text-lg">bitape</span>
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
              <p>- YOU ARE MINING {gameState.miningRate || 0} BitApe A DAY</p>
              <p>- YOUR HASH RATE IS {gameState.hashRate || 0} GH/S</p>
              <p>- {gameState.blocksUntilHalving || 0} BLOCKS UNTIL NEXT HALVENING</p>
              <p>- YOU HAVE {gameState.networkHashRatePercentage || 0}% OF THE TOTAL NETWORK HASH RATE ({gameState.totalNetworkHashRate || 0} GH/S)</p>
            </div>
          </div>

          {/* Mining Panel */}
          <div className="bg-royal border-2 border-banana rounded-lg overflow-hidden">
            <div className="p-3 text-center font-press-start">
              <p className="text-white mb-2 text-sm">YOU HAVE MINED {gameState.minedBit || 0} $BIT</p>
              <button 
                onClick={() => gameState.claimReward()}
                disabled={gameState.isClaimingReward || !gameState.hasFacility}
                className="w-full bg-dark-blue text-banana py-1 px-3 text-sm hover:bg-opacity-80 disabled:opacity-50 border-2 border-banana"
              >
                CLAIM MINED $BIT
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
              isPurchasingFacility={gameState.isPurchasingFacility}
              isGettingStarterMiner={gameState.isGettingStarterMiner}
              isUpgradingFacility={gameState.isUpgradingFacility}
              onTileSelect={handleTileSelect}
              address={address as Address}
              isGridMode={isGridModeActive}
              toggleGridMode={toggleGridMode}
            />
          </div>
        </div>
      </div>

      {/* Buy Facility Modal */}
      <BuyFacilityModal 
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        onConfirm={() => {
          setIsBuyModalOpen(false);
          // Refresh the game state after purchase
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
        totalBigEarned={gameState.totalBigEarned || '0.00'}
      />

      {/* Miner Purchase Modal */}
      {showMinerModal && selectedTile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-royal border-2 border-banana p-4 rounded-lg max-w-2xl w-full">
            <h2 className="text-banana font-press-start text-xl mb-4 text-center">BUY MINER</h2>
            
            {/* Tabs */}
            <div className="flex mb-3 border-b border-banana">
              <button className="bg-banana text-royal font-press-start text-xs px-6 py-1 mr-2">
                MINERS
              </button>
              <button className="text-white opacity-50 font-press-start text-xs px-6 py-1 mr-2">
                FLEX
              </button>
              <button className="text-white opacity-50 font-press-start text-xs px-6 py-1">
                SHOP
              </button>
            </div>
            
            <div className="bg-dark-blue p-2 mb-3 rounded">
              <p className="text-white font-press-start text-xs">SELECTED LOCATION: ({selectedTile.x}, {selectedTile.y})</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="border-r border-banana pr-3">
                <div className="bg-dark-blue p-2 mb-2 flex items-center rounded border-l-4 border-banana">
                  <div className="w-8 h-8 mr-2">
                    <Image src="/banana-miner.gif" alt="Banana Miner" width={32} height={32} className="object-contain" />
                  </div>
                  <span className="text-banana font-press-start text-xs">BANANA MINER</span>
                </div>
                <div className="bg-dark-blue p-2 mb-2 flex items-center opacity-50 rounded">
                  <div className="w-8 h-8 mr-2">
                    <Image src="/monkey-toaster.gif" alt="Monkey Toaster" width={32} height={32} className="object-contain" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-banana font-press-start text-xs">MONKEY TOASTER</span>
                    <span className="text-red-400 font-press-start text-[10px]">COMING SOON</span>
                  </div>
                </div>
                <div className="bg-dark-blue p-2 mb-2 flex items-center opacity-50 rounded">
                  <div className="w-8 h-8 mr-2">
                    <Image src="/miner-gorilla.png" alt="Gorilla Gadget" width={32} height={32} className="object-contain" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-banana font-press-start text-xs">GORILLA GADGET</span>
                    <span className="text-red-400 font-press-start text-[10px]">COMING SOON</span>
                  </div>
                </div>
                <div className="bg-dark-blue p-2 mb-2 flex items-center opacity-50 rounded">
                  <div className="w-8 h-8 mr-2">
                    <Image src="/miner-apepad.png" alt="ApePad Mini" width={32} height={32} className="object-contain" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-banana font-press-start text-xs">APEPAD MINI</span>
                    <span className="text-red-400 font-press-start text-[10px]">COMING SOON</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-banana font-press-start mb-3 text-center text-sm">BANANA MINER</h3>
                <div className="w-36 h-36 mx-auto mb-4 relative">
                  <Image 
                    src="/banana-miner.gif" 
                    alt="Banana Miner" 
                    width={144}
                    height={144}
                    className="object-contain" 
                  />
                </div>
                <p className="text-white font-press-start mb-1 text-xs">- HASH RATE: {Number(freeMinerData.hashrate)} GH/S</p>
                <p className="text-white font-press-start mb-1 text-xs">- PRICE: 0 $BIT</p>
                <p className="text-white font-press-start mb-1 text-xs">- ENERGY: 1 WATT</p>
                <p className="text-green-400 font-press-start mt-3 text-center text-xs">YOUR FIRST BANANA MINER IS FREE!</p>
              </div>
            </div>
            
            <div className="flex justify-between mt-4">
              <button 
                className="pixel-button bg-transparent border border-banana text-banana text-xs py-1"
                onClick={() => setShowMinerModal(false)}
              >
                CANCEL
              </button>
              <button 
                className="pixel-button bg-banana text-royal text-xs py-1"
                onClick={() => handleMinerPurchase(selectedTile.x, selectedTile.y)}
                disabled={gameState.isGettingStarterMiner}
              >
                {gameState.isGettingStarterMiner ? 'CONNECTING...' : 'GET FREE MINER'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Facility Modal */}
      <FacilityPurchaseModal 
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onPurchase={() => {
          setIsUpgradeModalOpen(false);
          // Call the upgradeFacility function from gameState
          gameState.upgradeFacility();
        }}
        isPurchasing={gameState.isUpgradingFacility}
      />
    </div>
  );
} 