'use client';

import React from 'react';
import { Dialog } from '@headlessui/react';
import Image from 'next/image';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TradeModal({ isOpen, onClose }: TradeModalProps) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/70 transition-opacity duration-300" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <Dialog.Panel className="w-full max-w-md bg-royal border-2 border-banana p-6 shadow-lg transform transition-all rounded-lg">
          <Dialog.Title className="font-press-start text-xl text-banana mb-6 text-center">
            TRADE $BIT
          </Dialog.Title>
          
          <div className="bg-royal-dark p-6 mb-6 rounded-lg">
            <div className="flex justify-center mb-6">
              <div className="relative w-24 h-24">
                <Image 
                  src="/bitape.png" 
                  alt="BitApe Logo" 
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            
            <h3 className="font-press-start text-center text-yellow-300 text-sm mb-4">Apetoshi deploying additional liquidity</h3>
            
            <p className="text-white font-press-start text-xs text-center mb-4">
              $BIT Trading is coming soon!
            </p>
            
            <div className="relative overflow-hidden rounded-lg mb-6">
              <div className="relative h-32 bg-gradient-to-r from-[#001420] to-[#002A46] rounded-lg p-4 flex items-center justify-center">
                <div className="absolute inset-0 opacity-20 bg-grid-pattern"></div>
                <div className="flex gap-4 items-center justify-center">
                  <div className="flex flex-col items-center">
                    <Image 
                      src="/apecoin.png" 
                      alt="ApeCoin" 
                      width={32} 
                      height={32} 
                    />
                    <p className="text-banana text-xs font-press-start mt-2">APE</p>
                  </div>
                  
                  <div className="text-banana text-2xl">⟷</div>
                  
                  <div className="flex flex-col items-center">
                    <Image 
                      src="/bitape.png" 
                      alt="BitApe" 
                      width={32} 
                      height={32} 
                    />
                    <p className="text-banana text-xs font-press-start mt-2">BIT</p>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-white font-press-start text-xs text-center">
              Be the first to know when trading is live by checking back here!
            </p>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="font-press-start px-6 py-3 bg-banana text-[#001420] hover:bg-banana/90 active:bg-banana/80 transition-colors font-bold rounded-md"
            >
              CLOSE
            </button>
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
      
      <style jsx>{`
        .bg-grid-pattern {
          background-image: linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </Dialog>
  );
} 