'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ConnectWalletButton from './ConnectWalletButton';
import { useGameState } from '@/hooks/useGameState';
import { useAccount } from 'wagmi';

const Header: React.FC = () => {
  return (
    <header className="bg-royal py-4 px-6 flex justify-between items-center">
      <div className="flex items-center">
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
        
        <nav className="hidden md:flex ml-12">
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
      
      <div className="flex items-center">
        <Link href="/announcements" className="pixel-button mr-2 hidden md:block">
          ANNOUNCEMENTS
        </Link>
        <Link href="/refer" className="pixel-button mr-2 hidden md:block">
          REFER A FRIEND
        </Link>
        <ConnectWalletButton />
      </div>
    </header>
  );
};

export default Header;
