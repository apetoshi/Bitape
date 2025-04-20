'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useGameState } from '@/hooks/useGameState';
import { useResourcesData } from '@/hooks/useResourcesData';

export function ResourcesPanel() {
  const { isConnected } = useAccount();
  const gameState = useGameState();
  const resourcesData = useResourcesData();
  
  // Add debug logging to track data in production
  console.log('ResourcesPanel - gameState:', {
    facilityData: gameState.facilityData,
    apeBalance: gameState.apeBalance,
    bitBalance: gameState.bitBalance,
    isConnected: gameState.isConnected
  });
  console.log('ResourcesPanel - resourcesData:', resourcesData);
  
  // Calculate spaces left and gigawatts available from gameState.facilityData with safety checks
  const spacesLeft = gameState.facilityData && 
    typeof gameState.facilityData.capacity !== 'undefined' && 
    typeof gameState.facilityData.miners !== 'undefined' ? 
      gameState.facilityData.capacity - gameState.facilityData.miners : 
      (typeof resourcesData.spacesLeft !== 'undefined' ? resourcesData.spacesLeft : 0);
    
  const gigawattsAvailable = gameState.facilityData && 
    typeof gameState.facilityData.power !== 'undefined' && 
    typeof gameState.facilityData.used !== 'undefined' ? 
      gameState.facilityData.power - gameState.facilityData.used : 
      (typeof resourcesData.gigawattsAvailable !== 'undefined' ? resourcesData.gigawattsAvailable : 0);

  if (!isConnected) {
    return (
      <div className="bg-[#001420] p-3 rounded-md border-2 border-banana">
        <h3 className="font-press-start text-white text-xs mb-4">RESOURCES</h3>
        <div className="text-center py-4">
          <p className="font-press-start text-white text-xs">CONNECT WALLET TO VIEW RESOURCES</p>
        </div>
      </div>
    );
  }

  // Ensure values are always defined
  const apeBalanceDisplay = resourcesData.apeBalance || '0';
  const bitBalanceDisplay = resourcesData.bitBalance || '0';
  const spacesLeftDisplay = spacesLeft || 0;
  const gigawattsAvailableDisplay = gigawattsAvailable || 0;

  return (
    <div className="bg-[#001420] p-3 rounded-md border-2 border-banana">
      <h3 className="font-press-start text-white text-xs mb-4">RESOURCES</h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-[#1a2a38] pb-2">
          <span className="font-press-start text-white text-xs">APE BALANCE</span>
          <span className="font-press-start text-banana text-xs">{apeBalanceDisplay} APE</span>
        </div>
        
        <div className="flex justify-between items-center border-b border-[#1a2a38] pb-2">
          <span className="font-press-start text-white text-xs">BIT BALANCE</span>
          <span className="font-press-start text-banana text-xs">{bitBalanceDisplay} BIT</span>
        </div>
        
        <div className="flex justify-between items-center border-b border-[#1a2a38] pb-2">
          <span className="font-press-start text-white text-xs">SPACES LEFT</span>
          <span className="font-press-start text-banana text-xs">{spacesLeftDisplay} SPACES</span>
        </div>
        
        <div className="flex justify-between items-center border-b border-[#1a2a38] pb-2">
          <span className="font-press-start text-white text-xs">GIGAWATTS AVAILABLE</span>
          <span className="font-press-start text-banana text-xs">{gigawattsAvailableDisplay} GW</span>
        </div>
      </div>
    </div>
  );
}
