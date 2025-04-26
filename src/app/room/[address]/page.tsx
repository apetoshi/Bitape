/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAccount, useContractRead, useWriteContract, usePublicClient, useBalance } from 'wagmi';
import { zeroAddress, formatEther, parseEther } from 'viem';
import type { Address } from 'viem';
import { useGameState, type GameState } from '@/hooks/useGameState';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { CONTRACT_ADDRESSES, MAIN_CONTRACT_ABI, BIT_TOKEN_ADDRESS, MINING_CONTROLLER_ABI, BIT_TOKEN_ABI } from '@/config/contracts';
import { MinerType, MINERS } from '@/config/miners';
import { MinerData as MinerDataConfig } from '@/config/miners';
import BuyFacilityModal from '@/components/BuyFacilityModal';
import AccountModal from '@/components/AccountModal';
import ReferralModal from '@/components/ReferralModal';
import AnnouncementsModal from '@/components/AnnouncementsModal';
import TradeModal from '@/components/TradeModal';
import { RoomVisualization } from '@/components/RoomVisualization';
import { ResourcesPanel } from '@/components/ResourcesPanel';
import { SpaceTab } from '@/components';
import { MiningClaimSection } from '@/components/MiningClaimSection';
import { EnhancedMiningClaimSection } from '@/components/EnhancedMiningClaimSection';
import { useIsMounted, useSafeHookValues } from '@/hooks/useIsMounted';
import FacilityPurchaseModal from '@/components/FacilityPurchaseModal';
import MinerPurchaseModal from '@/components/MinerPurchaseModal';
import StatsDisplay from '@/components/StatsDisplay';
import { getMinerMap, addMinerToMap, getMinerAtPosition } from './fixedMinerMap';
import { useFacilityLevel } from '@/components/FacilityLevelProvider';

// Import the PlayerMiner interface from the GameState type
import type { PlayerMiner } from '@/hooks/useGameState';

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

// Define custom hook outside the component
function useMinerData(address: Address | undefined, minerId: string) {
  const { data: minerData } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN as Address,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'miners',
    // Cast the args to the expected type to fix the type error
    args: address ? [BigInt(minerId)] : undefined,
    query: {
      enabled: !!address && !!minerId,
      select: (data: any) => {
        console.log('miner data', data)
        return {
          exists: data[0],
          owner: data[1],
          minerId: data[2],
          facilityId: data[3],
          hashrate: data[4],
          x: data[5],
          y: data[6],
        }
      },
    },
  })

  return { data: minerData }
}

// Add Window interface extension at the top of the file
declare global {
  interface Window {
    __openMinerPurchaseModal?: () => void;
    __showingMinerModal?: boolean;
  }
}

