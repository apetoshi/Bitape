import { useAccount, useContractRead, useBalance, useWriteContract, usePublicClient } from 'wagmi';
import { formatEther, parseEther, zeroAddress } from 'viem';
import { CONTRACT_ADDRESSES, ERC20_ABI, APECHAIN_ID, MAIN_CONTRACT_ABI, BIT_TOKEN_ADDRESS, BIT_TOKEN_ABI } from '../config/contracts';
import { MINERS, MinerType, MinerData } from '../config/miners';
import { useEffect, useState } from 'react';

interface PlayerFacility {
  power: bigint;
  level: bigint;
  miners: bigint;
  capacity: bigint;
  used: bigint;
  resources: bigint;
  spaces: bigint;
}

interface PlayerStats {
  totalMined: bigint;
  hashRate: bigint;
  miningRate: bigint;
  networkShare: bigint;
}

// Export the PlayerMiner interface so it can be imported elsewhere
export interface PlayerMiner {
  id: string | number;
  minerType: MinerType | number;
  x: number;
  y: number;
  hashrate?: number;
  powerConsumption?: number;
  cost?: number;
  inProduction?: boolean;
  image?: string;
  type?: number;
}

export interface GameState {
  // User state
  isConnected: boolean;
  address: string | undefined;
  
  // Resources
  apeBalance: string;
  bitBalance: string;
  spacesLeft: number;
  gigawattsAvailable: number;
  
  // Mining stats
  miningRate: string;
  hashRate: string;
  blocksUntilHalving: string;
  networkHashRatePercentage: string;
  totalNetworkHashRate: string;
  
  // Network stats
  totalMinedBit: string;
  burnedBit: string;
  rewardPerBlock: string;
  
  // Mining rewards
  minedBit: string;
  
  // Facility state
  hasFacility: boolean;
  facilityData: {
    power: number;
    level: number;
    miners: number;
    capacity: number;
    used: number;
    resources: number;
    spaces: number;
  } | null;
  stats: PlayerStats;
  
  // Actions
  purchaseFacility: () => Promise<void>;
  getStarterMiner: (x: number, y: number) => Promise<void>;
  purchaseMiner: (minerType: MinerType, x: number, y: number) => Promise<void>;
  claimReward: () => Promise<void>;
  upgradeFacility: () => Promise<void>;
  
  // Loading states
  isPurchasingFacility: boolean;
  isGettingStarterMiner: boolean;
  isPurchasingMiner: boolean;
  isClaimingReward: boolean;
  isUpgradingFacility: boolean;

  // New fields
  isGameActive: boolean;
  isUserActive: boolean;

  totalReferrals: number;
  totalBitEarned: string;
  refetch: () => void;

  // Referral info
  referralInfo: {
    referralCode: string;
    totalReferrals: number;
    rewardsEarned: string;
  };

  // Facility price
  initialFacilityPrice: string;

  // Miner status
  hasClaimedStarterMiner: boolean;
  
  // Player miners
  miners: PlayerMiner[];
}

