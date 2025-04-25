'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import { CONTRACT_ADDRESSES, MAIN_CONTRACT_ABI } from '../config/contracts';
import { zeroAddress } from 'viem';

// Define the context type
interface FacilityLevelContextType {
  facilityLevel: number;
  setFacilityLevel: (level: number) => void;
  isLevelLoading: boolean;
}

// Create the context with default values
const FacilityLevelContext = createContext<FacilityLevelContextType>({
  facilityLevel: 1,
  setFacilityLevel: () => {},
  isLevelLoading: true
});

// Custom hook to use the facility level context
export const useFacilityLevel = () => useContext(FacilityLevelContext);

interface FacilityLevelProviderProps {
  children: ReactNode;
}

export default function FacilityLevelProvider({ children }: FacilityLevelProviderProps) {
  // Use Wagmi hooks for contract data
  const { address } = useAccount();
  const [facilityLevel, setFacilityLevel] = useState<number>(1);
  const [isLevelLoading, setIsLevelLoading] = useState<boolean>(true);

  // Direct contract read using ownerToFacility (same as useGameState.ts)
  const { data: rawFacilityData, refetch: refetchFacility } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'ownerToFacility',
    args: [address || zeroAddress],
    query: {
      enabled: Boolean(address),
      refetchInterval: 10000, // Refetch every 10 seconds
    }
  });

  // Process facility data when it changes
  useEffect(() => {
    if (rawFacilityData) {
      try {
        if (Array.isArray(rawFacilityData) && rawFacilityData.length >= 7) {
          // [facilityIndex, maxMiners, currMiners, totalPowerOutput, currPowerOutput, x, y]
          const facilityIndex = Number(rawFacilityData[0] || 0);
          console.log('⚠️ FacilityLevelProvider: Raw facility data indices:', {
            facilityIndex: Number(rawFacilityData[0]),
            maxMiners: Number(rawFacilityData[1]),
            currMiners: Number(rawFacilityData[2]),
            totalPower: Number(rawFacilityData[3]),
            usedPower: Number(rawFacilityData[4])
          });
          
          // Only update if we have a valid facility (index > 0)
          if (facilityIndex > 0) {
            console.log(`⚠️ FacilityLevelProvider: Setting facility level to ${facilityIndex}`);
            setFacilityLevel(facilityIndex);
          } else {
            console.log('⚠️ FacilityLevelProvider: No valid facility (index 0), defaulting to level 1');
            setFacilityLevel(1);
          }
        } else {
          console.log('⚠️ FacilityLevelProvider: Invalid facility data format:', rawFacilityData);
          setFacilityLevel(1);
        }
      } catch (error) {
        console.error('⚠️ FacilityLevelProvider: Error processing facility data:', error);
        setFacilityLevel(1); // Default to level 1 on error
      }
      
      setIsLevelLoading(false);
    }
  }, [rawFacilityData]);

  // Add periodic refresh of facility data
  useEffect(() => {
    // Initial refetch
    if (refetchFacility) {
      refetchFacility();
    }
    
    // Set up interval to refetch
    const intervalId = setInterval(() => {
      if (refetchFacility) {
        console.log('⚠️ FacilityLevelProvider: Refreshing facility data...');
        refetchFacility();
      }
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [refetchFacility]);

  return (
    <FacilityLevelContext.Provider value={{ facilityLevel, setFacilityLevel, isLevelLoading }}>
      {children}
    </FacilityLevelContext.Provider>
  );
} 