// This disables static generation
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [isAnnouncementsModalOpen, setIsAnnouncementsModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);
  const [isStarterMinerModalOpen, setIsStarterMinerModalOpen] = useState<boolean>(false);
  const [isPurchaseMinerModalOpen, setIsPurchaseMinerModalOpen] = useState<boolean>(false);
  const [selectedTile, setSelectedTile] = useState<SelectedTile | null>(null);
  const [showMinerModal, setShowMinerModal] = useState(false);
  const [isGridModeActive, setIsGridModeActive] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const isMounted = useIsMounted();
  const [statsView, setStatsView] = useState<'simple' | 'pro'>('simple');
  const { writeContract } = useWriteContract();
  const publicClient = usePublicClient();
  const { facilityLevel: correctedFacilityLevel } = useFacilityLevel();
  // Add a state to track when facility upgrades happen for forcing refreshes
  const [facilityUpgradeTimestamp, setFacilityUpgradeTimestamp] = useState<number>(0);
  
  // Add refs for tracking selection time
  const lastSelectionTimeRef = useRef<number>(0);
  
  // Add the refs after other useRef declarations near the top of the component
  // Look for a section with other useRef declarations and add these:
  const hasMinerRef = useRef<boolean | null>(null);
  const initialCheckDoneRef = useRef<boolean>(false);
  
  // Set up global modal opener function only once on component mount
  useEffect(() => {
    // Initialize showMinerModal to false on component mount
    setShowMinerModal(false);
    
    // Create a new variable to prevent modal from auto-opening
    if (typeof window !== 'undefined') {
      window.__showingMinerModal = false;
    }
    
    if (typeof window !== 'undefined') {
      // @ts-ignore - Add global function to open modal, but don't auto-trigger it
      window.__openMinerPurchaseModal = () => {
        // Only open the modal if it's not already showing
        if (typeof window !== 'undefined' && !window.__showingMinerModal) {
          console.log('Global modal opener called - Opening miner purchase modal');
          window.__showingMinerModal = true;
          setShowMinerModal(true);
        } else {
          console.log('Modal is already showing or opening ignored during initial load');
        }
      };
    }
    
    return () => {
      // Clean up on unmount
      if (typeof window !== 'undefined') {
        // @ts-ignore - Remove global function
        window.__openMinerPurchaseModal = undefined;
      }
    };
  }, []); // Empty dependency array means it only runs once on mount
  
  // Get player facility data directly from contract
  const { data: facilityData } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'getPlayerFacility',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address)
    }
  });
  
  // Process the facility data from the contract
  useEffect(() => {
    if (facilityData) {
      console.log('RoomPage - Raw facility data received:', facilityData);
      
      if (Array.isArray(facilityData) && facilityData.length >= 7) {
        console.log('RoomPage - Facility level:', Number(facilityData[0]));
        console.log('RoomPage - Facility max miners:', Number(facilityData[1]));
        console.log('RoomPage - Facility total power:', Number(facilityData[3]));
      }
    }
  }, [facilityData]);
  
  // Direct contract read for miner data - using pagination to get all miners
  const { data: userMinersPaginated } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'getPlayerMinersPaginated',
    args: address ? [address, BigInt(0), BigInt(100)] : undefined, // Get up to 100 miners
    query: {
      enabled: Boolean(address),
      refetchInterval: 60000
    }
  });
  
  // Get BIT token total supply for stats display
  const { data: statsTotalSupplyData } = useContractRead({
    address: CONTRACT_ADDRESSES.BIT_TOKEN,
    abi: BIT_TOKEN_ABI,
    functionName: 'totalSupply',
    query: {
      enabled: true,
    },
  });
  
  // Direct contract read for mobile stats
  const { data: mobileTotalSupplyData } = useContractRead({
    address: CONTRACT_ADDRESSES.BIT_TOKEN,
    abi: BIT_TOKEN_ABI,
    functionName: 'totalSupply',
    query: {
      enabled: true,
    },
  });

  // Get BIT per block from contract
  const { data: bitPerBlockData } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: [...MAIN_CONTRACT_ABI],
    functionName: 'playerBitapePerBlock',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
      refetchInterval: 60000 // Refetch every minute
    }
  });

  // Get player hashrate from contract
  const { data: playerHashrateData } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'playerHashrate',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
      refetchInterval: 30000 // Refetch every 30 seconds
    }
  });

  // Get total network hashrate from contract
  const { data: totalHashrateData } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'totalHashrate',
    query: {
      enabled: true,
      refetchInterval: 30000 // Refetch every 30 seconds
    }
  });

  // Get blocks until next halvening from contract
  const { data: blocksUntilHalveningData } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MINING_CONTROLLER_ABI,
    functionName: 'getBlocksUntilHalving',
    query: {
      enabled: true,
      refetchInterval: 60000 // Refetch every minute
    }
  });

  // Calculate network share percentage
  const networkSharePercentage = useMemo(() => {
    if (!playerHashrateData || !totalHashrateData || BigInt(totalHashrateData) === BigInt(0)) {
      return BigInt(0);
    }
    
    // Calculate (playerHashrate / totalHashrate) * 10000 to get percentage with 2 decimal places
    return (BigInt(playerHashrateData) * BigInt(10000)) / BigInt(totalHashrateData);
  }, [playerHashrateData, totalHashrateData]);

  // Calculate mining rate (BIT per day)
  const miningRatePerDay = useMemo(() => {
    if (!playerHashrateData || !totalHashrateData || BigInt(totalHashrateData) === BigInt(0) || !bitPerBlockData) {
      return BigInt(0);
    }
    
    // User's share of network
    const userShareRatio = (BigInt(playerHashrateData) * BigInt(1000000)) / BigInt(totalHashrateData);
    
    // BIT per block
    const bitPerBlock = BigInt(bitPerBlockData);
    
    // Approximate blocks per day: 6000
    const blocksPerDay = BigInt(6000);
    
    // Calculate: (userShareRatio / 1000000) * bitPerBlock * blocksPerDay
    const bitPerDay = (userShareRatio * bitPerBlock * blocksPerDay) / BigInt(1000000);
    
    return bitPerDay;
  }, [playerHashrateData, totalHashrateData, bitPerBlockData]);
  
  const { data: acquiredStarterMinerData } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'acquiredStarterMiner',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address)
    }
  });

  // Get player miners - currently mocked since not in ABI
  const playerMiners: bigint[] = [];

  // Store miner data in state
  const [minerFullData, setMinerFullData] = useState<Record<string, any>>({});
  const [minerIds, setMinerIds] = useState<string[]>([]);

  // Effect to log miner IDs that need to be fetched and update minerIds state
  useEffect(() => {
    if (!address || !gameState.miners || gameState.miners.length === 0) return;
    
    console.log('Miners found in gameState:');
    const ids: string[] = [];
    
    gameState.miners.forEach(miner => {
      if (miner.id) {
        console.log(`Miner ID: ${miner.id}, Current data:`, miner);
        ids.push(String(miner.id));
      }
    });
    
    // Update the minerIds state for dynamic fetching
    setMinerIds(ids);
  }, [address, gameState.miners]);

  // Function to fetch data for a specific miner ID from the contract
  const fetchMinerData = useCallback(async (minerId: number) => {
    if (!address || !publicClient) return null;
    
    try {
      console.log(`Fetching data for miner ID: ${minerId}`);
      
      // Instead of using getPlayerMiner, use getPlayerMinersPaginated to get all miners
      // and then filter for the specific miner ID
      const data = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.MAIN as Address,
        abi: [
          {
            inputs: [
              { name: 'player', type: 'address' },
              { name: 'startIndex', type: 'uint256' },
              { name: 'size', type: 'uint256' }
            ],
            name: 'getPlayerMinersPaginated',
            outputs: [
              {
                components: [
              { name: 'minerIndex', type: 'uint256' },
                  { name: 'id', type: 'uint256' },
              { name: 'x', type: 'uint256' },
              { name: 'y', type: 'uint256' },
                  { name: 'hashrate', type: 'uint256' },
                  { name: 'powerConsumption', type: 'uint256' },
                  { name: 'cost', type: 'uint256' },
                  { name: 'inProduction', type: 'bool' }
                ],
                name: '',
                type: 'tuple[]'
              }
            ],
            stateMutability: 'view',
            type: 'function'
          }
        ] as const,
        functionName: 'getPlayerMinersPaginated',
        args: [address || zeroAddress, BigInt(0), BigInt(100)] // Get up to 100 miners
      });
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.log(`No miners found for player ${address}`);
        return null;
      }
      
      // Find the specific miner by ID
      const miner = data.find(m => Number(m[1]) === minerId); // m[1] is the miner ID
      
      if (miner) {
        console.log(`Data for miner ID ${minerId}:`, miner);
        return miner;
      } else {
        console.log(`Miner ID ${minerId} not found in the list of ${data.length} miners`);
        return null;
      }
    } catch (error) {
      console.error(`Error fetching miner data for ID ${minerId}:`, error);
      return null;
    }
  }, [address, publicClient]);

  // Function to fetch miner type data directly from the contract
  const fetchMinerTypeData = useCallback(async (minerIndex: number) => {
    console.log(`Fetching data for miner type: ${minerIndex}`);
    if (!publicClient) {
      console.log('No public client available, using fallback data');
      return null;
    }
    
    try {
      // Try to get the data from the contract
      console.log(`Attempting to fetch miner data for index ${minerIndex} from contract`);
      
      // Call the miners function to get the miner type details
      const data = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.MAIN as Address,
        abi: [
          {
            inputs: [
              { name: '', type: 'uint256' }
            ],
            name: 'miners',
            outputs: [
              { name: 'minerIndex', type: 'uint256' },
              { name: 'id', type: 'uint256' },
              { name: 'x', type: 'uint256' },
              { name: 'y', type: 'uint256' },
              { name: 'hashrate', type: 'uint256' },
              { name: 'powerConsumption', type: 'uint256' },
              { name: 'cost', type: 'uint256' },
              { name: 'inProduction', type: 'bool' }
            ],
            stateMutability: 'view',
            type: 'function'
          }
        ] as const,
        functionName: 'miners',
        args: [BigInt(minerIndex)]
      });
      
      console.log(`Contract data for miner type ${minerIndex}:`, data);
      return data;
    } catch (error) {
      console.error(`Error fetching miner type data for index ${minerIndex}:`, error);
      
      // Use fallback data from config if the contract call fails
      console.log(`Using fallback data from MINERS config for index ${minerIndex}`);
      const minerConfig = MINERS[minerIndex];
      if (!minerConfig) {
        console.error(`No fallback data available for miner type ${minerIndex}`);
        return null;
      }
      
      // Create a fallback data structure matching the contract output format
      const fallbackData = [
        BigInt(minerConfig.id), // minerIndex
        BigInt(0),             // id (not important for type data)
        BigInt(0),             // x (not important for type data)
        BigInt(0),             // y (not important for type data)
        BigInt(minerConfig.hashrate), // hashrate
        BigInt(minerConfig.energyConsumption), // powerConsumption
        BigInt(minerConfig.price * 10**18), // cost (convert to wei)
        minerConfig.isActive  // inProduction
      ];
      
      console.log(`Created fallback data for miner type ${minerIndex}:`, fallbackData);
      return fallbackData;
    }
  }, [publicClient]);

  // State to store miner type data from the contract
  const [minerTypeData, setMinerTypeData] = useState<Record<number, any>>({});
  
  // Fetch miner type data for Monkey Toaster (index 3) on mount
  useEffect(() => {
    if (!publicClient || !address) return;
    
    const fetchMonkeyToasterData = async () => {
      try {
        console.log('Attempting to fetch Monkey Toaster data from contract');
        const monkeyToasterData = await fetchMinerTypeData(MinerType.MONKEY_TOASTER);
        
        if (monkeyToasterData) {
          console.log('🐵 Monkey Toaster data retrieved:', monkeyToasterData);
          console.log('🐵 hashrate:', Number(monkeyToasterData[4]));
          console.log('🐵 powerConsumption:', Number(monkeyToasterData[5]));
          console.log('🐵 cost:', Number(monkeyToasterData[6]));
          
          setMinerTypeData(prev => ({
            ...prev,
            [MinerType.MONKEY_TOASTER]: monkeyToasterData
          }));
          
          // Add monkey toaster data to window object for easy inspection in browser console
          if (typeof window !== 'undefined') {
            // @ts-ignore - Add debug object to window
            window.__BITAPE_DEBUG = window.__BITAPE_DEBUG || {};
            // @ts-ignore - Track miners data
            window.__BITAPE_DEBUG.monkeyToasterData = monkeyToasterData;
          }
        } else {
          console.warn('No Monkey Toaster data returned, using default config values');
          
          // Create a fallback using the config data
          const monkeyToasterConfig = MINERS[MinerType.MONKEY_TOASTER];
          const fallbackData = [
            BigInt(monkeyToasterConfig.id), // minerIndex
            BigInt(0),             // id (not important for type data)
            BigInt(0),             // x (not important for type data)
            BigInt(0),             // y (not important for type data)
            BigInt(monkeyToasterConfig.hashrate), // hashrate
            BigInt(monkeyToasterConfig.energyConsumption), // powerConsumption
            BigInt(monkeyToasterConfig.price * 10**18), // cost (convert to wei)
            monkeyToasterConfig.isActive  // inProduction
          ];
          
          setMinerTypeData(prev => ({
            ...prev,
            [MinerType.MONKEY_TOASTER]: fallbackData
          }));
        }
      } catch (error) {
        console.error('Error in fetchMonkeyToasterData:', error);
        
        // Ensure we always have some data even if everything fails
        const monkeyToasterConfig = MINERS[MinerType.MONKEY_TOASTER];
        const emergencyFallbackData = [
          BigInt(monkeyToasterConfig.id), // minerIndex
          BigInt(0),             // id (not important for type data)
          BigInt(0),             // x (not important for type data)
          BigInt(0),             // y (not important for type data)
          BigInt(monkeyToasterConfig.hashrate), // hashrate
          BigInt(monkeyToasterConfig.energyConsumption), // powerConsumption
          BigInt(monkeyToasterConfig.price * 10**18), // cost (convert to wei)
          monkeyToasterConfig.isActive  // inProduction
        ];
        
        setMinerTypeData(prev => ({
          ...prev,
          [MinerType.MONKEY_TOASTER]: emergencyFallbackData
        }));
      }
    };
    
    fetchMonkeyToasterData();
  }, [publicClient, address, fetchMinerTypeData]);
  
  // Add a cache for tile miners to prevent redundant lookups
  const tileMinersCache = useRef(new Map());
  
  // Process the miners data outside of render to ensure consistent hook calls
  // Use stable object references with useMemo
  const getValidatedMiners = useCallback(() => {
    if (!gameState.miners) return [];
    
    return gameState.miners.map(miner => {
      const id = String(miner.id);
      
      // First validate coordinates to ensure they're within bounds and proper numbers
      const x = Number(miner.x);
      const y = Number(miner.y);
      
      // Skip miners with invalid coordinates early
      if (isNaN(x) || isNaN(y) || x < 0 || x > 1 || y < 0 || y > 1) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`Skipping miner ID ${id} with invalid coordinates (${x}, ${y})`);
        }
        return null;
      }
      
      // Check if we have on-chain data for this miner
      if (minerFullData[id]) {
        // Extract values from the object structure
        const minerData = minerFullData[id];
        
        // Access by property names based on the actual structure
        // Fallback to existing values if properties don't exist
        const minerType = Number(minerData.minerIndex || miner.minerType || 0);
        
        const hashrate = Number(minerData.hashrate || miner.hashrate || 0);
        const powerConsumption = Number(minerData.powerConsumption || miner.powerConsumption || 0);
        const cost = Number(minerData.cost || miner.cost || 0);
        const inProduction = Boolean(minerData.inProduction);
        
        // Log the mapping for debugging without excessive info
        if (process.env.NODE_ENV === 'development') {
          console.log(`Mapping miner ID ${id} with type ${minerType} at position (${x}, ${y})`);
        }
        
        const correctedMiner = {
          ...miner,
          minerType,
          x,
          y,
          hashrate,
          powerConsumption,
          cost,
          inProduction
        };
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`Validated miner ID ${id} at (${x}, ${y})`);
        }
        return correctedMiner;
      }
      
      // Otherwise use the existing data with validated coordinates
      return {
        ...miner,
        x,
        y
      };
    })
    .filter(Boolean); // Filter out null entries (invalid miners)
  }, [gameState.miners, minerFullData]);
  
  // Clear the tile miners cache when dependencies change
  useEffect(() => {
    tileMinersCache.current.clear();
  }, [gameState.miners, gameState.hasFacility, gameState.hasClaimedStarterMiner, selectedTile]);

  /**
   * Function to get a miner at a specific tile position
   */
  const getMinerAtTile = useCallback((tileX: number | undefined, tileY: number | undefined): PlayerMiner | null => {
    if (tileX === undefined || tileY === undefined) return null;
    
    // Create a cache key
    const cacheKey = `miner-${tileX}-${tileY}`;
    
    // Return from cache if available
    if (tileMinersCache.current.has(cacheKey)) {
      return tileMinersCache.current.get(cacheKey);
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Looking for miner at tile (${tileX}, ${tileY})`);
    }
    
    // Special case for starter miner
    if ((!gameState.miners || gameState.miners.length === 0) && gameState.hasFacility && gameState.hasClaimedStarterMiner) {
      // Only return a miner for the starter position if hasClaimedStarterMiner is true
      if (tileX === 0 && tileY === 0) {
        const starterMiner = {
          id: '1',
          minerType: 1, // BANANA_MINER
          x: 0,
          y: 0,
          hashrate: 100,
          powerConsumption: 1,
          inProduction: true,
          image: '/banana-miner.gif'
        };
        
        // Cache the result
        tileMinersCache.current.set(cacheKey, starterMiner);
        return starterMiner;
      }
      
      // Cache negative result
      tileMinersCache.current.set(cacheKey, null);
      return null;
    }
    
    if (!gameState.hasFacility) {
      tileMinersCache.current.set(cacheKey, null);
      return null;
    }
    
    // Find miner in validated miners list
    const miners = getValidatedMiners();
    const miner = miners.find(m => 
      Number(m?.x) === Number(tileX) && Number(m?.y) === Number(tileY)
    );
    
    // Cache the result
    tileMinersCache.current.set(cacheKey, miner || null);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Miner found at (${tileX}, ${tileY}):`, miner || 'None');
    }
    
    return miner || null;
  }, [getValidatedMiners, gameState.miners, gameState.hasFacility, gameState.hasClaimedStarterMiner]);

  // Check if the selected tile has a miner - reuse cache from getMinerAtTile
  const selectedTileHasMiner = useCallback((x: number, y: number): boolean => {
    // Create a cache key
    const cacheKey = `has-${x}-${y}`;
    
    // Return from cache if available
    if (tileMinersCache.current.has(cacheKey)) {
      return tileMinersCache.current.get(cacheKey);
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Checking if tile (${x}, ${y}) has a miner`);
    }
    
    // Special case for starter miner
    if ((!gameState.miners || gameState.miners.length === 0) && gameState.hasFacility && gameState.hasClaimedStarterMiner) {
      // Only return true for the starter position if hasClaimedStarterMiner is true
      if (x === 0 && y === 0) {
        tileMinersCache.current.set(cacheKey, true);
        return true;
      }
      
      tileMinersCache.current.set(cacheKey, false);
      return false;
    }
    
    // Get miners
    const miners = getValidatedMiners();
    
    // Check if any miner has these coordinates
    const hasMiner = miners.some(m => 
      m && Number(m.x) === Number(x) && Number(m.y) === Number(y)
    );
    
    // Cache the result
    tileMinersCache.current.set(cacheKey, hasMiner);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Tile (${x}, ${y}) has miner: ${hasMiner}`);
    }
    
    return hasMiner;
  }, [getValidatedMiners, gameState.hasFacility, gameState.hasClaimedStarterMiner, gameState.miners]);

  // Use the updated useMinerData hook directly within the component
  const { data: miner1Data } = useMinerData(address, '1');

  // Log miner data when it changes and store in state
  useEffect(() => {
    if (miner1Data) {
      console.log("Complete on-chain data for miner ID 1:", miner1Data);
      setMinerFullData(prev => ({...prev, 1: miner1Data}));
    }
  }, [miner1Data]);

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

  // Save the user's address to localStorage for use with fixedMinerMap
  useEffect(() => {
    if (address && typeof window !== 'undefined') {
      localStorage.setItem('lastConnectedAddress', address);
      console.log('Saved user address to localStorage:', address);
    }
  }, [address]);

  // Process facility data
  const facility = facilityData as unknown as bigint[] | undefined;
  
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

  // Transform raw facility data into user-friendly format for visualization
  const visualizationFacilityData = {
    // Prioritize correctedFacilityLevel, then the facility index from raw contract data, then fallback to parsed level
    level: correctedFacilityLevel ||                       // First choice: correctedFacilityLevel from provider
          (facility && Number(facility[0])) ||             // Second choice: direct facility index from contract
          parsedFacility?.level ||                         // Third choice: parsed facility level
          1,                                               // Fallback
    miners: parsedFacility?.miners || 0,
    power: typeof parsedFacility?.power !== 'undefined' ? Number(parsedFacility.power) : 0,
    capacity: typeof parsedFacility?.capacity !== 'undefined' ? Number(parsedFacility.capacity) : 0,
    used: typeof parsedFacility?.used !== 'undefined' ? Number(parsedFacility.used) : 0,
    resources: 0,
    spaces: typeof parsedFacility?.capacity !== 'undefined' ? Number(parsedFacility.capacity) : 0,
    // Add timestamp to force refresh after upgrades
    _refreshTimestamp: facilityUpgradeTimestamp
  };

  // Log the sources of facility level to help debugging
  console.log('🏢 Facility levels - correctedFacilityLevel:', correctedFacilityLevel, 
              'contract facility[0]:', facility && Number(facility[0]),
              'parsedFacility.level:', parsedFacility?.level,
              'FINAL visualizationFacilityData.level:', visualizationFacilityData.level);
  
  // Log visualizationFacilityData changes
  useEffect(() => {
    console.log('RoomPage - visualizationFacilityData updated:', visualizationFacilityData);
  }, [visualizationFacilityData]);

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

  // Add a specific hook to check the problematic coordinate (1,0)
  const { data: tileOneZeroOccupied } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: [
      ...MAIN_CONTRACT_ABI,
      {
        inputs: [
          { name: 'player', type: 'address' },
          { name: 'x', type: 'uint256' },
          { name: 'y', type: 'uint256' }
        ],
        name: 'playerOccupiedCoords',
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function'
      }
    ] as const,
    functionName: 'playerOccupiedCoords',
    args: [address || zeroAddress, BigInt(1), BigInt(0)],
    query: {
      enabled: Boolean(address)
    }
  });

  // Create a state to track occupied coordinates
  const [occupiedTiles, setOccupiedTiles] = useState<{x: number, y: number}[]>([]);
  
  // Update occupiedTiles when tileOneZeroOccupied changes
  useEffect(() => {
    // This code depends on tileOneZeroOccupied which is defined earlier in the file
    // If you're seeing a linter error, ensure the contract read for playerOccupiedCoords
    // is properly defined above this effect
    if (tileOneZeroOccupied) {
      console.log('Confirmed tile (1,0) is occupied');
      setOccupiedTiles([{x: 1, y: 0}]);
      
      // Update localStorage to match the blockchain data
      if (typeof window !== 'undefined') {
        localStorage.setItem('claimedMinerPosition', JSON.stringify({x: 1, y: 0}));
        console.log('Updated localStorage with correct miner position (1,0)');
      }
    }
  }, [tileOneZeroOccupied]);

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

  // Simplify the useEffect that forces a UI re-render to prevent infinite loops
  useEffect(() => {
    if (selectedTile) {
      // Debounce selection checks to prevent excessive processing
      const now = Date.now();
      if (now - lastSelectionTimeRef.current < 300) {
        return; // Skip if another selection was made recently
      }
      lastSelectionTimeRef.current = now;
      
      // Instead of calling the function directly which may cause re-renders,
      // make a local variable for the result
      const selectedTileHasAMiner = selectedTileHasMiner ? 
        selectedTileHasMiner(selectedTile.x, selectedTile.y) : false;
      
      // Only update the ref if the value actually changed - don't trigger re-renders
      if (hasMinerRef.current !== selectedTileHasAMiner) {
        hasMinerRef.current = selectedTileHasAMiner;
        console.log(`Selected tile has miner: ${selectedTileHasAMiner}`);
        
        // The page component will now naturally use hasMinerRef.current 
        // in its rendering logic without causing loops
      }
    }
  }, [selectedTile, selectedTileHasMiner]);

  // Optimize the force check after component mount
  useEffect(() => {
    // Only run once, use a ref to track
    if (selectedTile && !initialCheckDoneRef.current) {
      initialCheckDoneRef.current = true;
      console.log('⭐ Delayed check for miner at selected tile');
      
      // No need to cause re-renders here, just update refs if needed
      const hasMiner = selectedTileHasMiner(selectedTile.x, selectedTile.y);
      hasMinerRef.current = hasMiner;
      
      if (hasMiner) {
        const miner = getMinerAtTile(selectedTile.x, selectedTile.y);
        console.log('⭐ Miner details:', miner);
      }
    }
  }, [selectedTile, selectedTileHasMiner, getMinerAtTile]);

  // Force a re-render of the mining tab when miners change
  useEffect(() => {
    if (activeMobileTab === 'mining' && (gameState.miners || gameState.hasClaimedStarterMiner)) {
      // Force a refresh by setting the active tab again
      setActiveMobileTab('mining');
      console.log('Refreshing mining tab due to miner changes');
    }
  }, [gameState.miners, gameState.hasClaimedStarterMiner, activeMobileTab]);

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

  // Add live contract reads for stats display
  const { data: miningRateData, isLoading: isMiningRateLoading } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: [
      ...MAIN_CONTRACT_ABI,
      {
        inputs: [{ name: 'player', type: 'address' }],
        name: 'getPlayerBitPerDay',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
      }
    ] as const,
    functionName: 'getPlayerBitPerDay',
    args: [address || zeroAddress],
    query: {
      enabled: Boolean(address),
      refetchInterval: 30000 // Refresh every 30 seconds
    }
  });
  
  // Log the mining rate data when it changes
  useEffect(() => {
    if (miningRateData) {
      console.log("Player mining rate (BIT per day):", miningRateData);
      // Convert from wei (10^18) to a human-readable format
      const bitPerDay = Number(miningRateData) / 10**18;
      console.log("Player mining rate in BIT:", bitPerDay.toFixed(4));
    }
  }, [miningRateData]);

  const { data: hashRateData, isLoading: isHashRateLoading } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: [
      ...MAIN_CONTRACT_ABI,
      {
        inputs: [{ name: 'player', type: 'address' }],
        name: 'playerHashrate',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
      }
    ] as const,
    functionName: 'playerHashrate',
    args: [address || zeroAddress],
    query: {
      enabled: Boolean(address),
      refetchInterval: 30000 // Refresh every 30 seconds
    }
  });

  // Log the hash rate data when it changes
  useEffect(() => {
    if (hashRateData) {
      console.log("Player hashrate:", hashRateData);
    }
  }, [hashRateData]);

  const { data: networkShareData, isLoading: isNetworkShareLoading } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: [
      ...MAIN_CONTRACT_ABI,
      {
        inputs: [{ name: 'player', type: 'address' }],
        name: 'getPlayerShareOfNetwork',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
      }
    ] as const,
    functionName: 'getPlayerShareOfNetwork',
    args: [address || zeroAddress],
    query: {
      enabled: Boolean(address)
    }
  });

  const { data: totalNetworkHashrateData, isLoading: isTotalNetworkHashrateLoading } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: [
      ...MAIN_CONTRACT_ABI,
      {
        inputs: [],
        name: 'getCurrentHashrate',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
      }
    ] as const,
    functionName: 'getCurrentHashrate',
    args: [],
    query: {
      enabled: Boolean(address)
    }
  });

  // Additional data for PRO mode
  const { data: currentBitApePerBlockData } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: [
      ...MAIN_CONTRACT_ABI,
      {
        inputs: [],
        name: 'getCurrentBitApePerBlock',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
      }
    ] as const,
    functionName: 'getCurrentBitApePerBlock',
    args: [],
    query: {
      enabled: Boolean(address)
    }
  });

  const { data: burnedBitData } = useContractRead({
    address: CONTRACT_ADDRESSES.BIT_TOKEN,
    abi: [
      {
        inputs: [],
        name: 'amtBurned',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
      }
    ] as const,
    functionName: 'amtBurned',
    args: [],
    query: {
      enabled: Boolean(address)
    }
  });

  // Add unclaimed rewards read
  const { data: unclaimedRewardsData, isLoading: isUnclaimedRewardsLoading, refetch: refetchRewards } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: [
      ...MAIN_CONTRACT_ABI,
      {
        inputs: [{ name: 'player', type: 'address' }],
        name: 'pendingRewards',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
      }
    ] as const,
    functionName: 'pendingRewards',
    args: [address || zeroAddress],
    query: {
      enabled: Boolean(address),
      refetchInterval: 30000, // Automatically refresh every 30 seconds
    }
  });

  // These formatting functions will be moved to StatsDisplay.tsx
  // Keep them here for now for mobile view formatting
  const formatNumber = (value: bigint | undefined, decimals = 2, suffix = '', scaleDecimals = 0) => {
    if (value === undefined) return 'Loading...';
    
    // Scale down the value if needed (for values in wei)
    const scaleFactor = scaleDecimals > 0 ? 10 ** scaleDecimals : 1;
    const num = Number(value) / scaleFactor;
    
    if (num >= 1_000_000_000) {
      return `${(num / 1_000_000_000).toFixed(decimals)}B${suffix}`;
    } else if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(decimals)}M${suffix}`;
    } else if (num >= 1_000) {
      return `${(num / 1_000).toFixed(decimals)}K${suffix}`;
    } else {
      return `${num.toFixed(decimals)}${suffix}`;
    }
  };

  // Format a percentage value with optional scaling
  const formatPercentage = (value: bigint | undefined, scaleDecimals = 0) => {
    if (value === undefined) return 'Loading...';
    
    // Scale down the value if needed (for values in wei)
    const scaleFactor = scaleDecimals > 0 ? 10 ** scaleDecimals : 1;
    const percentage = Number(value) / scaleFactor;
    
    return percentage.toFixed(2);
  };

  // Format values for claim section with better handling
  const unclaimedRewards = isUnclaimedRewardsLoading 
    ? 'Loading...'
    : formatNumber(unclaimedRewardsData as bigint, 4, '', 18);
    
  // Calculate a mining rate based on hash rate if the contract doesn't provide one
  const calculateMiningRate = () => {
    // Only calculate if we have the hash rate but mining rate isn't available
    if (
      hashRateData && 
      totalNetworkHashrateData && 
      totalNetworkHashrateData > BigInt(0) &&
      (!miningRateData || miningRateData === BigInt(0))
    ) {
      // Simplified estimate: ~ 2.5 BIT per block * 6000 blocks per day * user's share of network
      const userShare = Number(hashRateData) / Number(totalNetworkHashrateData);
      const bitPerBlock = 2.5; // Approximate
      const blocksPerDay = 6000; // Approximate
      const estimatedRate = userShare * bitPerBlock * blocksPerDay;
      
      console.log(`Estimated mining rate: ${estimatedRate.toFixed(2)} BIT/day (based on ${userShare.toFixed(4)} network share)`);
      return estimatedRate.toFixed(2);
    }
    return null;
  };
  
  // Get our calculated or contract-provided mining rate
  const calculatedMiningRate = calculateMiningRate();
  const displayMiningRate = calculatedMiningRate || formatNumber(miningRateData as bigint, 2, '', 18);

  // Refresh rewards data periodically
  useEffect(() => {
    if (!address) return;
    
    // Initial fetch
    refetchRewards();
    
    // Setup interval to refresh rewards data
    const intervalId = setInterval(() => {
      refetchRewards();
    }, 60000); // Refresh every minute
    
    return () => clearInterval(intervalId);
  }, [address, refetchRewards]);

  // Handle claim rewards using the existing gameState method for simplicity
  const handleClaimRewards = async () => {
    try {
      console.log("Claiming rewards...");
      // Use the gameState's claimRewards method which is already set up correctly
      await gameState.claimReward();
      
      // After claiming, refetch the rewards to update the UI
      setTimeout(() => {
        console.log("Refetching rewards after claim");
        refetchRewards();
      }, 5000); // Allow time for transaction to process
    } catch (error) {
      // Check if this is a user rejection error
      const isUserRejection = 
        error.message?.includes('User rejected') ||
        error.message?.includes('user rejected') ||
        error.message?.includes('denied transaction') ||
        error.code === 4001 ||
        error.message?.includes('User denied');
        
      if (isUserRejection) {
        console.log('User canceled the claim transaction in their wallet');
        // Don't show an alert for user rejection
        return;
      } else {
        console.error('Error claiming rewards:', error);
        // Only show error alert for non-rejection errors
        alert(`Failed to claim rewards: ${error.message || 'Unknown error'}`);
      }
    }
  };

  // Add useEffects for miner post-purchase storing
  useEffect(() => {
    if (typeof window === 'undefined' || !address || !gameState.miners) return;
    
    // Whenever the miners array changes, update our fixed miner map to ensure persistence
    gameState.miners.forEach((miner: any) => {
      console.log('Updating miner map:', miner);
      // Store each miner in our persisted map
      addMinerToMap(
        address,
        { x: Number(miner.x), y: Number(miner.y) },
        Number(miner.type)
      );
    });
  }, [gameState.miners, address]);

  // Utility functions for working with miners
  const getMinerTypeName = (minerType: number) => {
    switch (minerType) {
      case 1: return "BANANA MINER";
      case 2: return "MONKEY TOASTER";
      case 3: return "APEPAD MINI";
      case 4: return "GORILLA GADGET";
      default: return "UNKNOWN";
    }
  };
  
  const getMinerMiningRate = (minerType: number) => {
    // Use contract data for the Monkey Toaster if available
    if (minerType === 2 && minerTypeData[2]) {
      const hashrate = Number(minerTypeData[2][4]); // hashrate is at index 4
      console.log(`Using contract data for MONKEY_TOASTER mining rate: ${hashrate}`);
      return hashrate.toString();
    }
    
    // Fallback mining rates from miners.ts if contract data not available
    switch (minerType) {
      case 1: return "100";   // BANANA_MINER
      case 2: return "180";   // MONKEY_TOASTER
      case 3: return "1000";  // APEPAD_MINI
      case 4: return "5000";  // GORILLA_GADGET
      default: return "0";
    }
  };
  
  const getMinerHashRate = (minerType: number) => {
    // Use contract data for the Monkey Toaster if available
    if (minerType === 2 && minerTypeData[2]) {
      const hashrate = Number(minerTypeData[2][4]); // hashrate is at index 4
      console.log(`Using contract data for MONKEY_TOASTER hashrate: ${hashrate}`);
      return hashrate.toString();
    }
    
    // Fallback hash rates from miners.ts if contract data not available
    switch (minerType) {
      case 1: return "100";   // BANANA_MINER
      case 2: return "180";   // MONKEY_TOASTER
      case 3: return "1000";  // APEPAD_MINI
      case 4: return "5000";  // GORILLA_GADGET
      default: return "0";
    }
  };
  
  const getMinerPowerConsumption = (minerType: number) => {
    // Use contract data for the Monkey Toaster if available
    if (minerType === 2 && minerTypeData[2]) {
      const powerConsumption = Number(minerTypeData[2][5]); // powerConsumption is at index 5
      console.log(`Using contract data for MONKEY_TOASTER power consumption: ${powerConsumption}`);
      return powerConsumption.toString();
    }
    
    // Fallback power consumption values from miners.ts if contract data not available
    switch (minerType) {
      case 1: return "1";    // BANANA_MINER
      case 2: return "6";    // MONKEY_TOASTER
      case 3: return "10";   // APEPAD_MINI
      case 4: return "30";   // GORILLA_GADGET
      default: return "0";
    }
  };
  
  // Add a new function to get the miner cost from contract data
  const getMinerCost = (minerType: number) => {
    // Use contract data for the Monkey Toaster if available
    if (minerType === 2 && minerTypeData[2]) {
      const cost = Number(minerTypeData[2][6]); // cost is at index 6
      console.log(`Using contract data for MONKEY_TOASTER cost: ${cost}`);
      return cost.toString();
    }
    
    // Fallback costs from miners.ts if contract data not available
    switch (minerType) {
      case 1: return "0";    // BANANA_MINER (Free starter miner)
      case 2: return "20";   // MONKEY_TOASTER
      case 3: return "40";   // APEPAD_MINI
      case 4: return "100";  // GORILLA_GADGET
      default: return "0";
    }
  };

  // Force refresh miners data when the component mounts
  useEffect(() => {
    if (hasFacility && gameState.refetch && address) {
      console.log('Refreshing game state to update miners list');
      // Make sure to call refetch to get the latest miner data
      gameState.refetch();
    }
  }, [hasFacility, gameState, address]);

  // Add a new hook to explicitly log miner data from gameState
  useEffect(() => {
    if (gameState.miners && gameState.miners.length > 0) {
      console.log('Current miners from gameState:', gameState.miners);
      
      // Check specifically for miners at certain positions
      const position1_0 = gameState.miners.find(m => Number(m.x) === 1 && Number(m.y) === 0);
      if (position1_0) {
        console.log(`Found miner at position (1,0) with type ${position1_0.minerType}`);
      } else {
        console.log('No miner found at position (1,0)');
      }
    }
  }, [gameState.miners]);

  // Global error handler for contract rejections
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      // Check if this is a contract rejection error
      const errorMessage = event.error?.message || event.message;
      
      if (errorMessage && typeof errorMessage === 'string') {
        const isUserRejection = 
          errorMessage.includes('User rejected') ||
          errorMessage.includes('user rejected') ||
          errorMessage.includes('denied transaction') ||
          errorMessage.includes('User denied');
          
        if (isUserRejection) {
          // Prevent the error from showing in the UI
          event.preventDefault();
          console.log('User canceled a transaction - suppressing error');
        }
      }
    };
    
    // Add global error handler
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', (event) => {
      // Check if this is a promise rejection with a contract error
      const errorMessage = event.reason?.message || (typeof event.reason === 'string' ? event.reason : '');
      
      if (errorMessage && typeof errorMessage === 'string') {
        const isUserRejection = 
          errorMessage.includes('User rejected') ||
          errorMessage.includes('user rejected') ||
          errorMessage.includes('denied transaction') ||
          errorMessage.includes('User denied');
          
        if (isUserRejection) {
          // Prevent the error from showing in the UI
          event.preventDefault();
          console.log('User canceled a transaction promise - suppressing error');
        }
      }
    });
    
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleGlobalError);
    };
  }, []);

  // Add a useEffect to refresh the UI when facility level changes
  useEffect(() => {
    if (parsedFacility && correctedFacilityLevel && gameState) {
      const facilityLevel = parsedFacility?.level || 1;
      
      console.log('Room page - Current facility level:', facilityLevel);
      console.log('Room page - Parsed facility data:', parsedFacility);
      
      // Force a refresh of facilityData-dependent components when the level changes
      if (correctedFacilityLevel > 0 && facilityLevel !== correctedFacilityLevel) {
        console.log(`LEVEL MISMATCH: UI shows ${correctedFacilityLevel}, parsed shows ${facilityLevel}, refreshing`);
        
        // Update the facility upgrade timestamp to trigger re-renders
        setFacilityUpgradeTimestamp(Date.now());
        
        // Refresh game state data
        if (gameState.refetch) {
          console.log('Forcing game state refresh due to facility level change');
          gameState.refetch();
        }
      }
    }
  }, [parsedFacility, correctedFacilityLevel, gameState, setFacilityUpgradeTimestamp]);

  if (!isConnected || !address) {
    return null;
  }

  // Create separate components for the tile content
  function SelectedTileWithMiner({ miner, onOpenMinerModal }: { miner: any, onOpenMinerModal: () => void }) {
    const [showRemoveWarning, setShowRemoveWarning] = useState(false);
    
    const getMinerHashRate = useMemo(() => {
      return (minerType: number) => {
        // Use the correct hashrates from miners.ts
        if (minerType === 1) return '100'; // BANANA_MINER
        if (minerType === 2) return '180'; // MONKEY_TOASTER 
        if (minerType === 3) return '1000'; // APEPAD_MINI
        if (minerType === 4) return '5000'; // GORILLA_GADGET
        return '0';
      };
    }, []);

    const getMinerPowerConsumption = useMemo(() => {
      return (minerType: number) => {
        // Use the correct power consumption values from miners.ts
        if (minerType === 1) return '1'; // BANANA_MINER
        if (minerType === 2) return '6'; // MONKEY_TOASTER
        if (minerType === 3) return '10'; // APEPAD_MINI
        if (minerType === 4) return '30'; // GORILLA_GADGET
        return '0';
      };
    }, []);

    const getMinerCost = useMemo(() => {
      return (minerType: number) => {
        // Use the correct cost values from miners.ts
        if (minerType === 1) return 'FREE'; // BANANA_MINER
        if (minerType === 2) return '20'; // MONKEY_TOASTER
        if (minerType === 3) return '40'; // APEPAD_MINI
        if (minerType === 4) return '100'; // GORILLA_GADGET
        return '0';
      };
    }, []);

    const getMinerTypeName = useMemo(() => {
      return (minerType: number) => {
        // Use the correct miner names from miners.ts
        if (minerType === 1) return 'BANANA MINER'; // BANANA_MINER
        if (minerType === 2) return 'MONKEY TOASTER'; // MONKEY_TOASTER
        if (minerType === 3) return 'APEPAD MINI'; // APEPAD_MINI
        if (minerType === 4) return 'GORILLA GADGET'; // GORILLA_GADGET
        return 'UNKNOWN MINER';
      };
    }, []);
    
    // Handle removing a miner
    const handleRemoveMinerFromTile = async () => {
      if (!selectedTile) return;
      
      try {
        console.log(`Removing miner at position (${selectedTile.x}, ${selectedTile.y})`);
        
        // Get the miner at this position to find its ID
        const miner = getMinerAtTile(selectedTile.x, selectedTile.y);
        
        if (!miner || !miner.id) {
          console.error('Cannot remove miner: no miner ID found');
          alert('Failed to remove miner. Miner data not found.');
          setShowRemoveWarning(false);
          return;
        }
        
        console.log('Found miner to remove:', miner);
        
        // Use the gameState.removeMiner function to call the contract
        if (gameState.removeMiner) {
          const success = await gameState.removeMiner(Number(miner.id));
          
          if (success) {
            console.log('Miner successfully removed via contract call');
            // Close the warning dialog
            setShowRemoveWarning(false);
            
            // Refresh the UI to reflect the change
            if (gameState.refetch) {
              await gameState.refetch();
            }
            
            // Force UI update
            setSelectedTile({...selectedTile});
            
            // Switch to resources tab
            setActiveTab('resources');
          } else {
            console.error('Contract call to remove miner failed');
            alert('Failed to remove miner. Please try again.');
          }
        } else {
          console.error('removeMiner function not available in gameState');
          alert('Cannot remove miner: function not available');
          setShowRemoveWarning(false);
        }
      } catch (error) {
        console.error('Error removing miner:', error);
        alert('Failed to remove miner. Please try again.');
        setShowRemoveWarning(false);
      }
    };

    // Get the correct miner type for image and stats
    const minerType = miner.minerType !== undefined ? 
      Number(miner.minerType) : 
      (miner.type !== undefined ? Number(miner.type) : 0);
                    
    const MINERS = {
      1: { name: 'BANANA MINER', image: '/banana-miner.gif' },
      2: { name: 'MONKEY TOASTER', image: '/monkey-toaster.gif' },
      3: { name: 'APEPAD MINI', image: '/apepad.png' },
      4: { name: 'GORILLA GADGET', image: '/gorilla-gadget.gif' }
    };
    
    const minerConfig = MINERS[minerType as keyof typeof MINERS];
    const minerImage = minerConfig?.image || '/banana-miner.gif';
    const minerName = minerConfig?.name || getMinerTypeName(minerType);
                    
    return (
      <div className="space-y-3">
        <p className="bigcoin-text">MINER DETAILS:</p>
        <div className="flex items-center space-x-2">
          <div className="w-16 h-16 relative">
            <Image
              src={minerImage}
              alt={minerName}
              fill
              className="object-contain"
            />
          </div>
          <div>
            <p className="bigcoin-value">{minerName}</p>
            <p className="bigcoin-text text-xs opacity-80">HASH RATE: {getMinerHashRate(minerType)} GH/s</p>
            <p className="bigcoin-text text-xs opacity-80">ENERGY: {getMinerPowerConsumption(minerType)} WATTS</p>
            {/* Add cost information for miners other than the free starter miner */}
            {minerType !== 1 && (
              <p className="bigcoin-text text-xs opacity-80">COST: {getMinerCost(minerType)} BIT</p>
            )}
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          {/* Remove miner button */}
          <button
            onClick={() => setShowRemoveWarning(true)}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-press-start py-2 px-4 rounded-md transition-colors"
          >
            REMOVE MINER
          </button>
          
          {/* ApeCoin Powered Text */}
          <div className="flex items-center justify-center mt-2">
            <Image 
              src="/apecoin.png" 
              alt="ApeCoin Logo" 
              width={12} 
              height={12} 
              className="mr-1" 
            />
            <span className="text-banana font-press-start text-[8px] sm:text-[10px]">Powered by ApeCoin</span>
          </div>
        </div>
        
        {/* Warning dialog for removing miner */}
        {showRemoveWarning && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-royal border-2 border-banana p-6 max-w-md w-full rounded-md">
              <h3 className="font-press-start text-lg text-banana mb-4 text-center">WARNING</h3>
              <p className="text-white mb-6 text-center">
                Removing this miner will cause you to lose it permanently. You will need to purchase a new miner if you want to place one here again.
              </p>
              <div className="flex justify-between">
                <button
                  onClick={() => setShowRemoveWarning(false)}
                  className="font-press-start px-6 py-2 border-2 border-banana text-banana hover:bg-banana/10 transition-colors"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleRemoveMinerFromTile}
                  className="font-press-start px-6 py-2 bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  REMOVE ANYWAY
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Simple component that opens the miner modal directly
  function DirectMinerPurchaseButton({ text, buttonClass, autoSelectTile }: { 
    text: string, 
    buttonClass?: string, 
    autoSelectTile?: boolean 
  }) {
    const openModal = () => {
      console.log('DirectMinerPurchaseButton clicked - opening modal directly');
      
      try {
        // If autoSelectTile is enabled, find and select an empty tile first
        if (autoSelectTile) {
          // Automatically select the first available empty tile
          const emptyTiles = [[0,0], [0,1], [1,0], [1,1]].filter(
            ([x, y]) => !selectedTileHasMiner(x, y)
          );
          
          if (emptyTiles.length > 0) {
            const [x, y] = emptyTiles[0];
            setSelectedTile({x, y});
            console.log(`Auto-selected empty tile at (${x}, ${y}) for miner purchase`);
          } else {
            console.log('No empty tiles available for new miners');
            alert('No empty slots available. Upgrade your facility to get more slots.');
            return; // Exit early if no tiles available
          }
        }
        
        // Simply set the modal to open
        setShowMinerModal(true);
      } catch (err) {
        console.error('Error opening modal:', err);
      }
    };
    
                    return (
                          <button
        onClick={openModal}
        className={buttonClass || "w-full bg-banana text-royal font-press-start py-2 rounded-md hover:bg-yellow-400 transition-colors"}
                          >
        <span>{text}</span>
        <svg className="w-5 h-5 inline-block ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
                          </button>
    );
  }

  function EmptySelectedTile({ hasFacility, parsedFacility, onOpenMinerModal }: { 
    hasFacility: boolean, 
    parsedFacility: any, 
    onOpenMinerModal: () => void
  }) {
    return (
      <div className="space-y-4">
        <p className="text-center text-sm py-3">No miner at this location.</p>
        
        <div className="bg-dark-blue p-4 rounded-lg">
          <div className="flex flex-col items-center">
            <p className="text-center text-yellow-300 font-press-start text-sm mb-3">
              PLACE A MINER HERE
            </p>
            
            {/* Use the onOpenMinerModal function directly */}
            <button
              onClick={onOpenMinerModal}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-press-start py-3 px-4 rounded-md transition-colors shadow-lg text-center flex items-center justify-center space-x-2"
            >
              <span>BUY MINER</span>
              <svg className="w-5 h-5 inline-block ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            
            {/* Add some space requirements info if available */}
            {parsedFacility && (
              <p className="text-center text-white text-xs mt-3">
                {parsedFacility.capacity - parsedFacility.miners > 0 
                  ? `You have ${parsedFacility.capacity - parsedFacility.miners} mining slots available` 
                  : "No mining slots available. Upgrade facility first."}
              </p>
            )}
            
            {/* ApeCoin Powered Text */}
            <div className="flex items-center justify-center mt-2">
              <Image 
                src="/apecoin.png" 
                alt="ApeCoin Logo" 
                width={12} 
                height={12} 
                className="mr-1" 
              />
              <span className="text-banana font-press-start text-[8px] sm:text-[10px]">Powered by ApeCoin</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function SelectedTileContent({ 
    selectedTile, 
    getMinerAtTile, 
    hasFacility, 
    parsedFacility, 
    onOpenMinerModal,
    getLocationDescription 
  }: { 
    selectedTile: SelectedTile | null, 
    getMinerAtTile: (x: number, y: number) => any, 
    hasFacility: boolean, 
    parsedFacility: any, 
    onOpenMinerModal: () => void,
    getLocationDescription: (tile: SelectedTile) => string 
  }) {
    if (!selectedTile) {
      return (
        <div className="text-center py-4">
          <p className="text-sm">Click a tile to select it</p>
        </div>
      );
    }

    // Debug logging to help diagnose the issue
    console.log(`SelectedTileContent: Checking for miner at (${selectedTile.x}, ${selectedTile.y})`);
    console.log(`hasClaimedStarterMiner status:`, gameState.hasClaimedStarterMiner);
    
    // Validate the function is available
    console.log('getMinerAtTile function available:', Boolean(getMinerAtTile));
    
    // Check miners array directly
    const validMiners = gameState.miners || [];
    console.log('All available miners:', validMiners);
    
    // Log the specific miner at this tile by direct check
    const directMiner = validMiners.find(
      m => Number(m.x) === Number(selectedTile.x) && Number(m.y) === Number(selectedTile.y)
    );
    console.log('Direct miner check result:', directMiner);
    
    // Call the passed function to get miner
    const miner = getMinerAtTile(selectedTile.x, selectedTile.y);
    console.log('SelectedTileContent: Miner found via getMinerAtTile:', miner);
    
    // Final miner check - only show miners if they're actually owned per contract state
    // This overrides any hardcoded data being returned for the starter miner
    const finalMiner = 
      // For starter miner (0,0), only show if hasClaimedStarterMiner is true
      (selectedTile.x === 0 && selectedTile.y === 0) ? 
        (gameState.hasClaimedStarterMiner ? miner : null) : 
        // For other positions, use the direct miner from miners array
        directMiner || miner;
        
    console.log(`Final miner determination for (${selectedTile.x}, ${selectedTile.y}):`, 
                finalMiner ? 'MINER PRESENT' : 'NO MINER');
    
    return (
      <div>
        <div className="border-b border-white/20 pb-2 mb-3">
          <span className="bigcoin-text">LOCATION:</span>
          <span className="bigcoin-value block mt-1">{getLocationDescription(selectedTile)}</span>
          <span className="bigcoin-text text-xs mt-1">POSITION: X: {selectedTile.x}, Y: {selectedTile.y}</span>
        </div>
        
        {finalMiner ? (
          <SelectedTileWithMiner miner={finalMiner} onOpenMinerModal={onOpenMinerModal} />
        ) : (
          <EmptySelectedTile 
            hasFacility={hasFacility} 
            parsedFacility={parsedFacility} 
            onOpenMinerModal={onOpenMinerModal}
          />
        )}
      </div>
    );
  }

  const renderTabContent = () => {
    // Avoid excessive logging to improve performance
    if (process.env.NODE_ENV === 'development') {
      console.log('Page - Rendering tab content with current tab:', activeTab);
    }

    // Memoize tab content to avoid unnecessary renders
    switch (activeTab) {
      case 'resources':
        return <ResourcesPanel />;
      case 'space':
        return (
          <div className="p-3 space-y-3">
            <div className="border-b border-white/20 pb-2">
              <span className="font-press-start text-white text-sm">- YOUR APEROOM</span>
            </div>
            
            {hasFacility && gameState.hasClaimedStarterMiner ? (
              <>
                <div className="border-b border-white/20 pb-2">
                  <span className="font-press-start text-white text-sm">- TOTAL SPACES</span>
                  <span className="font-press-start text-banana text-sm block mt-1 ml-2">
                    {parsedFacility ? parsedFacility.capacity : 4} SPACES
                  </span>
                </div>
                <div className="border-b border-white/20 pb-2">
                  <span className="font-press-start text-white text-sm">- TOTAL GIGAWATTS</span>
                  <span className="font-press-start text-banana text-sm block mt-1 ml-2">
                    {parsedFacility ? parsedFacility.power : 28} GIGAWATTS
                  </span>
                </div>
                <div className="border-b border-white/20 pb-2">
                  <span className="font-press-start text-white text-sm">- FOOD SOURCE</span>
                  <span className="font-press-start text-banana text-sm block mt-1 ml-2">FREE BANANAS 🍌 FROM APETOSHI</span>
                </div>
                {parsedFacility && (
                  <div className="text-center mt-4">
                    <button
                      onClick={handleUpgradeFacility}
                      disabled={gameState.isUpgradingFacility}
                      className="bg-banana text-royal font-press-start text-sm py-2 px-4 rounded-md w-full"
                    >
                      {gameState.isUpgradingFacility ? "UPGRADING..." : "UPGRADE FACILITY"}
                    </button>
                    
                    {/* ApeCoin Powered Text */}
                    <div className="flex items-center justify-center mt-2">
                      <Image 
                        src="/apecoin.png" 
                        alt="ApeCoin Logo" 
                        width={12} 
                        height={12} 
                        className="mr-1" 
                      />
                      <span className="text-banana font-press-start text-[8px] sm:text-[10px]">Powered by ApeCoin</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center py-4">
                <div className="pixel-text text-white text-sm mb-1">NO MINING SPACE</div>
                <div className="font-press-start text-banana text-xs block mb-0.5">0 TOTAL SPACES</div>
                <div className="font-press-start text-banana text-xs block mb-1">0 TOTAL GIGAWATTS</div>
                <div className="pixel-text text-white text-sm mb-2">CANT MINE WITHOUT SPACE, BUDDY</div>
                {hasFacility && !gameState.hasClaimedStarterMiner && (
                  <button
                    onClick={() => gameState.getStarterMiner(0, 0)}
                    className="pixel-text bg-banana text-black hover:bg-banana/90 py-1 px-2 text-xs rounded-md"
                  >
                    Get Starter Miner
                  </button>
                )}
                {!hasFacility && (
                  <button
                    onClick={gameState.purchaseFacility}
                    className="pixel-text bg-banana text-black hover:bg-banana/90 py-1 px-2 text-xs rounded-md"
                  >
                    Buy a Facility
                  </button>
                )}
              </div>
            )}
          </div>
        );
      case 'selectedTile':
        // Only log in development mode
        if (process.env.NODE_ENV === 'development') {
          console.log('Rendering SELECTED TILE tab with selectedTile:', selectedTile);
        }
        
        // Don't render if no tile is selected
        if (!selectedTile) {
          return (
            <div className="p-3 text-center">
              <p className="font-press-start text-white text-xs">No tile selected</p>
              <p className="font-press-start text-white text-[9px] mt-2">Click on a tile in the grid mode to select it</p>
            </div>
          );
        }
        
        // Create a dedicated function to open the modal - defined outside the render cycle
        const openMinerModal = () => {
          // Check if we should handle removing a miner first
          if (selectedTile && selectedTileHasMiner(selectedTile.x, selectedTile.y)) {
            // Additional check for starter miner - only allow removal if actually claimed
            if (selectedTile.x === 0 && selectedTile.y === 0 && !gameState.hasClaimedStarterMiner) {
              if (process.env.NODE_ENV === 'development') {
                console.log('Preventing removal of starter miner that has not been claimed');
              }
              return;
            }
            
            if (process.env.NODE_ENV === 'development') {
              console.log('Opening modal to remove miner at:', selectedTile);
            }
            // Call the global handleRemoveMiner with the current selectedTile
            handleRemoveMiner(selectedTile.x, selectedTile.y);
            return;
          }
          
          // Otherwise show the miner purchase modal if not already visible
          if (!showMinerModal) {
            setShowMinerModal(true);
          }
        };
        
        return (
          <div className="p-3 space-y-2">
            <SelectedTileContent 
              selectedTile={selectedTile}
              getMinerAtTile={getMinerAtTile}
              hasFacility={hasFacility}
              parsedFacility={parsedFacility}
              onOpenMinerModal={openMinerModal}
              getLocationDescription={getLocationDescription}
            />
          </div>
        );
      default:
        return <div>Select a tab</div>;
    }
  };

  // Direct contract read for totalSupply for mobile tab (moved to component level)

  // Define getLocationDescription function to fix the reference error
  const getLocationDescription = (tile: SelectedTile) => {
    if (tile.x === 0 && tile.y === 0) return "NEAR BED";
    if (tile.x === 1 && tile.y === 0) return "NEAR BANANA BOXES";
    if (tile.x === 0 && tile.y === 1) return "NEAR JUKEBOX";
    if (tile.x === 1 && tile.y === 1) return "NEAR CONTROL PANEL";
    return "UNKNOWN LOCATION";
  };

  // Render content based on the active mobile tab
  const renderMobileTabContent = () => {
    switch (activeMobileTab) {
      case 'actions':
        return (
          <div className="p-4">
            <div className="flex border-b-2 border-banana mb-4">
              <button 
                onClick={() => setActiveTab("resources")}
                className={`font-press-start text-xs mr-2 p-2 ${activeTab === "resources" ? "bg-banana text-royal" : "text-white"}`}
              >
                RESOURCES
              </button>
              <button 
                onClick={() => setActiveTab("space")}
                className={`font-press-start text-xs mx-2 p-2 ${activeTab === "space" ? "bg-banana text-royal" : "text-white"}`}
              >
                SPACE
              </button>
              <button 
                onClick={() => setActiveTab("selectedTile")}
                className={`font-press-start text-xs ml-2 p-2 ${activeTab === "selectedTile" ? "bg-banana text-royal" : "text-white"}`}
              >
                SELECTED TILE
              </button>
            </div>
            
            {activeTab === 'resources' && (
              <div className="bg-[#001420]/70 border border-banana p-4 rounded-md space-y-3">
                <div className="flex justify-between items-center border-b border-white/20 pb-2">
                  <span className="font-press-start text-white text-xs">APE:</span> 
                  <span className="font-press-start text-banana text-xs">{gameState.apeBalance || '0.54746334447510442'} APE</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/20 pb-2">
                  <span className="font-press-start text-white text-xs">BIT:</span> 
                  <span className="font-press-start text-banana text-xs">{gameState.bitBalance || '7857.5379464285714285'} BIT</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/20 pb-2">
                  <span className="font-press-start text-white text-xs">SPACES LEFT:</span>
                  <span className="font-press-start text-banana text-xs">
                    {gameState.spacesLeft || '0'} SPACES
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-press-start text-white text-xs">GIGAWATTS AVAILABLE:</span>
                  <span className="font-press-start text-banana text-xs">
                    {gameState.gigawattsAvailable || '0'} GIGAWATTS
                  </span>
                </div>
              </div>
            )}
            
            {activeTab === 'space' && (
              <div className="bg-[#001420]/70 border border-banana p-4 rounded-md space-y-3">
                <div className="border-b border-white/20 pb-2">
                  <span className="font-press-start text-white text-xs">- YOUR APEROOM</span>
                </div>
                
                {hasFacility && gameState.hasClaimedStarterMiner ? (
                  <>
                    <div className="border-b border-white/20 pb-2">
                      <span className="font-press-start text-white text-xs">- TOTAL SPACES</span>
                      <span className="font-press-start text-banana text-xs block mt-1 ml-2">
                        {parsedFacility ? parsedFacility.capacity : 4} SPACES
                      </span>
                    </div>
                    <div className="border-b border-white/20 pb-2">
                      <span className="font-press-start text-white text-xs">- TOTAL GIGAWATTS</span>
                      <span className="font-press-start text-banana text-xs block mt-1 ml-2">
                        {parsedFacility ? parsedFacility.power : 28} GIGAWATTS
                      </span>
                    </div>
                    <div className="border-b border-white/20 pb-2">
                      <span className="font-press-start text-white text-xs">- FOOD SOURCE</span>
                      <span className="font-press-start text-banana text-xs block mt-1 ml-2">FREE BANANAS 🍌 FROM APETOSHI</span>
                    </div>
                    {parsedFacility && (
                      <div className="text-center mt-4">
                        <button
                          onClick={() => gameState.upgradeFacility()}
                          disabled={gameState.isUpgradingFacility}
                          className="bg-banana text-royal font-press-start text-xs py-2 px-4 rounded-md w-full"
                        >
                          {gameState.isUpgradingFacility ? "UPGRADING..." : "UPGRADE FACILITY"}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center py-4">
                    <div className="pixel-text text-white text-sm mb-1">NO MINING SPACE</div>
                    <div className="font-press-start text-banana text-xs block mb-0.5">0 TOTAL SPACES</div>
                    <div className="font-press-start text-banana text-xs block mb-1">0 TOTAL GIGAWATTS</div>
                    <div className="pixel-text text-white text-sm mb-2">CANT MINE WITHOUT SPACE, BUDDY</div>
                    {hasFacility && !gameState.hasClaimedStarterMiner && (
                      <button
                        onClick={() => gameState.getStarterMiner(0, 0)}
                        className="pixel-text bg-banana text-black hover:bg-banana/90 py-1 px-2 text-xs rounded-md"
                      >
                        Get Starter Miner
                      </button>
                    )}
                    {!hasFacility && (
                      <button
                        onClick={gameState.purchaseFacility}
                        className="pixel-text bg-banana text-black hover:bg-banana/90 py-1 px-2 text-xs rounded-md"
                      >
                        Buy a Facility
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'selectedTile' && selectedTile && (
              <div className="bg-[#001420]/70 border border-banana p-4 rounded-md space-y-3">
                <div className="border-b border-white/20 pb-3 mb-1">
                  <span className="font-press-start text-white text-xs">LOCATION:</span>
                  <span className="font-press-start text-banana text-xs block mt-2">
                    {getLocationDescription(selectedTile)}
                  </span>
                  <span className="font-press-start text-white text-xs mt-2 block">
                    POSITION: X: {selectedTile.x}, Y: {selectedTile.y}
                  </span>
                </div>
                
                {selectedTileHasMiner && selectedTileHasMiner(selectedTile.x, selectedTile.y) ? (
                  <div className="space-y-3">
                    <p className="font-press-start text-white text-xs">ACTIVE MINER:</p>
                    {getMinerAtTile && (() => {
                      const miner = getMinerAtTile(selectedTile.x, selectedTile.y);
                      if (!miner) return null;
                      
                      const minerType = Number(miner.minerType || miner.type || 0);
                      return (
                        <>
                          <div className="flex items-start justify-end mt-3">
                            <div className="text-right">
                              <p className="font-press-start text-banana text-xs">{getMinerTypeName ? getMinerTypeName(minerType) : `Type ${minerType}`}</p>
                              <p className="font-press-start text-white text-xs mt-1">
                                {getMinerHashRate ? getMinerHashRate(minerType) : "100"} GH/s · 
                                {getMinerPowerConsumption ? getMinerPowerConsumption(minerType) : "1"} WATTS
                              </p>
                            </div>
                          </div>
                          <div className="mt-4">
                            <button
                              onClick={() => handleRemoveMiner(selectedTile.x, selectedTile.y)}
                              className="w-full bg-red-500 text-white font-press-start text-xs py-2 rounded-md"
                            >
                              REMOVE MINER
                            </button>
                            
                            {/* ApeCoin Powered Text */}
                            <div className="flex items-center justify-center mt-2">
                              <Image 
                                src="/apecoin.png" 
                                alt="ApeCoin Logo" 
                                width={12} 
                                height={12} 
                                className="mr-1" 
                              />
                              <span className="text-banana font-press-start text-[8px] sm:text-[10px]">Powered by ApeCoin</span>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <div>
                    <p className="font-press-start text-white text-xs mb-3">NO MINER INSTALLED</p>
                    {hasFacility && (
                      <div className="mt-4">
                        <button
                          onClick={() => setShowMinerModal(true)}
                          className="w-full bg-banana text-royal font-press-start text-xs py-2 rounded-md"
                        >
                          BUY MINER
                        </button>
                        
                        {/* ApeCoin Powered Text */}
                        <div className="flex items-center justify-center mt-2">
                          <Image 
                            src="/apecoin.png" 
                            alt="ApeCoin Logo" 
                            width={12} 
                            height={12} 
                            className="mr-1" 
                          />
                          <span className="text-banana font-press-start text-[8px] sm:text-[10px]">Powered by ApeCoin</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      case 'stats':
        return (
          <div className="p-4">
            {/* Toggle between Simple and Pro views */}
            <div className="flex border-b-2 border-banana p-2 mb-4">
              <button 
                onClick={() => setStatsView("simple")}
                className={`font-press-start text-xs mr-4 ${statsView === "simple" ? "text-banana font-bold" : "text-white opacity-50"}`}
              >
                SIMPLE
              </button>
              <span className="font-press-start text-white opacity-50">/</span>
              <button 
                onClick={() => setStatsView("pro")}
                className={`font-press-start text-xs ml-4 ${statsView === "pro" ? "text-banana font-bold" : "text-white opacity-50"}`}
              >
                PRO
              </button>
            </div>
            
            {/* Simple Stats View */}
            {statsView === "simple" ? (
              <div className="bg-[#001420]/70 border border-banana p-4 rounded-md space-y-3 font-press-start">
                <p className="text-white text-xs">- YOU ARE MINING <span className="text-banana">
                  {gameState.miningRate || miningRateData ? 
                    formatNumber(miningRateData as bigint, 2, '', 18) : 
                    '0.973'} BIT</span> A DAY</p>
                <p className="text-white text-xs">- YOUR HASH RATE IS <span className="text-banana">
                  {gameState.hashRate || hashRateData ? 
                    formatNumber(hashRateData as bigint, 0, '') : 
                    '2K'} GH/S</span></p>
                <p className="text-white text-xs">- <span className="text-banana">
                  {blocksUntilHalveningData ? 
                    String(blocksUntilHalveningData) : 
                    '2,500,640'} BLOCKS</span> UNTIL NEXT HALVENING</p>
                <p className="text-white text-xs">- YOU HAVE <span className="text-banana">
                  {networkSharePercentage ? 
                    (Number(networkSharePercentage) / 100).toFixed(6) : 
                    '0.000472'}%</span> OF THE TOTAL NETWORK HASH RATE (<span className="text-banana">
                  {totalHashrateData ? 
                    formatNumber(totalHashrateData as bigint, 0, '') : 
                    '483,155,475'} GH/S</span>)</p>
              </div>
            ) : (
              /* Pro Stats View */
              <div className="bg-[#001420]/70 border border-banana p-4 rounded-md space-y-3 font-press-start">
                <p className="text-white text-xs">- <span className="text-banana">
                  {currentBitApePerBlockData !== undefined 
                    ? formatNumber(currentBitApePerBlockData, 2, '', 18) 
                    : '2.5'}</span> TOTAL BIT MINED PER BLOCK</p>
                <p className="text-white text-xs">- <span className="text-banana">
                  {statsTotalSupplyData !== undefined 
                    ? formatNumber(statsTotalSupplyData, 2, '', 18) 
                    : '4,058,118.214'}</span> $BIT HAS EVER BEEN MINED</p>
                <p className="text-white text-xs">- <span className="text-banana">
                  {burnedBitData !== undefined 
                    ? formatNumber(burnedBitData, 2, '', 18) 
                    : '2,402,685.75'}</span> $BIT HAS BEEN BURNED</p>
                <p className="text-white text-xs">- <span className="text-banana">2,102,400 BLOCKS</span> HALVENING PERIOD</p>
              </div>
            )}
          </div>
        );
      case 'mining':
        return (
          <div className="p-4">
            {/* CLAIM MINED $BIT Section - Replace the tabs from actions */}
            <div className="bg-[#001420]/70 border border-banana p-4 rounded-md mb-4 text-center">
              <h3 className="font-press-start text-white text-sm mb-2">YOU HAVE MINED</h3>
              <p className="font-press-start text-banana text-xl mb-3">
                {isUnclaimedRewardsLoading ? 
                 'Loading...' : 
                 `${formatNumber(unclaimedRewardsData as bigint || BigInt(0), 5, '', 18)} $BIT`}
              </p>
              <button
                onClick={handleClaimRewards}
                disabled={gameState.isClaimingReward || (!unclaimedRewardsData || Number(unclaimedRewardsData) <= 0)}
                className="w-full bg-banana text-royal font-press-start text-xs py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                CLAIM MINED $BIT
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const handleTileSelect = useCallback((x: number, y: number) => {
    // Add a debounce to prevent rapid state updates
    if (Date.now() - lastSelectionTimeRef.current < 300) {
      return; // Ignore rapid selections
    }
    lastSelectionTimeRef.current = Date.now();
    
    console.log(`Tile selected at position (${x}, ${y})`);
    
    // Update the selected tile
    setSelectedTile({ x, y });
    
    // Always switch to selected tile tab when a tile is clicked directly
    // But do this in a separate useEffect to avoid setting state during another state update
    setActiveTab('selectedTile');
  }, []);
  
  // Use an effect to handle post-selection actions
  useEffect(() => {
    // Only proceed if there's a selected tile
    if (!selectedTile) return;
    
    console.log(`Selected tile changed to (${selectedTile.x}, ${selectedTile.y})`);
    
    // Any additional logic based on tile selection can go here
  }, [selectedTile]);

  const handlePurchaseFacility = async () => {
    try {
      await gameState.purchaseFacility();
    } catch (error: any) {
      console.error("Error purchasing facility:", error);
    }
  };

  const handleUpgradeFacility = async () => {
    // Open the upgrade modal
    setIsUpgradeModalOpen(true);
  };

  // Handle the actual facility upgrade from the modal
  const handleFacilityUpgradeConfirm = async () => {
    try {
      console.log('Processing facility upgrade');
      
      // Close the modal to prevent multiple submissions
      setIsUpgradeModalOpen(false);
      
      // Call the gameState function to upgrade the facility
      const success = await gameState.upgradeFacility();
      
      if (success) {
        console.log('Facility upgraded successfully, refreshing data');
        
        // Update the timestamp to force a refresh of the visualization
        setFacilityUpgradeTimestamp(Date.now());
        
        // Force refresh all game data
        if (gameState.refetch) {
          try {
            await gameState.refetch();
            console.log('Game state refreshed after facility upgrade');
            
            // Force another refresh after a delay to ensure contract data is updated
            setTimeout(() => {
              if (gameState.refetch) {
                gameState.refetch();
                // Update the timestamp again after the second refresh
                setFacilityUpgradeTimestamp(Date.now());
                console.log('Second refresh completed after facility upgrade');
              }
            }, 3000);
          } catch (refreshError) {
            console.error('Error refreshing game state:', refreshError);
          }
        }
      }
    } catch (error) {
      console.error('Error upgrading facility:', error);
    }
  };

  // Add a wrapper function to fix the type error with gameState.purchaseMiner
  const handlePurchaseMiner = useCallback(async (minerType: MinerType, x: number, y: number): Promise<void> => {
    await gameState.purchaseMiner(minerType, x, y);
  }, [gameState]);

  // Add functionality to remove a miner from a tile
  const handleRemoveMiner = async (x: number, y: number) => {
    if (!confirm(`Are you sure you want to remove the miner at position (${x}, ${y})? This action cannot be undone.`)) {
      return;
    }
    
    try {
      console.log(`Removing miner at position (${x}, ${y})`);
      
      // Get the miner at this position to find its ID
      const miner = getMinerAtTile(x, y);
      
      if (!miner || !miner.id) {
        console.error('Cannot remove miner: no miner ID found');
        alert('Failed to remove miner. Miner data not found.');
        return;
      }
      
      console.log('Found miner to remove:', miner);
      
      // Use the gameState.removeMiner function to call the contract
      if (gameState.removeMiner) {
        const success = await gameState.removeMiner(Number(miner.id));
        
        if (success) {
          console.log('Miner successfully removed via contract call');
          
          // Refresh game state to update UI
          if (gameState.refetch) {
            console.log('Refreshing game state after removing miner');
            await gameState.refetch();
          }
          
          // Force a re-render of the selected tile
          if (selectedTile) {
            setSelectedTile({...selectedTile});
          }
          
          // Switch to resources tab to show updated stats
          setActiveTab('resources');
          
          // Wait a moment and then check again (async refresh might take time)
          setTimeout(() => {
            if (gameState.refetch) {
              gameState.refetch();
            }
          }, 2000);
        } else {
          console.error('Contract call to remove miner failed');
          alert('Failed to remove miner. Please try again.');
        }
      } else {
        console.error('removeMiner function not available in gameState');
        alert('Cannot remove miner: function not available');
      }
    } catch (error) {
      console.error('Error removing miner:', error);
      alert('Failed to remove miner. Please try again.');
    }
  };
  
  const toggleGridMode = () => {
    setIsGridModeActive(!isGridModeActive);
  };

  const handleGetStarterMiner = async () => {
    // If no tile is selected, default to position (0,0) for the starter miner
    const tileToUse = selectedTile || { x: 0, y: 0 };
    
    if (!address) {
      console.error('Cannot claim starter miner: wallet not connected');
      return;
    }
    
    console.log('Claiming starter miner at position:', tileToUse, 'for address:', address);
    
    try {
      // Call the gameState function directly to claim the starter miner
      console.log(`Calling gameState.getStarterMiner(${tileToUse.x}, ${tileToUse.y})`);
      
      // Don't show success message yet - wait for confirmation
      await gameState.getStarterMiner(tileToUse.x, tileToUse.y);
      console.log('Starter miner transaction submitted');
      
      // Force refresh game state to update miners list
      if (gameState.refetch) {
        console.log('Refreshing game state after claiming miner');
        await gameState.refetch();
      }
      
      // No success alert here - it should only be shown after confirmation by the contract
      
      // Force a re-render by updating the selected tile
      setSelectedTile({...tileToUse});
      setActiveTab('selectedTile');
      
      // Wait a moment and then force refresh to ensure UI is updated
      setTimeout(() => {
        if (gameState.refetch) {
          gameState.refetch();
        }
      }, 2000);
    } catch (error) {
      console.error('Error claiming starter miner:', error);
      alert('Failed to claim starter miner. Please try again.');
    }
  };

  // Render statistics panel function
  const renderStatistics = (minerType: number) => {
    return renderMinerStatistics(minerType);
  };

  // Update localStorage to use the correct coordinates for starter miner
  useEffect(() => {
    if (gameState.hasClaimedStarterMiner && typeof window !== 'undefined') {
      // Check if the localStorage has the wrong position
      const savedPositionStr = localStorage.getItem('claimedMinerPosition');
      if (savedPositionStr) {
        const position = JSON.parse(savedPositionStr);
        // If the position is 0,0 but should be 1,0 according to chain data
        if (position.x === 0 && position.y === 0 && tileOneZeroOccupied) {
          console.log('Correcting miner position in localStorage from (0,0) to (1,0)');
          localStorage.setItem('claimedMinerPosition', JSON.stringify({x: 1, y: 0}));
        }
      }
    }
  }, [gameState.hasClaimedStarterMiner, tileOneZeroOccupied]);

  // Handle buying a miner
  const handleBuyMinerSuccess = (
    minerType: number,
    position: { x: number; y: number }
  ) => {
    console.log(`Miner purchase successful! Type: ${minerType}, Position: (${position.x}, ${position.y})`);
    
    // Add to our fixed miner map for persistence
    if (address) {
      addMinerToMap(address, position, minerType);
    }
    
    // Force a refresh of the miners data
    refetchRewards();
  };

  if (!isMounted) {
    return null;
  }

  // Render miner-specific statistics
  const renderMinerStatistics = (minerType: number) => {
    if (minerType === undefined) return null;

    // Get different statistics based on miner type
    // Since these aren't actual properties on the PlayerMiner type, we get them from constants based on miner type

  return (
      <div className="mt-2 space-y-2">
        <div className="flex justify-between">
          <span className="text-xs opacity-80">Hash Rate:</span>
          <span className="text-xs font-bold">{getMinerHashRate(minerType)} GH/s</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs opacity-80">Mining Rate:</span>
          <span className="text-xs font-bold">{getMinerMiningRate(minerType)} BIT/day</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs opacity-80">Power Consumption:</span>
          <span className="text-xs font-bold">{getMinerPowerConsumption(minerType)} GW</span>
        </div>
        {minerType !== MinerType.BANANA_MINER && (
          <div className="flex justify-between">
            <span className="text-xs opacity-80">Cost:</span>
            <span className="text-xs font-bold">{getMinerCost(minerType)} BIT</span>
          </div>
        )}
      </div>
    );
  };

  // Render overall mining statistics from contract
  const renderStatsDisplay = () => {
    return (
      <StatsDisplay 
        miningRateData={miningRatePerDay}
        hashRateData={playerHashrateData as bigint}
        blocksUntilHalvingData={blocksUntilHalveningData as bigint}
        networkShareData={networkSharePercentage}
        totalNetworkHashrateData={totalHashrateData as bigint}
        totalSupplyData={statsTotalSupplyData as bigint} // Use the data from the top-level hook
        burnedBitData={burnedBitData as bigint} // Optional
        currentBitApePerBlockData={bitPerBlockData as bigint}
        isMiningRateLoading={!miningRatePerDay}
        isHashRateLoading={!playerHashrateData}
        isNetworkShareLoading={!networkSharePercentage}
        isTotalNetworkHashrateLoading={!totalHashrateData}
      />
    );
  };

  return (
    <div className="h-screen w-screen overflow-hidden">
      {/* Buy Miner button - fixed position at top right, only shown when no tile is selected */}
      {/* Removed the floating BUY MINER button that was overlapping with profile button */}
      
      {/* Mobile layout (1 column stacked) */}
      <div className="md:hidden flex flex-col h-screen">
        {/* Header */}
        <div className="mobile-dashboard-header flex justify-between items-center">
          <Link href="/">
            <Image
              src="/bitape.png"
              alt="BitApe Logo"
              width={80}
              height={80}
              className="hover:opacity-80 transition-opacity"
              priority
            />
          </Link>
          <div className="relative">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="bigcoin-button"
              aria-label="Menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {isMobileMenuOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-royal border-2 border-banana rounded-lg shadow-lg z-50">
                <div className="p-2">
                  <button 
                    onClick={() => {
                      setIsProfileModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-white hover:bg-banana hover:text-royal font-press-start text-xs transition-colors"
                  >
                    PROFILE
                  </button>
                  <button 
                    onClick={() => {
                      setIsTradeModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-white hover:bg-banana hover:text-royal font-press-start text-xs transition-colors"
                  >
                    TRADE $BIT
                  </button>
                  <button 
                    onClick={() => {
                      setIsAnnouncementsModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-white hover:bg-banana hover:text-royal font-press-start text-xs transition-colors"
                  >
                    ANNOUNCEMENTS
                  </button>
                  <button 
                    onClick={() => {
                      setIsReferralModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-white hover:bg-banana hover:text-royal font-press-start text-xs transition-colors"
                  >
                    REFER A FRIEND
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Main content area - add padding-bottom to account for fixed footer */}
        <div className="mobile-dashboard-content pb-24">
          {/* Mobile tab content first */}
          {renderMobileTabContent()}
          
          {/* Room visualization - This component already handles the BUY FACILITY UI */}
          <div className="bigcoin-panel mt-4">
            <RoomVisualization 
              hasFacility={hasFacility}
              facilityData={visualizationFacilityData}
              onPurchaseFacility={handlePurchaseFacility}
              onGetStarterMiner={handleGetStarterMiner}
              onUpgradeFacility={handleUpgradeFacility}
              onPurchaseMiner={handlePurchaseMiner}
              isPurchasingFacility={gameState.isPurchasingFacility}
              isGettingStarterMiner={gameState.isGettingStarterMiner}
              isUpgradingFacility={gameState.isUpgradingFacility}
              onTileSelect={handleTileSelect}
              address={address as Address}
              isGridMode={isGridModeActive}
              toggleGridMode={toggleGridMode}
              hasClaimedStarterMiner={gameState.hasClaimedStarterMiner}
              miners={gameState.miners}
              selectedTileHasMiner={selectedTileHasMiner}
              getMinerAtTile={getMinerAtTile}
            />
          </div>
        </div>
        
        {/* Bottom tab navigation */}
        <div className="mobile-dashboard-footer">
          {!hasFacility ? (
            <button 
              className="mobile-dashboard-tab active bg-gradient-to-r from-[#F0B90B] to-[#FFDD00] text-black font-bold w-full"
              onClick={handlePurchaseFacility}
            >
              {gameState.isPurchasingFacility ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  PURCHASING...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <span className="text-black font-bold">BUY FACILITY (FREE Miner)</span>
                </span>
              )}
            </button>
          ) : (
            <>
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
            </>
          )}
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
                width={100}
                height={100}
                className="hover:opacity-80 transition-opacity"
                priority
              />
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-2">
            <Link href="/about" className="font-press-start text-sm text-white hover:text-banana">
              ABOUT
            </Link>
            <button 
              onClick={() => setIsTradeModalOpen(true)}
              className="font-press-start text-sm text-white hover:text-banana"
            >
              TRADE $BIT
            </button>
            <button 
              onClick={() => setIsAnnouncementsModalOpen(true)}
              className="font-press-start text-sm text-banana border-2 border-banana px-3 py-1 hover:bg-banana hover:text-royal pixel-button"
            >
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
              {renderStatsDisplay()}
            </div>

            {/* Mining Panel */}
            <div className="bg-royal border-2 border-banana rounded-lg overflow-hidden">
              <EnhancedMiningClaimSection
                minedBit={unclaimedRewards}
                onClaimRewards={handleClaimRewards}
                isClaimingReward={gameState.isClaimingReward}
                miningRate={displayMiningRate}
              />
            </div>
          </div>

          {/* Main Room Area */}
          <div className="col-span-8 flex flex-col items-center justify-center">
            <div className="relative w-[700px] h-[700px] border border-banana overflow-hidden p-1.5 lg:w-[630px] lg:h-[630px]">
              <RoomVisualization 
                hasFacility={hasFacility}
                facilityData={visualizationFacilityData}
                onPurchaseFacility={handlePurchaseFacility}
                onGetStarterMiner={handleGetStarterMiner}
                onUpgradeFacility={handleUpgradeFacility}
                onPurchaseMiner={handlePurchaseMiner}
                isPurchasingFacility={gameState.isPurchasingFacility}
                isGettingStarterMiner={gameState.isGettingStarterMiner}
                isUpgradingFacility={gameState.isUpgradingFacility}
                onTileSelect={handleTileSelect}
                address={address as Address}
                isGridMode={isGridModeActive}
                toggleGridMode={toggleGridMode}
                hasClaimedStarterMiner={gameState.hasClaimedStarterMiner}
                miners={gameState.miners}
                selectedTileHasMiner={selectedTileHasMiner}
                getMinerAtTile={getMinerAtTile}
              />
              
              {/* For desktop view, we'll place the purchase UI directly in the room */}
              {!hasFacility && (
                <div className="absolute inset-0 flex items-center justify-center z-30">
                  <div className="max-w-md p-4 bg-transparent backdrop-blur-sm rounded-lg border border-[#F0B90B] shadow-lg relative overflow-hidden">
                    {/* FREE Miner Badge */}
                    <div className="absolute -right-12 top-6 bg-green-500 text-white font-press-start text-xs py-1 px-8 transform rotate-45 shadow-lg">
                      FREE MINER
                    </div>
                    
                    <p className="font-press-start text-white text-lg mb-4">Start Your Mining Operation Now!</p>
                    
                    {/* Free Miner Promotion */}
                    <div className="bg-[#001420]/60 p-4 rounded-md mb-4 border-2 border-yellow-400 flex items-center">
                      <div className="relative w-24 h-24 mr-4">
                        <Image 
                          src={MINERS[MinerType.BANANA_MINER].image}
                          alt="Free Banana Miner" 
                          width={96}
                          height={96}
                          className="object-contain"
                          unoptimized={true}
                        />
                      </div>
                      <div>
                        <p className="text-yellow-400 font-press-start text-base mb-2">FREE BANANA MINER</p>
                        <p className="text-white font-press-start text-sm mb-1">
                          • {MINERS[MinerType.BANANA_MINER].hashrate} GH/s Hashrate
                        </p>
                        <p className="text-white font-press-start text-sm mb-1">
                          • {MINERS[MinerType.BANANA_MINER].energyConsumption} WATTS Energy
                        </p>
                        <p className="text-banana font-press-start text-sm">
                          • Start mining immediately!
                        </p>
                      </div>
                    </div>
                    
                    {/* Consolidated BUY FACILITY button with ApeCoin logo */}
                    <div className="flex flex-col items-center">
                      <button 
                        onClick={handlePurchaseFacility}
                        disabled={gameState.isPurchasingFacility}
                        className="w-full font-press-start text-base px-8 py-4 bg-gradient-to-r from-[#F0B90B] to-[#FFDD00] text-black hover:opacity-90 transition-opacity rounded-md shadow-md font-bold flex items-center justify-center"
                      >
                        {gameState.isPurchasingFacility ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            PURCHASING...
                          </span>
                        ) : (
                          <div className="flex items-center">
                            <span className="mr-3">BUY FACILITY</span>
                            <div className="flex items-center bg-blue-600 rounded-full px-2 py-1">
                              <span className="text-white mr-1 font-bold">10</span>
                              <div className="w-5 h-5 relative">
                                <Image 
                                  src="/apecoin.png"
                                  alt="APE" 
                                  width={20}
                                  height={20}
                                  className="object-contain"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </button>
                      <p className="text-white text-xs mt-1 opacity-80 text-center">(Initial facility includes a FREE Miner)</p>
                      
                      {/* ApeCoin Powered Text */}
                      <div className="flex items-center justify-center mt-2">
                        <Image 
                          src="/apecoin.png" 
                          alt="ApeCoin Logo" 
                          width={12} 
                          height={12} 
                          className="mr-1" 
                        />
                        <span className="text-banana font-press-start text-[8px] sm:text-[10px]">Powered by ApeCoin</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Footer with ApeChain branding */}
        <footer className="py-2 text-center">
          <div className="flex justify-center items-center">
            <Image 
              src="/ApeChain/Powered by ApeCoin-1.png" 
              alt="Powered by ApeCoin" 
              width={160}
              height={32}
              className="object-contain" 
            />
          </div>
        </footer>
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
        onClose={() => {
          console.log('Closing miner purchase modal');
          setShowMinerModal(false);
          // Reset the flag when modal closes
          if (typeof window !== 'undefined') {
            window.__showingMinerModal = false;
          }
        }}
        onPurchase={(minerType, x, y) => {
          console.log(`Purchasing miner: type=${minerType}, position=(${x}, ${y})`);
          return handlePurchaseMiner(minerType, x, y);
        }}
        selectedTile={selectedTile || undefined}
        isPurchasing={gameState.isPurchasingMiner}
        bitBalance={bitBalance || '0'}
        hasClaimedStarterMiner={gameState.hasClaimedStarterMiner}
        minerTypeData={minerTypeData}
      />

      {/* Upgrade Facility Modal */}
      <FacilityPurchaseModal 
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onPurchase={handleFacilityUpgradeConfirm}
        isPurchasing={gameState.isUpgradingFacility}
        facilityLevel={parsedFacility?.level || 1}
      />

      {/* Trade Modal */}
      <TradeModal
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
      />

      {/* Announcements Modal */}
      <AnnouncementsModal
        isOpen={isAnnouncementsModalOpen}
        onClose={() => setIsAnnouncementsModalOpen(false)}
        onOpenReferralModal={() => {
          setIsAnnouncementsModalOpen(false);
          setIsReferralModalOpen(true);
        }}
      />
    </div>
  );
} 