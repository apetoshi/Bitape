'use client';

import { useAccount, useContractRead, useBalance } from 'wagmi';
import { formatUnits, zeroAddress } from 'viem';
import { APECHAIN_ID, CONTRACT_ADDRESSES, MAIN_CONTRACT_ABI, BIT_TOKEN_ABI, BIT_TOKEN_ADDRESS } from '../config/contracts';
import { useEffect, useState } from 'react';

export interface ResourcesData {
  apeBalance: string;
  bitBalance: string;
  spacesLeft: number;
  gigawattsAvailable: number;
  isLoading: boolean;
  hasFacility: boolean;
  // Add more detailed stats
  hashRate: string;
  miningRate: string;
  networkShare: string;
}

export function useResourcesData(): ResourcesData {
  const { address, isConnected } = useAccount();
  const [spacesLeft, setSpacesLeft] = useState<number>(0);
  const [gigawattsAvailable, setGigawattsAvailable] = useState<number>(0);
  const [hasFacility, setHasFacility] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hashRate, setHashRate] = useState<string>('0');
  const [miningRate, setMiningRate] = useState<string>('0');
  const [networkShare, setNetworkShare] = useState<string>('0');

  // Add hardcoded facility data as fallback
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  
  // Get native APE balance
  const { data: apeBalanceData, isLoading: isApeLoading } = useBalance({
    address: address as `0x${string}`,
    chainId: APECHAIN_ID,
    query: {
      enabled: !!address,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  // Get BIT token balance
  const { data: bitBalanceData, isLoading: isBitLoading } = useContractRead({
    address: BIT_TOKEN_ADDRESS,
    abi: BIT_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address || zeroAddress],
    query: {
      enabled: !!address,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  // Get facility data - THIS IS NOW THE SINGLE SOURCE OF TRUTH FOR FACILITY OWNERSHIP
  const { data: facilityData, isLoading: isFacilityLoading } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'ownerToFacility',
    args: [address || zeroAddress],
    query: {
      enabled: !!address,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  // Add explicit logging for facility data
  useEffect(() => {
    if (facilityData) {
      console.log('✅ SUCCESSFULLY RECEIVED ownerToFacility response:', facilityData);
      
      // Determine if user has a facility based on facilityIndex > 0
      if (Array.isArray(facilityData) && facilityData.length >= 7) {
        const facilityIndex = Number(facilityData[0] || 0);
        const userHasFacility = facilityIndex > 0;
        
        console.log(`User ${userHasFacility ? 'HAS' : 'DOES NOT HAVE'} a facility (facilityIndex: ${facilityIndex})`);
        setHasFacility(userHasFacility);
      } else {
        console.log('Invalid facility data format, assuming user has no facility');
        setHasFacility(false);
      }
    }
  }, [facilityData]);

  // PRODUCTION: Only use actual contract data, not demo/mock data
  useEffect(() => {
    if (isConnected && address) {
      console.log('🔄 Using REAL contract data for connected user:', address);
      // setHasFacility is now determined solely by contract data in the previous useEffect
    }
  }, [isConnected, address]);

  // Get user miners using the paginated function
  const { data: userMiners, isLoading: isMinersLoading } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'getPlayerMinersPaginated',
    args: [address || zeroAddress, BigInt(0), BigInt(100)], // Start at index 0, get up to 100 miners
    query: {
      enabled: !!address,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  // Get player stats for mining details
  const { data: playerStatsData, isLoading: isStatsLoading } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'getPlayerStats',
    args: [address || zeroAddress],
    query: {
      enabled: !!address,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  // Process player stats
  useEffect(() => {
    // Process player stats data
    if (playerStatsData && Array.isArray(playerStatsData) && playerStatsData.length >= 4) {
      try {
        console.log('Player stats data:', playerStatsData);
        
        // Format hashRate (GH/s)
        const hashRateValue = Number(playerStatsData[1] || BigInt(0));
        setHashRate(hashRateValue.toString());
        
        // Format miningRate (BIT/day)
        const miningRateValue = Number(playerStatsData[2] || BigInt(0)) / 10**18;
        setMiningRate(miningRateValue.toFixed(2));
        
        // Format networkShare (%)
        const networkShareValue = Number(playerStatsData[3] || BigInt(0)) / 100;
        setNetworkShare(networkShareValue.toFixed(2));
      } catch (error) {
        console.error('Error processing player stats:', error);
        setHashRate('0');
        setMiningRate('0');
        setNetworkShare('0');
      }
    }
  }, [playerStatsData]);

  // Calculate available resources based on facility data
  useEffect(() => {
    if (hasFacility) {
      // Directly use the facilityData from the contract read
      if (facilityData && Array.isArray(facilityData) && facilityData.length >= 5) {
        try {
          console.log('useResourcesData - Using facilityData from contract:', facilityData);
          
          // Parse the array values
          const maxMiners = Number(facilityData[1] || 0);
          const currMiners = Number(facilityData[2] || 0);
          const totalPower = Number(facilityData[3] || 0);
          const usedPower = Number(facilityData[4] || 0);
          
          // Calculate spaces left (maxMiners - currMiners)
          const spaces = Math.max(0, maxMiners - currMiners);
          setSpacesLeft(spaces);
          
          // Calculate power available (totalPowerOutput - currPowerOutput)
          const power = Math.max(0, totalPower - usedPower);
          setGigawattsAvailable(power);
          
          console.log('useResourcesData - Calculated resources:', {
            spacesLeft: spaces,
            gigawattsAvailable: power,
            maxMiners,
            currMiners,
            totalPower,
            usedPower
          });
        } catch (error) {
          console.error('Error calculating resources from facility data:', error);
          setSpacesLeft(0);
          setGigawattsAvailable(0);
        }
      } else {
        console.warn('useResourcesData - No valid facility data available');
        setSpacesLeft(0);
        setGigawattsAvailable(0);
      }
    } else {
      // No facility
      setSpacesLeft(0);
      setGigawattsAvailable(0);
    }
  }, [hasFacility, facilityData]);

  // Add hardcoded facility data as fallback
  useEffect(() => {
    // Always use hardcoded data when facility exists
    if (hasFacility) {
      // DISABLED - We want to use real data from the contract
      // console.log('⚠️ ResourcesData - Using verified hardcoded facility data');
      // setIsUsingFallback(true);
      
      // // Use the data from the contract explorer screenshot
      // const hardcodedData = {
      //   facilityIndex: 1,
      //   maxMiners: 4,
      //   currMiners: 1,
      //   totalPowerOutput: 28,
      //   currPowerOutput: 1
      // };
      
      // // Set the values directly
      // setSpacesLeft(hardcodedData.maxMiners - hardcodedData.currMiners);
      // setGigawattsAvailable(hardcodedData.totalPowerOutput - hardcodedData.currPowerOutput);
    }
  }, [hasFacility]);

  const formattedApeBalance = apeBalanceData?.formatted ?? '0';
  const formattedBitBalance = bitBalanceData ? formatUnits(bitBalanceData as bigint, 18) : '0';

  console.log('Resources data:', {
    ape: formattedApeBalance,
    bit: formattedBitBalance,
    spaces: spacesLeft,
    power: gigawattsAvailable,
    hashRate,
    miningRate,
    networkShare,
    loading: isLoading,
    hasFacility
  });

  // Create the return object and log it
  const returnData = {
    apeBalance: formattedApeBalance,
    bitBalance: formattedBitBalance,
    spacesLeft,
    gigawattsAvailable,
    isLoading,
    hasFacility, // Use actual value from contract, not forcing to true
    hashRate,
    miningRate,
    networkShare
  };
  
  // Remove FINAL OVERRIDE
  // if (isConnected) {
  //   console.log('⚠️ FINAL OVERRIDE: Using hardcoded values for connected user');
  //   returnData.spacesLeft = 3; // 4 max - 1 current
  //   returnData.gigawattsAvailable = 27; // 28 total - 1 current
  //   returnData.hasFacility = true;
  //   console.log('🔄 FINAL ResourcesData:', returnData);
  // }
  
  console.log('🔄 RETURNING ResourcesData:', returnData);
  
  return returnData;
} 