'use client';

import React, { useEffect, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { Button } from './ui/button';
import { useAccount, useContractRead } from 'wagmi';
import { CONTRACT_ADDRESSES, MAIN_CONTRACT_ABI } from '@/config/contracts';
import { zeroAddress } from 'viem';

export default function SpaceTab() {
  const { isConnected, address } = useAccount();
  const gameState = useGameState();
  const [facilityData, setFacilityData] = useState({
    level: 1,
    maxMiners: 4,
    currMiners: 1,
    totalPower: 28,
    usedPower: 1
  });

  // Direct contract read to get facility data using ownerToFacility
  const { data: rawFacilityData } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'ownerToFacility',
    args: [address || zeroAddress],
    query: {
      enabled: Boolean(address),
    }
  });

  // Process raw facility data
  useEffect(() => {
    if (rawFacilityData && Array.isArray(rawFacilityData) && rawFacilityData.length >= 5) {
      console.log('SpaceTab - Raw facility data received:', rawFacilityData);
      
      try {
        // [facilityIndex, maxMiners, currMiners, totalPowerOutput, currPowerOutput, x, y]
        const facilityIndex = Number(rawFacilityData[0] || 0);
        const maxMiners = Number(rawFacilityData[1] || 0);
        const currMiners = Number(rawFacilityData[2] || 0);
        const totalPowerOutput = Number(rawFacilityData[3] || 0);
        const currPowerOutput = Number(rawFacilityData[4] || 0);
        
        // Only set facility data if facilityIndex > 0 (user has a facility)
        if (facilityIndex > 0) {
          const newFacilityData = {
            level: facilityIndex,
            maxMiners,
            currMiners,
            totalPower: totalPowerOutput,
            usedPower: currPowerOutput
          };
          
          console.log('SpaceTab - Setting new facility data:', newFacilityData);
          setFacilityData(newFacilityData);
          
          console.log('SpaceTab - User has facility with index:', facilityIndex);
        } else {
          console.log('SpaceTab - User does not have a facility (facilityIndex is 0)');
          // Initialize with zeros instead of demo values
          const defaultValues = {
            level: 0,
            maxMiners: 0,
            currMiners: 0,
            totalPower: 0,
            usedPower: 0
          };
          console.log('SpaceTab - Using default zero values');
          setFacilityData(defaultValues);
        }
      } catch (error) {
        console.error('Error processing facility data in SpaceTab:', error);
        
        // Initialize with zeros instead of hardcoded values
        const defaultValues = {
          level: 0,
          maxMiners: 0,
          currMiners: 0,
          totalPower: 0,
          usedPower: 0
        };
        console.log('SpaceTab - Setting default zero values due to error');
        setFacilityData(defaultValues);
      }
    } else {
      // Initialize with zeros if no facility data received
      console.log('SpaceTab - No facility data received, using default zero values');
      const defaultValues = {
        level: 0,
        maxMiners: 0,
        currMiners: 0,
        totalPower: 0,
        usedPower: 0
      };
      console.log('SpaceTab - Setting default zero values');
      setFacilityData(defaultValues);
    }
  }, [rawFacilityData]);

  // Update facility data from gameState when available
  useEffect(() => {
    if (gameState.hasFacility && gameState.facilityData) {
      console.log('SpaceTab - Updating from gameState with real facility data:', gameState.facilityData);
      
      // Always use the real contract data from gameState
      setFacilityData({
        level: gameState.facilityData.level || 0,
        maxMiners: gameState.facilityData.capacity || 0,
        currMiners: gameState.facilityData.miners || 0,
        totalPower: gameState.facilityData.power || 0,
        usedPower: gameState.facilityData.used || 0
      });
    } else if (!gameState.hasFacility) {
      // If user doesn't have a facility, ensure we're displaying zeros
      const defaultValues = {
        level: 0,
        maxMiners: 0,
        currMiners: 0,
        totalPower: 0,
        usedPower: 0
      };
      console.log('SpaceTab - User has no facility, using zeros');
      setFacilityData(defaultValues);
    }
  }, [gameState.hasFacility, gameState.facilityData]);

  // Calculate spaces left and power available
  const spacesLeft = facilityData.maxMiners - facilityData.currMiners;
  const gigawattsAvailable = facilityData.totalPower - facilityData.usedPower;

  // Check if the user has a facility using real data
  const userHasFacility = facilityData.level > 0;

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

  // Add detailed logging to check values before render
  console.log('SpaceTab - Rendering with direct values:', {
    level: facilityData.level,
    maxMiners: facilityData.maxMiners,
    currMiners: facilityData.currMiners,
    totalPower: facilityData.totalPower,
    usedPower: facilityData.usedPower,
    gameStateFacilityData: gameState.facilityData
  });

  return (
    <div className="bg-[#001420] p-3 rounded-md border-2 border-banana">
      <h3 className="font-press-start text-white text-xs mb-4">FACILITY STATUS</h3>

      {gameState.isConnected ? (
        gameState.hasFacility ? (
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
                  style={{ width: `${(facilityData.currMiners / facilityData.maxMiners) * 100}%` }}
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
                  style={{ width: `${(facilityData.usedPower / facilityData.totalPower) * 100}%` }}
                />
              </div>
              <div className="flex justify-between">
                <span className="font-press-start text-white text-[9px]">USED: {facilityData.usedPower}GW</span>
                <span className="font-press-start text-white text-[9px]">MAX: {facilityData.totalPower}GW</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6">
            <p className="font-press-start text-white text-xs">No facility data available</p>
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-6">
          <p className="font-press-start text-white text-xs">Connect wallet to view facility</p>
        </div>
      )}
    </div>
  );
} 