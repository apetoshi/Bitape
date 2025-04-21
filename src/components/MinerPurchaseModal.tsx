import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Dialog } from '@headlessui/react';
import { MINERS, MinerType, MinerData, getActiveMiners } from '@/config/miners';
import { addMinerToMap } from '@/app/room/[address]/fixedMinerMap';
import { APECHAIN_ID, CONTRACT_ADDRESSES } from '@/config/contracts';
import { usePublicClient, useAccount } from 'wagmi';
import { formatEther, parseEther, parseUnits } from 'viem';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  Grid,
  GridItem,
  Text,
  Flex,
  Box,
  Progress,
  Tooltip,
  useColorModeValue
} from '@chakra-ui/react';
import { BITAPE_TOKEN_ABI, BITAPE_TOKEN_ADDRESS } from '@/config/web3';

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
  const [hasEnoughAllowance, setHasEnoughAllowance] = useState<boolean>(false);
  const [isCheckingAllowance, setIsCheckingAllowance] = useState<boolean>(false);
  const [minerCost, setMinerCost] = useState<string>('0');
  const activeMiners = getActiveMiners();
  const publicClient = usePublicClient();
  const { address } = useAccount();
  
  // Convert bitBalance to a number - ensure it's properly formatted from wei to ether
  const bitBalanceNumber = parseFloat(bitBalance);
  
  // Get miner info from contract data or fallback to config
  const getMinerInfo = (minerType: MinerType) => {
    const configMiner = MINERS[minerType];
    return {
      hashrate: configMiner.hashrate,
      powerConsumption: configMiner.energyConsumption,
      cost: configMiner.price
    };
  };

  // Memoize the selected miner details
  const minerDetails = useMemo(() => {
    const miner = MINERS[selectedMiner];
    const isFreeMiner = selectedMiner === MinerType.BANANA_MINER && !hasClaimedStarterMiner;
    const price = isFreeMiner ? 0 : getMinerInfo(selectedMiner).cost;
    const hashrate = getMinerInfo(selectedMiner).hashrate;
    const powerConsumption = getMinerInfo(selectedMiner).powerConsumption;

    return {
      name: miner.name,
      image: miner.image,
      description: miner.description,
      price: typeof price === 'string' ? parseFloat(price) : price,
      hashrate: typeof hashrate === 'string' ? parseFloat(hashrate) : hashrate,
      powerConsumption: typeof powerConsumption === 'string' ? parseFloat(powerConsumption) : powerConsumption
    };
  }, [selectedMiner, hasClaimedStarterMiner]);
  
  // Memoize the miner cost value for allowance checks
  const minerCostValue = useMemo(() => {
    const isFreeMiner = selectedMiner === MinerType.BANANA_MINER && !hasClaimedStarterMiner;
    if (isFreeMiner) return '0';
    const price = minerDetails.price;
    return price !== undefined ? price.toString() : '0';
  }, [minerDetails.price, selectedMiner, hasClaimedStarterMiner]);
  
  // Check if user can afford the selected miner using contract data when available
  const minerCostNumber = Number(minerCostValue);
  const canAfford = minerCostNumber <= bitBalanceNumber;
  
  // For the free starter miner, check if user has already claimed it
  const isFreeMiner = selectedMiner === MinerType.BANANA_MINER && minerCostNumber === 0;
  const canGetFreeMiner = isFreeMiner && !hasClaimedStarterMiner;
  
  // Determine if user can purchase this miner
  const canPurchase = selectedTile && (canAfford || canGetFreeMiner);
  
  // Create a mapping of miner types to their names and indices for clarity
  const minerMapping = {
    [MinerType.BANANA_MINER]: { name: "BANANA MINER", index: MinerType.BANANA_MINER },
    [MinerType.MONKEY_TOASTER]: { name: "MONKEY TOASTER", index: MinerType.MONKEY_TOASTER },
    [MinerType.APEPAD_MINI]: { name: "APEPAD MINI", index: MinerType.APEPAD_MINI },
    [MinerType.GORILLA_GADGET]: { name: "GORILLA GADGET", index: MinerType.GORILLA_GADGET },
  };
  
  // Define a display order for miners from cheaper to more expensive
  // Note: Order switched between APEPAD_MINI (now 3) and GORILLA_GADGET (now 4)
  const minerDisplayOrder = [
    MinerType.BANANA_MINER,    // Free starter miner (1)
    MinerType.MONKEY_TOASTER,  // 20 BIT (2)
    MinerType.APEPAD_MINI,     // 40 BIT (3)
    MinerType.GORILLA_GADGET   // 100 BIT (4)
  ];
  
  // Get active miners in our preferred display order
  const orderedActiveMiners = minerDisplayOrder
    .map(minerType => MINERS[minerType])
    .filter(miner => miner.isActive);
  
  // Check allowance when the modal opens or miner type changes
  useEffect(() => {
    const checkAllowance = async () => {
      if (!isOpen || !publicClient || !address || isFreeMiner) return;

      try {
        setIsCheckingAllowance(true);
        // Get the miner cost to check against allowance
        const cost = minerCostValue;
        if (!cost) {
          console.error('Failed to get miner cost for allowance check');
          return;
        }

        // Log to help debug
        console.log('Checking allowance with params:', {
          tokenAddress: BITAPE_TOKEN_ADDRESS,
          ownerAddress: address,
          spenderAddress: CONTRACT_ADDRESSES.MAIN,
          minerCost: cost
        });

        // Parse the miner cost as a bigint for comparison
        const minerCostBigInt = parseEther(cost);
        
        // Read the current allowance with added error handling
        try {
          const allowance = await publicClient.readContract({
            address: BITAPE_TOKEN_ADDRESS as `0x${string}`,
            abi: BITAPE_TOKEN_ABI,
            functionName: 'allowance',
            args: [address, CONTRACT_ADDRESSES.MAIN as `0x${string}`]
          });

          console.log('Allowance check result:', {
            allowance: allowance?.toString(),
            minerCost: minerCostBigInt.toString(),
            hasEnough: (allowance as bigint) >= minerCostBigInt
          });

          // Compare allowance to cost
          setHasEnoughAllowance((allowance as bigint) >= minerCostBigInt);
        } catch (allowanceError) {
          console.error('Specific error checking allowance:', allowanceError);
          // Fallback: Treat as not having enough allowance so user can approve
          setHasEnoughAllowance(false);
        }
      } catch (error) {
        console.error('Error checking allowance:', error);
        setHasEnoughAllowance(false);
      } finally {
        setIsCheckingAllowance(false);
      }
    };

    if (isOpen && address) {
      checkAllowance();
    }
  }, [isOpen, selectedMiner, publicClient, isFreeMiner, address, minerCostValue]);

  // Get button text based on current state
  const getButtonText = () => {
    if (isPurchasing || purchaseStage !== 'initial') {
      if (purchaseStage === 'approving') return 'APPROVING TOKENS...';
      if (purchaseStage === 'purchasing') return 'PURCHASING...';
      if (purchaseStage === 'success') return 'PURCHASED!';
      return 'PROCESSING...';
    }
    
    if (isFreeMiner) return 'CLAIM FREE MINER';
    
    // Format price safely
    const price = minerDetails.price;
    const formattedPrice = typeof price === 'number' 
      ? price.toFixed(2)
      : price;
    
    return `BUY FOR ${formattedPrice} BIT`;
  };

  // Get button tooltip based on conditions
  const getButtonTooltip = () => {
    if (!selectedTile) return "Select a tile first";
    if (!canAfford && !canGetFreeMiner) return "Insufficient BIT balance";
    if (isPurchasing) return "Transaction in progress";
    return isFreeMiner ? "Claim your free starter miner" : "Purchase this miner";
  };

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
      hasEnoughAllowance,
      minerCost: minerCostValue
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
      // Set appropriate initial state
      setPurchaseStage(hasEnoughAllowance ? 'purchasing' : 'approving');
      
      // Ensure coordinates are numbers
      const x = Number(selectedTile.x);
      const y = Number(selectedTile.y);
      
      console.log(`Initiating purchase for ${MINERS[selectedMiner].name} on tile (${x}, ${y})`);
      
      // Process the purchase
      try {
        await onPurchase(selectedMiner, x, y);
        
        // If we get here without errors, set to success state
        setPurchaseStage('success');
        console.log("Purchase transaction submitted successfully");
        
        // Remove localStorage persistence - rely only on contract data
        console.log(`Purchased miner type ${selectedMiner} at position (${x}, ${y})`);
      } catch (error) {
        // Set error message for display
        let displayError = 'Transaction failed';
        
        if (error instanceof Error) {
          // Format the error message to be more user-friendly
          if (error.message.includes('user rejected') || error.message.includes('rejected') || error.message.includes('denied')) {
            displayError = 'You declined the transaction in your wallet';
          } else if (error.message.includes('insufficient funds for gas')) {
            displayError = 'Not enough APE tokens for transaction fees';
          } else if (error.message.includes('Invalid price data') || error.message.includes('Failed to convert')) {
            displayError = 'Price data error - please try again';
          } else if (error.message.includes('network') || error.message.includes('connection')) {
            displayError = 'Network connection issue - please check your internet connection';
          } else if (error.message.includes('MetaMask') || error.message.includes('wallet')) {
            displayError = 'Wallet error: ' + error.message.split(':')[0]; // Get just the first part
          } else if (error.message.includes('Token approval failed')) {
            // Keep the original message for token approval errors as they're already well-formatted
            displayError = error.message;
          } else {
            // For other errors, keep the original message but cap the length
            displayError = error.message.length > 100 
              ? `${error.message.substring(0, 100)}...` 
              : error.message;
          }
        } else {
          displayError = 'Unknown error occurred';
        }
        
        console.error('Purchase transaction failed:', error);
        setErrorMessage(displayError);
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
        hasEnoughAllowance,
        selectedTile
      });
    }
  }, [isOpen, selectedMiner, purchaseStage, isPurchasing, bitBalance, canAfford, isFreeMiner, canGetFreeMiner, canPurchase, hasEnoughAllowance, selectedTile]);

  // Function to refresh the page
  const refreshPage = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  // Update miner cost when the selected miner changes
  useEffect(() => {
    setMinerCost(minerCostValue);
  }, [minerCostValue]);

  if (!isOpen) return null;

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
            <p className="text-gray-400 font-press-start text-xs mt-1">
              Transactions will be executed on Apechain
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
                          : `${typeof miner.price === 'number' ? miner.price.toFixed(2) : miner.price} BIT`}
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
                <p className="text-white mb-1">- PRICE: {minerCostValue} BIT</p>
                <p className="text-white mb-1">- ENERGY: {minerDetails.powerConsumption} WATT</p>
                <p className="text-white mb-1">- MINER INDEX: {selectedMiner} ({minerDetails.name})</p>
                {/* 
                  Note on miner indices:
                  BANANA_MINER = 1 (Starter)
                  MONKEY_TOASTER = 2
                  APEPAD_MINI = 3 (Previously was GORILLA_GADGET)
                  GORILLA_GADGET = 4 (Previously was APEPAD_MINI)
                */}
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
                
                {!hasEnoughAllowance && !isFreeMiner && canAfford && purchaseStage === 'initial' && (
                  <p className="text-yellow-500 mt-3 text-center">
                    TOKEN APPROVAL NEEDED
                  </p>
                )}
                
                {purchaseStage === 'approving' && (
                  <div>
                    <p className="text-green-400 mt-3 text-center animate-pulse">
                      APPROVING TOKEN SPEND...
                      <br />
                      <span className="text-white text-xs mt-1 block">
                        Please check your wallet and confirm the transaction.
                        <br />
                        If your wallet isn't responding, try refreshing the page.
                      </span>
                    </p>
                    <div className="mt-2 text-center">
                      <button
                        onClick={refreshPage}
                        className="mt-1 font-press-start text-xs px-3 py-1 bg-gray-700 text-white hover:bg-gray-600 transition-colors rounded"
                      >
                        WALLET NOT RESPONDING? REFRESH
                      </button>
                    </div>
                  </div>
                )}
                
                {purchaseStage === 'purchasing' && (
                  <div>
                    <p className="text-green-400 mt-3 text-center animate-pulse">
                      PURCHASING MINER...
                      <br />
                      <span className="text-white text-xs mt-1 block">
                        Please check your wallet and confirm the transaction.
                        <br />
                        If your wallet isn't responding, try refreshing the page.
                      </span>
                    </p>
                    <div className="mt-2 text-center">
                      <button
                        onClick={refreshPage}
                        className="mt-1 font-press-start text-xs px-3 py-1 bg-gray-700 text-white hover:bg-gray-600 transition-colors rounded"
                      >
                        WALLET NOT RESPONDING? REFRESH
                      </button>
                    </div>
                  </div>
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
                    Click BUY to purchase this miner. Your wallet will prompt you to approve token spending if needed.
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
                disabled={!canPurchase || isPurchasing || purchaseStage !== 'initial' || isCheckingAllowance}
                title={getButtonTooltip()}
                className={`font-press-start px-6 py-2 ${
                  canPurchase && purchaseStage === 'initial' && !isCheckingAllowance
                    ? 'bg-banana text-royal hover:bg-opacity-90'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                } transition-colors`}
              >
                {isCheckingAllowance ? 'CHECKING...' : getButtonText()}
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