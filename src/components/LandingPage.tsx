'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ConnectWalletButton from './ConnectWalletButton';
import { useAccount } from 'wagmi';
import { useContractRead } from 'wagmi';
import { CONTRACT_ADDRESSES, MAIN_CONTRACT_ABI } from '../config/contracts';
import { formatUnits } from 'viem';
import ThreeJSGlobe from './ThreeJSGlobe';
import AnimatedCounter from './AnimatedCounter';

const LandingPage = () => {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const [minedBit, setMinedBit] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 200, height: 200 });

  // Handle responsive sizing
  useEffect(() => {
    // Set initial dimensions
    const updateSize = () => {
      const isMobile = window.innerWidth < 768;
      setDimensions({
        width: isMobile ? 200 : 300,
        height: isMobile ? 200 : 300
      });
    };
    
    // Set size on mount
    updateSize();
    
    // Update on resize
    window.addEventListener('resize', updateSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Read total BIT supply from the token contract
  const { data: totalSupplyData } = useContractRead({
    address: CONTRACT_ADDRESSES.BIT_TOKEN,
    abi: [
      {
        inputs: [],
        name: 'totalSupply',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
      }
    ],
    functionName: 'totalSupply',
  });

  // Format total supply when data is available
  useEffect(() => {
    if (totalSupplyData) {
      try {
        // Convert to a number for the animated counter
        const formattedSupply = Number(formatUnits(totalSupplyData as bigint, 18));
        setMinedBit(formattedSupply);
      } catch (error) {
        console.error("Error formatting total supply:", error);
        setMinedBit(0);
      }
    }
  }, [totalSupplyData]);

  useEffect(() => {
    if (isConnected && address) {
      router.push(`/room/${address}`);
    }
  }, [isConnected, address, router]);

  // Format the animated counter value with commas
  const formatNumber = (value: number) => {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-royal">
      {/* Header */}
      <header className="nav-bar flex justify-between items-center px-3 sm:px-6 py-3 relative z-30">
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
        
        {/* Desktop navigation - hidden on mobile */}
        <nav className="hidden md:flex items-center gap-4">
          <Link href="/about" className="font-press-start text-white text-xs md:text-sm hover:text-banana">
            ABOUT
          </Link>
          <Link href="/trade" className="font-press-start text-white text-xs md:text-sm hover:text-banana">
            TRADE $BIT
          </Link>
          <span className="font-press-start text-gray-500 text-xs md:text-sm cursor-not-allowed">
            Brewing...
          </span>
          <Link href="/announcements" className="pixel-button text-xs md:text-sm">
            ANNOUNCEMENTS
          </Link>
          <Link href="/refer" className="pixel-button text-xs md:text-sm">
            REFER A FRIEND
          </Link>
          <ConnectWalletButton className="scale-90" />
        </nav>
        
        {/* Mobile connect button */}
        <div className="md:hidden">
          <ConnectWalletButton className="scale-90" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-4 pt-20 pb-20 relative overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '16px 16px',
            imageRendering: 'pixelated'
          }}
        />

        <div className="relative z-10 w-full max-w-4xl mx-auto text-center space-y-4 md:space-y-8 py-4 md:py-8 mt-12 mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-press-start text-banana pixel-text leading-relaxed">
            <span className="text-banana block sm:inline">BITAPE:</span> 
            <span className="block sm:inline"> A PEER-TO-PEER</span>
            <span className="block"> APE CASH SYSTEM</span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-3xl font-press-start pixel-text mt-6">
            <AnimatedCounter 
              targetValue={minedBit} 
              formatFn={formatNumber} 
              className="text-banana"
              offset={50} // Smaller offset for a more subtle effect
              duration={10000} // 10 seconds for one full cycle
            /> $BIT HAS ALREADY BEEN MINED.
          </p>
          
          <p className="text-base sm:text-lg md:text-xl font-press-start text-white pixel-text mt-4">
            START EARNING TODAY.
          </p>

          <div className="my-6 md:my-10">
            {/* ApeChain themed 3D globe */}
            <div className="relative w-[200px] h-[200px] md:w-[300px] md:h-[300px] mx-auto">
              <ThreeJSGlobe width={dimensions.width} height={dimensions.height} />
            </div>
          </div>

          <div className="w-full max-w-sm mx-auto">
            <ConnectWalletButton className="w-full font-press-start text-sm md:text-lg py-3 md:py-4 px-6 md:px-8 bg-transparent border-2 border-banana text-banana hover:bg-banana hover:text-royal transition-colors pixel-button" />
          </div>
        </div>
      </main>

      {/* Footer with ApeChain branding */}
      <footer className="py-4 text-center">
        <div className="flex justify-center items-center">
          <Image 
            src="/ApeChain/Powered by ApeCoin-1.png" 
            alt="Powered by ApeCoin" 
            width={180}
            height={36}
            className="object-contain" 
          />
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 