import React, { useState } from 'react';

interface StatsDisplayProps {
  miningRateData: bigint | undefined;
  hashRateData: bigint | undefined;
  blocksUntilHalvingData: bigint | undefined;
  networkShareData: bigint | undefined;
  totalNetworkHashrateData: bigint | undefined;
  totalSupplyData: bigint | undefined;
  burnedBitData: bigint | undefined;
  currentBitApePerBlockData: bigint | undefined;
  isMiningRateLoading?: boolean;
  isHashRateLoading?: boolean;
  isNetworkShareLoading?: boolean;
  isTotalNetworkHashrateLoading?: boolean;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({
  miningRateData,
  hashRateData,
  blocksUntilHalvingData,
  networkShareData,
  totalNetworkHashrateData,
  totalSupplyData,
  burnedBitData,
  currentBitApePerBlockData,
  isMiningRateLoading = false,
  isHashRateLoading = false,
  isNetworkShareLoading = false,
  isTotalNetworkHashrateLoading = false
}) => {
  const [mode, setMode] = useState<'SIMPLE' | 'PRO'>('SIMPLE');

  // Format values for display
  const formatNumber = (value: bigint | undefined, decimals = 2, suffix = '', scaleDecimals = 0, isLoading = false) => {
    // Return 0 with proper formatting when loading has completed but value is undefined
    if (value === undefined) {
      return isLoading ? 'Loading...' : '0';
    }
    
    // Scale down the value if needed (for values in wei)
    const scaleFactor = scaleDecimals > 0 ? 10 ** scaleDecimals : 1;
    const num = Number(value) / scaleFactor;
    
    // For small values like 100 (which could be hashrate), don't format to K/M/B if less than 1000
    if (num < 1000 && suffix === '') {
      return `${num.toFixed(0)}${suffix}`;
    }
    
    if (num >= 1_000_000_000) {
      return `${(num / 1_000_000_000).toFixed(decimals)}B${suffix}`;
    } else if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(decimals)}M${suffix}`;
    } else if (num >= 1_000) {
      return `${(num / 1_000).toFixed(decimals)}K${suffix}`;
    } else {
      return `${num.toFixed(decimals)}${suffix}`;
    }
  };

  // Format a percentage value with optional scaling
  const formatPercentage = (value: bigint | undefined, isLoading = false) => {
    if (value === undefined) {
      return isLoading ? 'Loading...' : '0.00';
    }
    
    // Network share is already provided as percentage * 100
    const percentage = Number(value) / 100;
    
    return percentage.toFixed(2);
  };

  // Process values for display with loading awareness
  const miningRate = formatNumber(miningRateData, 2, '', 18, isMiningRateLoading);
  const hashRate = formatNumber(hashRateData, 0, '', 0, isHashRateLoading);
  const blocksUntilHalving = blocksUntilHalvingData !== undefined ? String(blocksUntilHalvingData) : 'Loading...';
  
  // Calculate mining rate estimate based on hash rate (if contract isn't providing it)
  let calculatedMiningRate = miningRate;
  if ((miningRate === '0' || miningRate === 'Loading...') && hashRateData) {
    // Simplified estimate: ~ 2.5 BIT per block * 6000 blocks per day * user's share of network
    if (totalNetworkHashrateData && totalNetworkHashrateData > BigInt(0)) {
      const userShare = Number(hashRateData) / Number(totalNetworkHashrateData);
      const bitPerBlock = currentBitApePerBlockData ? Number(currentBitApePerBlockData) / 10**18 : 2.5;
      const blocksPerDay = 6000; // Approximate
      const estimatedMiningRate = userShare * bitPerBlock * blocksPerDay;
      
      calculatedMiningRate = estimatedMiningRate.toFixed(2);
      console.log(`Estimated mining rate: ${calculatedMiningRate} BIT/day (based on ${userShare.toFixed(4)} network share)`);
    }
  }
  
  // Calculate network share percentage directly from hash rate and total network hash rate
  let networkSharePercentage = '0.00';
  if (hashRateData && totalNetworkHashrateData && totalNetworkHashrateData > BigInt(0)) {
    const percentage = (Number(hashRateData) / Number(totalNetworkHashrateData)) * 100;
    networkSharePercentage = percentage.toFixed(2);
    console.log(`Calculated network share: ${percentage.toFixed(2)}% (hashRate: ${hashRateData}, totalNetwork: ${totalNetworkHashrateData})`);
  } else {
    // Fallback to the contract-provided value if available
    networkSharePercentage = formatPercentage(networkShareData, isNetworkShareLoading);
  }
  
  const totalNetworkHashrate = formatNumber(totalNetworkHashrateData, 0, '', 0, isTotalNetworkHashrateLoading);
  const currentBitApePerBlock = formatNumber(currentBitApePerBlockData, 2, '', 18);
  const totalSupply = formatNumber(totalSupplyData, 2, '', 18);
  const burnedBit = formatNumber(burnedBitData, 2, '', 18);

  return (
    <div>
      <div className="flex border-b-2 border-banana px-3 py-1">
        <button 
          onClick={() => setMode('SIMPLE')}
          className={`font-press-start text-xs ${mode === 'SIMPLE' ? 'text-banana' : 'text-[#4A5568]'} mr-4`}
        >
          SIMPLE
        </button>
        <button 
          onClick={() => setMode('PRO')}
          className={`font-press-start text-xs ${mode === 'PRO' ? 'text-banana' : 'text-[#4A5568]'}`}
        >
          PRO
        </button>
      </div>
      <div className="p-3 space-y-1 font-press-start text-white text-xs">
        {mode === 'SIMPLE' ? (
          <>
            <p>- YOU ARE MINING <span className="text-banana">{calculatedMiningRate}</span> BIT A DAY</p>
            <p>- YOUR HASH RATE IS <span className="text-banana">{hashRate}</span> GH/S</p>
            <p>- <span className="text-banana">{blocksUntilHalving}</span> BLOCKS UNTIL NEXT HALVENING</p>
            <p>- YOU HAVE <span className="text-banana">{networkSharePercentage}%</span> OF THE TOTAL NETWORK HASH RATE (<span className="text-banana">{totalNetworkHashrate}</span> GH/S)</p>
          </>
        ) : (
          <>
            <p>- <span className="text-banana">{currentBitApePerBlock}</span> TOTAL BIT MINED PER BLOCK</p>
            <p>- <span className="text-banana">{totalSupply}</span> BIT HAS EVER BEEN MINED</p>
            <p>- <span className="text-banana">{burnedBit}</span> BIT HAS BEEN BURNED</p>
          </>
        )}
      </div>
    </div>
  );
};

export default StatsDisplay;
