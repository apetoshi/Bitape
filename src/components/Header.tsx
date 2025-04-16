'use client';

import React from 'react';
import Link from 'next/link';
import ConnectWalletButton from './ConnectWalletButton';

const Header: React.FC = () => {
  return (
    <header className="bg-royal py-4 px-6 flex justify-between items-center">
      <div className="flex items-center">
        {/* Logo would be replaced with actual BitApe logo */}
        <div className="mr-2 text-banana font-bold text-2xl">
          <span className="pixel-text">bitape</span>
        </div>
        
        <nav className="hidden md:flex ml-8">
          <Link href="/about" className="pixel-text text-white mx-3 hover:text-banana">
            ABOUT
          </Link>
          <Link href="/trade" className="pixel-text text-white mx-3 hover:text-banana">
            TRADE $BIT
          </Link>
          <Link href="/leaderboard" className="pixel-text text-white mx-3 hover:text-banana">
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
