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
import Header from './Header';
import Footer from './Footer';

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
        width: isMobile ? 180 : 250,
        height: isMobile ? 180 : 250
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
    <div className="h-screen flex flex-col bg-royal overflow-hidden">
      {/* Import Header component */}
      <Header />

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center relative overflow-hidden">
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

        <div className="relative z-10 w-full max-w-4xl mx-auto text-center space-y-2 md:space-y-4 py-0">
          <h1 className="text-xl sm:text-2xl md:text-4xl font-press-start text-banana pixel-text leading-relaxed">
            <span className="text-banana block sm:inline">BITAPE:</span> 
            <span className="block sm:inline"> A PEER-TO-PEER</span>
            <span className="block"> APE CASH SYSTEM</span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-3xl font-press-start pixel-text mt-2">
            <AnimatedCounter 
              targetValue={minedBit} 
              formatFn={formatNumber} 
              className="text-banana"
              offset={50} // Smaller offset for a more subtle effect
              duration={10000} // 10 seconds for one full cycle
            /> $BIT HAS ALREADY BEEN MINED.
          </p>
          
          <p className="text-base sm:text-lg md:text-xl font-press-start text-white pixel-text mt-2">
            START EARNING TODAY.
          </p>

          <div className="my-4">
            {/* ApeChain themed 3D globe */}
            <div className="relative w-[180px] h-[180px] md:w-[250px] md:h-[250px] mx-auto">
              <ThreeJSGlobe width={dimensions.width} height={dimensions.height} />
            </div>
          </div>

          <div className="w-full max-w-sm mx-auto">
            <ConnectWalletButton className="w-full font-press-start text-sm md:text-lg py-2 md:py-3 px-6 md:px-8 bg-transparent border-2 border-banana text-banana hover:bg-banana hover:text-royal transition-colors pixel-button" />
          </div>
        </div>
      </main>

      {/* Import Footer component */}
      <Footer />
    </div>
  );
};

export default LandingPage; 