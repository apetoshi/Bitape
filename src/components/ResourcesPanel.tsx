import React from 'react';

interface ResourcesPanelProps {
  apeBalance: string;
  bitBalance: string;
  spacesLeft: number | string;
  gigawattsAvailable: number | string;
}

export const ResourcesPanel: React.FC<ResourcesPanelProps> = ({
  apeBalance,
  bitBalance,
  spacesLeft,
  gigawattsAvailable
}) => {
  // Handle potential NaN values
  const displaySpaces = isNaN(Number(spacesLeft)) ? 0 : spacesLeft;
  const displayGigawatts = isNaN(Number(gigawattsAvailable)) ? 0 : gigawattsAvailable;

  return (
    <div className="game-panel bg-[#001420] p-3 md:p-4 rounded-lg border-2 border-banana">
      <div className="space-y-3">
        <div className="flex justify-between items-center py-1 border-b border-white/20">
          <span className="pixel-text text-white/80 text-xs md:text-sm">APE BALANCE</span>
          <span className="pixel-text text-white text-xs md:text-sm font-medium">{apeBalance} APE</span>
        </div>
        <div className="flex justify-between items-center py-1 border-b border-white/20">
          <span className="pixel-text text-white/80 text-xs md:text-sm">BIT BALANCE</span>
          <span className="pixel-text text-white text-xs md:text-sm font-medium">{bitBalance} BIT</span>
        </div>
        <div className="flex justify-between items-center py-1 border-b border-white/20">
          <span className="pixel-text text-white/80 text-xs md:text-sm">SPACES LEFT</span>
          <span className="pixel-text text-white text-xs md:text-sm font-medium">{displaySpaces} SPACES</span>
        </div>
        <div className="flex justify-between items-center py-1">
          <span className="pixel-text text-white/80 text-xs md:text-sm">GIGAWATTS AVAILABLE</span>
          <span className="pixel-text text-white text-xs md:text-sm font-medium">{displayGigawatts} GW</span>
        </div>
      </div>
    </div>
  );
};
