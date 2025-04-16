import React, { useState } from 'react';
import Image from 'next/image';
import { useContractRead } from 'wagmi';
import { CONTRACT_ADDRESSES, MAIN_CONTRACT_ABI } from '../config/contracts';
import { Address, zeroAddress } from 'viem';

// Add keyframes for the pulse animation
const pulseStyle = `
  @keyframes pulse {
    0% { box-shadow: 0 0 0 1px #FFDD00; }
    50% { box-shadow: 0 0 0 3px #FFDD00; }
    100% { box-shadow: 0 0 0 1px #FFDD00; }
  }
`;

interface FacilityData {
  power: number;
  level: number;
  miners: number;
  capacity: number;
  used: number;
  resources: number;
  spaces: number;
}

interface RoomVisualizationProps {
  hasFacility: boolean;
  facilityData?: FacilityData;
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
  placedMiners?: { x: number, y: number }[];
}

const RoomVisualization: React.FC<RoomVisualizationProps> = ({
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
  isGridMode = false,
  toggleGridMode,
  placedMiners
}) => {
  const [selectedTile, setSelectedTile] = useState<{x: number, y: number}>();

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

  if (!hasFacility) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-royal">
        <div className="text-center">
          <h2 className="font-press-start text-2xl mb-4 text-banana">YOU DON'T HAVE A SPACE TO MINE!</h2>
          <div className="space-y-2 text-sm mb-6">
            <p className="text-white">- NO MINING SPACE</p>
            <p className="text-white">- 0 TOTAL SPACES</p>
            <p className="text-white">- 0 TOTAL GIGAWATTS</p>
            <p className="text-white">- CANT MINE WITHOUT SPACE, BUDDY</p>
          </div>
          <button 
            className="bg-banana text-royal font-press-start px-6 py-3 rounded hover:bg-opacity-90"
            onClick={onPurchaseFacility}
            disabled={isPurchasingFacility}
          >
            {isPurchasingFacility ? 'PURCHASING...' : 'BUY FACILITY'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Add the keyframes animation style */}
      <style jsx global>{pulseStyle}</style>
      <div className="relative w-full h-[690px] bg-royal overflow-hidden overflow-x-hidden">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Background Image */}
          <div className="relative w-full h-full max-w-full overflow-hidden">
            <Image 
              src="/bedroom.png" 
              alt="Mining Facility" 
              fill 
              sizes="100%" 
              style={{ objectFit: 'contain', objectPosition: 'center' }}
              priority 
            />
          </div>

          {/* Clickable Mining Spaces - Positioned to match the isometric view */}
          <div className="absolute inset-0 scale-[0.98]">
            <div
              onClick={() => handleTileClick(0, 0)}
              className={`absolute w-[85px] h-[85px] cursor-pointer transition-all duration-300 ${
                selectedTile?.x === 0 && selectedTile?.y === 0
                  ? "bg-blue-500 bg-opacity-40"
                  : isGridMode ? "bg-blue-500 bg-opacity-20 hover:bg-opacity-30" : ""
              }`}
              style={{
                top: '51.5%', left: '44.5%', transform: 'translate(-50%, -50%) rotate(-2deg)',
                borderRadius: "2px",
                animation: selectedTile?.x === 0 && selectedTile?.y === 0 ? "pulse 1.5s infinite" : "none"
              }}
            />
            {placedMiners?.some(miner => miner.x === 0 && miner.y === 0) && (
              <Image 
                src="/banana-miner.gif"
                alt="Banana Miner"
                width={85}
                height={85}
                className="absolute"
                style={{ top: '54%', left: '44.5%', transform: 'translate(-50%, -50%) rotate(-2deg)' }}
              />
            )}
            <div
              onClick={() => handleTileClick(1, 0)}
              className={`absolute w-[85px] h-[85px] cursor-pointer transition-all duration-300 ${
                selectedTile?.x === 1 && selectedTile?.y === 0
                  ? "bg-blue-500 bg-opacity-40"
                  : isGridMode ? "bg-blue-500 bg-opacity-20 hover:bg-opacity-30" : ""
              }`}
              style={{
                top: '57.5%', left: '31.5%', transform: 'translate(-50%, -50%) rotate(-2deg)',
                borderRadius: "2px",
                animation: selectedTile?.x === 1 && selectedTile?.y === 0 ? "pulse 1.5s infinite" : "none"
              }}
            />
            {placedMiners?.some(miner => miner.x === 1 && miner.y === 0) && (
              <Image 
                src="/banana-miner.gif"
                alt="Banana Miner"
                width={85}
                height={85}
                className="absolute"
                style={{ top: '60.5%', left: '31.5%', transform: 'translate(-50%, -50%) rotate(-2deg)' }}
              />
            )}
            <div
              onClick={() => handleTileClick(1, 1)}
              className={`absolute w-[85px] h-[85px] cursor-pointer transition-all duration-300 ${
                selectedTile?.x === 1 && selectedTile?.y === 1
                  ? "bg-blue-500 bg-opacity-40"
                  : isGridMode ? "bg-blue-500 bg-opacity-20 hover:bg-opacity-30" : ""
              }`}
              style={{
                top: "64%",
                left: "43%",
                transform: "skew(-30deg, 0) rotate(45deg)",
                borderRadius: "2px",
                animation: selectedTile?.x === 1 && selectedTile?.y === 1 ? "pulse 1.5s infinite" : "none"
              }}
            />
            {placedMiners?.some(miner => miner.x === 1 && miner.y === 1) && (
              <Image 
                src="/banana-miner.gif"
                alt="Banana Miner"
                width={85}
                height={85}
                className="absolute"
                style={{ top: '66.4%', left: '44.5%', transform: 'translate(-50%, -50%) rotate(-2deg)' }}
              />
            )}
            <div
              onClick={() => handleTileClick(0, 1)}
              className={`absolute w-[85px] h-[85px] cursor-pointer transition-all duration-300 ${
                selectedTile?.x === 0 && selectedTile?.y === 1
                  ? "bg-blue-500 bg-opacity-40"
                  : isGridMode ? "bg-blue-500 bg-opacity-20 hover:bg-opacity-30" : ""
              }`}
              style={{
                top: "58%",
                left: "56%",
                transform: "skew(-30deg, 0) rotate(45deg)",
                borderRadius: "2px",
                animation: selectedTile?.x === 0 && selectedTile?.y === 1 ? "pulse 1.5s infinite" : "none"
              }}
            />
            {placedMiners?.some(miner => miner.x === 0 && miner.y === 1) && (
              <Image 
                src="/banana-miner.gif"
                alt="Banana Miner"
                width={85}
                height={85}
                className="absolute"
                style={{ top: '60.5%', left: '56.5%', transform: 'translate(-50%, -50%) rotate(-2deg)' }}
              />
            )}
          </div>
        </div>

        {/* Control Panel - fixed at bottom */}
        <div className="absolute bottom-4 left-4 flex gap-4 z-20">
          {/* Left Gameboy Button */}
          <button
            className="bg-[#444444] text-yellow-300 text-xs font-press-start px-4 py-3 rounded-lg shadow-lg border-b-4 border-[#222222] focus:outline-none hover:bg-[#555555] hover:translate-y-[1px] hover:border-b-2 active:translate-y-[3px] active:border-b-0 transition-all"
            onClick={toggleGridMode}
          >
            GRID
          </button>
          
          {/* Right Gameboy Button */}
          <button
            className="bg-[#444444] text-yellow-300 text-xs font-press-start px-4 py-3 rounded-lg shadow-lg border-b-4 border-[#222222] focus:outline-none hover:bg-[#555555] hover:translate-y-[1px] hover:border-b-2 active:translate-y-[3px] active:border-b-0 transition-all"
            onClick={onUpgradeFacility}
            disabled={isUpgradingFacility}
          >
            UPGRADE
          </button>
        </div>
      </div>
    </>
  );
};

export default RoomVisualization;
