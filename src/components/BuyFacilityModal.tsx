'use client';

import React from 'react';
import { Dialog } from '@headlessui/react';
import { useGameState } from '@/hooks/useGameState';

interface BuyFacilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}

// Add styles for mobile scrolling
const modalScrollStyle = `
  .facility-modal-content {
    max-height: 90vh;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
`;

export function BuyFacilityModal({ isOpen, onClose, onConfirm }: BuyFacilityModalProps) {
  const { 
    purchaseFacility, 
    isPurchasingFacility, 
    apeBalance,
    initialFacilityPrice,
  } = useGameState();

  const hasEnoughApe = parseFloat(apeBalance) >= parseFloat(initialFacilityPrice);

  const handlePurchase = async () => {
    await purchaseFacility();
    onConfirm?.();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <style jsx global>{modalScrollStyle}</style>
      <div className="fixed inset-0 bg-black/70 transition-opacity duration-300" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <Dialog.Panel className="w-full max-w-md bg-royal border-2 border-banana p-6 shadow-lg shadow-black/25 transform transition-all facility-modal-content">
          <Dialog.Title className="font-press-start text-xl text-banana mb-6 text-center">
            PURCHASE INITIAL FACILITY
          </Dialog.Title>
          
          <div className="bg-royal-dark p-6 mb-8 border border-banana/20">
            <p className="font-press-start text-white text-sm text-center">
              Purchase your initial facility for {initialFacilityPrice} APE to start mining BIT.
            </p>
            {!hasEnoughApe && (
              <p className="font-press-start text-red-500 text-sm mt-4 text-center">
                You need at least {initialFacilityPrice} APE to purchase a facility.
              </p>
            )}
          </div>

          <div className="flex justify-center space-x-6">
            <button
              onClick={onClose}
              className="font-press-start px-8 py-3 border-2 border-banana text-banana hover:bg-banana/10 active:bg-banana/20 transition-colors duration-150"
            >
              CANCEL
            </button>
            <button
              onClick={handlePurchase}
              disabled={!hasEnoughApe || isPurchasingFacility}
              className="font-press-start px-8 py-3 bg-banana text-royal hover:bg-banana/90 active:bg-banana/80 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPurchasingFacility ? 'PURCHASING...' : 'PURCHASE FACILITY'}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

export default BuyFacilityModal; 