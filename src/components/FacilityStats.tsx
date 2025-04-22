import React from 'react';

interface FacilityData {
  power: number;
  level: number;
  miners: number;
  capacity: number;
  used: number;
  resources: number;
  spaces: number;
}

interface FacilityStatsProps {
  facilityData?: FacilityData;
  activeTab: 'RESOURCES' | 'SPACE';
  onUpgrade?: () => Promise<void>;
  isUpgrading?: boolean;
}

const FacilityStats: React.FC<FacilityStatsProps> = ({
  facilityData,
  activeTab,
  onUpgrade,
  isUpgrading
}) => {
  if (!facilityData) return null;

  if (activeTab === 'SPACE') {
    return (
      <div className="space-y-4 font-press-start text-white">
        <p>- YOUR APEROOM</p>
        <p>- {facilityData.spaces} TOTAL SPACES</p>
        <p>- {facilityData.capacity} TOTAL GIGAWATTS</p>
        <p>- FREE BANANAS🍌 FROM APETOSHI</p>
        {onUpgrade && (
          <div className="mt-6">
            <button 
              onClick={onUpgrade}
              disabled={isUpgrading}
              className="bg-transparent border-2 border-banana text-banana hover:bg-banana hover:text-royal transition-colors px-6 py-2 font-press-start disabled:opacity-50"
            >
              {isUpgrading ? 'UPGRADING...' : 'UPGRADE'}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 font-press-start text-white">
        <span className="text-banana">💎</span>
        <span>LEVEL {facilityData.level}</span>
      </div>
      <div className="flex items-center gap-2 font-press-start text-white">
        <span className="text-banana">⚡</span>
        <span>{facilityData.power} WATTS</span>
      </div>
      <div className="flex items-center gap-2 font-press-start text-white">
        <span className="text-banana">🏠</span>
        <span>{facilityData.used}/{facilityData.spaces} SPACES USED</span>
      </div>
      <div className="flex items-center gap-2 font-press-start text-white">
        <span className="text-banana">🔧</span>
        <span>{facilityData.resources} RESOURCES</span>
      </div>
    </div>
  );
};

export default FacilityStats; 