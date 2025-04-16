import React from 'react';
import Image from 'next/image';

interface FacilityPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: () => void;
  isPurchasing: boolean;
}

const FacilityPurchaseModal: React.FC<FacilityPurchaseModalProps> = ({
  isOpen,
  onClose,
  onPurchase,
  isPurchasing
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-royal border-2 border-banana p-6 max-w-lg w-full m-4">
        <h2 className="font-press-start text-xl text-banana mb-4 text-center">UPGRADE SPACE</h2>
        
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
            <h3 className="font-press-start text-banana text-sm mb-3 text-center">NEXT SPACE</h3>
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
          <h4 className="font-press-start text-banana text-lg mb-1">UPGRADE COST: 70 $BIT</h4>
          <p className="text-red-500 font-press-start text-xs">INSUFFICIENT $BIT BALANCE</p>
        </div>

        <div className="flex justify-center space-x-6">
          <button
            onClick={onClose}
            className="font-press-start px-8 py-2 border-2 border-banana text-banana hover:bg-banana hover:text-royal transition-colors"
          >
            CANCEL
          </button>
          <button
            onClick={onPurchase}
            disabled={isPurchasing || true} // Disabled because of insufficient balance
            className="font-press-start px-8 py-2 bg-[#444444] text-[#888888] transition-colors disabled:opacity-50"
          >
            UPGRADE NOW
          </button>
        </div>
      </div>
    </div>
  );
};

export default FacilityPurchaseModal; 