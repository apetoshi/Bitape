'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { Button } from './ui/button';
import { useAccount, useContractRead } from 'wagmi';
import { CONTRACT_ADDRESSES, MAIN_CONTRACT_ABI } from '@/config/contracts';
import { zeroAddress } from 'viem';
import { useIsMounted } from '@/hooks/useIsMounted';

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

  // Memoize facility data processing to avoid redundant updates
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
      
      // Only return valid facility data if facilityIndex > 0
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

  // Memoize gameState facility data
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
    
    // Prevent update loops by using a single state update strategy
    // Priority: gameState > contract data > default
    if (processedGameStateData) {
      if (dataSource !== 'gameState' || 
          JSON.stringify(facilityData) !== JSON.stringify(processedGameStateData)) {
        console.log('SpaceTab - Using game state data:', processedGameStateData);
        setFacilityData(processedGameStateData);
        setDataSource('gameState');
      }
    } else if (processedContractData) {
      if (dataSource !== 'contract' || 
          JSON.stringify(facilityData) !== JSON.stringify(processedContractData)) {
        console.log('SpaceTab - Using contract data:', processedContractData);
        setFacilityData(processedContractData);
        setDataSource('contract');
      }
    } else if (dataSource !== 'none') {
      console.log('SpaceTab - Using default zeros');
      setFacilityData(DEFAULT_FACILITY_DATA);
      setDataSource('none');
    }
  }, [processedGameStateData, processedContractData, isMounted, dataSource, facilityData]);
  
  // Reset data source when dependencies change to force re-evaluation
  useEffect(() => {
    setDataSource('none');
  }, [address]);

  // Calculate spaces left and power available - memoized
  const { spacesLeft, gigawattsAvailable, userHasFacility } = useMemo(() => ({
    spacesLeft: facilityData.maxMiners - facilityData.currMiners,
    gigawattsAvailable: facilityData.totalPower - facilityData.usedPower,
    userHasFacility: facilityData.level > 0
  }), [facilityData]);

  if (!isMounted) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <div className="pixel-text text-white">Loading facility data...</div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <div className="pixel-text text-white">Connect wallet to view your Space</div>
      </div>
    );
  }

  if (!userHasFacility && !gameState.hasFacility) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <div className="pixel-text text-white">You don't have a facility yet</div>
        <Button className="mt-4 pixel-text bg-banana text-black hover:bg-banana/90" onClick={gameState.purchaseFacility}>
          Buy a Facility
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-[#001420] p-3 rounded-md border-2 border-banana">
      <h3 className="font-press-start text-white text-xs mb-4">FACILITY STATUS</h3>

      {isConnected ? (
        userHasFacility || gameState.hasFacility ? (
          <div className="space-y-6">
            {/* Slots/Spaces */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-press-start text-white text-xs">SPACES LEFT:</span>
                <span className="font-press-start text-banana text-xs">{spacesLeft} SPACES</span>
              </div>
              <div className="w-full bg-blue-900 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-yellow-400 h-full" 
                  style={{ width: `${facilityData.maxMiners ? (facilityData.currMiners / facilityData.maxMiners) * 100 : 0}%` }}
                />
              </div>
              <div className="flex justify-between">
                <span className="font-press-start text-white text-[9px]">USED: {facilityData.currMiners}</span>
                <span className="font-press-start text-white text-[9px]">MAX: {facilityData.maxMiners}</span>
              </div>
            </div>

            {/* Power */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-press-start text-white text-xs">GIGAWATTS AVAILABLE:</span>
                <span className="font-press-start text-banana text-xs">{gigawattsAvailable} GW</span>
              </div>
              <div className="w-full bg-blue-900 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-yellow-400 h-full" 
                  style={{ width: `${facilityData.totalPower ? (facilityData.usedPower / facilityData.totalPower) * 100 : 0}%` }}
                />
              </div>
              <div className="flex justify-between">
                <span className="font-press-start text-white text-[9px]">USED: {facilityData.usedPower} GW</span>
                <span className="font-press-start text-white text-[9px]">MAX: {facilityData.totalPower} GW</span>
              </div>
            </div>

            {/* Upgrade Requirements (Shown only to keep UI consistent) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-press-start text-white text-xs">UPGRADE REQUIREMENTS:</span>
              </div>
              <div className="pl-4 space-y-1">
                <p className="font-press-start text-white text-[9px]">• LEVEL: {facilityData.level}</p>
                <p className="font-press-start text-white text-[9px]">Upgrade in $BIT</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="font-press-start text-white text-xs">NO FACILITY DETECTED</p>
            <p className="font-press-start text-white text-[9px] mt-2">PURCHASE A FACILITY TO BEGIN MINING</p>
          </div>
        )
      ) : (
        <div className="text-center py-4">
          <p className="font-press-start text-white text-xs">CONNECT WALLET TO VIEW FACILITY</p>
        </div>
      )}
    </div>
  );
} 