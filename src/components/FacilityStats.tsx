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
      <div className="bg-[#001420]/70 border border-banana p-4 rounded-md space-y-3">
        <div className="border-b border-white/20 pb-2">
          <span className="font-press-start text-white text-xs">- YOUR APEROOM</span>
        </div>
        <div className="border-b border-white/20 pb-2">
          <span className="font-press-start text-white text-xs">- TOTAL SPACES</span>
          <span className="font-press-start text-banana text-xs block mt-1 ml-2">
            {facilityData.spaces} SPACES
          </span>
        </div>
        <div className="border-b border-white/20 pb-2">
          <span className="font-press-start text-white text-xs">- TOTAL GIGAWATTS</span>
          <span className="font-press-start text-banana text-xs block mt-1 ml-2">
            {facilityData.capacity} GIGAWATTS
          </span>
        </div>
        <div className="border-b border-white/20 pb-2">
          <span className="font-press-start text-white text-xs">- FOOD SOURCE</span>
          <span className="font-press-start text-banana text-xs block mt-1 ml-2">FREE BANANAS 🍌 FROM APETOSHI</span>
        </div>
        {onUpgrade && (
          <div className="mt-4">
            <button 
              onClick={onUpgrade}
              disabled={isUpgrading}
              className="bg-banana text-royal font-press-start text-xs py-2 px-4 rounded-md w-full"
            >
              {isUpgrading ? 'UPGRADING...' : 'UPGRADE FACILITY'}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[#001420]/70 border border-banana p-4 rounded-md space-y-2">
      <div className="flex items-center gap-2 font-press-start text-white border-b border-white/20 pb-2">
        <span className="text-banana">💎</span>
        <span>LEVEL {facilityData.level}</span>
      </div>
      <div className="flex items-center gap-2 font-press-start text-white border-b border-white/20 pb-2">
        <span className="text-banana">⚡</span>
        <span>{facilityData.power} WATTS</span>
      </div>
      <div className="flex items-center gap-2 font-press-start text-white border-b border-white/20 pb-2">
        <span className="text-banana">🏠</span>
        <span>{facilityData.used}/{facilityData.spaces} SPACES USED</span>
      </div>
      <div className="flex items-center gap-2 font-press-start text-white border-b border-white/20 pb-2">
        <span className="text-banana">🔧</span>
        <span>{facilityData.resources} RESOURCES</span>
      </div>
    </div>
  );
};

export default FacilityStats; 