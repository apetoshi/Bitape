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
        // Check if we're on mobile
        const isMobile = typeof window !== 'undefined' && 
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Check for specific mobile wallet support
        const hasMetaMaskInBrowser = typeof window !== 'undefined' && 
          typeof window.ethereum !== 'undefined' && 
          window.ethereum.isMetaMask;
        
        // Open the appropriate web3modal view based on device and available wallets
        if (isMobile) {
          if (hasMetaMaskInBrowser) {
            // Use injected MetaMask if available in browser
            await open({
              view: 'Connect'
            });
          } else {
            // Launch WalletConnect QR or deep link options for mobile
            await open({
              view: 'Connect'
            });
            
            // For MetaMask app - direct deep link if Web3Modal fails to open it
            if (isMobile && !hasMetaMaskInBrowser) {
              // Try direct deep linking to MetaMask as fallback
              const mmDeepLink = `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`;
              window.open(mmDeepLink, '_blank');
            }
          }
        } else {
          // Standard flow for desktop
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
