'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  const [isConnecting, setIsConnecting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Always call all hooks unconditionally at the top level
  const web3Modal = useWeb3Modal();
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const { apeBalance, bitBalance } = useTokenBalance();
  
  // Handle button text updates
  useEffect(() => {
    if (!mounted) return;
    
    if (isConnecting) {
      setButtonText('CONNECTING...');
    } else if (isConnected) {
      setButtonText('PROFILE');
    } else {
      setButtonText('CONNECT WALLET');
    }
  }, [isConnected, isConnecting, mounted]);
  
  // Set mounted state for hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle routing when wallet is connected
  useEffect(() => {
    if (isConnected && address && mounted) {
      // Set a small delay to ensure connection is stable
      const timeout = setTimeout(() => {
        router.push(`/room/${address}`);
      }, 500);
      
      return () => clearTimeout(timeout);
    }
  }, [isConnected, address, router, mounted]);

  // Create a memoized click handler to avoid recreation on renders
  const handleClick = useCallback(async () => {
    if (isConnected) {
      setIsModalOpen(true);
      return;
    }
    
    try {
      setIsConnecting(true);
      
      // Open wallet modal
      await web3Modal.open();
      
      // Set a connection timeout to reset UI if connection stalls
      const connectionTimeout = setTimeout(() => {
        if (!isConnected) {
          console.log('Connection may not have completed, resetting button state');
          setIsConnecting(false);
        }
      }, 10000); // Longer timeout to handle slow connections
      
      // Clean up the timeout
      return () => clearTimeout(connectionTimeout);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setIsConnecting(false);
    }
  }, [isConnected, web3Modal]);

  // Handle connection reset
  useEffect(() => {
    if (isConnected) {
      setIsConnecting(false);
    }
  }, [isConnected]);

  // If not mounted yet, show minimal loading state
  if (!mounted) {
    return (
      <button 
        className={`bg-transparent border-2 border-banana text-banana opacity-70 font-press-start ${className}`}
        aria-label="Loading wallet connection"
        disabled
      >
        LOADING...
      </button>
    );
  }

  return (
    <>
      <button 
        onClick={handleClick} 
        className={`bg-transparent border-2 border-banana text-banana hover:bg-banana hover:text-royal transition-colors font-press-start ${className} ${isConnecting ? 'opacity-70 cursor-wait' : ''}`}
        aria-label={isConnected ? "Open profile" : "Connect wallet"}
        disabled={isConnecting}
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
