'use client';

import { useAccount, useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi';
import { CONTRACT_ADDRESSES, MINING_CONTROLLER_ABI } from '@/config/contracts';
import { formatUnits } from 'viem';

export function useMiningData() {
  const { address } = useAccount();

  // Get unclaimed rewards
  const { data: unclaimedRewards } = useContractRead({
    address: CONTRACT_ADDRESSES.MINING_CONTROLLER,
    abi: MINING_CONTROLLER_ABI,
    functionName: 'getUnclaimedRewards',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    },
  });

  // Get user mining rate
  const { data: userMiningRate } = useContractRead({
    address: CONTRACT_ADDRESSES.MINING_CONTROLLER,
    abi: MINING_CONTROLLER_ABI,
    functionName: 'getUserMiningRate',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    },
  });

  // Get network hash rate
  const { data: networkHashRate } = useContractRead({
    address: CONTRACT_ADDRESSES.MINING_CONTROLLER,
    abi: MINING_CONTROLLER_ABI,
    functionName: 'getNetworkHashRate',
    query: {
      enabled: true,
    },
  });

  // Get user hash rate
  const { data: userHashRate } = useContractRead({
    address: CONTRACT_ADDRESSES.MINING_CONTROLLER,
    abi: MINING_CONTROLLER_ABI,
    functionName: 'getUserHashRate',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    },
  });

  // Get blocks until halving
  const { data: blocksUntilHalving } = useContractRead({
    address: CONTRACT_ADDRESSES.MINING_CONTROLLER,
    abi: MINING_CONTROLLER_ABI,
    functionName: 'getBlocksUntilHalving',
    query: {
      enabled: true,
    },
  });

  // Claim rewards function
  const { write: claimReward, data: claimData } = useContractWrite({
    address: CONTRACT_ADDRESSES.MINING_CONTROLLER,
    abi: MINING_CONTROLLER_ABI,
    functionName: 'claimReward',
  });

  const { isLoading: isClaimLoading, isSuccess: isClaimSuccess } = useWaitForTransaction({
    hash: claimData?.hash,
  });

  // Calculate percentage of network hash rate
  const networkHashRatePercentage = userHashRate && networkHashRate
    ? (Number(userHashRate) / Number(networkHashRate) * 100).toFixed(4)
    : '0.0000';

  return {
    unclaimedRewards: unclaimedRewards ? formatUnits(unclaimedRewards as bigint, 18) : '0',
    userMiningRate: userMiningRate ? formatUnits(userMiningRate as bigint, 18) : '0',
    networkHashRate: networkHashRate ? formatUnits(networkHashRate as bigint, 18) : '0',
    userHashRate: userHashRate ? formatUnits(userHashRate as bigint, 18) : '0',
    networkHashRatePercentage,
    blocksUntilHalving: blocksUntilHalving ? Number(blocksUntilHalving) : 0,
    claimReward,
    isClaimLoading,
    isClaimSuccess,
  };
} 