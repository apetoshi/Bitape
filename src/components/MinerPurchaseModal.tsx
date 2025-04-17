import React, { useState } from 'react';
import Image from 'next/image';
import { Dialog } from '@headlessui/react';
import { MINERS, MinerType, MinerData, getActiveMiners } from '@/config/miners';

interface MinerPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (minerType: MinerType, x: number, y: number) => Promise<void>;
  selectedTile?: { x: number, y: number };
  isPurchasing: boolean;
  bitBalance: string;
  hasClaimedStarterMiner: boolean;
}

const MinerPurchaseModal: React.FC<MinerPurchaseModalProps> = ({
  isOpen,
  onClose,
  onPurchase,
  selectedTile,
  isPurchasing,
  bitBalance,
  hasClaimedStarterMiner
}) => {
  const [selectedMiner, setSelectedMiner] = useState<MinerType>(MinerType.BANANA_MINER);
  const activeMiners = getActiveMiners();
  
  // Convert bitBalance to a number
  const bitBalanceNumber = parseFloat(bitBalance);
  
  // Get the details of the selected miner
  const minerDetails = MINERS[selectedMiner];
  
  // Check if user can afford the selected miner
  const canAfford = minerDetails.price <= bitBalanceNumber;
  
  // For the free starter miner, check if user has already claimed it
  const isFreeMiner = selectedMiner === MinerType.BANANA_MINER && minerDetails.price === 0;
  const canGetFreeMiner = isFreeMiner && !hasClaimedStarterMiner;
  
  // Determine if user can purchase this miner
  const canPurchase = selectedTile && (canAfford || canGetFreeMiner);
  
  // Handle the purchase
  const handlePurchase = async () => {
    if (!selectedTile || isPurchasing || !canPurchase) return;
    
    await onPurchase(selectedMiner, selectedTile.x, selectedTile.y);
    onClose();
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
        <Dialog.Panel className="relative bg-royal border-2 border-banana p-6 max-w-4xl w-full m-4">
          <Dialog.Title className="font-press-start text-2xl text-banana mb-6 text-center">
            PURCHASE MINER
          </Dialog.Title>
          
          <div className="bg-dark-blue p-2 mb-4 rounded">
            <p className="text-white font-press-start text-xs">
              SELECTED LOCATION: {selectedTile ? `(${selectedTile.x}, ${selectedTile.y})` : 'NONE'}
            </p>
            <p className="text-banana font-press-start text-xs mt-1">
              YOUR BALANCE: {bitBalance} BIT
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Left Side - Miner List */}
            <div className="space-y-2 border-r border-banana pr-3">
              {activeMiners.map((miner) => {
                const isSelected = selectedMiner === miner.id;
                const isFreeMiner = miner.id === MinerType.BANANA_MINER && miner.price === 0;
                const isUnavailable = isFreeMiner && hasClaimedStarterMiner;
                
                return (
                  <div 
                    key={miner.id}
                    onClick={() => !isUnavailable && setSelectedMiner(miner.id as MinerType)}
                    className={`bg-dark-blue p-2 flex items-center rounded cursor-pointer
                      ${isSelected ? 'border-l-4 border-banana' : ''}
                      ${isUnavailable ? 'opacity-50 cursor-not-allowed' : 'hover:bg-dark-blue/80'}`}
                  >
                    <div className="w-10 h-10 mr-3 relative">
                      <Image 
                        src={miner.image} 
                        alt={miner.name} 
                        fill
                        className="object-contain" 
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-banana font-press-start text-xs">{miner.name}</span>
                      <span className="text-white font-press-start text-xs">
                        {isFreeMiner 
                          ? (hasClaimedStarterMiner ? 'ALREADY CLAIMED' : 'FREE STARTER') 
                          : `${miner.price} BIT`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Right Side - Selected Miner Details */}
            <div className="space-y-4">
              <h3 className="text-banana font-press-start mb-3 text-center text-sm">
                {minerDetails.name}
              </h3>
              <div className="w-36 h-36 mx-auto mb-4 relative">
                <Image 
                  src={minerDetails.image} 
                  alt={minerDetails.name} 
                  fill
                  className="object-contain" 
                />
              </div>
              <div className="space-y-2 font-press-start text-xs">
                <p className="text-white mb-1">- HASH RATE: {minerDetails.hashrate} GH/S</p>
                <p className="text-white mb-1">- PRICE: {minerDetails.price} BIT</p>
                <p className="text-white mb-1">- ENERGY: {minerDetails.energyConsumption} WATT</p>
                {minerDetails.description && (
                  <p className={`mt-3 text-center ${isFreeMiner ? 'text-green-400' : 'text-yellow-300'}`}>
                    {minerDetails.description}
                  </p>
                )}
                
                {!canAfford && !canGetFreeMiner && (
                  <p className="text-red-500 mt-3 text-center">
                    INSUFFICIENT BIT BALANCE
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-between mt-8">
            <button
              onClick={onClose}
              className="font-press-start px-6 py-2 border-2 border-banana text-banana hover:bg-banana hover:text-royal transition-colors"
            >
              CANCEL
            </button>
            <button
              onClick={handlePurchase}
              disabled={!canPurchase || isPurchasing}
              className={`font-press-start px-6 py-2 ${
                canPurchase
                  ? 'bg-banana text-royal hover:bg-opacity-90'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              } transition-colors`}
            >
              {isPurchasing 
                ? 'PROCESSING...' 
                : isFreeMiner 
                  ? 'CLAIM FREE MINER' 
                  : `BUY FOR ${minerDetails.price} BIT`}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default MinerPurchaseModal; 