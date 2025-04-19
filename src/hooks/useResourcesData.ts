'use client';

import { useAccount, useContractRead, useBalance } from 'wagmi';
import { formatUnits, zeroAddress } from 'viem';
import { APECHAIN_ID, CONTRACT_ADDRESSES, ERC20_ABI, MAIN_CONTRACT_ABI, BIT_TOKEN_ABI } from '../config/contracts';
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
    abi: BIT_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address || zeroAddress],
    query: {
      enabled: !!address,
    },
  });

  // Check if facility exists
  const { data: hasInitializedFacility, isLoading: isInitLoading } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'initializedStarterFacility',
    args: [address || zeroAddress],
    query: {
      enabled: !!address,
    },
  });

  // Get facility data
  const { data: facilityData, isLoading: isFacilityLoading } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'getPlayerFacility',
    args: [address || zeroAddress],
    query: {
      enabled: !!address && !!hasInitializedFacility,
    },
  });

  // Get user miners using the paginated function
  const { data: userMiners, isLoading: isMinersLoading } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'getPlayerMinersPaginated',
    args: [address || zeroAddress, BigInt(0), BigInt(100)], // Start at index 0, get up to 100 miners
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
    if (facilityData && hasFacility) {
      try {
        // facilityData is an array of values: [power, level, miners, capacity, used, resources, spaces]
        const facilityValues = facilityData as unknown as bigint[];
        const totalPower = Number(facilityValues[0] || BigInt(0));
        const usedPower = Number(facilityValues[4] || BigInt(0));
        const maxSpaces = Number(facilityValues[6] || BigInt(0));
        
        // Count user miners
        const minersList = userMiners as unknown as any[] || [];
        const totalMiners = minersList.length;
        
        // Set spaces left
        setSpacesLeft(maxSpaces - totalMiners);
        
        // Set gigawatts available
        setGigawattsAvailable(totalPower - usedPower);
      } catch (error) {
        console.error('Error processing facility data:', error);
        setSpacesLeft(0);
        setGigawattsAvailable(0);
      }
    } else if (!hasFacility) {
      setSpacesLeft(0);
      setGigawattsAvailable(0);
    }
  }, [facilityData, userMiners, hasFacility, isApeLoading, isBitLoading, isInitLoading, isFacilityLoading, isMinersLoading]);

  return {
    apeBalance: apeBalanceData?.formatted ?? '0',
    bitBalance: bitBalanceData ? formatUnits(bitBalanceData as bigint, 18) : '0',
    spacesLeft,
    gigawattsAvailable,
    isLoading,
    hasFacility
  };
} 