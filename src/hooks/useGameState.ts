import { useAccount, useContractRead, useBalance, useWriteContract } from 'wagmi';
import { formatEther, parseEther, zeroAddress } from 'viem';
import { CONTRACT_ADDRESSES, MINING_CONTROLLER_ABI, ERC20_ABI, APECHAIN_ID, MAIN_CONTRACT_ABI } from '../config/contracts';
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
  claimReward: () => Promise<void>;
  upgradeFacility: () => Promise<void>;
  
  // Loading states
  isPurchasingFacility: boolean;
  isGettingStarterMiner: boolean;
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
}

export function useGameState(): GameState {
  const { address, isConnected } = useAccount();
  
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

  // Contract reads
  const { data: gameActiveState } = useContractRead({
    address: CONTRACT_ADDRESSES.MINING_CONTROLLER,
    abi: MINING_CONTROLLER_ABI,
    functionName: 'isGameActive',
    query: {
      enabled: true,
    },
  });

  const { data: userActiveState } = useContractRead({
    address: CONTRACT_ADDRESSES.MINING_CONTROLLER,
    abi: MINING_CONTROLLER_ABI,
    functionName: 'isUserActive',
    args: [address as `0x${string}`],
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
    address: CONTRACT_ADDRESSES.BIT_TOKEN,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
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
        value: parseEther('10')
      });
      await refetchStats();
    } catch (error) {
      console.error('Error purchasing facility:', error);
    } finally {
      setIsPurchasingFacility(false);
    }
  };

  const handleGetStarterMiner = async (x: number, y: number) => {
    if (!address) return;
    try {
      setIsGettingStarterMiner(true);
      await writeContract({
        address: CONTRACT_ADDRESSES.MAIN,
        abi: MAIN_CONTRACT_ABI,
        functionName: 'getFreeStarterMiner',
        args: [BigInt(x), BigInt(y)]
      });
      await refetchStats();
    } catch (error) {
      console.error('Error getting starter miner:', error);
    } finally {
      setIsGettingStarterMiner(false);
    }
  };

  const handleClaimReward = async () => {
    if (!address) return;
    try {
      setIsClaimingReward(true);
      await writeContract({
        address: CONTRACT_ADDRESSES.MINING_CONTROLLER,
        abi: MINING_CONTROLLER_ABI,
        functionName: 'claimReward'
      });
      await refetchStats();
    } catch (error) {
      console.error('Error claiming reward:', error);
    } finally {
      setIsClaimingReward(false);
    }
  };

  const handleUpgradeFacility = async () => {
    if (!address) return;
    try {
      setIsUpgrading(true);
      await writeContract({
        address: CONTRACT_ADDRESSES.MAIN,
        abi: MAIN_CONTRACT_ABI,
        functionName: 'upgradeFacility',
        args: []
      });
      await refetchStats();
    } catch (error) {
      console.error('Error upgrading facility:', error);
    } finally {
      setIsUpgrading(false);
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
    claimReward: handleClaimReward,
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
    },
    referralInfo: {
      referralCode: address ? address.slice(2, 8).toUpperCase() : '',
      totalReferrals: Number(totalReferrals),
      rewardsEarned: totalBitEarned,
    },
    initialFacilityPrice: '10',
  };
}
