'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { useAccount, useContractRead } from 'wagmi';
import { CONTRACT_ADDRESSES, MAIN_CONTRACT_ABI } from '@/config/contracts';
import { zeroAddress, formatEther } from 'viem';
import { useIsMounted } from '@/hooks/useIsMounted';
import { useConnectModal } from '@rainbow-me/rainbowkit';

// Default facility data with zeros
const DEFAULT_FACILITY_DATA = {
  level: 0,
  maxMiners: 0,
  currMiners: 0,
  totalPower: 0,
  usedPower: 0
};

export default function SpaceTab() {
  const { isConnected, address } = useAccount();
  const gameState = useGameState();
  const isMounted = useIsMounted();
  const [facilityData, setFacilityData] = useState(DEFAULT_FACILITY_DATA);
  
  // Single source of truth for tracking which data source to use
  const [dataSource, setDataSource] = useState<'none' | 'contract' | 'gameState'>('none');

  // Direct contract read to get facility data using ownerToFacility
  const { data: rawFacilityData } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'ownerToFacility',
    args: [address || zeroAddress],
    query: {
      enabled: Boolean(address) && isMounted,
    }
  });

  // Process contract data with memoization
  const processedContractData = useMemo(() => {
    if (!rawFacilityData || !Array.isArray(rawFacilityData) || rawFacilityData.length < 5) {
      return null;
    }
      
      try {
        // [facilityIndex, maxMiners, currMiners, totalPowerOutput, currPowerOutput, x, y]
        const facilityIndex = Number(rawFacilityData[0] || 0);
        const maxMiners = Number(rawFacilityData[1] || 0);
        const currMiners = Number(rawFacilityData[2] || 0);
        const totalPowerOutput = Number(rawFacilityData[3] || 0);
        const currPowerOutput = Number(rawFacilityData[4] || 0);
        
      // Only set facility data if facilityIndex > 0 (user has a facility)
        if (facilityIndex > 0) {
        return {
            level: facilityIndex,
            maxMiners,
            currMiners,
            totalPower: totalPowerOutput,
            usedPower: currPowerOutput
          };
        }
      } catch (error) {
        console.error('Error processing facility data in SpaceTab:', error);
    }
    
    return null;
  }, [rawFacilityData]);

  // Process gameState data with memoization
  const processedGameStateData = useMemo(() => {
    if (!gameState.hasFacility || !gameState.facilityData) {
      return null;
    }
    
    return {
      level: Number(gameState.facilityData.level) || 0,
      maxMiners: Number(gameState.facilityData.capacity) || 0,
      currMiners: Number(gameState.facilityData.miners) || 0,
      totalPower: Number(gameState.facilityData.power) || 0,
      usedPower: Number(gameState.facilityData.used) || 0
    };
  }, [gameState.hasFacility, gameState.facilityData]);

  // Single update effect that prioritizes data sources
  useEffect(() => {
    if (!isMounted) return;
    
    // Priority: gameState > contract data > default
    if (processedGameStateData) {
      if (dataSource !== 'gameState' || 
          JSON.stringify(facilityData) !== JSON.stringify(processedGameStateData)) {
        console.log('SpaceTab - Using game state data:', processedGameStateData);
        console.log('SpaceTab - Game state facility level:', processedGameStateData.level);
        console.log('SpaceTab - Game state max miners:', processedGameStateData.maxMiners);
        setFacilityData(processedGameStateData);
        setDataSource('gameState');
      }
    } else if (processedContractData) {
      if (dataSource !== 'contract' || 
          JSON.stringify(facilityData) !== JSON.stringify(processedContractData)) {
        console.log('SpaceTab - Using contract data:', processedContractData);
        console.log('SpaceTab - Contract facility level:', processedContractData.level);
        console.log('SpaceTab - Contract max miners:', processedContractData.maxMiners);
        setFacilityData(processedContractData);
        setDataSource('contract');
      }
    } else if (dataSource !== 'none') {
      console.log('SpaceTab - Using default zeros');
      setFacilityData(DEFAULT_FACILITY_DATA);
      setDataSource('none');
    }
  }, [processedGameStateData, processedContractData, isMounted, dataSource, facilityData]);
  
  // Reset data source when dependencies change
  useEffect(() => {
    setDataSource('none');
  }, [address]);

  // Force refresh when facility level changes in gameState
  useEffect(() => {
    if (gameState.facilityData?.level !== facilityData.level) {
      console.log('SpaceTab - Detected facility level change!', {
        'Current level': facilityData.level,
        'New level': gameState.facilityData?.level
      });
      setDataSource('none'); // Force a refresh of the data source
    }
  }, [gameState.facilityData?.level, facilityData.level]);

  // Calculate derived values using memoization
  const { spacesLeft, gigawattsAvailable, userHasFacility } = useMemo(() => ({
    spacesLeft: facilityData.maxMiners - facilityData.currMiners,
    gigawattsAvailable: facilityData.totalPower - facilityData.usedPower,
    userHasFacility: facilityData.level > 0
  }), [facilityData]);

  // If user is not connected, show connection message
  if (!isConnected) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <div className="pixel-text text-white">Connect wallet to view your Space</div>
      </div>
    );
  }

  // Check if user has a facility
  if (!userHasFacility && !gameState.hasFacility) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <div className="pixel-text text-white">You don't have a facility yet</div>
        <Button className="mt-4 pixel-text bg-banana text-black hover:bg-banana/90" onClick={gameState.purchaseFacility}>
          Buy a Facility
        </Button>
        
        {/* ApeCoin Powered Text */}
        <div className="flex items-center justify-center mt-2">
          <div className="w-3 h-3 mr-1">
            <img 
              src="/apecoin.png" 
              alt="ApeCoin Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-banana font-press-start text-[8px]">Powered by ApeCoin</span>
        </div>
      </div>
    );
  }

  // Main facility data display - only show if user has a facility
  return (
    <div className="h-full p-4 flex flex-col space-y-6">
      <div className="space-y-6 flex-grow">
        {/* Space Usage */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
            <div className="pixel-text text-white">Spaces Left:</div>
            <div className="pixel-text text-banana">{spacesLeft} Spaces</div>
              </div>
          
          <Progress 
            value={(facilityData.currMiners / facilityData.maxMiners) * 100} 
            className="h-2 bg-blue-950" 
                />
          
          <div className="flex justify-between text-xs">
            <div className="pixel-text text-white/70">Used: {facilityData.currMiners}</div>
            <div className="pixel-text text-white/70">Max: {facilityData.maxMiners}</div>
              </div>
            </div>

        {/* Power Usage */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
            <div className="pixel-text text-white">Gigawatts Available:</div>
            <div className="pixel-text text-banana">{gigawattsAvailable} GW</div>
              </div>
          
          <Progress 
            value={(facilityData.usedPower / facilityData.totalPower) * 100} 
            className="h-2 bg-blue-950" 
                />
          
          <div className="flex justify-between text-xs">
            <div className="pixel-text text-white/70">Used: {facilityData.usedPower} GW</div>
            <div className="pixel-text text-white/70">Max: {facilityData.totalPower} GW</div>
              </div>
            </div>

        {/* Facility Level */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
            <div className="pixel-text text-white">Facility Level:</div>
            <div className="pixel-text text-banana">Level {facilityData.level}</div>
          </div>
        </div>
      </div>
      
      {/* Upgrade Button - only show if user can upgrade */}
      {gameState.hasFacility && (
        <Button 
          className="w-full bg-banana pixel-text text-black hover:bg-banana/90"
          onClick={gameState.upgradeFacility}
          disabled={gameState.isUpgradingFacility}
        >
          {gameState.isUpgradingFacility ? 'UPGRADING...' : 'UPGRADE FACILITY'}
        </Button>
      )}
    </div>
  );
} 