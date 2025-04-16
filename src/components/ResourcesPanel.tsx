import React from 'react';

interface ResourcesPanelProps {
  apeBalance: string;
  bitBalance: string;
  spacesLeft: number | string;
  gigawattsAvailable: number | string;
}

const ResourcesPanel: React.FC<ResourcesPanelProps> = ({
  apeBalance,
  bitBalance,
  spacesLeft,
  gigawattsAvailable
}) => {
  // Handle potential NaN values
  const displaySpaces = isNaN(Number(spacesLeft)) ? 0 : spacesLeft;
  const displayGigawatts = isNaN(Number(gigawattsAvailable)) ? 0 : gigawattsAvailable;

  return (
    <div className="bg-royal px-2 py-2">
      <div className="space-y-3">
        <div className="flex justify-between items-center py-1 border-b border-white/20">
          <span className="pixel-text text-white/80 text-sm">APE BALANCE</span>
          <span className="pixel-text text-white text-sm">{apeBalance} APE</span>
        </div>
        <div className="flex justify-between items-center py-1 border-b border-white/20">
          <span className="pixel-text text-white/80 text-sm">BIT BALANCE</span>
          <span className="pixel-text text-white text-sm">{bitBalance} BIT</span>
        </div>
        <div className="flex justify-between items-center py-1 border-b border-white/20">
          <span className="pixel-text text-white/80 text-sm">SPACES LEFT</span>
          <span className="pixel-text text-white text-sm">{displaySpaces} SPACES</span>
        </div>
        <div className="flex justify-between items-center py-1">
          <span className="pixel-text text-white/80 text-sm">GIGAWATTS AVAILABLE</span>
          <span className="pixel-text text-white text-sm">{displayGigawatts} GW</span>
        </div>
      </div>
    </div>
  );
};

export default ResourcesPanel;
