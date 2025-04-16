import React, { useState } from 'react';

interface StatsDisplayProps {
  miningRate: string;
  hashRate: string;
  blocksUntilHalving: string;
  networkHashRatePercentage: string;
  totalNetworkHashRate: string;
  totalMinedBit: string;
  burnedBit: string;
  rewardPerBlock: string;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({
  miningRate,
  hashRate,
  blocksUntilHalving,
  networkHashRatePercentage,
  totalNetworkHashRate,
  totalMinedBit,
  burnedBit,
  rewardPerBlock,
}) => {
  const [mode, setMode] = useState<'SIMPLE' | 'PRO'>('SIMPLE');

  return (
    <div className="game-panel">
      <div className="flex justify-between items-center mb-6">
        <h2 className="game-text text-lg">STATS</h2>
        <div className="flex items-center">
          <button
            onClick={() => setMode('SIMPLE')}
            className={`game-button border-r-0 ${mode === 'SIMPLE' ? 'bg-banana text-royal' : ''}`}
          >
            SIMPLE
          </button>
          <div className="game-text px-2">/</div>
          <button
            onClick={() => setMode('PRO')}
            className={`game-button border-l-0 ${mode === 'PRO' ? 'bg-banana text-royal' : ''}`}
          >
            PRO
          </button>
        </div>
      </div>

      {mode === 'SIMPLE' ? (
        <div className="space-y-3">
          <p className="game-text">
            - YOU ARE MINING <span className="game-value">{miningRate}</span> $BIT A DAY
          </p>
          <p className="game-text">
            - YOUR HASH RATE IS <span className="game-value">{hashRate}</span> GH/S
          </p>
          <p className="game-text">
            - <span className="game-value">{blocksUntilHalving}</span> BLOCKS UNTIL NEXT HALVENING
          </p>
          <p className="game-text">
            - YOU HAVE <span className="game-value">{networkHashRatePercentage}%</span> OF THE TOTAL 
            NETWORK HASH RATE (<span className="game-value">{totalNetworkHashRate}</span> GH/S)
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="game-text">
            - <span className="game-value">{rewardPerBlock}</span> TOTAL $BIT MINED PER BLOCK
          </p>
          <p className="game-text">
            - <span className="game-value">{totalMinedBit}</span> $BIT HAS EVER BEEN MINED.
          </p>
          <p className="game-text">
            - <span className="game-value">{burnedBit}</span> $BIT HAS BEEN BURNED.
          </p>
        </div>
      )}
    </div>
  );
};

export default StatsDisplay;
