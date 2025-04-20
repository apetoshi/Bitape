'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useDisclosure } from '@chakra-ui/react';
import AccountModal from './AccountModal';
import { useGameState } from '@/hooks/useGameState';
import { useAccount, useDisconnect } from 'wagmi';
import { FaChevronDown } from 'react-icons/fa';
import ReferralModal from './ReferralModal';
import AnnouncementsModal from './AnnouncementsModal';

const ConnectButton = dynamic(() => import('@/components/ConnectWalletButton'), {
  ssr: false
});

const CustomLink = React.forwardRef<HTMLAnchorElement, { children: React.ReactNode; className?: string }>(
  ({ children, className }, ref) => {
    return (
      <a ref={ref} className={className}>
        {children}
      </a>
    );
  }
);

CustomLink.displayName = 'CustomLink';

const Header: React.FC = () => {
  const router = useRouter();
  const { isOpen: isProfileOpen, onOpen: onProfileOpen, onClose: onProfileClose } = useDisclosure();
  const { isOpen: isReferralOpen, onOpen: onReferralOpen, onClose: onReferralClose } = useDisclosure();
  const { isOpen: isAnnouncementsOpen, onOpen: onAnnouncementsOpen, onClose: onAnnouncementsClose } = useDisclosure();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { apeBalance, bitBalance, totalReferrals, totalBitEarned } = useGameState();

  useEffect(() => {
    if (isConnected && address) {
      router.push(`/room/${address}`);
    }
  }, [isConnected, address, router]);

  const handleDisconnect = async () => {
    try {
      console.log('Starting wallet disconnection process...');
      
      // Create a timeout to ensure we don't get stuck
      const timeoutId = setTimeout(() => {
        console.log('Disconnect timeout triggered - forcing page reload');
        window.location.replace('/');
      }, 5000); // 5 second safety timeout
      
      // First disconnect using wagmi's hook
      await disconnect();
      console.log('Wagmi disconnect completed');
      
      // Clear the timeout since disconnect succeeded
      clearTimeout(timeoutId);
      
      // Force cleanup all wallet-related items in localStorage
      if (typeof window !== 'undefined') {
        console.log('Cleaning up localStorage wallet items');
        
        try {
          // Only remove specific known keys rather than looping through all localStorage
          const problematicKeys = [
            'wagmi.store', 
            'wagmi.wallet', 
            'wagmi.connected',
            'walletconnect',
            'WALLETCONNECT_DEEPLINK_CHOICE',
            'WALLETCONNECT_DEEPLINK_CHOICE_WC_V2',
            'w3m_connected_wallet',
            'w3m_preferences',
            'w3m_recent',
            'wc@2:client:0.3',
            'WALLETCONNECT_DEEPLINK_CHOICE',
            'WALLET_TYPE',
            'wallet-provider'
          ];
          
          problematicKeys.forEach(key => {
            if (localStorage.getItem(key)) {
              console.log(`Removing known problematic key: ${key}`);
              localStorage.removeItem(key);
            }
          });
        } catch (error) {
          console.error('Error cleaning localStorage:', error);
        }
      }
      
      // Prevent WalletConnect errors by cleaning up global objects
      if (typeof window !== 'undefined') {
        try {
          // Add a guard for Object.values issue
          if (window.localStorage.getItem('walletconnect')) {
            try {
              const wcData = JSON.parse(window.localStorage.getItem('walletconnect') || '{}');
              // Clear out problematic WalletConnect data
              if (wcData) {
                window.localStorage.setItem('walletconnect', JSON.stringify({}));
              }
            } catch (e) {
              console.warn('Failed to parse WalletConnect data:', e);
              window.localStorage.removeItem('walletconnect');
            }
          }
          
          // Attempt to clear Ethereum provider
          if (window.ethereum && window.ethereum.close) {
            console.log('Closing ethereum provider connection');
            await window.ethereum.close();
          }
          
          // Reset any global WalletConnect variables
          if ((window as any).walletConnect) {
            console.log('Deleting global walletConnect object');
            delete (window as any).walletConnect;
          }
          
          if ((window as any).WalletConnect) {
            console.log('Deleting global WalletConnect object');
            delete (window as any).WalletConnect;
          }
          
          // Try to reset any web3Modal instances
          if ((window as any).web3Modal) {
            console.log('Clearing web3Modal');
            (window as any).web3Modal = null;
          }
        } catch (err) {
          console.error('Error clearing provider connections:', err);
        }
      }
      
      console.log('Disconnect cleanup completed, redirecting to home');
      
      // Force a complete page refresh to reset all app state
      window.location.replace('/');
      
    } catch (error) {
      console.error('Error during wallet disconnection:', error);
      
      // As a last resort, force a hard refresh
      window.location.replace('/');
    }
  };

  return (
    <header className="nav-bar flex justify-between items-center px-3 sm:px-6 py-4 relative z-30">
      <div className="flex items-center">
        <Link href="/" className="flex items-center">
          <Image
            src="/bitape.png"
            alt="BitApe Logo"
            width={60}
            height={60}
            className="hover:opacity-80 transition-opacity"
            priority
          />
        </Link>
      </div>
      
      {/* Connect wallet button - always visible */}
      <div className="flex items-center">
        {isConnected && address ? (
          <button
            onClick={onProfileOpen}
            className="flex items-center px-2 py-1 bg-[#001420] rounded-lg border border-yellow-400 hover:bg-[#001F33]"
            aria-label="Open profile"
          >
            <div className="mr-2 text-right hidden sm:block">
              <div className="text-white font-press-start text-xs">{apeBalance} APE</div>
              <div className="text-gray-400 font-mono text-xs">{address.slice(0, 4)}...{address.slice(-4)}</div>
            </div>
            <div className="block sm:hidden mr-1 text-white font-mono text-xs">
              {address.slice(0, 4)}...{address.slice(-4)}
            </div>
            <FaChevronDown className="w-3 h-3 text-yellow-400" />
          </button>
        ) : (
          <div className="scale-90 transform-origin-right">
            <ConnectButton />
          </div>
        )}
      </div>
      
      {/* Desktop navigation - hidden on mobile since we use dock menu there */}
      <nav className="hidden md:flex items-center ml-8 space-x-4">
        <Link href="/about" className="font-press-start text-white text-sm hover:text-banana">
          ABOUT
        </Link>
        <span className="font-press-start text-gray-500 text-sm cursor-not-allowed">
          TRADE $BIT
        </span>
        <span className="font-press-start text-gray-500 text-sm cursor-not-allowed">
          LEADERBOARD
        </span>
        <button 
          onClick={onReferralOpen}
          className="pixel-button text-sm"
        >
          REFER
        </button>
        <button 
          onClick={onAnnouncementsOpen}
          className="pixel-button text-sm"
        >
          ANNOUNCEMENTS
        </button>
        <span className="font-press-start text-gray-500 text-sm cursor-not-allowed">
          DISCLAIMER
        </span>
      </nav>

      {isConnected && address && (
        <AccountModal
          isOpen={isProfileOpen}
          onClose={onProfileClose}
          address={address}
          apeBalance={apeBalance?.toString() || '0'}
          bitBalance={bitBalance?.toString() || '0'}
        />
      )}
      
      <ReferralModal
        isOpen={isReferralOpen}
        onClose={onReferralClose}
        totalReferrals={totalReferrals || 0}
        totalBitEarned={totalBitEarned || '0'}
      />

      <AnnouncementsModal
        isOpen={isAnnouncementsOpen}
        onClose={onAnnouncementsClose}
      />
    </header>
  );
};

export default Header;
