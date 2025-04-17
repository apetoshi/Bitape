'use client';

import { useAccount, useContractRead, useBalance } from 'wagmi';
import { formatUnits } from 'viem';
import { APECHAIN_ID, CONTRACT_ADDRESSES, ERC20_ABI, MAIN_CONTRACT_ABI } from '../config/contracts';
import { useEffect, useState } from 'react';

export interface ResourcesData {
  apeBalance: string;
  bitBalance: string;
  spacesLeft: number;
  gigawattsAvailable: number;
  isLoading: boolean;
  hasFacility: boolean;
}

export function useResourcesData(): ResourcesData {
  const { address, isConnected } = useAccount();
  const [spacesLeft, setSpacesLeft] = useState<number>(0);
  const [gigawattsAvailable, setGigawattsAvailable] = useState<number>(0);
  const [hasFacility, setHasFacility] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Get native APE balance
  const { data: apeBalanceData, isLoading: isApeLoading } = useBalance({
    address: address as `0x${string}`,
    chainId: APECHAIN_ID,
    query: {
      enabled: !!address,
    },
  });

  // Get BIT token balance
  const { data: bitBalanceData, isLoading: isBitLoading } = useContractRead({
    address: CONTRACT_ADDRESSES.BIT_TOKEN,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    },
  });

  // Check if facility exists
  const { data: hasInitializedFacility, isLoading: isInitLoading } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'initializedStarterFacility',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    },
  });

  // Get facility data
  const { data: facilityData, isLoading: isFacilityLoading } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'getPlayerFacility',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address && !!hasInitializedFacility,
    },
  });

  // Get user miners count
  const { data: userMinersData, isLoading: isMinersLoading } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'getUserMiners',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address && !!hasInitializedFacility,
    },
  });

  useEffect(() => {
    if (hasInitializedFacility !== undefined) {
      setHasFacility(!!hasInitializedFacility);
    }
  }, [hasInitializedFacility]);

  useEffect(() => {
    // Update loading state
    setIsLoading(
      isApeLoading || 
      isBitLoading || 
      isInitLoading || 
      (hasFacility && (isFacilityLoading || isMinersLoading))
    );

    // Process facility data
    if (facilityData && userMinersData && hasFacility) {
      try {
        const [power, level, miners, capacity, used, resources, spaces] = facilityData as unknown as bigint[];
        const [minerIds] = userMinersData as [bigint[], bigint[], bigint[]];
        
        const totalMiners = minerIds ? minerIds.length : 0;
        const maxSpaces = Number(spaces);
        const totalPower = Number(power);
        const usedPower = Number(used);
        
        // Set spaces left
        setSpacesLeft(maxSpaces - totalMiners);
        
        // Set gigawatts available
        setGigawattsAvailable(totalPower - usedPower);
      } catch (error) {
        console.error('Error processing facility data:', error);
      }
    } else if (!hasFacility) {
      setSpacesLeft(0);
      setGigawattsAvailable(0);
    }
  }, [facilityData, userMinersData, hasFacility, isApeLoading, isBitLoading, isInitLoading, isFacilityLoading, isMinersLoading]);

  return {
    apeBalance: apeBalanceData?.formatted ?? '0',
    bitBalance: bitBalanceData ? formatUnits(bitBalanceData as bigint, 18) : '0',
    spacesLeft,
    gigawattsAvailable,
    isLoading,
    hasFacility
  };
} 