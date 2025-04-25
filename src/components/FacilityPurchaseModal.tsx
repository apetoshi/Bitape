import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Dialog } from '@headlessui/react';
import { useAccount, useContractRead } from 'wagmi';
import { BIT_TOKEN_ABI, BIT_TOKEN_ADDRESS } from '../config/contracts';
import { formatEther } from 'viem';
import { useGameState } from '../hooks/useGameState';

interface FacilityPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: () => void;
  isPurchasing: boolean;
}

const FACILITY_COST = '70'; // 70 BIT tokens

const FacilityPurchaseModal: React.FC<FacilityPurchaseModalProps> = ({
  isOpen,
  onClose,
  onPurchase,
  isPurchasing
}) => {
  const { address } = useAccount();
  const gameState = useGameState();
  
  const [hasSufficientBalance, setHasSufficientBalance] = useState(false);
  const [bitBalance, setBitBalance] = useState('0');
  const [isProcessing, setIsProcessing] = useState(false);
  const [facilityPurchaseError, setFacilityPurchaseError] = useState('');

  // Get BIT token balance
  const { data: bitBalanceData } = useContractRead({
    address: BIT_TOKEN_ADDRESS,
    abi: BIT_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: Boolean(address),
    },
  });

  // Check if user has sufficient BIT balance
  useEffect(() => {
    if (bitBalanceData) {
      const balance = formatEther(bitBalanceData as bigint);
      setBitBalance(balance);
      setHasSufficientBalance(parseFloat(balance) >= parseFloat(FACILITY_COST));
    } else if (gameState.bitBalance) {
      setBitBalance(gameState.bitBalance);
      setHasSufficientBalance(parseFloat(gameState.bitBalance) >= parseFloat(FACILITY_COST));
    }
  }, [bitBalanceData, gameState.bitBalance]);

  // Handle facility purchase
  const handleBuyNewFacility = async () => {
    try {
      setIsProcessing(true);
      setFacilityPurchaseError('');
      
      const result = await gameState.buyNewFacility();
      
      if (result) {
        // Call the onPurchase callback to update the UI
        onPurchase();
        // Close the modal
        onClose();
      }
    } catch (error: any) {
      console.error("Error purchasing facility:", error);
      setFacilityPurchaseError(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="relative bg-royal border-2 border-banana p-6 max-w-lg w-full m-4">
          <Dialog.Title className="font-press-start text-xl text-banana mb-4 text-center">
            UPGRADE SPACE
          </Dialog.Title>
          
          <div className="bg-[#0a3049] p-4 mb-6">
            <p className="font-press-start text-white text-sm text-center">
              UPGRADE YOUR SPACE TO INCREASE POWER OUTPUT AND SPACE CAPACITY
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-[#0a3049] p-4">
              <h3 className="font-press-start text-banana text-sm mb-3 text-center">CURRENT SPACE</h3>
              <div className="relative w-32 h-32 mx-auto mb-4">
                <Image
                  src="/images/facilities/bedroom.png"
                  alt="Bedroom Mining Setup"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="space-y-2 font-press-start text-white text-xs">
                <p>YOUR APEROOM</p>
                <p>MAX MINERS: 4</p>
                <p>POWER: 28 GW</p>
              </div>
            </div>
            
            <div className="bg-[#0a3049] p-4">
              <h3 className="font-press-start text-banana text-sm mb-3 text-center">NEXT STOP APE FEST VEGAS</h3>
              <div className="flex justify-center items-center h-10 my-2">
                <span className="text-yellow-500 text-xl font-bold">➡</span>
              </div>
              <div className="relative w-32 h-32 mx-auto mb-4">
                <Image
                  src="/images/facilities/treehouse.png"
                  alt="Treehouse Mining Setup"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="space-y-2 font-press-start text-white text-xs">
                <p>YOUR TREEHOUSE</p>
                <p>MAX MINERS: 8</p>
                <p>POWER: 168 GW</p>
              </div>
            </div>
          </div>

          <div className="text-center mb-6">
            <h4 className="font-press-start text-banana text-lg mb-1">UPGRADE COST: {FACILITY_COST} $BIT</h4>
            {!hasSufficientBalance && (
              <p className="text-red-500 font-press-start text-xs">
                INSUFFICIENT $BIT BALANCE (YOU HAVE: {parseFloat(bitBalance).toFixed(2)} $BIT)
              </p>
            )}
            {facilityPurchaseError && (
              <p className="text-red-500 font-press-start text-xs mt-2">{facilityPurchaseError}</p>
            )}
          </div>

          <div className="flex justify-center space-x-6">
            <button
              onClick={onClose}
              className="font-press-start px-8 py-2 border-2 border-banana text-banana hover:bg-banana hover:text-royal transition-colors"
            >
              CANCEL
            </button>
            <button
              onClick={handleBuyNewFacility}
              disabled={isPurchasing || isProcessing || !hasSufficientBalance}
              className={`font-press-start px-8 py-2 ${hasSufficientBalance ? 'bg-banana text-royal hover:bg-banana/90' : 'bg-[#444444] text-[#888888]'} transition-colors disabled:opacity-50`}
            >
              {isPurchasing || isProcessing ? 'UPGRADING...' : 'UPGRADE NOW'}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default FacilityPurchaseModal; 