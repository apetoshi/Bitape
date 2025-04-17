'use client';

import React, { useState, useEffect } from 'react';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import AccountModal from './AccountModal';
import { useTokenBalance } from '@/hooks/useTokenBalance';

interface ConnectWalletButtonProps {
  className?: string;
}

const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({ className }) => {
  const { open } = useWeb3Modal();
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { apeBalance, bitBalance } = useTokenBalance();

  // Handle routing when wallet is connected
  useEffect(() => {
    if (isConnected && address) {
      router.push(`/room/${address}`);
    }
  }, [isConnected, address, router]);

  const handleClick = async () => {
    if (isConnected) {
      setIsModalOpen(true);
    } else {
      try {
        // Check if we're on mobile and MetaMask is available through deep linking
        const isMobile = typeof window !== 'undefined' && 
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
          // Try to open MetaMask mobile app directly if available
          await open({
            view: 'Mobile',
          });
        } else {
          await open();
        }
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    }
  };

  return (
    <>
      <button 
        onClick={handleClick} 
        className={`bg-transparent border-2 border-banana text-banana hover:bg-banana hover:text-royal transition-colors font-press-start ${className}`}
      >
        {isConnected ? 'PROFILE' : 'CONNECT WALLET'}
      </button>

      {isConnected && address && (
        <AccountModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          address={address}
          apeBalance={apeBalance}
          bitBalance={bitBalance}
        />
      )}
    </>
  );
};

export default ConnectWalletButton;
