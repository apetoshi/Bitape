import React from 'react';

interface MiningClaimSectionProps {
  minedBit: string;
  onClaimReward: () => Promise<void>;
  isClaimingReward: boolean;
}

export const MiningClaimSection: React.FC<MiningClaimSectionProps> = ({
  minedBit,
  onClaimReward,
  isClaimingReward
}) => {
  return (
    <div className="stats-panel">
      <div className="flex flex-col items-center justify-center py-4">
        <p className="pixel-text mb-4">YOU HAVE MINED <span className="text-banana-yellow">{minedBit} $BIT</span></p>
        <button 
          className="claim-button"
          onClick={onClaimReward}
          disabled={isClaimingReward || parseFloat(minedBit) <= 0}
        >
          {isClaimingReward ? 'CLAIMING...' : 'CLAIM MINED $BIT'}
        </button>
      </div>
    </div>
  );
};
