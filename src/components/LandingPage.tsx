'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ConnectWalletButton from './ConnectWalletButton';
import { useAccount } from 'wagmi';

const LandingPage = () => {
  const router = useRouter();
  const { isConnected, address } = useAccount();

  useEffect(() => {
    if (isConnected && address) {
      router.push(`/room/${address}`);
    }
  }, [isConnected, address, router]);

  return (
    <div className="min-h-screen flex flex-col bg-royal">
      {/* Header */}
      <header className="nav-bar flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-8">
          <div className="flex items-center">
            <Image
              src="/bitape.png"
              alt="BitApe Logo"
              width={100}
              height={100}
              className="hover:opacity-80 transition-opacity"
              priority
            />
          </div>
          <nav className="flex gap-8">
            <Link href="/about" className="font-press-start text-white hover:text-banana">
              ABOUT
            </Link>
            <Link href="/trade" className="font-press-start text-white hover:text-banana">
              TRADE $BIT
            </Link>
            <Link href="/leaderboard" className="font-press-start text-[#4A5568] hover:text-banana">
              LEADERBOARD
            </Link>
          </nav>
        </div>
        <div className="flex gap-4">
          <button className="font-press-start text-banana border-2 border-banana px-4 py-2 hover:bg-banana hover:text-royal pixel-button">
            ANNOUNCEMENTS
          </button>
          <button className="font-press-start text-banana border-2 border-banana px-4 py-2 hover:bg-banana hover:text-royal pixel-button">
            REFER A FRIEND
          </button>
          <ConnectWalletButton className="px-4 py-2" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-4 relative">
        {/* Grid Background */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px',
            imageRendering: 'pixelated'
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-press-start text-banana pixel-text">
            <span className="text-banana">BITAPE:</span> A PEER-TO-PEER APE CASH SYSTEM
          </h1>
          
          <p className="text-2xl md:text-3xl font-press-start text-banana pixel-text">
            971,753 $BIT HAS ALREADY BEEN MINED.
          </p>
          
          <p className="text-xl md:text-2xl font-press-start text-white pixel-text">
            START EARNING TODAY.
          </p>

          <div className="mb-12">
            <div className="relative w-[200px] h-[200px] mx-auto border-2 border-banana">
              <Image
                src="/globe.svg"
                alt="Globe Animation"
                fill
                priority
                className="object-contain"
              />
            </div>
          </div>

          <div className="w-full max-w-md mx-auto">
            <ConnectWalletButton className="w-full font-press-start text-xl py-4 px-8 bg-transparent border-2 border-banana text-banana hover:bg-banana hover:text-royal transition-colors pixel-button" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage; 