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
import DisclaimerModal from './DisclaimerModal';

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
  const { isOpen: isDisclaimerOpen, onOpen: onDisclaimerOpen, onClose: onDisclaimerClose } = useDisclosure();
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
      
      // Disconnect using wagmi's hook
      await disconnect();
      console.log('Wallet disconnected successfully');
      
      // Simple reload to reset the app state
      window.location.href = '/';
      
    } catch (error) {
      console.error('Error during wallet disconnection:', error);
      // As a last resort, force a refresh
      window.location.href = '/';
    }
  };

  return (
    <header className="nav-bar flex justify-between items-center px-2 sm:px-3 py-1 relative z-30">
      <div className="flex-none">
        {/* Logo removed from here to save space, will be used directly in LandingPage */}
      </div>
      
      {/* Central connect wallet button */}
      <div className="flex-grow flex justify-center items-center mx-2">
        {isConnected && address ? (
          <button
            onClick={onProfileOpen}
            className="flex items-center px-2 py-1 bg-[#001420] rounded-lg border border-yellow-400 hover:bg-[#001F33] text-xs"
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
          <div className="scale-90 transform-origin-center">
            <ConnectButton />
          </div>
        )}
      </div>
      
      {/* Desktop navigation - right aligned */}
      <nav className="hidden md:flex items-center flex-none space-x-2">
        <Link href="/about" className="font-press-start text-white text-xs hover:text-banana">
          ABOUT
        </Link>
        <Link href="/leaderboard" className="font-press-start text-white text-xs hover:text-banana">
          LEADERBOARD
        </Link>
        <button 
          onClick={onReferralOpen}
          className="font-press-start text-white text-xs hover:text-banana"
        >
          REFER
        </button>
        <button 
          onClick={onAnnouncementsOpen}
          className="font-press-start text-white text-xs hover:text-banana"
        >
          ANNOUNCEMENTS
        </button>
        <button 
          onClick={onDisclaimerOpen}
          className="font-press-start text-white text-xs hover:text-banana"
        >
          DISCLAIMER
        </button>
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
      
      <DisclaimerModal
        isOpen={isDisclaimerOpen}
        onClose={onDisclaimerClose}
      />
    </header>
  );
};

export default Header;
