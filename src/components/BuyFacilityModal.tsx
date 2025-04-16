'use client';

import React from 'react';
import Image from 'next/image';
import { Dialog } from '@headlessui/react';
import { useContractWrite, useAccount, useTransaction } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACT_ADDRESSES, MAIN_CONTRACT_ABI } from '@/config/contracts';

interface BuyFacilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const BuyFacilityModal: React.FC<BuyFacilityModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  const { address } = useAccount();
  
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as `0x${string}`;
  
  const { data: hash, isPending: isWritePending, writeContract } = useContractWrite();

  const { isLoading: isConfirming } = useTransaction({
    hash,
  });

  const handlePurchase = async () => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.MAIN,
        abi: MAIN_CONTRACT_ABI,
        functionName: 'purchaseInitialFacility',
        args: [ZERO_ADDRESS],
        value: parseEther('0.1'), // 10 APE
      });
      onConfirm();
    } catch (error) {
      console.error('Failed to purchase facility:', error);
    }
  };

  const isLoading = isWritePending || isConfirming;

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl bg-royal border-4 border-banana rounded-lg shadow-xl">
          <div className="p-6">
            <Dialog.Title className="text-xl font-press-start text-center text-banana mb-4">
              PURCHASE YOUR FIRST MINING SPACE
            </Dialog.Title>
            
            <p className="text-sm font-press-start text-center text-white mb-6">
              Start mining BitApe with your own mining facility!
            </p>

            <div className="relative w-full h-48 mb-6">
              <Image
                src="/bedroom.png"
                alt="Mining Facility"
                fill
                className="object-contain pixel-art"
                priority
              />
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center font-press-start text-sm">
                <span className="text-white">Power Output:</span>
                <span className="text-banana">20 WATTS</span>
              </div>
              <div className="flex justify-between items-center font-press-start text-sm">
                <span className="text-white">Space Capacity:</span>
                <span className="text-banana">4 UNITS</span>
              </div>
              <div className="flex justify-between items-center font-press-start text-sm">
                <span className="text-white">Price:</span>
                <span className="text-banana">10 APE</span>
              </div>
            </div>

            <div className="bg-royal-blue p-4 rounded-lg mb-6">
              <p className="text-center font-press-start text-banana text-sm">
                FREE STARTER MINER INCLUDED!
              </p>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-transparent font-press-start text-banana text-sm border-2 border-banana hover:bg-banana hover:text-royal transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={handlePurchase}
                disabled={isLoading}
                className="px-6 py-2 bg-banana font-press-start text-royal text-sm hover:bg-banana-dark transition-colors disabled:opacity-50"
              >
                {isLoading ? 'PURCHASING...' : 'PURCHASE NOW'}
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default BuyFacilityModal; 