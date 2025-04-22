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
    <header className="nav-bar flex justify-between items-center px-3 sm:px-6 py-4 relative z-30">
      <div className="flex items-center">
        <Link href="/" className="flex items-center">
          <Image
            src="/bitape.png"
            alt="BitApe Logo"
            width={120}
            height={120}
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
