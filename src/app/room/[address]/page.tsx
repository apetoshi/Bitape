/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAccount, useContractRead, useWriteContract, usePublicClient } from 'wagmi';
import { zeroAddress } from 'viem';
import type { Address } from 'viem';
import { useGameState, type GameState } from '@/hooks/useGameState';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { CONTRACT_ADDRESSES, MAIN_CONTRACT_ABI } from '@/config/contracts';
import { MinerType, MINERS } from '@/config/miners';
import { MinerData as MinerDataConfig } from '@/config/miners';
import BuyFacilityModal from '@/components/BuyFacilityModal';
import AccountModal from '@/components/AccountModal';
import ReferralModal from '@/components/ReferralModal';
import { RoomVisualization } from '@/components/RoomVisualization';
import { ResourcesPanel } from '@/components/ResourcesPanel';
import { MiningClaimSection } from '@/components/MiningClaimSection';
import { EnhancedMiningClaimSection } from '@/components/EnhancedMiningClaimSection';
import { useIsMounted } from '@/hooks/useIsMounted';
import FacilityPurchaseModal from '@/components/FacilityPurchaseModal';
import MinerPurchaseModal from '@/components/MinerPurchaseModal';
import StatsDisplay from '@/components/StatsDisplay';
import { getMinerMap, addMinerToMap, getMinerAtPosition } from './fixedMinerMap';

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
  const { writeContract } = useWriteContract();
  const publicClient = usePublicClient();
  
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
  
  const { data: acquiredStarterMinerData } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'acquiredStarterMiner',
    args: [address || zeroAddress],
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

  // Create a custom function to fetch miner data properly
  const fetchMinerData = useCallback(async (minerId: string | number) => {
    console.log(`Fetching data for miner ID: ${minerId}`);
    if (!publicClient) return null;
    
    try {
      // Call the contract function with the minerId parameter
      const data = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.MAIN as Address,
        abi: [
          {
            inputs: [
              { name: 'player', type: 'address' },
              { name: 'minerId', type: 'uint256' }
            ],
            name: 'getPlayerMiner',
            outputs: [
              { name: 'minerIndex', type: 'uint256' },
              { name: 'x', type: 'uint256' },
              { name: 'y', type: 'uint256' },
              { name: 'id', type: 'uint256' },
              { name: 'hashrate', type: 'uint256' },
              { name: 'powerConsumption', type: 'uint256' },
              { name: 'cost', type: 'uint256' },
              { name: 'inProduction', type: 'bool' }
            ],
            stateMutability: 'view',
            type: 'function'
          }
        ] as const,
        functionName: 'getPlayerMiner',
        args: [address || zeroAddress, BigInt(minerId.toString())]
      });
      
      console.log(`Data for miner ID ${minerId}:`, data);
      return data;
    } catch (error) {
      console.error(`Error fetching miner data for ID ${minerId}:`, error);
      return null;
    }
  }, [address, publicClient]);
  
  // Function to fetch miner type data directly from the contract
  const fetchMinerTypeData = useCallback(async (minerIndex: number) => {
    console.log(`Fetching data for miner type: ${minerIndex}`);
    if (!publicClient) return null;
    
    try {
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
      return null;
    }
  }, [publicClient]);

  // State to store miner type data from the contract
  const [minerTypeData, setMinerTypeData] = useState<Record<number, any>>({});
  
  // Fetch miner type data for Monkey Toaster (index 3) on mount
  useEffect(() => {
    if (!publicClient || !address) return;
    
    const fetchMonkeyToasterData = async () => {
      try {
        const monkeyToasterData = await fetchMinerTypeData(MinerType.MONKEY_TOASTER);
        if (monkeyToasterData) {
          console.log('🐵 Monkey Toaster data from contract:', monkeyToasterData);
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
        }
      } catch (error) {
        console.error('Error fetching Monkey Toaster data:', error);
      }
    };
    
    fetchMonkeyToasterData();
  }, [publicClient, address, fetchMinerTypeData]);

  // Function to fetch data for specific miner IDs
  const fetchSpecificMiners = useCallback(async () => {
    if (!address) return;
    
    // Fetch data for miner ID 1 explicitly
    try {
      console.log("Attempting to fetch on-chain data for miner ID 1");
      await fetchMinerData(1);
    } catch (e) {
      console.error("Error fetching miner 1:", e);
    }
    
    // Fetch data for miner ID 11 explicitly (the one with invalid coordinates)
    try {
      console.log("Attempting to fetch on-chain data for miner ID 11");
      await fetchMinerData(11);
    } catch (e) {
      console.error("Error fetching miner 11:", e);
    }
  }, [address, fetchMinerData]);
  
  // Effect to trigger the explicit fetches when miner IDs change
  useEffect(() => {
    if (minerIds.length > 0) {
      fetchSpecificMiners();
    }
  }, [minerIds, fetchSpecificMiners]);

  // Add special handling for miner with ID 11 that has invalid coordinates
  useEffect(() => {
    if (!gameState.miners || gameState.miners.length === 0) return;
    
    // Find miner with ID 11 
    const miner11 = gameState.miners.find(m => m.id === '11' || m.id === 11);
    
    if (miner11) {
      console.log(`Found miner with ID 11:`, miner11);
      
      // Check if it has invalid coordinates
      if (Number(miner11.y) > 1) { 
        console.warn(`Miner ID 11 has invalid y-coordinate of ${miner11.y}, should be 0 or 1`);
        
        // Get on-chain data to compare
        fetchMinerData(11).then(data => {
          if (data) {
            const correctX = Number(data[1]); // x is at index 1 in the tuple
            const correctY = Number(data[2]); // y is at index 2 in the tuple
            
            console.log(`On-chain coordinates for miner ID 11: (${correctX}, ${correctY})`);
            
            // If coordinates from contract are different from what we have locally
            if (correctX !== Number(miner11.x) || correctY !== Number(miner11.y)) {
              console.warn(`Coordinate mismatch! Local: (${miner11.x}, ${miner11.y}), On-chain: (${correctX}, ${correctY})`);
              
              // Create a corrected version of the miner data - in a production app we'd update state here
              const correctedMiner = {
                ...miner11,
                x: correctX,
                y: correctY
              };
              
              console.log(`Corrected miner ID 11 data:`, correctedMiner);
            }
          }
        });
      }
    }
  }, [gameState.miners, fetchMinerData]);

  // Apply coordinate validation to miners - filter out invalid coordinates
  useEffect(() => {
    if (!gameState.miners || gameState.miners.length === 0) return;
    
    // Check for miners with invalid coordinates
    const invalidMiners = gameState.miners.filter(m => 
      Number(m.x) > 1 || Number(m.y) > 1
    );
    
    if (invalidMiners.length > 0) {
      console.error(`Found ${invalidMiners.length} miners with invalid coordinates:`, invalidMiners);
      
      // Log each invalid miner
      invalidMiners.forEach(m => {
        console.error(`Miner ID=${m.id} has invalid position (${m.x}, ${m.y})`);
      });
    }
  }, [gameState.miners]);

  // Create a modified miners array that uses on-chain data when available
  const getValidatedMiners = useCallback(() => {
    if (!gameState.miners) return [];
    
    return gameState.miners.map(miner => {
      const id = String(miner.id);
      // Check if we have on-chain data for this miner
      if (minerFullData[id]) {
        // Extract values from tuple - index 0 is minerIndex from contract
        const [minerType, x, y, minerId, hashrate, powerConsumption, cost, inProduction] = minerFullData[id];
        
        // IMPORTANT: On-chain minerIndex starts at 1, but MINERS config might be 0-indexed
        // Convert contract minerIndex to frontend MinerType enum
        // MinerType.BANANA_MINER = 1 in contract but might be 0 in frontend
        const mappedMinerType = Number(minerType);
        
        // Log the mapping for debugging
        console.log(`Mapping contract minerIndex ${minerType} to frontend type ${mappedMinerType} for miner ID ${id}`);
        console.log(`Full on-chain data: [${minerType}, ${x}, ${y}, ${minerId}, ${hashrate}, ${powerConsumption}, ${cost}, ${inProduction}]`);
        
        // Use corrected on-chain coordinates
        const correctedMiner = {
          ...miner,
          minerType: mappedMinerType,
          x: Number(x),
          y: Number(y),
          hashrate: Number(hashrate),
          powerConsumption: Number(powerConsumption),
          cost: Number(cost),
          inProduction: Boolean(inProduction)
        };
        
        console.log(`Corrected miner ID ${id} data:`, correctedMiner);
        return correctedMiner;
      }
      
      // Otherwise use the existing data
      return miner;
    })
    // Filter out miners with invalid coordinates
    .filter(m => {
      const x = Number(m.x);
      const y = Number(m.y);
      const valid = x <= 1 && y <= 1;
      if (!valid) {
        console.warn(`Filtering out miner ID ${m.id} with invalid coordinates (${x}, ${y})`);
      }
      return valid;
    });
  }, [gameState.miners, minerFullData]);

  /**
   * Function to get a miner at a specific tile position
   */
  const getMinerAtTile = useCallback((tileX: number | undefined, tileY: number | undefined): PlayerMiner | null => {
    if (tileX === undefined || tileY === undefined) return null;
    
    console.log(`Looking for miner at tile (${tileX}, ${tileY})`);
    
    const miner = getValidatedMiners().find(m => 
      Number(m.x) === Number(tileX) && Number(m.y) === Number(tileY)
    );
    
    console.log(`Miner found at (${tileX}, ${tileY}):`, miner);
    return miner || null;
  }, [getValidatedMiners]);

  // Change this to a proper custom hook rather than a function that calls hooks
  function useMinerData(minerId: string) {
    return useContractRead({
      address: CONTRACT_ADDRESSES.MAIN,
      abi: [
        ...MAIN_CONTRACT_ABI,
        {
          inputs: [
            { name: 'player', type: 'address' },
            { name: 'minerId', type: 'uint256' }
          ],
          name: 'getPlayerMiner',
          outputs: [
            { name: 'minerIndex', type: 'uint256' },
            { name: 'x', type: 'uint256' },
            { name: 'y', type: 'uint256' },
            { name: 'id', type: 'uint256' },
            { name: 'hashrate', type: 'uint256' },
            { name: 'powerConsumption', type: 'uint256' },
            { name: 'cost', type: 'uint256' },
            { name: 'inProduction', type: 'bool' }
          ],
          stateMutability: 'view',
          type: 'function'
        }
      ] as const,
      functionName: 'getPlayerMiner',
      args: [address || zeroAddress, BigInt(minerId)],
      query: {
        enabled: Boolean(address) && Boolean(minerId)
      }
    });
  }

  // Need to pre-define hooks for specific IDs we've seen in logs
  const { data: miner1Data } = useMinerData('1');
  const { data: miner11Data } = useMinerData('11');

  // Log miner data when it changes and store in state
  useEffect(() => {
    if (miner1Data) {
      console.log("Complete on-chain data for miner ID 1:", miner1Data);
      setMinerFullData(prev => ({...prev, 1: miner1Data}));
    }
  }, [miner1Data]);

  useEffect(() => {
    if (miner11Data) {
      console.log("Complete on-chain data for miner ID 11:", miner11Data);
      setMinerFullData(prev => ({...prev, 11: miner11Data}));
    }
  }, [miner11Data]);

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
  const visualizationFacilityData = {
    level: parsedFacility?.level || 0,
    miners: parsedFacility?.miners || 0,
    power: typeof parsedFacility?.power !== 'undefined' ? Number(parsedFacility.power) : 0,
    capacity: typeof parsedFacility?.capacity !== 'undefined' ? Number(parsedFacility.capacity) : 0,
    used: typeof parsedFacility?.used !== 'undefined' ? Number(parsedFacility.used) : 0,
    resources: 0,
    spaces: typeof parsedFacility?.capacity !== 'undefined' ? Number(parsedFacility.capacity) : 0
  };

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

  /**
   * Function to check if a tile has a miner
   */
  const selectedTileHasMiner = useCallback((tileX: number | undefined, tileY: number | undefined): boolean => {
    // Special check for known miner positions - mainly for debugging
    if (tileX === 0 && tileY === 0) {
      console.log("Special check for starter miner at position (0,0)");
    }
    
    // First check localStorage
    if (typeof window !== 'undefined' && tileX !== undefined && tileY !== undefined) {
      const minerData = getMinerAtPosition(address as string, tileX, tileY);
      if (minerData) {
        console.log(`Found ${minerData.type === MinerType.MONKEY_TOASTER ? 'Monkey Toaster' : 'Banana Miner'} at position (${tileX},${tileY}) from localStorage!`);
      }
    }
    
    // Check using validated miners that have correct on-chain coordinates
    const validatedMiners = getValidatedMiners();
    const hasMiner = validatedMiners.some(m => 
      Number(m.x) === Number(tileX) && Number(m.y) === Number(tileY)
    );
    
    console.log(`Has miner at (${tileX},${tileY}): ${hasMiner}`);
    return hasMiner;
  }, [address, getValidatedMiners]);

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

  // Special check for position (0,0) which is commonly used for starter miners
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

  const { data: blocksUntilHalvingData } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: [
      ...MAIN_CONTRACT_ABI,
      {
        inputs: [],
        name: 'getBlocksUntilNextHalving',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
      }
    ] as const,
    functionName: 'getBlocksUntilNextHalving',
    args: [],
    query: {
      enabled: Boolean(address)
    }
  });

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

  const { data: totalSupplyData } = useContractRead({
    address: CONTRACT_ADDRESSES.BIT_TOKEN,
    abi: [
      {
        inputs: [],
        name: 'totalSupply',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
      }
    ] as const,
    functionName: 'totalSupply',
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
        name: 'getCurrentRewards',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
      }
    ] as const,
    functionName: 'getCurrentRewards',
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
      // Use the gameState's claimRewardsmethod which is already set up correctly
      await gameState.claimReward();
      
      // After claiming, refetch the rewards to update the UI
      setTimeout(() => {
        console.log("Refetching rewards after claim");
        refetchRewards();
      }, 5000); // Allow time for transaction to process
    } catch (error) {
      console.error('Error claiming rewards:', error);
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
    const minerNames = {
      [MinerType.BANANA_MINER]: "BANANA MINER",
      [MinerType.MONKEY_TOASTER]: "MONKEY TOASTER",
      [MinerType.GORILLA_GADGET]: "GORILLA GADGET",
      [MinerType.APEPAD_MINI]: "APEPAD MINI"
    };
    return minerNames[minerType as keyof typeof minerNames] || "UNKNOWN";
  };
  
  const getMinerMiningRate = (minerType: number) => {
    // Use contract data for the Monkey Toaster if available
    if (minerType === MinerType.MONKEY_TOASTER && minerTypeData[MinerType.MONKEY_TOASTER]) {
      const hashrate = Number(minerTypeData[MinerType.MONKEY_TOASTER][4]); // hashrate is at index 4
      console.log(`Using contract data for MONKEY_TOASTER mining rate: ${hashrate}`);
      return hashrate.toString();
    }
    
    const miningRates = {
      [MinerType.BANANA_MINER]: "100",
      [MinerType.MONKEY_TOASTER]: "1000", // Fallback if contract data not available
      [MinerType.GORILLA_GADGET]: "750",
      [MinerType.APEPAD_MINI]: "2000"
    };
    return miningRates[minerType as keyof typeof miningRates] || "0";
  };
  
  const getMinerHashRate = (minerType: number) => {
    // Use contract data for the Monkey Toaster if available
    if (minerType === MinerType.MONKEY_TOASTER && minerTypeData[MinerType.MONKEY_TOASTER]) {
      const hashrate = Number(minerTypeData[MinerType.MONKEY_TOASTER][4]); // hashrate is at index 4
      console.log(`Using contract data for MONKEY_TOASTER hashrate: ${hashrate}`);
      return hashrate.toString();
    }
    
    const hashRates = {
      [MinerType.BANANA_MINER]: "100",
      [MinerType.MONKEY_TOASTER]: "1000", // Fallback if contract data not available
      [MinerType.GORILLA_GADGET]: "750",
      [MinerType.APEPAD_MINI]: "2000"
    };
    return hashRates[minerType as keyof typeof hashRates] || "0";
  };
  
  const getMinerPowerConsumption = (minerType: number) => {
    // Use contract data for the Monkey Toaster if available
    if (minerType === MinerType.MONKEY_TOASTER && minerTypeData[MinerType.MONKEY_TOASTER]) {
      const powerConsumption = Number(minerTypeData[MinerType.MONKEY_TOASTER][5]); // powerConsumption is at index 5
      console.log(`Using contract data for MONKEY_TOASTER power consumption: ${powerConsumption}`);
      return powerConsumption.toString();
    }
    
    const powerConsumptions = {
      [MinerType.BANANA_MINER]: "1",
      [MinerType.GORILLA_GADGET]: "5",
      [MinerType.MONKEY_TOASTER]: "10", // Fallback if contract data not available
      [MinerType.APEPAD_MINI]: "100"
    };
    return powerConsumptions[minerType as keyof typeof powerConsumptions] || "0";
  };
  
  // Add a new function to get the miner cost from contract data
  const getMinerCost = (minerType: number) => {
    // Use contract data for the Monkey Toaster if available
    if (minerType === MinerType.MONKEY_TOASTER && minerTypeData[MinerType.MONKEY_TOASTER]) {
      const cost = Number(minerTypeData[MinerType.MONKEY_TOASTER][6]); // cost is at index 6
      console.log(`Using contract data for MONKEY_TOASTER cost: ${cost}`);
      return cost.toString();
    }
    
    const costs = {
      [MinerType.BANANA_MINER]: "0",
      [MinerType.GORILLA_GADGET]: "60",
      [MinerType.MONKEY_TOASTER]: "20", // Fallback if contract data not available
      [MinerType.APEPAD_MINI]: "5000"
    };
    return costs[minerType as keyof typeof costs] || "0";
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
                  // ALWAYS prioritize contract miners first
                  const miner = getMinerAtTile(selectedTile.x, selectedTile.y);
                  console.log('Miner found by getMinerAtTile:', miner);
                  
                  if (miner) {
                    // Get the correct miner type for image and stats
                    const minerType = miner.minerType !== undefined ? 
                      Number(miner.minerType) : 
                      (miner.type !== undefined ? Number(miner.type) : 0);
                    
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
                            {minerType !== MinerType.BANANA_MINER && (
                              <p className="bigcoin-text text-xs opacity-80">COST: {getMinerCost(minerType)} BIT</p>
                            )}
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
                    return (
                      <div className="space-y-3">
                        <p className="text-center text-sm py-4">No miner at this location.</p>
                        {hasFacility && parsedFacility && Number(parsedFacility.miners) < Number(parsedFacility.capacity) && (
                          <button
                            onClick={() => setShowMinerModal(true)}
                            className="w-full bigcoin-button"
                          >
                            PLACE MINER HERE
                          </button>
                        )}
                      </div>
                    );
                  }
                })()}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm">Click a tile to select it</p>
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
              {!acquiredStarterMinerData && (
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
            
            {/* Also display mining stats in mobile view */}
            <div className="border-t border-white/20 pt-4 mt-4">
              <h3 className="bigcoin-text mb-2">MINING STATS</h3>
              <p className="font-press-start text-white text-xs mb-1">- MINING <span className="text-banana">
                {miningRateData !== undefined 
                  ? formatNumber(miningRateData, 2, '', 18) 
                  : 'Loading...'}
              </span> BIT/DAY</p>
              <p className="font-press-start text-white text-xs mb-1">- HASH RATE: <span className="text-banana">
                {hashRateData !== undefined 
                  ? formatNumber(hashRateData, 0, '') 
                  : 'Loading...'}
              </span> GH/S</p>
              <p className="font-press-start text-white text-xs mb-1">- <span className="text-banana">
                {blocksUntilHalvingData !== undefined 
                  ? String(blocksUntilHalvingData) 
                  : 'Loading...'}
              </span> BLOCKS UNTIL HALVENING</p>
              <p className="font-press-start text-white text-xs">- <span className="text-banana">
                {networkShareData !== undefined 
                  ? (Number(networkShareData) / 100).toFixed(2) 
                  : 'Loading...'}%
              </span> OF NETWORK (<span className="text-banana">
                {totalNetworkHashrateData !== undefined 
                  ? formatNumber(totalNetworkHashrateData, 0, '') 
                  : 'Loading...'}
              </span> GH/S)</p>
            </div>
            
            {/* Add PRO stats in mobile view as well */}
            <div className="border-t border-white/20 pt-4 mt-4">
              <h3 className="bigcoin-text mb-2">NETWORK STATS</h3>
              <p className="font-press-start text-white text-xs mb-1">- <span className="text-banana">
                {currentBitApePerBlockData !== undefined 
                  ? formatNumber(currentBitApePerBlockData, 2, '', 18) 
                  : 'Loading...'}
              </span> BIT PER BLOCK</p>
              <p className="font-press-start text-white text-xs mb-1">- <span className="text-banana">
                {totalSupplyData !== undefined 
                  ? formatNumber(totalSupplyData, 2, '', 18) 
                  : 'Loading...'}
              </span> TOTAL BIT MINED</p>
              <p className="font-press-start text-white text-xs">- <span className="text-banana">
                {burnedBitData !== undefined 
                  ? formatNumber(burnedBitData, 2, '', 18) 
                  : 'Loading...'}
              </span> BIT BURNED</p>
            </div>
          </div>
        );
      case 'mining':
        // Get all miners including any from localStorage if needed
        let displayedMiners = [...(gameState.miners || [])];
        
        // If no miners in gameState but user has claimed starter miner, check localStorage
        if (displayedMiners.length === 0 && gameState.hasClaimedStarterMiner && typeof window !== 'undefined') {
          try {
            // Check localStorage for any saved miners
            const minerData = getMinerAtPosition(address as string, 0, 0);
            if (minerData) {
              console.log('Found Banana Miner at position (0,0) from localStorage!');
              displayedMiners.push({
                id: '0',
                minerType: MinerType.BANANA_MINER,
                x: 0,
                y: 0,
                image: MINERS[MinerType.BANANA_MINER].image,
                hashrate: 1,
                powerConsumption: 1,
                cost: 0,
                inProduction: true
              });
            }
          } catch (e) {
            console.error('Error retrieving miner from localStorage:', e);
          }
        }
        
        // If still no miners but we know starter miner is claimed, add default at 0,0
        if (displayedMiners.length === 0 && gameState.hasClaimedStarterMiner) {
          console.log('No miners found, but starter miner claimed. Adding default at (0,0)');
          displayedMiners.push({
            id: '0',
            minerType: MinerType.BANANA_MINER,
            x: 0,
            y: 0,
            image: MINERS[MinerType.BANANA_MINER].image,
            hashrate: 1,
            powerConsumption: 1,
            cost: 0,
            inProduction: true
          });
        }

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
            <div className="flex justify-between items-center mb-3">
              <span className="bigcoin-text">TOTAL GIGAWATTS</span>
              <span className="bigcoin-value font-press-start">
                {parsedFacility ? `${parsedFacility.power} GW` : '0 GW'}
              </span>
            </div>
            
            {/* Mining stats with improved mobile styling */}
            <div className="border-t border-white/20 pt-3 mb-3">
              <p className="font-press-start text-white text-xs mb-1">- MINING <span className="text-banana">
                {miningRateData !== undefined 
                  ? formatNumber(miningRateData, 2, '', 18) 
                  : 'Loading...'}
              </span> BIT/DAY</p>
              <p className="font-press-start text-white text-xs mb-1">- HASH RATE: <span className="text-banana">
                {hashRateData !== undefined 
                  ? formatNumber(hashRateData, 0, '') 
                  : 'Loading...'}
              </span> GH/S</p>
            </div>
            
            <div className="mt-4">
              <h3 className="text-lg font-bold mb-2">Your Miners</h3>
              {displayedMiners.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {displayedMiners.map((miner, index) => (
                    <div key={index} className="border border-white/20 p-3 rounded">
                      <div className="flex justify-between items-center">
                        <span className="text-xs">Miner #{miner.id}</span>
                        <span className="text-xs">Type: {getMinerTypeName(miner.minerType)}</span>
                      </div>
                      <div className="mt-2">
                        <span className="text-xs">Mining rate: {getMinerMiningRate(miner.minerType)} BIT/day</span>
                      </div>
                      <div className="mt-2">
                        <span className="text-xs">Position: X:{miner.x}, Y:{miner.y}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-sm">No miners yet</div>
              )}
            </div>
          </div>
        );
      default:
        return null;
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
    console.log(`Tile selected at (${x}, ${y})`);
    
    // Check if we're selecting the same tile again
    const isSameTile = selectedTile && selectedTile.x === x && selectedTile.y === y;
    
    // Force re-render by creating a new object, even if coordinates are the same
    setSelectedTile({ x, y });
    
    // Switch to the selected tile tab when a new tile is selected
    if (!isSameTile || activeTab !== 'selectedTile') {
      setActiveTab('selectedTile');
    }
    
    // Check if there's a miner at this position immediately after selection
    const hasMiner = selectedTileHasMiner(x, y);
    console.log(`Tile has miner: ${hasMiner}`);
    
    // Force the component to update since tile selection is critical for UI
    // This helps address the double-click issue
    setTimeout(() => {
      if (selectedTile?.x !== x || selectedTile?.y !== y) {
        console.log('Forcing tile selection update');
        setSelectedTile({ x, y });
      }
    }, 100);
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
    // If no tile is selected, default to position (0,0) for the starter miner
    const tileToUse = selectedTile || { x: 0, y: 0 };
    
    console.log('Claiming starter miner at position:', tileToUse);
    
    // Save position to localStorage for UI persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('claimedMinerPosition', JSON.stringify({
        x: tileToUse.x,
        y: tileToUse.y
      }));
      console.log('Saved miner position to localStorage');
      
      // Add to our debug object for inspection
      // @ts-ignore
      window.__BITAPE_DEBUG = window.__BITAPE_DEBUG || {};
      // @ts-ignore
      window.__BITAPE_DEBUG.claimedPosition = {
        x: tileToUse.x, 
        y: tileToUse.y
      };
    }
    
    try {
      // Call the contract method to claim the starter miner
      await gameState.getStarterMiner(tileToUse.x, tileToUse.y);
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
        x: tileToUse.x,
        y: tileToUse.y
      };
      
      // Debug log the new miner
      console.log('Created new miner object:', newMiner);
      
      setIsBuyModalOpen(false);
      
      // Re-check if the tile has a miner after the operation
      const hasMinerNow = selectedTileHasMiner(tileToUse.x, tileToUse.y);
      console.log(`Tile has miner after claiming: ${hasMinerNow}`);
      
      // Force a re-render by updating the selected tile (with the same values)
      setSelectedTile({...tileToUse});
      setActiveTab('selectedTile');
      
      // Wait a moment and then check again (async refresh might take time)
      setTimeout(() => {
        console.log('Delayed check for miner presence');
        const hasMinerDelayed = selectedTileHasMiner(tileToUse.x, tileToUse.y);
        console.log(`Tile has miner after delay: ${hasMinerDelayed}`);
        
        // Force another re-render if needed
        setSelectedTile({...tileToUse});
      }, 2000);
    } catch (error) {
      console.error('Error claiming starter miner:', error);
    }
  };

  // Render statistics panel function
  const renderStatistics = (minerType: number) => {
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
              facilityData={visualizationFacilityData}
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
              miners={getValidatedMiners()
                .map(m => {
                  // Get the correct miner type from the contract's minerIndex
                  const contractMinerType = m.minerType;
                  
                  // Map contract minerType to our frontend MinerType enum
                  let frontendMinerType;
                  
                  // Check which mapping system is in use
                  if (MinerType.BANANA_MINER === 1) {
                    // If enum matches contract exactly (1-indexed)
                    frontendMinerType = contractMinerType;
                  } else {
                    // If enum is 0-indexed (common in JS/TS), adjust by -1
                    frontendMinerType = contractMinerType;
                  }
                  
                  // Use the correct type to get image
                  const minerImage = MINERS[frontendMinerType]?.image || '/banana-miner.gif';
                  
                  console.log(`Miner ID ${m.id}: Contract type ${contractMinerType}, Frontend type ${frontendMinerType}, Image ${minerImage}`);
                  
                  return {
                    id: m.id,
                    minerType: frontendMinerType,
                    x: Number(m.x),
                    y: Number(m.y),
                    image: minerImage,
                    hashrate: m.hashrate,
                    powerConsumption: m.powerConsumption,
                    inProduction: m.inProduction
                  };
                })}
              selectedTileHasMiner={(x, y) => selectedTileHasMiner(x, y)}
              getMinerAtTile={(x, y) => {
                const miner = getMinerAtTile(x, y);
                if (!miner) return null;
                
                // Get the correct miner type from the contract's minerIndex
                const contractMinerType = miner.minerType;
                
                // Map contract minerType to our frontend MinerType enum
                let frontendMinerType;
                
                // Check which mapping system is in use
                if (MinerType.BANANA_MINER === 1) {
                  // If enum matches contract exactly (1-indexed)
                  frontendMinerType = contractMinerType;
                } else {
                  // If enum is 0-indexed (common in JS/TS), adjust by -1
                  frontendMinerType = contractMinerType;
                }
                
                // Use the correct type to get image
                const minerImage = MINERS[frontendMinerType]?.image || '/banana-miner.gif';
                
                return {
                  id: miner.id,
                  minerType: frontendMinerType,
                  x: Number(miner.x),
                  y: Number(miner.y),
                  image: minerImage,
                  hashrate: miner.hashrate,
                  powerConsumption: miner.powerConsumption,
                  inProduction: miner.inProduction
                };
              }}
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
              <StatsDisplay
                miningRateData={miningRateData as bigint}
                hashRateData={hashRateData as bigint}
                blocksUntilHalvingData={blocksUntilHalvingData as bigint}
                networkShareData={networkShareData as bigint}
                totalNetworkHashrateData={totalNetworkHashrateData as bigint}
                totalSupplyData={totalSupplyData as bigint}
                burnedBitData={burnedBitData as bigint}
                currentBitApePerBlockData={currentBitApePerBlockData as bigint}
                isMiningRateLoading={isMiningRateLoading}
                isHashRateLoading={isHashRateLoading}
                isNetworkShareLoading={isNetworkShareLoading}
                isTotalNetworkHashrateLoading={isTotalNetworkHashrateLoading}
              />
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
            <div className="relative w-[700px] h-[700px] border border-banana overflow-hidden p-1.5">
              <RoomVisualization 
                hasFacility={hasFacility}
                facilityData={visualizationFacilityData}
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
                miners={getValidatedMiners()
                  .map(m => {
                    // Get the correct miner type from the contract's minerIndex
                    const contractMinerType = m.minerType;
                    
                    // Map contract minerType to our frontend MinerType enum
                    let frontendMinerType;
                    
                    // Check which mapping system is in use
                    if (MinerType.BANANA_MINER === 1) {
                      // If enum matches contract exactly (1-indexed)
                      frontendMinerType = contractMinerType;
                    } else {
                      // If enum is 0-indexed (common in JS/TS), adjust by -1
                      frontendMinerType = contractMinerType;
                    }
                    
                    // Use the correct type to get image
                    const minerImage = MINERS[frontendMinerType]?.image || '/banana-miner.gif';
                    
                    console.log(`Miner ID ${m.id}: Contract type ${contractMinerType}, Frontend type ${frontendMinerType}, Image ${minerImage}`);
                    
                    return {
                      id: m.id,
                      minerType: frontendMinerType,
                      x: Number(m.x),
                      y: Number(m.y),
                      image: minerImage,
                      hashrate: m.hashrate,
                      powerConsumption: m.powerConsumption,
                      inProduction: m.inProduction
                    };
                  })}
                selectedTileHasMiner={(x, y) => selectedTileHasMiner(x, y)}
                getMinerAtTile={(x, y) => {
                  const miner = getMinerAtTile(x, y);
                  if (!miner) return null;
                  
                  // Get the correct miner type from the contract's minerIndex
                  const contractMinerType = miner.minerType;
                  
                  // Map contract minerType to our frontend MinerType enum
                  let frontendMinerType;
                  
                  // Check which mapping system is in use
                  if (MinerType.BANANA_MINER === 1) {
                    // If enum matches contract exactly (1-indexed)
                    frontendMinerType = contractMinerType;
                  } else {
                    // If enum is 0-indexed (common in JS/TS), adjust by -1
                    frontendMinerType = contractMinerType;
                  }
                  
                  // Use the correct type to get image
                  const minerImage = MINERS[frontendMinerType]?.image || '/banana-miner.gif';
                  
                  return {
                    id: miner.id,
                    minerType: frontendMinerType,
                    x: Number(miner.x),
                    y: Number(miner.y),
                    image: minerImage,
                    hashrate: miner.hashrate,
                    powerConsumption: miner.powerConsumption,
                    inProduction: miner.inProduction
                  };
                }}
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
        bitBalance={bitBalance || '0'}
        hasClaimedStarterMiner={gameState.hasClaimedStarterMiner}
        minerTypeData={minerTypeData}
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