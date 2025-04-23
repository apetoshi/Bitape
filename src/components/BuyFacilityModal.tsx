'use client';
// Version 1.0.1 - Improved transaction handling

import React from 'react';
import { Dialog } from '@headlessui/react';
import { useGameState } from '@/hooks/useGameState';
import { useReferral } from '@/hooks/useReferral';
import Image from 'next/image';
import { useAccount, useWriteContract, usePublicClient } from 'wagmi';
import { CONTRACT_ADDRESSES, MAIN_CONTRACT_ABI } from '@/config/contracts';
import { parseEther } from 'viem';

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
  
  @media (max-width: 640px) {
    .facility-modal-buttons {
      flex-direction: column;
      gap: 1rem;
    }
    
    .facility-modal-buttons button {
      width: 100%;
    }
  }
`;

export function BuyFacilityModal({ isOpen, onClose, onConfirm }: BuyFacilityModalProps) {
  const { 
    apeBalance,
    initialFacilityPrice = "10", // Hard-code fallback to 10 to ensure consistency
    refetch
  } = useGameState();
  
  const { referralAddress, isReferralCaptured } = useReferral();
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const [isPurchasing, setIsPurchasing] = React.useState(false);

  // Determine if user has enough APE
  const hasEnoughApe = parseFloat(apeBalance) >= 10; // Hardcode 10 as required amount

  const handlePurchase = async () => {
    setIsPurchasing(true);
    try {
      // Direct contract call with 10 APE value to match the 0x3e89bb13 signature
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.MAIN as `0x${string}`,
        abi: MAIN_CONTRACT_ABI,
        functionName: 'purchaseInitialFacility',
        args: [referralAddress as `0x${string}`],
        value: parseEther('10'), // Send 10 APE to match signature 0x3e89bb13
        account: address as `0x${string}`,
        chain: publicClient?.chain
      });
      
      console.log('Transaction submitted:', hash);
      
      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log('Transaction confirmed:', receipt);
      
      // Refresh game state
      refetch();
      
      // Close modal
      onConfirm?.();
      alert('Facility purchased successfully!');
    } catch (error: any) {
      console.error('Error purchasing facility:', error);
      
      // Check if user rejected the transaction in their wallet
      if (
        error?.message?.includes('User rejected') || 
        error?.message?.includes('user rejected') || 
        error?.message?.includes('rejected') ||
        error?.message?.includes('denied') ||
        error?.message?.includes('cancelled') ||
        error?.message?.includes('canceled') ||
        error?.code === 4001
      ) {
        console.log('User canceled the transaction in wallet');
      } else {
        // Only show alert for errors that weren't user cancellations
        alert(`Error purchasing facility: ${error.message}`);
      }
    } finally {
      // Always reset the purchasing state
      setIsPurchasing(false);
    }
  };

  // Format referral address for display
  const formatReferralAddress = (address: string) => {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  // Check if this is a default referral or a captured one
  const DEFAULT_REFERRAL = '0x0000003b0d921e12Cc0CdB780b476F966bB16DaE';
  const isDefaultReferral = referralAddress === DEFAULT_REFERRAL;
  const showReferral = isReferralCaptured && !isDefaultReferral;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <style jsx global>{modalScrollStyle}</style>
      <div className="fixed inset-0 bg-black/70 transition-opacity duration-300" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <Dialog.Panel className="w-full max-w-md bg-royal border-2 border-banana p-4 sm:p-6 shadow-lg shadow-black/25 transform transition-all facility-modal-content rounded-lg">
          <Dialog.Title className="font-press-start text-lg sm:text-xl text-banana mb-4 sm:mb-6 text-center">
            PURCHASE INITIAL FACILITY
          </Dialog.Title>
          
          <div className="bg-royal-dark p-4 sm:p-6 mb-4 sm:mb-8 border border-banana/20 rounded-lg">
            <div className="flex items-center justify-center mb-4">
              <p className="font-press-start text-white text-xs sm:text-sm text-center">
                Purchase your initial facility for 
                <span className="inline-flex items-center mx-1">
                  <Image 
                    src="/apecoin.png" 
                    alt="ApeCoin" 
                    width={16} 
                    height={16} 
                    className="inline mr-1" 
                  />
                  <span className="text-banana">10 APE</span>
                </span>
                to start mining BIT.
              </p>
            </div>
            
            {/* Referral information - only show if user was actually invited */}
            {showReferral && (
              <div className="mt-4 mb-2 bg-royal p-3 rounded-md">
                <p className="font-press-start text-white text-[10px] sm:text-xs mb-1">INVITED BY:</p>
                <div className="flex items-center justify-center">
                  <span className="font-mono text-banana text-xs">
                    {formatReferralAddress(referralAddress)}
                  </span>
                </div>
              </div>
            )}
            
            {!hasEnoughApe && (
              <p className="font-press-start text-red-500 text-xs mt-4 text-center">
                You need at least 
                <span className="inline-flex items-center mx-1">
                  <Image 
                    src="/apecoin.png" 
                    alt="ApeCoin" 
                    width={12} 
                    height={12} 
                    className="inline mr-1" 
                  />
                  <span>10 APE</span>
                </span>
                to purchase a facility.
              </p>
            )}
          </div>

          <div className="facility-modal-buttons flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center">
            <button
              onClick={onClose}
              className="font-press-start px-6 py-3 border-2 border-banana text-banana hover:bg-banana/10 active:bg-banana/20 transition-colors duration-150 order-2 sm:order-1"
            >
              CANCEL
            </button>
            <button
              onClick={handlePurchase}
              disabled={!hasEnoughApe || isPurchasing}
              className="font-press-start px-6 py-3 bg-banana text-[#001420] hover:bg-banana/90 active:bg-banana/80 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2 font-bold"
            >
              {isPurchasing ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#001420]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  PURCHASING...
                </span>
              ) : (
                'PURCHASE FACILITY'
              )}
            </button>
          </div>
          
          {/* Footer with ApeCoin branding */}
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

export default BuyFacilityModal; 