export function useGameState(): GameState {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  
  // State variables
  const [apeBalance, setApeBalance] = useState('0');
  const [bitBalance, setBitBalance] = useState('0');
  const [minedBit] = useState('0');
  const [hasFacility, setHasFacility] = useState(false);
  const [spacesLeft] = useState(0);
  const [gigawattsAvailable] = useState(0);
  const [miningRate] = useState('0');
  const [hashRate] = useState('0');
  const [blocksUntilHalving] = useState('0');
  const [networkHashRatePercentage] = useState('0');
  const [totalNetworkHashRate] = useState('0');
  const [isPurchasingFacility, setIsPurchasingFacility] = useState(false);
  const [isGettingStarterMiner, setIsGettingStarterMiner] = useState(false);
  const [isClaimingReward, setIsClaimingReward] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [totalBitEarned, setTotalBitEarned] = useState('0');
  const [miners, setMiners] = useState<PlayerMiner[]>([]);
  const [isPurchasingMiner, setIsPurchasingMiner] = useState(false);

  // Contract reads
  const { data: gameActiveState } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'miningHasStarted',
    query: {
      enabled: true,
    },
  });

  const { data: userActiveState } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'initializedStarterFacility',
    args: [address || zeroAddress],
    query: {
      enabled: !!address,
    },
  });

  // Get native APE balance
  const { data: apeBalanceData } = useBalance({
    address: address as `0x${string}`,
    chainId: APECHAIN_ID,
    query: {
      enabled: !!address,
    },
  });

  // Get BIT token balance
  const { data: bitBalanceData } = useContractRead({
    address: BIT_TOKEN_ADDRESS,
    abi: BIT_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address || zeroAddress],
    query: {
      enabled: !!address,
    },
  });

  // Get facility data
  const { data: facilityData } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'getPlayerFacility',
    args: [address || zeroAddress],
    query: {
      enabled: !!address,
    },
  }) as { data: PlayerFacility | undefined };

  // Check if player has initialized facility
  const { data: hasInitializedFacility, refetch: refetchInitialized } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'initializedStarterFacility',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    },
  });

  // Get referral info
  const { data: referralData } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'getUserReferralInfo',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    },
  });

  // Get player stats
  const { data: playerStats, refetch: refetchStats } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'getPlayerStats',
    args: [address || zeroAddress],
    query: {
      enabled: Boolean(address)
    }
  });

  // Check if user has already claimed starter miner
  const { data: hasClaimedStarterMiner, refetch: refetchStarterMiner } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'acquiredStarterMiner' as any,
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    },
  });

  // Get user miners - update to use correct contract calls pattern
  const { data: playerMiners, refetch: refetchMinerIds } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'getPlayerMinersPaginated',
    args: [address || zeroAddress, BigInt(0), BigInt(100)], // Get up to 100 miners starting at index 0
    query: {
      enabled: !!address && hasFacility,
    },
  });

  // Update state when data changes
  useEffect(() => {
    if (apeBalanceData) {
      setApeBalance(apeBalanceData.formatted);
    }
  }, [apeBalanceData]);

  useEffect(() => {
    if (bitBalanceData) {
      setBitBalance(formatEther(bitBalanceData as bigint));
    }
  }, [bitBalanceData]);
  
  useEffect(() => {
    if (hasInitializedFacility !== undefined) {
      setHasFacility(!!hasInitializedFacility);
    }
  }, [hasInitializedFacility]);

  // Contract write functions
  const { writeContract } = useWriteContract();

  const handlePurchaseFacility = async () => {
    try {
      setIsPurchasingFacility(true);
      await writeContract({
        address: CONTRACT_ADDRESSES.MAIN,
        abi: MAIN_CONTRACT_ABI,
        functionName: 'purchaseInitialFacility',
        args: [zeroAddress],
        value: parseEther('0.005')
      });
      await refetchStats();
    } catch (error) {
      console.error('Error purchasing facility:', error);
    } finally {
      setIsPurchasingFacility(false);
    }
  };
  
  const handleClaimRewards = async () => {
    try {
      setIsClaimingReward(true);
      await writeContract({
        address: CONTRACT_ADDRESSES.MAIN,
        abi: MAIN_CONTRACT_ABI,
        functionName: 'claimRewards',
      });
      await refetchStats();
    } catch (error) {
      console.error('Error claiming rewards:', error);
    } finally {
      setIsClaimingReward(false);
    }
  };
  
  const handleUpgradeFacility = async () => {
    try {
      setIsUpgrading(true);
      await writeContract({
        address: CONTRACT_ADDRESSES.MAIN,
        abi: MAIN_CONTRACT_ABI,
        functionName: 'upgradeFacility',
      });
      await refetchStats();
    } catch (error) {
      console.error('Error upgrading facility:', error);
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleGetStarterMiner = async (x: number, y: number) => {
    if (!address) {
      console.error('No wallet connected');
      return;
    }

    try {
      setIsGettingStarterMiner(true);
      await writeContract({
        address: CONTRACT_ADDRESSES.MAIN,
        abi: MAIN_CONTRACT_ABI,
        functionName: 'getFreeStarterMiner',
        args: [BigInt(x), BigInt(y)],
      });
      await refetchStarterMiner();
      await refetchMinerIds();
    } catch (error) {
      console.error('Error claiming starter miner:', error);
    } finally {
      setIsGettingStarterMiner(false);
    }
  };

  // Update referral info
  useEffect(() => {
    if (referralData) {
      const [totalRefs, totalEarned] = referralData as [bigint, bigint];
      setTotalReferrals(Number(totalRefs));
      setTotalBitEarned(formatEther(totalEarned));
    }
  }, [referralData]);

  // Process miner data - completely revise to use the two-step fetch process
  useEffect(() => {
    const fetchMinersData = async () => {
      if (!address || !playerMiners || !Array.isArray(playerMiners) || playerMiners.length === 0) {
        console.log('No miners to fetch or user not connected');
        setMiners([]);
        return;
      }
      
      console.log('Found player miners:', playerMiners.length);
      
      try {
        // Since getPlayerMinersPaginated already returns full miner data, we can parse it directly
        const minersList: PlayerMiner[] = playerMiners.map((miner: any) => ({
          id: Number(miner.id),
          minerType: Number(miner.minerIndex),
          x: Number(miner.x),
          y: Number(miner.y),
          hashrate: Number(miner.hashrate),
          powerConsumption: Number(miner.powerConsumption),
          cost: Number(miner.cost),
          inProduction: miner.inProduction,
          // Add miner image based on type
          image: MINERS[Number(miner.minerIndex) as MinerType]?.image || '',
        }));
        
        console.log('Processed miners:', minersList);
        setMiners(minersList);
      } catch (error) {
        console.error('Error fetching miner data:', error);
        setMiners([]);
      }
    };
    
    // Call the fetch function
    fetchMinersData();
  }, [address, playerMiners, hasFacility]);

  // Make refetchMiners include the new IDs fetch + individual miners fetch
  const refetchMiners = async () => {
    console.log('Refetching all miner data...');
    await refetchMinerIds();
  };

  // Add purchase miner function
  const handlePurchaseMiner = async (minerType: MinerType, x: number, y: number) => {
    if (!address) return;
    
    try {
      console.log(`=== MINER PURCHASE FLOW STARTED ===`);
      console.log(`Attempting to purchase miner type ${minerType} at position (${x}, ${y})`);
      console.log(`Using BIT token address: ${BIT_TOKEN_ADDRESS}`);
      console.log(`Using MAIN contract address: ${CONTRACT_ADDRESSES.MAIN}`);
      
      setIsPurchasingMiner(true);
      
      // Validate that user has a facility
      if (!hasFacility) {
        console.error('You must purchase a facility before buying miners');
        return;
      }
      
      // For the free starter miner
      if (minerType === MinerType.BANANA_MINER && !hasClaimedStarterMiner) {
        console.log(`Processing free starter miner claim...`);
        await handleGetStarterMiner(x, y);
        return;
      }
      
      // For paid miners
      const minerPrice = MINERS[minerType].price.toString();
      const formattedPrice = parseEther(minerPrice);
      
      console.log(`=== MINER TRANSACTION INFO ===`);
      // Print the contract interface for debugging
      console.log(`Contract ABI functions:`, MAIN_CONTRACT_ABI
        .filter(item => item.type === 'function')
        .map(item => item.name)
      );
      
      // Skip approval check for free miners
      if (minerPrice !== '0') {
        console.log(`=== CHECKING TOKEN APPROVAL ===`);
        console.log(`Miner price: ${minerPrice} BIT (${formattedPrice} wei)`);
        
        // IMPORTANT: Make sure we have publicClient before proceeding
        if (!publicClient) {
          throw new Error('Public client not available, cannot check allowance');
        }
        
        try {
          // CRITICAL: Wait for the allowance call to complete before proceeding
          // Use the complete BITAPE_TOKEN_ABI that has the proper allowance function
          const allowanceResult = await publicClient.readContract({
            address: BIT_TOKEN_ADDRESS,
            abi: BIT_TOKEN_ABI,  // Changed from BITAPE_TOKEN_ABI to BIT_TOKEN_ABI
            functionName: 'allowance',
            args: [address as `0x${string}`, CONTRACT_ADDRESSES.MAIN]
          });
          
          const currentAllowance = allowanceResult as bigint;
          console.log(`Current token allowance: ${formatEther(currentAllowance)} BIT`);
          console.log(`Required allowance: ${formatEther(formattedPrice)} BIT`);
          
          // Strict comparison to ensure we only approve if absolutely necessary
          // Add a small buffer to avoid unnecessary approvals
          if (currentAllowance < formattedPrice) {
            console.log(`=== TOKEN APPROVAL NEEDED ===`);
            console.log(`Approving ${minerPrice} BIT for spending`);
            
            // First approve the token spending - using the same ABI for consistency
            const approvalTx = await writeContract({
              address: BIT_TOKEN_ADDRESS, 
              abi: BIT_TOKEN_ABI,  // Changed from BITAPE_TOKEN_ABI to BIT_TOKEN_ABI
              functionName: 'approve',
              args: [CONTRACT_ADDRESSES.MAIN, formattedPrice]
            });
            
            console.log(`Token approval transaction submitted: ${approvalTx}`);
            
            // Wait for approval transaction confirmation
            console.log(`Waiting for approval transaction confirmation...`);
            await new Promise(resolve => setTimeout(resolve, 8000));
            
            console.log(`Token approval should be complete, proceeding to purchase`);
          } else {
            console.log(`Token already has sufficient allowance - SKIPPING APPROVAL`);
          }
        } catch (allowanceError) {
          console.error(`Error checking token allowance:`, allowanceError);
          throw new Error(`Failed to check token allowance: ${allowanceError instanceof Error ? allowanceError.message : 'Unknown error'}`);
        }
      }
      
      // Now proceed with the buyMiner transaction - use exact name from ABI
      console.log(`=== EXECUTING MINER PURCHASE ===`);
      
      // Debug the actual function we're going to call
      const minerFunction = MAIN_CONTRACT_ABI.find(item => 
        item.type === 'function' && item.name === 'buyMiner'
      );
      console.log('Found function in ABI:', minerFunction);
      
      // Ensure we're using the correct 1-based miner index values
      console.log(`Selected Miner Type:`, {
        minerType,
        minerEnumValue: MinerType[minerType],
        minerDisplayName: MINERS[minerType].name,
        contractIndex: Number(minerType) // This is now correctly 1-based
      });
      
      // Convert parameters - Use the MinerType enum value directly as the index since it's now 1-based
      const minerIndex = BigInt(minerType);
      const xPos = BigInt(x);
      const yPos = BigInt(y);
      
      // Log the expected hex representation of the calldata (for debugging)
      console.log(`Function selector: 0x476e2e66 (buyMiner)`);
      console.log(`Expected calldata pattern: 0x476e2e66...${minerIndex.toString().padStart(8, '0')}...${xPos.toString().padStart(8, '0')}...${yPos.toString().padStart(8, '0')}`);
      
      console.log(`Calling contract with exact parameters:`, {
        contract: CONTRACT_ADDRESSES.MAIN,
        function: 'buyMiner',
        minerIndex: minerIndex.toString(), 
        minerName: MINERS[minerType].name,
        minerType,
        x: xPos.toString(), 
        y: yPos.toString()
      });
      
      // Double-check the MinerType enum matches expected contract values
      console.log(`MinerType Contract Validation: BANANA_MINER=${MinerType.BANANA_MINER}, MONKEY_TOASTER=${MinerType.MONKEY_TOASTER}, GORILLA_GADGET=${MinerType.GORILLA_GADGET}, APEPAD_MINI=${MinerType.APEPAD_MINI}`);
      
      // Execute the transaction with explicit logging
      const buyTx = await writeContract({
        address: CONTRACT_ADDRESSES.MAIN,
        abi: MAIN_CONTRACT_ABI,
        functionName: 'buyMiner',
        args: [minerIndex, xPos, yPos]
      });
      
      console.log(`Miner purchase transaction hash: ${buyTx}`);
      console.log(`=== MINER PURCHASE COMPLETED ===`);
      
      // Refetch all relevant data
      console.log(`Refreshing game state data...`);
      
      // Wait for the transaction to be confirmed before refetching
      console.log(`Waiting for transaction confirmation and blockchain updates...`);
      // Add a delay to ensure blockchain has time to update
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // Now refetch all data with explicit logging
      console.log(`Refetching player stats...`);
      await refetchStats();
      
      console.log(`Refetching miner data...`);
      await refetchMiners();
      
      // Add another delay then refetch again to ensure we get the latest data
      await new Promise(resolve => setTimeout(resolve, 5000));
      console.log(`Performing second refetch of miner data...`);
      await refetchMiners();
      
      console.log(`All data refreshed. Current miners:`, miners);
      
      // Force a page refresh if the miners array is still empty
      if (miners.length === 0) {
        console.log(`Warning: Miners array is still empty after refresh. Suggesting manual page refresh.`);
        if (typeof window !== 'undefined') {
          console.log(`You may need to refresh the page to see your new miner.`);
        }
      }
    } catch (error) {
      // Better error handling
      const errorDetails = {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown error type',
        details: JSON.stringify(error, (key, value) => 
          typeof value === 'bigint' ? value.toString() : value, 2)
      };
      
      console.error(`ERROR IN MINER PURCHASE FLOW:`, errorDetails);
      throw error; // Re-throw to let UI handle it
    } finally {
      setIsPurchasingMiner(false);
    }
  };

  return {
    isConnected,
    address,
    apeBalance,
    bitBalance,
    spacesLeft,
    gigawattsAvailable,
    miningRate,
    hashRate,
    blocksUntilHalving,
    networkHashRatePercentage,
    totalNetworkHashRate,
    totalMinedBit: playerStats ? playerStats[0].toString() : '0',
    burnedBit: '1,238,626.5',
    rewardPerBlock: '2.5',
    minedBit,
    hasFacility,
    facilityData: facilityData ? {
      power: Number(facilityData.power),
      level: Number(facilityData.level),
      miners: Number(facilityData.miners),
      capacity: Number(facilityData.capacity),
      used: Number(facilityData.used),
      resources: Number(facilityData.resources),
      spaces: Number(facilityData.spaces),
    } : null,
    stats: playerStats ? {
      totalMined: playerStats[0],
      hashRate: playerStats[1],
      miningRate: playerStats[2],
      networkShare: playerStats[3],
    } : {
      totalMined: BigInt(0),
      hashRate: BigInt(0),
      miningRate: BigInt(0),
      networkShare: BigInt(0),
    },
    purchaseFacility: handlePurchaseFacility,
    getStarterMiner: handleGetStarterMiner,
    claimReward: handleClaimRewards,
    upgradeFacility: handleUpgradeFacility,
    isPurchasingFacility,
    isGettingStarterMiner,
    isClaimingReward,
    isUpgradingFacility: isUpgrading,
    isGameActive: !!gameActiveState,
    isUserActive: !!userActiveState,
    totalReferrals,
    totalBitEarned,
    refetch: () => {
      refetchInitialized();
      refetchStats();
      refetchMiners();
    },
    referralInfo: {
      referralCode: address ? address.slice(2, 8).toUpperCase() : '',
      totalReferrals: Number(totalReferrals),
      rewardsEarned: totalBitEarned,
    },
    initialFacilityPrice: '0.005',
    hasClaimedStarterMiner: !!hasClaimedStarterMiner,
    purchaseMiner: handlePurchaseMiner,
    isPurchasingMiner,
    miners,
  };
}
