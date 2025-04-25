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

  // Single effect to update facility data with priority
  useEffect(() => {
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
  }, [processedGameStateData, processedContractData, dataSource, facilityData]);
  
  // Reset data source when dependencies change
  useEffect(() => {
    setDataSource('none');
  }, [address]);

  // Calculate derived values using memoization
  const { spacesLeft, gigawattsAvailable, userHasFacility } = useMemo(() => ({
    spacesLeft: facilityData.maxMiners - facilityData.currMiners,
    gigawattsAvailable: facilityData.totalPower - facilityData.usedPower,
    userHasFacility: facilityData.level > 0
  }), [facilityData]);

  // Check if user is not connected
  if (!isConnected) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <div className="pixel-text text-white">Connect wallet to view your Space</div>
      </div>
    );
  }

  // Check if facility is fully initialized (has facility AND has claimed starter miner)
  const isFullyInitialized = userHasFacility && gameState.hasClaimedStarterMiner;

  // Only render facility UI if user actually has a facility
  return (
    <div className="bg-[#001420]/70 border border-banana p-4 rounded-md">
      <div className="space-y-3">
        <div className="border-b border-white/20 pb-2">
          <span className="font-press-start text-white text-xs">- YOUR APEROOM</span>
        </div>
        {userHasFacility ? (
          isFullyInitialized ? (
            <>
              <div className="border-b border-white/20 pb-2">
                <span className="font-press-start text-white text-xs">- TOTAL SPACES</span>
                <span className="font-press-start text-banana text-xs block mt-1 ml-2">
                  {facilityData.maxMiners} SPACES
                </span>
              </div>
              <div className="border-b border-white/20 pb-2">
                <span className="font-press-start text-white text-xs">- TOTAL GIGAWATTS</span>
                <span className="font-press-start text-banana text-xs block mt-1 ml-2">
                  {facilityData.totalPower} GIGAWATTS
                </span>
              </div>
              <div className="border-b border-white/20 pb-2">
                <span className="font-press-start text-white text-xs">- FOOD SOURCE</span>
                <span className="font-press-start text-banana text-xs block mt-1 ml-2">FREE BANANAS 🍌 FROM APETOSHI</span>
              </div>

              {/* Space usage visualization */}
              <div className="space-y-2 pt-2">
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

              {/* Power usage visualization */}
              <div className="space-y-2 pt-2">
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
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center py-4">
              <div className="pixel-text text-white text-sm mb-1">NO MINING SPACE</div>
              <div className="font-press-start text-banana text-xs block mb-0.5">0 TOTAL SPACES</div>
              <div className="font-press-start text-banana text-xs block mb-1">0 TOTAL GIGAWATTS</div>
              <div className="pixel-text text-white text-sm mb-2">CANT MINE WITHOUT SPACE, BUDDY</div>
              <Button className="pixel-text bg-banana text-black hover:bg-banana/90 py-1 px-2 text-xs" onClick={() => gameState.getStarterMiner(0, 0)}>
                Get Starter Miner
              </Button>
          </div>
          )
        ) : (
          <div className="flex h-full flex-col items-center justify-center py-4">
            <div className="pixel-text text-white text-sm mb-2">You don't have a facility yet</div>
            <Button className="pixel-text bg-banana text-black hover:bg-banana/90 py-1 px-2 text-xs" onClick={gameState.purchaseFacility}>
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
        )}

        {/* Upgrade button - only show if user can upgrade */}
        {isFullyInitialized && gameState.hasFacility && (
          <div className="mt-4">
            <Button 
              className="w-full font-press-start text-xs bg-banana text-royal hover:bg-banana/90"
              onClick={gameState.upgradeFacility}
              disabled={gameState.isUpgradingFacility}
            >
              {gameState.isUpgradingFacility ? 'UPGRADING...' : 'UPGRADE FACILITY'}
            </Button>
        </div>
      )}
      </div>
    </div>
  );
} 