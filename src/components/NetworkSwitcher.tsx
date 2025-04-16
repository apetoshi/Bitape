'use client';

import React from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';

interface NetworkSwitcherProps {
  className?: string;
}

const NetworkSwitcher: React.FC<NetworkSwitcherProps> = ({ className }) => {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { isConnected } = useAccount();

  // ApeChain ID
  const apeChainId = 33139;

  // Check if user is on ApeChain
  const isOnApeChain = chainId === apeChainId;

  if (!isConnected) {
    return null;
  }

  return (
    <div className={`${className}`}>
      {!isOnApeChain && (
        <div className="bg-red-800 text-white p-2 rounded pixel-border">
          <p className="pixel-text text-xs mb-2">You are not connected to ApeChain!</p>
          <button
            onClick={() => switchChain?.({ chainId: apeChainId })}
            className="pixel-button text-xs"
          >
            Switch to ApeChain
          </button>
        </div>
      )}
    </div>
  );
};

export default NetworkSwitcher;
