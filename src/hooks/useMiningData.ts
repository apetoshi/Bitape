'use client';

import { useAccount, useContractRead, useContractWrite, useTransaction } from 'wagmi';
import { CONTRACT_ADDRESSES, MINING_CONTROLLER_ABI } from '@/config/contracts';
import { formatUnits } from 'viem';

interface MiningData {
  minedBit: bigint;
  hashRate: bigint;
  networkShare: bigint;
}

export function useMiningData() {
  const { address } = useAccount();

  // Get mining data
  const { data: miningData } = useContractRead({
    address: CONTRACT_ADDRESSES.MINING_CONTROLLER,
    abi: MINING_CONTROLLER_ABI,
    functionName: 'getMiningData',
    args: [address],
    query: {
      enabled: !!address,
    },
  }) as { data: [bigint, bigint, bigint] | undefined };

  // Format mining data
  const formattedMiningData = {
    minedBit: miningData ? formatUnits(miningData[0], 18) : '0',
    hashRate: miningData ? formatUnits(miningData[1], 18) : '0',
    networkShare: miningData ? formatUnits(miningData[2], 18) : '0',
  };

  // Claim rewards function
  const { writeContract, data: claimData } = useContractWrite();

  const handleClaimReward = async () => {
    if (!address) return;
    
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.MINING_CONTROLLER,
        abi: MINING_CONTROLLER_ABI,
        functionName: 'claimReward',
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
    claimReward: handleClaimReward,
    isClaimLoading,
    isClaimSuccess,
  };
} 