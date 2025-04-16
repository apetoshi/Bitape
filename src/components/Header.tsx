'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useDisclosure } from '@chakra-ui/react';
import AccountModal from './AccountModal';
import { useGameState } from '@/hooks/useGameState';
import { useAccount } from 'wagmi';
import { FaChevronDown } from 'react-icons/fa';

const ConnectButton = dynamic(() => import('@rainbow-me/rainbowkit').then(mod => mod.ConnectButton), {
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
  const { address, isConnected } = useAccount();
  const { apeBalance, bitBalance } = useGameState();

  useEffect(() => {
    if (isConnected && address) {
      router.push(`/room/${address}`);
    }
  }, [isConnected, address, router]);

  return (
    <header className="nav-bar flex justify-between items-center px-6 py-4">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center">
          <Image
            src="/bitape.png"
            alt="BitApe Logo"
            width={80}
            height={80}
            className="hover:opacity-80 transition-opacity"
            priority
          />
        </Link>
        
        <nav className="hidden md:flex">
          <Link href="/about" className="font-press-start text-white mx-3 hover:text-banana">
            ABOUT
          </Link>
          <Link href="/trade" className="font-press-start text-white mx-3 hover:text-banana">
            TRADE $BIT
          </Link>
          <Link href="/leaderboard" className="font-press-start text-white mx-3 hover:text-banana">
            LEADERBOARD
          </Link>
        </nav>
      </div>
      
      <div className="flex items-center gap-4">
        <Link href="/announcements" className="pixel-button hidden md:block">
          ANNOUNCEMENTS
        </Link>
        <Link href="/refer" className="pixel-button hidden md:block">
          REFER A FRIEND
        </Link>
        {isConnected && address && (
          <div className="flex items-center">
            <div className="mr-4 text-right">
              <div className="text-white font-press-start text-sm">{apeBalance} APE</div>
              <div className="text-gray-400 font-mono text-sm">{address.slice(0, 6)}...{address.slice(-4)}</div>
            </div>
            <button
              onClick={onProfileOpen}
              className="bg-[#FFD700] hover:bg-[#FFE55C] rounded-full p-2 transition-colors"
              aria-label="Open profile"
            >
              <FaChevronDown className="w-4 h-4 text-black" />
            </button>
          </div>
        )}
        {!isConnected && <ConnectButton />}
      </div>

      {isConnected && address && (
        <AccountModal
          isOpen={isProfileOpen}
          onClose={onProfileClose}
          address={address}
          apeBalance={apeBalance?.toString() || '0'}
          bitBalance={bitBalance?.toString() || '0'}
        />
      )}
    </header>
  );
};

export default Header;
