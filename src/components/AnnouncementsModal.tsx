'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import Image from 'next/image';
import { MINERS, MinerType } from '../config/miners';

interface AnnouncementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenReferralModal?: () => void;
}

export default function AnnouncementsModal({ isOpen, onClose, onOpenReferralModal }: AnnouncementsModalProps) {
  // Get the Banana Miner data
  const bananaMiner = MINERS[MinerType.BANANA_MINER];
  
  // Get the other miners for display in mining section
  const regularMiners = [
    MINERS[MinerType.MONKEY_TOASTER],
    MINERS[MinerType.APEPAD_MINI],
    MINERS[MinerType.GORILLA_GADGET]
  ];
  
  // State to track if user has scrolled to the bottom
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  
  // Check if button is visible
  const checkButtonVisibility = () => {
    if (!contentRef.current || !buttonRef.current) return;
    
    const contentRect = contentRef.current.getBoundingClientRect();
    const buttonRect = buttonRef.current.getBoundingClientRect();
    
    // Check if button is visible in the viewport
    const isVisible = buttonRect.top >= contentRect.top && 
                      buttonRect.bottom <= contentRect.bottom;
    
    console.log('Button visibility check:', { 
      isVisible,
      buttonTop: buttonRect.top,
      buttonBottom: buttonRect.bottom,
      contentTop: contentRect.top,
      contentBottom: contentRect.bottom
    });
    
    if (isVisible) {
      console.log('Button is in viewport');
      setHasScrolledToBottom(true);
    }
  };
  
  // Add scroll event listener
  useEffect(() => {
    const contentElement = contentRef.current;
    if (contentElement) {
      // Initial check in case content is short
      setTimeout(() => {
        checkButtonVisibility();
      }, 500);
      
      const handleScroll = () => {
        checkButtonVisibility();
      };
      
      contentElement.addEventListener('scroll', handleScroll);
      return () => contentElement.removeEventListener('scroll', handleScroll);
    }
  }, []);
  
  // Reset scroll state when modal opens
  useEffect(() => {
    if (isOpen) {
      setHasScrolledToBottom(false);
      
      // Check again after a small delay to handle short content case
      setTimeout(() => {
        checkButtonVisibility();
      }, 500);
    }
  }, [isOpen]);
  
  // Force button visibility for short content
  useEffect(() => {
    if (contentRef.current && buttonRef.current) {
      const { scrollHeight, clientHeight } = contentRef.current;
      // If content is shorter than the container, show the button right away
      if (scrollHeight <= clientHeight) {
        console.log('Content fits without scrolling, showing button');
        setHasScrolledToBottom(true);
      }
    }
  }, [isOpen]);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/70 transition-opacity duration-300" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <Dialog.Panel className="w-full max-w-2xl bg-royal border-2 border-banana p-6 shadow-lg transform transition-all rounded-lg relative">
          <Dialog.Title className="font-press-start text-xl text-banana mb-6 text-center">
            <div className="flex items-center justify-center">
              <span className="animate-pulse mr-2">🔥</span>
              ANNOUNCEMENTS
              <span className="animate-pulse ml-2">🔥</span>
            </div>
            </Dialog.Title>
            
          <div 
            ref={contentRef}
            className="bg-royal-dark p-6 mb-6 rounded-lg max-h-[60vh] overflow-y-auto"
            onScroll={checkButtonVisibility}
          >
            {/* Welcome Section */}
            <div className="mb-8 border-b border-banana/20 pb-6">
              <h3 className="font-press-start text-center text-banana text-sm mb-4">
                BITAPE PLATFORM IS LIVE!
              </h3>
              
              <div className="flex justify-center mb-4">
                <div className="relative w-32 h-32">
                  <Image 
                    src="/bitape.png" 
                    alt="BitApe Logo" 
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              
              <p className="text-white font-press-start text-xs text-center">
                Welcome to the official launch of BitApe - the premier idle game built on Ape Chain!
              </p>
            </div>
            
            {/* Facility Section */}
            <div className="mb-8 border-b border-banana/20 pb-6">
              <h3 className="font-press-start text-yellow-300 text-sm mb-4">
                START WITH YOUR FACILITY
              </h3>
              
              <div className="flex items-center mb-4">
                <div className="relative w-16 h-16 mr-4">
                  <Image 
                    src="/apecoin.png" 
                    alt="ApeCoin" 
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-white font-press-start text-xs">
                    Purchase your initial facility using ApeCoin. This is your foundation for mining operations.
                  </p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-[#001420] to-[#002A46] rounded-lg p-4 mb-4">
                <p className="text-banana font-press-start text-xs text-center">
                  Upgrade your facility to increase capacity and earnings!
                </p>
              </div>
            </div>
            
            {/* Free Banana Miner Section */}
            <div className="mb-8 border-b border-banana/20 pb-6">
              <h3 className="font-press-start text-yellow-300 text-sm mb-4">
                FREE BANANA MINER INCLUDED!
              </h3>
              
              <div className="flex items-center mb-4">
                <div className="relative w-24 h-24 mr-4 flex-shrink-0">
                  <Image 
                    src={bananaMiner.image}
                    alt={bananaMiner.name}
                    width={150}
                    height={150}
                    className="object-contain"
                    unoptimized={true}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-white font-press-start text-xs mb-2">
                    Your facility purchase includes a FREE {bananaMiner.name}!
                  </p>
                  <p className="text-banana font-press-start text-xs">
                    • {bananaMiner.hashrate} GH/s Hashrate
                  </p>
                  <p className="text-banana font-press-start text-xs">
                    • {bananaMiner.energyConsumption} WATTS Energy
                  </p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-[#001420] to-[#002A46] rounded-lg p-4 mb-4">
                <p className="text-banana font-press-start text-xs text-center">
                  {bananaMiner.description}
                </p>
              </div>
            </div>
            
            {/* Mining Section */}
            <div className="mb-8 border-b border-banana/20 pb-6">
              <h3 className="font-press-start text-yellow-300 text-sm mb-4">
                MINING $BIT TOKEN
              </h3>
              
              <div className="flex items-center mb-4">
                <div className="relative w-16 h-16 mr-4 flex-shrink-0">
                  <Image 
                    src="/bitape.png" 
                    alt="BitApe" 
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-white font-press-start text-xs">
                    Mine $BIT tokens with your facility and purchase additional miners to increase your mining rate.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                {regularMiners.map((miner) => (
                  <div key={miner.id} className="flex flex-col items-center">
                    <div className="relative w-20 h-20 mb-2">
                      <Image 
                        src={miner.image}
                        alt={miner.name}
                        width={100}
                        height={100}
                        className="object-contain"
                        unoptimized={true}
                      />
                    </div>
                    <p className="text-banana font-press-start text-[8px] text-center">{miner.name}</p>
                    <p className="text-white font-press-start text-[8px] text-center">{miner.hashrate} GH/s</p>
                    <p className="text-green-400 font-press-start text-[8px] text-center">{miner.price} $BIT</p>
                </div>
              ))}
              </div>
              
              <div className="bg-gradient-to-r from-[#001420] to-[#002A46] rounded-lg p-4">
                <p className="text-banana font-press-start text-xs text-center">
                  Claim your mined $BIT tokens regularly to make purchases!
                </p>
              </div>
            </div>

            {/* Referral Section */}
            <div>
              <h3 className="font-press-start text-yellow-300 text-sm mb-4">
                REFER YOUR FRIENDS
              </h3>
              
              <div className="flex items-center mb-4">
                <div className="relative w-16 h-16 mr-4 flex-shrink-0">
                  <div className="absolute inset-0 flex items-center justify-center bg-royal-dark rounded-full border border-banana">
                    <span className="text-banana text-2xl">👥</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-white font-press-start text-xs">
                    Earn 2.5% of all $BIT mined by friends you refer to the platform!
                  </p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-[#001420] to-[#002A46] rounded-lg p-4 mb-4">
                <p className="text-banana font-press-start text-xs text-center">
                  Share your referral link to start earning today!
                </p>
              </div>
              
              {/* Button positioned here - directly after the referral text */}
              <div ref={buttonRef} className="mt-4">
                <div className={`transition-all duration-500 ${hasScrolledToBottom ? 'opacity-100' : 'opacity-0'}`}>
                  {onOpenReferralModal && (
              <button
                      onClick={onOpenReferralModal}
                      className="w-full font-press-start px-6 py-3 bg-banana text-[#001420] hover:bg-banana/90 active:bg-banana/80 transition-colors font-bold rounded-md animate-pulse"
                      disabled={!hasScrolledToBottom}
              >
                      REFER A FRIEND
              </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer with APE branding */}
          <div className="mt-6 pt-2 border-t border-banana/20 text-center">
            <div className="flex items-center justify-center">
              <Image 
                src="/apecoin.png" 
                alt="ApeCoin Logo" 
                width={16} 
                height={16} 
                className="mr-2" 
              />
              <span className="text-banana font-press-start text-[8px] sm:text-[10px]">Powered by ApeCoin</span>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 