'use client';

import { useAccount, useContractRead, useContractWrite, useTransaction } from 'wagmi';
import { CONTRACT_ADDRESSES, MAIN_CONTRACT_ABI } from '@/config/contracts';
import { formatUnits, zeroAddress } from 'viem';

interface MiningData {
  minedBit: string;
  hashRate: string;
  networkShare: string;
}

export function useMiningData(): MiningData & {
  claimRewards: () => Promise<void>;
  isClaimLoading: boolean;
  isClaimSuccess: boolean;
} {
  const { address } = useAccount();

  // Get player hashrate
  const { data: playerHashrate } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'playerHashrate',
    args: [address || zeroAddress],
    query: {
      enabled: !!address,
    },
  });

  // Get total network hashrate
  const { data: totalHashrate } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'totalHashrate',
    query: {
      enabled: true,
    },
  });

  // Get pending rewards
  const { data: pendingRewards } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'pendingRewards',
    args: [address || zeroAddress],
    query: {
      enabled: !!address,
    },
  });

  // Calculate network share
  const networkShare = playerHashrate && totalHashrate && Number(totalHashrate) > 0
    ? (BigInt(playerHashrate) * BigInt(10000)) / BigInt(totalHashrate)
    : BigInt(0);

  // Format mining data
  const formattedMiningData: MiningData = {
    minedBit: pendingRewards ? formatUnits(pendingRewards as bigint, 18) : '0',
    hashRate: playerHashrate ? formatUnits(playerHashrate as bigint, 18) : '0',
    networkShare: networkShare ? formatUnits(networkShare, 2) : '0', // As percentage with 2 decimal places
  };

  // Claim rewards function
  const { writeContract, data: claimData } = useContractWrite();

  const handleClaimRewards = async () => {
    if (!address) return;
    
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.MAIN,
        abi: MAIN_CONTRACT_ABI,
        functionName: 'claimRewards',
      });
    } catch (error) {
      console.error('Error claiming reward:', error);
    }
  };

  const { isLoading: isClaimLoading, isSuccess: isClaimSuccess } = useTransaction({
    hash: claimData,
  });

  return {
    ...formattedMiningData,
    claimRewards: handleClaimRewards,
    isClaimLoading,
    isClaimSuccess,
  };
} 