import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Dialog } from '@headlessui/react';
import { MINERS, MinerType, MinerData, getActiveMiners } from '@/config/miners';
import { addMinerToMap } from '@/app/room/[address]/fixedMinerMap';

interface MinerPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (minerType: MinerType, x: number, y: number) => Promise<void>;
  selectedTile?: { x: number, y: number };
  isPurchasing: boolean;
  bitBalance: string;
  hasClaimedStarterMiner: boolean;
  minerTypeData?: Record<number, any>;
}

// Add styles for mobile scrolling
const modalScrollStyle = `
  .miner-purchase-modal {
    max-height: 90vh;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
`;

const MinerPurchaseModal: React.FC<MinerPurchaseModalProps> = ({
  isOpen,
  onClose,
  onPurchase,
  selectedTile,
  isPurchasing,
  bitBalance,
  hasClaimedStarterMiner,
  minerTypeData = {}
}) => {
  // Set default selected miner: if starter miner is claimed, default to MONKEY_TOASTER
  const defaultMiner = hasClaimedStarterMiner ? MinerType.MONKEY_TOASTER : MinerType.BANANA_MINER;
  const [selectedMiner, setSelectedMiner] = useState<MinerType>(defaultMiner);
  const [purchaseStage, setPurchaseStage] = useState<'initial' | 'approving' | 'purchasing' | 'success'>('initial');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const activeMiners = getActiveMiners();
  
  // Convert bitBalance to a number
  const bitBalanceNumber = parseFloat(bitBalance);
  
  // Get the details of the selected miner
  const minerDetails = MINERS[selectedMiner];
  
  // Update where the miner details are displayed to use contract data when available
  const getMinerInfo = (minerType: MinerType, property: 'hashrate' | 'powerConsumption' | 'cost') => {
    // Use contract data for Monkey Toaster if available
    if (minerType === MinerType.MONKEY_TOASTER && minerTypeData[MinerType.MONKEY_TOASTER]) {
      const data = minerTypeData[MinerType.MONKEY_TOASTER];
      if (property === 'hashrate') {
        return Number(data[4]).toString(); // hashrate is at index 4
      } else if (property === 'powerConsumption') {
        return Number(data[5]).toString(); // powerConsumption is at index 5
      } else if (property === 'cost') {
        return Number(data[6]).toString(); // cost is at index 6
      }
    }
    
    // Fallback to config data
    const miner = MINERS[minerType];
    if (property === 'hashrate') {
      return miner.hashrate.toString();
    } else if (property === 'powerConsumption') {
      return miner.energyConsumption.toString();
    } else if (property === 'cost') {
      return miner.price.toString();
    }
    return '0';
  };
  
  // Check if user can afford the selected miner using contract data when available
  const minerCost = Number(getMinerInfo(selectedMiner, 'cost'));
  const canAfford = minerCost <= bitBalanceNumber;
  
  // For the free starter miner, check if user has already claimed it
  const isFreeMiner = selectedMiner === MinerType.BANANA_MINER && minerCost === 0;
  const canGetFreeMiner = isFreeMiner && !hasClaimedStarterMiner;
  
  // Determine if user can purchase this miner
  const canPurchase = selectedTile && (canAfford || canGetFreeMiner);
  
  // Create a mapping of miner types to their names and indices for clarity
  const minerMapping = {
    [MinerType.BANANA_MINER]: { name: "BANANA MINER", index: MinerType.BANANA_MINER },
    [MinerType.MONKEY_TOASTER]: { name: "MONKEY TOASTER", index: MinerType.MONKEY_TOASTER },
    [MinerType.GORILLA_GADGET]: { name: "GORILLA GADGET", index: MinerType.GORILLA_GADGET },
    [MinerType.APEPAD_MINI]: { name: "APEPAD MINI", index: MinerType.APEPAD_MINI },
  };
  
  // Define a specific display order for miners regardless of their index values
  const minerDisplayOrder = [
    MinerType.BANANA_MINER,
    MinerType.MONKEY_TOASTER,
    MinerType.GORILLA_GADGET,
    MinerType.APEPAD_MINI
  ];
  
  // Get active miners in our preferred display order
  const orderedActiveMiners = minerDisplayOrder
    .map(minerType => MINERS[minerType])
    .filter(miner => miner.isActive);
  
  // Handle the purchase
  const handlePurchase = async () => {
    // Reset any previous error message
    setErrorMessage(null);
    
    // Add detailed debugging to understand what's happening
    console.log("handlePurchase called with: ", {
      selectedTile,
      isPurchasing,
      canPurchase,
      selectedMiner,
      minerIndex: selectedMiner,  // Important: Use consistent naming with contract
      minerIndexValue: Number(selectedMiner),
      minerName: MINERS[selectedMiner].name
    });
    
    // Add explicit mapping information for clarity
    console.log("Miner index mapping information:", {
      BANANA_MINER: MinerType.BANANA_MINER,
      MONKEY_TOASTER: MinerType.MONKEY_TOASTER,
      GORILLA_GADGET: MinerType.GORILLA_GADGET,
      APEPAD_MINI: MinerType.APEPAD_MINI
    });
    
    if (!selectedTile || isPurchasing || !canPurchase) {
      console.log("Purchase aborted because:", {
        noSelectedTile: !selectedTile,
        isPurchasing,
        cannotPurchase: !canPurchase
      });
      return;
    }
    
    try {
      // Always start with approving state first
      setPurchaseStage('approving');
      
      // Ensure coordinates are numbers
      const x = Number(selectedTile.x);
      const y = Number(selectedTile.y);
      
      console.log(`Initiating purchase of miner index ${selectedMiner} (${MINERS[selectedMiner].name}) at position (${x}, ${y})`);
      console.log(`Expected contract calldata will contain: minerIndex=${selectedMiner}, x=${x}, y=${y}`);
      
      // Now call the purchase function
      try {
        await onPurchase(selectedMiner, x, y);
        
        // If we get here without errors, set to success state
        setPurchaseStage('success');
        console.log("Purchase transaction submitted successfully");
        
        // For any miner purchased, save to localStorage for UI persistence
        if (typeof window !== 'undefined') {
          // Create a standard key for Monkey Toaster position
          if (selectedMiner === MinerType.MONKEY_TOASTER) {
            console.log(`Saving ${MINERS[selectedMiner].name} purchase to localStorage`);
            localStorage.setItem('monkey_toaster_purchased', 'true');
            localStorage.setItem('monkey_toaster_position', JSON.stringify({x, y}));
          }
          
          // Also save to fixedMinerMap for all miner types for consistent storage
          try {
            // We need a user address to save to the miner map
            const userAddress = localStorage.getItem('lastConnectedAddress');
            if (userAddress) {
              console.log(`Saving miner to fixedMinerMap for address ${userAddress}`);
              addMinerToMap(userAddress, {x, y}, selectedMiner);
            } else {
              console.warn('Could not save to fixedMinerMap: No user address found');
            }
          } catch (err) {
            console.error('Error saving to fixedMinerMap:', err);
          }
        }
        
        // Don't automatically close modal, let user see success message and refresh option
      } catch (error) {
        // Set error message for display
        const message = error instanceof Error ? error.message : 'Unknown error occurred';
        setErrorMessage(message);
        console.error('Purchase transaction failed:', message);
        setPurchaseStage('initial');
      }
    } catch (error) {
      // Handle any other errors
      const message = error instanceof Error ? error.message : 'Unknown error';
      setErrorMessage(message);
      console.error('Error during miner purchase:', message);
      setPurchaseStage('initial');
    }
  };

  // Reset purchase stage when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setPurchaseStage('initial');
    }
  }, [isOpen]);

  // When the modal opens and hasClaimedStarterMiner changes, update the selected miner
  useEffect(() => {
    if (hasClaimedStarterMiner && selectedMiner === MinerType.BANANA_MINER) {
      setSelectedMiner(MinerType.MONKEY_TOASTER);
    }
  }, [isOpen, hasClaimedStarterMiner, selectedMiner]);

  // Add useEffect to log state changes for debugging
  useEffect(() => {
    if (isOpen) {
      console.log("MinerPurchaseModal state:", {
        selectedMiner,
        purchaseStage,
        isPurchasing,
        bitBalance,
        canAfford,
        isFreeMiner,
        canGetFreeMiner,
        canPurchase,
        selectedTile
      });
    }
  }, [isOpen, selectedMiner, purchaseStage, isPurchasing, bitBalance, canAfford, isFreeMiner, canGetFreeMiner, canPurchase, selectedTile]);

  // Function to refresh the page
  const refreshPage = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  if (!isOpen) return null;

  // Get button text based on current state
  const getButtonText = () => {
    if (isPurchasing || purchaseStage !== 'initial') {
      if (purchaseStage === 'approving') return 'APPROVING TOKENS...';
      if (purchaseStage === 'purchasing') return 'PURCHASING...';
      if (purchaseStage === 'success') return 'PURCHASED!';
      return 'PROCESSING...';
    }
    
    if (isFreeMiner) return 'CLAIM FREE MINER';
    return `BUY FOR ${minerDetails.price} BIT`;
  };

  // Get button tooltip based on conditions
  const getButtonTooltip = () => {
    if (!selectedTile) return "Select a tile first";
    if (!canAfford && !canGetFreeMiner) return "Insufficient BIT balance";
    if (isPurchasing) return "Transaction in progress";
    return isFreeMiner ? "Claim your free starter miner" : "Purchase this miner";
  };

  return (
    <Dialog
      open={isOpen}
      onClose={purchaseStage === 'success' ? refreshPage : onClose}
      className="relative z-50"
    >
      <style jsx global>{modalScrollStyle}</style>
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <Dialog.Panel className="relative bg-royal border-2 border-banana p-6 max-w-4xl w-full m-4 miner-purchase-modal">
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
              {orderedActiveMiners.map((miner) => {
                const isSelected = selectedMiner === miner.id;
                const isFreeMiner = miner.id === MinerType.BANANA_MINER && miner.price === 0;
                const isUnavailable = isFreeMiner && hasClaimedStarterMiner;
                
                return (
                  <div 
                    key={miner.id}
                    onClick={() => !isUnavailable && purchaseStage === 'initial' && setSelectedMiner(miner.id as MinerType)}
                    className={`bg-dark-blue p-2 flex items-center rounded 
                      ${purchaseStage === 'initial' && !isUnavailable ? 'cursor-pointer' : 'cursor-not-allowed'}
                      ${isSelected ? 'border-l-4 border-banana' : ''}
                      ${isUnavailable || purchaseStage !== 'initial' ? 'opacity-50' : 'hover:bg-dark-blue/80'}`}
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
                <p className="text-white mb-1">- HASH RATE: {getMinerInfo(selectedMiner, 'hashrate')} GH/S</p>
                <p className="text-white mb-1">- PRICE: {getMinerInfo(selectedMiner, 'cost')} BIT</p>
                <p className="text-white mb-1">- ENERGY: {getMinerInfo(selectedMiner, 'powerConsumption')} WATT</p>
                <p className="text-white mb-1">- MINER INDEX: {selectedMiner} ({minerMapping[selectedMiner].name})</p>
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
                
                {purchaseStage === 'approving' && (
                  <p className="text-green-400 mt-3 text-center animate-pulse">
                    APPROVING TOKEN SPEND...
                  </p>
                )}
                
                {purchaseStage === 'purchasing' && (
                  <p className="text-green-400 mt-3 text-center animate-pulse">
                    PURCHASING MINER...
                  </p>
                )}
                
                {purchaseStage === 'success' && (
                  <div className="mt-3 text-center">
                    <p className="text-green-400 font-press-start text-sm mb-2">
                      MINER PURCHASED SUCCESSFULLY!
                    </p>
                    <p className="text-xs text-gray-300">
                      Your new miner should appear on the grid shortly. If you don't see it, please refresh the page.
                    </p>
                    <button
                      onClick={refreshPage}
                      className="mt-2 font-press-start text-xs px-4 py-1 bg-banana text-royal hover:bg-opacity-90"
                    >
                      REFRESH PAGE
                    </button>
                  </div>
                )}
                
                {errorMessage && (
                  <p className="text-red-500 mt-3 text-center break-words">
                    ERROR: {errorMessage}
                  </p>
                )}
                
                {/* Add more detailed explanation of the purchase process */}
                {canPurchase && purchaseStage === 'initial' && !isFreeMiner && (
                  <p className="text-xs text-gray-300 mt-3 text-center">
                    When you click BUY, you'll need to approve the transaction. 
                    If it's your first time, two wallet prompts may appear: 
                    one for token approval and one for the purchase.
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-between mt-8">
            <button
              onClick={purchaseStage === 'success' ? refreshPage : onClose}
              disabled={purchaseStage !== 'initial' && purchaseStage !== 'success'}
              className={`font-press-start px-6 py-2 border-2 border-banana text-banana 
                ${(purchaseStage === 'initial' || purchaseStage === 'success')
                  ? 'hover:bg-banana hover:text-royal' 
                  : 'opacity-50 cursor-not-allowed'} 
                transition-colors`}
            >
              {purchaseStage === 'success' ? 'REFRESH' : 'CANCEL'}
            </button>
            {purchaseStage !== 'success' ? (
              <button
                onClick={handlePurchase}
                disabled={!canPurchase || isPurchasing || purchaseStage !== 'initial'}
                title={getButtonTooltip()}
                className={`font-press-start px-6 py-2 ${
                  canPurchase && purchaseStage === 'initial'
                    ? 'bg-banana text-royal hover:bg-opacity-90'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                } transition-colors`}
              >
                {getButtonText()}
              </button>
            ) : (
              <button
                onClick={refreshPage}
                className="font-press-start px-6 py-2 bg-banana text-royal hover:bg-opacity-90 transition-colors"
              >
                REFRESH PAGE
              </button>
            )}
          </div>
          
          {selectedTile && (
            <div className="mt-6 text-center text-xs text-white">
              MINER WILL BE PLACED AT POSITION: X={selectedTile.x}, Y={selectedTile.y}
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default MinerPurchaseModal; 