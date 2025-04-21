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
  // Track component mount state to avoid hydration issues
  const [mounted, setMounted] = useState(false);
  const [buttonText, setButtonText] = useState('CONNECT WALLET');
  
  // Always call the hook unconditionally at the top level
  const web3Modal = useWeb3Modal();
  
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { apeBalance, bitBalance } = useTokenBalance();
  
  // Only check connection after component mounts on client
  useEffect(() => {
    setMounted(true);
    setButtonText(isConnected ? 'PROFILE' : 'CONNECT WALLET');
  }, [isConnected]);

  // Handle routing when wallet is connected
  useEffect(() => {
    if (isConnected && address && mounted) {
      router.push(`/room/${address}`);
    }
  }, [isConnected, address, router, mounted]);

  const handleClick = async () => {
    if (isConnected) {
      setIsModalOpen(true);
    } else {
      try {
        // Simple check if web3Modal is available
        if (!web3Modal) {
          console.warn('Web3Modal not ready yet - please wait a moment and try again');
          return;
        }
        
        // Use a simpler approach to handle wallet connection
        await web3Modal.open();
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    }
  };

  // If not mounted yet, show minimal loading state to avoid hydration issues
  if (!mounted) {
    return (
      <button 
        className={`bg-transparent border-2 border-banana text-banana opacity-70 font-press-start ${className}`}
        aria-label="Loading wallet connection"
      >
        LOADING...
      </button>
    );
  }

  return (
    <>
      <button 
        onClick={handleClick} 
        className={`bg-transparent border-2 border-banana text-banana hover:bg-banana hover:text-royal transition-colors font-press-start ${className}`}
        aria-label={isConnected ? "Open profile" : "Connect wallet"}
      >
        {buttonText}
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
