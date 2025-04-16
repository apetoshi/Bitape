import { useAccount, useContractRead, useContractWrite, useTransaction, useBalance, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther, parseEther, Address, zeroAddress } from 'viem';
import { CONTRACT_ADDRESSES, MINING_CONTROLLER_ABI, ERC20_ABI, APECHAIN_ID, MAIN_CONTRACT_ABI } from '../config/contracts';
import { useEffect, useState, useMemo } from 'react';

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
  upgradeFacility: () => void;
  
  // Loading states
  isPurchasingFacility: boolean;
  isGettingStarterMiner: boolean;
  isClaimingReward: boolean;
  isUpgradingFacility: boolean;

  // New fields
  isGameActive: boolean;
  isUserActive: boolean;

  totalReferrals: number;
  totalBigEarned: string;
  refetch: () => void;
}

export function useGameState(): GameState {
  const { address, isConnected } = useAccount();
  
  // State variables
  const [apeBalance, setApeBalance] = useState('0');
  const [bitBalance, setBitBalance] = useState('0');
  const [minedBit, setMinedBit] = useState('0');
  const [hasFacility, setHasFacility] = useState(false);
  const [spacesLeft, setSpacesLeft] = useState(0);
  const [gigawattsAvailable, setGigawattsAvailable] = useState(0);
  const [miningRate, setMiningRate] = useState('0');
  const [hashRate, setHashRate] = useState('0');
  const [blocksUntilHalving, setBlocksUntilHalving] = useState('0');
  const [networkHashRatePercentage, setNetworkHashRatePercentage] = useState('0');
  const [totalNetworkHashRate, setTotalNetworkHashRate] = useState('0');
  const [isPurchasingFacility, setIsPurchasingFacility] = useState(false);
  const [isGettingStarterMiner, setIsGettingStarterMiner] = useState(false);
  const [isClaimingReward, setIsClaimingReward] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [totalBigEarned, setTotalBigEarned] = useState('0');
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

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
    args: [address],
    watch: true,
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
  const { data: referralInfo } = useContractRead({
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
  const { data: purchaseFacilityData, write: purchaseFacility } = useContractWrite({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'purchaseInitialFacility'
  });

  const { data: getStarterMinerData, write: getStarterMinerWrite } = useContractWrite({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'getFreeStarterMiner'
  });

  const { data: claimRewardData, write: claimRewardWrite } = useContractWrite({
    address: CONTRACT_ADDRESSES.MINING_CONTROLLER,
    abi: MINING_CONTROLLER_ABI,
    functionName: 'claimReward'
  });

  const { writeAsync: upgradeFacilityWrite } = useContractWrite({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'upgradeFacility',
  });

  const upgradeFacility = async () => {
    if (!upgradeFacilityWrite) return;
    setIsUpgrading(true);
    try {
      const tx = await upgradeFacilityWrite();
      setTxHash(tx.hash);
    } catch (error) {
      console.error('Error upgrading facility:', error);
      setIsUpgrading(false);
    }
  };

  // Update referral info
  useEffect(() => {
    if (referralInfo) {
      const [totalRefs, totalEarned] = referralInfo as [bigint, bigint];
      setTotalReferrals(Number(totalRefs));
      setTotalBigEarned(formatEther(totalEarned));
    }
  }, [referralInfo]);

  const { isLoading: isPending } = useTransaction({
    hash: txHash,
  });

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
    purchaseFacility: async () => {
      if (!purchaseFacility) return;
      return purchaseFacility();
    },
    getStarterMiner: async (x: number, y: number) => {
      if (!getStarterMinerWrite) return;
      return getStarterMinerWrite({
        args: [BigInt(x), BigInt(y)]
      });
    },
    claimReward: async () => {
      if (!claimRewardWrite) return;
      return claimRewardWrite();
    },
    upgradeFacility,
    isPurchasingFacility,
    isGettingStarterMiner,
    isClaimingReward,
    isUpgradingFacility: isUpgrading || isPending,
    isGameActive: !!gameActiveState,
    isUserActive: !!userActiveState,
    totalReferrals,
    totalBigEarned,
    refetch: () => {
      refetchInitialized();
      refetchStats();
    },
  };
}
