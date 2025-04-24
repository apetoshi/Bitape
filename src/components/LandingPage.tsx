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

  // Handle responsive sizing with enhanced dimensions for larger screens
  useEffect(() => {
    // Set initial dimensions based on screen size
    const updateSize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        // Mobile
        setDimensions({
          width: 200,
          height: 200
        });
      } else if (width < 1280) {
        // Tablet/Small laptop
        setDimensions({
          width: 300,
          height: 300
        });
      } else {
        // Large laptop/Desktop
        setDimensions({
          width: 400,
          height: 400
        });
      }
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
      <header className="nav-bar flex justify-between items-center px-3 sm:px-6 lg:px-12 py-3 lg:py-4 relative z-30">
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
        <nav className="hidden md:flex items-center gap-4 lg:gap-6">
          <Link href="/about" className="font-press-start text-white text-xs md:text-sm lg:text-base hover:text-banana">
            ABOUT
          </Link>
          <Link href="/trade" className="font-press-start text-white text-xs md:text-sm lg:text-base hover:text-banana">
            TRADE $BIT
          </Link>
          <span className="font-press-start text-gray-500 text-xs md:text-sm lg:text-base cursor-not-allowed">
            Brewing...
          </span>
          <Link href="/announcements" className="pixel-button text-xs md:text-sm lg:text-base">
            ANNOUNCEMENTS
          </Link>
          <Link href="/refer" className="pixel-button text-xs md:text-sm lg:text-base">
            REFER A FRIEND
          </Link>
          <ConnectWalletButton className="scale-90 lg:scale-100" />
        </nav>
        
        {/* Mobile connect button */}
        <div className="md:hidden">
          <ConnectWalletButton className="scale-90" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-6 lg:p-10 relative overflow-hidden">
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

        <div className="relative z-10 w-full max-w-5xl mx-auto text-center space-y-4 md:space-y-6 lg:space-y-10 py-4 md:py-8 lg:py-12">
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-press-start text-banana pixel-text leading-relaxed">
            <span className="text-banana inline-block lg:inline">BITAPE:</span> 
            <span className="inline-block lg:inline"> A PEER-TO-PEER</span>
            <span className="inline-block lg:inline"> APE CASH SYSTEM</span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-3xl lg:text-4xl font-press-start pixel-text mt-6 lg:mt-8">
            <AnimatedCounter 
              targetValue={minedBit} 
              formatFn={formatNumber} 
              className="text-banana"
              offset={50} // Smaller offset for a more subtle effect
              duration={10000} // 10 seconds for one full cycle
            /> $BIT HAS ALREADY BEEN MINED.
          </p>
          
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-press-start text-white pixel-text mt-4 lg:mt-6">
            START EARNING TODAY.
          </p>

          <div className="my-6 md:my-10 lg:my-12">
            {/* ApeChain themed 3D globe with responsive sizing */}
            <div className="relative w-[200px] h-[200px] md:w-[300px] md:h-[300px] lg:w-[400px] lg:h-[400px] xl:w-[500px] xl:h-[500px] mx-auto">
              <ThreeJSGlobe width={dimensions.width} height={dimensions.height} />
            </div>
          </div>

          <div className="w-full max-w-sm md:max-w-md lg:max-w-lg mx-auto">
            <ConnectWalletButton className="w-full font-press-start text-sm md:text-lg lg:text-xl py-3 md:py-4 lg:py-5 px-6 md:px-8 lg:px-10 bg-transparent border-2 border-banana text-banana hover:bg-banana hover:text-royal transition-colors pixel-button" />
          </div>
        </div>
      </main>

      {/* Footer with ApeChain branding */}
      <footer className="py-4 md:py-6 lg:py-8 text-center">
        <div className="flex justify-center items-center">
          <Image 
            src="/ApeChain/Powered by ApeCoin-1.png" 
            alt="Powered by ApeCoin" 
            width={180}
            height={36}
            className="object-contain md:w-[200px] lg:w-[220px]" 
          />
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 