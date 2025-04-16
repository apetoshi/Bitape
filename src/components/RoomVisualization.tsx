import React, { useState } from 'react';
import Image from 'next/image';
import { useContractRead } from 'wagmi';
import { CONTRACT_ADDRESSES, MAIN_CONTRACT_ABI } from '../config/contracts';
import { Address, zeroAddress } from 'viem';
import { Button } from '@/components/ui/button';

// Add keyframes for the pulse animation
const pulseStyle = `
  @keyframes pulse {
    0% { box-shadow: 0 0 0 1px #FFDD00; }
    50% { box-shadow: 0 0 0 3px #FFDD00; }
    100% { box-shadow: 0 0 0 1px #FFDD00; }
  }
`;

export interface RoomVisualizationProps {
  hasFacility: boolean;
  facilityData?: {
    power: number;
    level: number;
    miners: number;
    capacity: number;
    used: number;
    resources: number;
    spaces: number;
  };
  onPurchaseFacility: () => Promise<void>;
  onGetStarterMiner: (x: number, y: number) => Promise<void>;
  onUpgradeFacility: () => Promise<void>;
  isPurchasingFacility: boolean;
  isGettingStarterMiner: boolean;
  isUpgradingFacility: boolean;
  onTileSelect?: (x: number, y: number) => void;
  address?: Address;
  isGridMode?: boolean;
  toggleGridMode?: () => void;
}

export function RoomVisualization({
  hasFacility,
  facilityData,
  onPurchaseFacility,
  onGetStarterMiner,
  onUpgradeFacility,
  isPurchasingFacility,
  isGettingStarterMiner,
  isUpgradingFacility,
  onTileSelect,
  address,
  isGridMode,
  toggleGridMode
}: RoomVisualizationProps) {
  const [selectedTile, setSelectedTile] = useState<{x: number, y: number}>();
  const [showGrid, setShowGrid] = useState(false);

  // Check if user has claimed their free miner
  const { data: minerData } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'getPlayerFacility',
    args: [address || zeroAddress],
    query: {
      enabled: Boolean(address)
    }
  });

  const handleTileClick = (x: number, y: number) => {
    if (!isGridMode) return;
    setSelectedTile({ x, y });
    if (onTileSelect) {
      onTileSelect(x, y);
    }
  };

  // Function to check if a tile already has a miner
  const tileHasMiner = (x: number, y: number) => {
    // This would need to be implemented based on your contract data
    return false;
  };

  return (
    <div className="relative w-full h-[500px] bg-gray-900 rounded-lg overflow-hidden">
      {hasFacility ? (
        <>
          <Image
            src="/bedroom.png"
            alt="Mining Facility"
            fill
            style={{ objectFit: 'contain', objectPosition: 'center' }}
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/50 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <Button
                onClick={toggleGridMode}
                variant="outline"
                size="sm"
              >
                {isGridMode ? 'HIDE GRID' : 'SHOW GRID'}
              </Button>
              <Button
                onClick={onUpgradeFacility}
                loading={isUpgradingFacility}
                variant="solid"
                size="sm"
              >
                UPGRADE
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
          <p className="text-gray-400 mb-4">You don&apos;t have any mining space yet.</p>
          <Button
            onClick={onPurchaseFacility}
            loading={isPurchasingFacility}
            variant="solid"
            size="lg"
          >
            Purchase Facility
          </Button>
        </div>
      )}
    </div>
  );
}
