import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Dialog } from '@headlessui/react';
import { useAccount, useContractRead, useWriteContract } from 'wagmi';
import { BIT_TOKEN_ABI, BIT_TOKEN_ADDRESS, CONTRACT_ADDRESSES, MAIN_CONTRACT_ABI } from '../config/contracts';
import { formatEther, parseEther } from 'viem';
import { useGameState } from '../hooks/useGameState';

interface FacilityPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: () => void;
  isPurchasing: boolean;
  facilityLevel?: number;
}

const FACILITY_COST = '70'; // 70 BIT tokens

// Facility data mapping
const FACILITY_DATA = {
  1: { name: "YOUR APEROOM", maxMiners: 4, power: 28 },
  2: { name: "YOUR TREEHOUSE", maxMiners: 8, power: 168 },
  3: { name: "YOUR JUNGLE LAB", maxMiners: 16, power: 520 },
  4: { name: "YOUR APE MANSION", maxMiners: 32, power: 1280 }
};

const FacilityPurchaseModal: React.FC<FacilityPurchaseModalProps> = ({
  isOpen,
  onClose,
  onPurchase,
  isPurchasing,
  facilityLevel = 1
}) => {
  const { address } = useAccount();
  const gameState = useGameState();
  
  const [hasSufficientBalance, setHasSufficientBalance] = useState(false);
  const [hasSufficientAllowance, setHasSufficientAllowance] = useState(false);
  const [bitBalance, setBitBalance] = useState('0');
  const [isProcessing, setIsProcessing] = useState(false);
  const [facilityPurchaseError, setFacilityPurchaseError] = useState('');
  const [isApprovingTokens, setIsApprovingTokens] = useState(false);
  
  // Track transaction progress with refs to avoid race conditions and prevent double execution
  const transactionInProgressRef = useRef(false);
  const approvalCompletedRef = useRef(false);
  const purchaseExecutedRef = useRef(false); // Track if purchase has been executed
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const closeModalAfterSuccessRef = useRef(false);

  // Read the facility data directly from contract
  const { data: facilityData, refetch: refetchFacilityData } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'getPlayerFacility',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address)
    }
  });

  // Get validated facility level
  const [validatedLevel, setValidatedLevel] = useState(facilityLevel);

  // Update validated level when contract data or prop changes
  useEffect(() => {
    if (facilityData && Array.isArray(facilityData) && facilityData.length > 0) {
      const contractLevel = Number(facilityData[0]);
      if (contractLevel > 0) {
        console.log('FacilityModal - Using contract facility level:', contractLevel);
        setValidatedLevel(contractLevel);
      } else {
        console.log('FacilityModal - Using prop facility level:', facilityLevel);
        setValidatedLevel(facilityLevel);
      }
    } else {
      setValidatedLevel(facilityLevel);
    }
  }, [facilityData, facilityLevel]);

  // Calculate next level (ensure it doesn't exceed max level 4)
  const nextLevel = Math.min(validatedLevel + 1, 4);

  // Get facility image based on level with cache busting
  const getFacilityImage = (level: number): string => {
    const timestamp = Date.now();
    return `/images/facilities/level-${level}.png?t=${timestamp}`;
  };

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

  // Check BIT token allowance
  const { data: allowanceData, refetch: refetchAllowance } = useContractRead({
    address: BIT_TOKEN_ADDRESS,
    abi: BIT_TOKEN_ABI,
    functionName: 'allowance',
    args: [address as `0x${string}`, CONTRACT_ADDRESSES.MAIN],
    query: {
      enabled: Boolean(address),
      refetchInterval: 5000, // Refetch every 5 seconds to catch allowance changes
    },
  });

  // Use contract write for token approval
  const { 
    writeContract: approveTokens, 
    isPending: isApprovePending, 
    status: approvalStatus,
    error: approvalError,
    reset: resetApproval
  } = useWriteContract();
  
  // Add a new useWriteContract hook for direct facility operations
  const {
    writeContract: writeFacilityContract,
    isPending: isFacilityWritePending,
    status: facilityWriteStatus,
    error: facilityWriteError,
    reset: resetFacilityWrite
  } = useWriteContract();

  // Reset all states when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Reset all states when modal closes
      setIsProcessing(false);
      setFacilityPurchaseError('');
      setIsApprovingTokens(false);
      resetApproval?.();
      resetFacilityWrite?.();
      
      // Clear any pending intervals
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      
      // Reset all transaction tracking refs
      transactionInProgressRef.current = false;
      approvalCompletedRef.current = false;
      purchaseExecutedRef.current = false;
      closeModalAfterSuccessRef.current = false;
    }
  }, [isOpen, resetApproval, resetFacilityWrite]);

  // Update balance and allowance checks
  useEffect(() => {
    // Update BIT balance
    if (bitBalanceData) {
      const balance = formatEther(bitBalanceData as bigint);
      setBitBalance(balance);
      setHasSufficientBalance(parseFloat(balance) >= parseFloat(FACILITY_COST));
    } else if (gameState.bitBalance) {
      setBitBalance(gameState.bitBalance);
      setHasSufficientBalance(parseFloat(gameState.bitBalance) >= parseFloat(FACILITY_COST));
    }
    
    // Update allowance status
    if (allowanceData) {
      const allowance = formatEther(allowanceData as bigint);
      setHasSufficientAllowance(parseFloat(allowance) >= parseFloat(FACILITY_COST));
    }
  }, [bitBalanceData, gameState.bitBalance, allowanceData]);

  // Monitor approval status with better tracking
  useEffect(() => {
    // Only process if we're actively approving and we haven't already completed it
    if (approvalStatus === 'success' && isApprovingTokens && !approvalCompletedRef.current) {
      console.log('Approval transaction succeeded, setting approval completed flag');
      
      // Mark approval as completed to prevent duplicate purchases
      approvalCompletedRef.current = true;
      
      // Wait a moment before refetching to allow for blockchain confirmation
      setTimeout(async () => {
        await refetchAllowance();
        setIsApprovingTokens(false);
        
        // Check allowance after approval and execute purchase if sufficient
        if (!purchaseExecutedRef.current) {
          const allowance = formatEther(allowanceData as bigint);
          const hasAllowance = parseFloat(allowance) >= parseFloat(FACILITY_COST);
          
          if (hasAllowance) {
            console.log('Allowance now sufficient after approval, proceeding with purchase');
            executeFacilityPurchase();
          } else {
            console.log('Waiting for allowance update after approval...');
            // Wait a bit longer and check again
            setTimeout(async () => {
              await refetchAllowance();
              const updatedAllowanceData = allowanceData;
              if (updatedAllowanceData) {
                const updatedAllowance = formatEther(updatedAllowanceData as bigint);
                if (parseFloat(updatedAllowance) >= parseFloat(FACILITY_COST) && !purchaseExecutedRef.current) {
                  console.log('Allowance now sufficient after delay, proceeding with purchase');
                  executeFacilityPurchase();
                }
              }
            }, 3000);
          }
        }
      }, 2000);
    } else if (approvalStatus === 'error' && isApprovingTokens) {
      console.error('Approval transaction failed:', approvalError?.message);
      setIsApprovingTokens(false);
      setFacilityPurchaseError(`Failed to approve token spending: ${approvalError?.message || 'Unknown error'}`);
      
      // Reset flags to allow trying again
      approvalCompletedRef.current = false;
      purchaseExecutedRef.current = false;
      
      resetApproval();
    }
  }, [approvalStatus, isApprovingTokens, approvalError, refetchAllowance, resetApproval, allowanceData]);

  // Enhanced facility transaction monitoring
  useEffect(() => {
    if (facilityWriteStatus === 'success' && transactionInProgressRef.current) {
      console.log('Facility upgrade transaction succeeded');
      
      // Reset transaction flags
      transactionInProgressRef.current = false;
      closeModalAfterSuccessRef.current = true;
      
      // Clear any check intervals
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      
      // Comprehensive data refresh to ensure UI updates
      const refreshData = async () => {
        try {
          // First refresh facility data directly
          await refetchFacilityData();
          console.log('Refreshed facility data directly after upgrade');
          
          // Then refresh full game state
          if (gameState.refetch) {
            await gameState.refetch();
            console.log('Refreshed game state after facility upgrade');
          }
          
          // Force update to the parent component
          onPurchase();
          
          // Add a slight delay before closing to ensure UI updates
          setTimeout(() => {
            // Always reset processing state
            setIsProcessing(false);
            
            // Only close if that's what we want to do
            if (closeModalAfterSuccessRef.current) {
              onClose();
            }
          }, 1000);
        } catch (error) {
          console.error('Error refreshing data after upgrade:', error);
          setIsProcessing(false);
          setFacilityPurchaseError('Upgrade succeeded but there was an error refreshing data. Please refresh the page.');
        }
      };
      
      refreshData();
    } 
    else if (facilityWriteStatus === 'error' && transactionInProgressRef.current) {
      console.error("Error upgrading facility:", facilityWriteError);
      setFacilityPurchaseError(`Error: ${facilityWriteError?.message || 'Transaction failed'}`);
      
      // Reset states
      setIsProcessing(false);
      transactionInProgressRef.current = false;
      purchaseExecutedRef.current = false;
      
      // Clear any check intervals
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    }
  }, [facilityWriteStatus, facilityWriteError, gameState, onPurchase, onClose, refetchFacilityData]);

  // Handle approval of BIT tokens - this is a separate step now
  const handleApproveTokens = async () => {
    // Don't proceed if already approving or processing
    if (isApprovingTokens || isProcessing || approvalCompletedRef.current) {
      console.log('Skipping approval as it is already in progress or completed');
      return false;
    }
    
    try {
      setIsApprovingTokens(true);
      setFacilityPurchaseError('');
      
      // Approve a large amount to avoid needing to approve again
      const approvalAmount = parseEther('10000'); // 10000 BIT tokens
      
      console.log('Approving BIT tokens for spending...', CONTRACT_ADDRESSES.MAIN);
      
      // Call the approve function DIRECTLY with the specific contract
      approveTokens({
        address: BIT_TOKEN_ADDRESS,
        abi: BIT_TOKEN_ABI,
        functionName: 'approve',
        args: [CONTRACT_ADDRESSES.MAIN, approvalAmount]
      });
      
      return true;
    } catch (error: any) {
      console.error("Error initiating token approval:", error);
      setFacilityPurchaseError(`Error approving tokens: ${error.message}`);
      setIsApprovingTokens(false);
      approvalCompletedRef.current = false;
      return false;
    }
  };

  // The facility purchase function with improved state management
  const executeFacilityPurchase = async () => {
    // Check if a purchase is already in progress or has been executed
    if (transactionInProgressRef.current || purchaseExecutedRef.current) {
      console.log('Purchase already in progress or executed, skipping duplicate execution');
      return false;
    }
    
    try {
      setIsProcessing(true);
      setFacilityPurchaseError('');
      
      // Set purchase flag to prevent duplicate calls
      purchaseExecutedRef.current = true;
      
      // For initial purchase, use the gameState method
      if (validatedLevel === 0) {
        console.log('Executing initial facility purchase...');
        
        const result = await gameState.purchaseFacility();
      if (result) {
          console.log('Initial facility purchase successful!');
          
          // Refresh contract data to get the updated facility level
          try {
            await refetchFacilityData();
            
            if (gameState.refetch) {
              await gameState.refetch();
              console.log('Refreshed game state after facility purchase');
            }
            
        // Call the onPurchase callback to update the UI
        onPurchase();
            
        // Close the modal
            setTimeout(() => {
        onClose();
            }, 1000);
          } catch (refreshError) {
            console.error('Error refreshing data after purchase:', refreshError);
          }
        }
        
        // Always reset processing state for initial purchase
        setIsProcessing(false);
        return true;
      } else {
        // For upgrades, directly call the buyNewFacility function
        console.log('Calling buyNewFacility function directly...');
        
        // Set transaction flags
        transactionInProgressRef.current = true;
        
        // Send the transaction
        writeFacilityContract({
          address: CONTRACT_ADDRESSES.MAIN,
          abi: MAIN_CONTRACT_ABI,
          functionName: 'buyNewFacility',
          args: []
        });
        
        // Set a safety timeout to reset UI if transaction status never updates
        const safetyTimeout = setTimeout(() => {
          if (transactionInProgressRef.current) {
            console.warn('Safety timeout triggered - resetting processing state');
            setIsProcessing(false);
            transactionInProgressRef.current = false;
            purchaseExecutedRef.current = false;
            setFacilityPurchaseError('Transaction status unknown. Please check your wallet for confirmation.');
          }
        }, 60000); // 60 second safety timeout
        
        return true;
      }
    } catch (error: any) {
      console.error("Error purchasing facility:", error);
      setFacilityPurchaseError(`Error: ${error.message || 'Transaction failed'}`);
      setIsProcessing(false);
      transactionInProgressRef.current = false;
      purchaseExecutedRef.current = false;
      return false;
    }
  };

  // Handle button click - check allowance first, then handle accordingly
  const handleBuyNewFacility = async () => {
    // Don't process if a transaction is already in progress
    if (transactionInProgressRef.current || isProcessing || isApprovingTokens || isApprovePending || isFacilityWritePending || purchaseExecutedRef.current) {
      console.log('Transaction already in progress, ignoring click');
      return;
    }
    
    // Clear any previous errors
    setFacilityPurchaseError('');
    
    // Check balance first
    if (!hasSufficientBalance) {
      setFacilityPurchaseError('Insufficient BIT balance to complete this purchase');
      return;
    }
    
    // First, check if we need to approve tokens
    if (!hasSufficientAllowance) {
      console.log('Insufficient allowance, requesting approval first');
      
      // Reset execution tracking to prevent duplicates
      purchaseExecutedRef.current = false;
      
      await handleApproveTokens();
      // The purchase will continue after approval via the useEffect monitoring approval status
    } else {
      // We already have sufficient allowance, proceed directly
      console.log('Sufficient allowance exists, proceeding with purchase');
      
      // Reset execution tracking to prevent duplicates
      purchaseExecutedRef.current = false;
      
      await executeFacilityPurchase();
    }
  };

  // Add an effect to detect when the user cancels from the wallet
  useEffect(() => {
    // If isPending was true and now is false without a success/error status
    // it likely means the user rejected in the wallet
    if (!isFacilityWritePending && transactionInProgressRef.current && 
        facilityWriteStatus !== 'success' && facilityWriteStatus !== 'error') {
      const checkRejection = setTimeout(() => {
        if (transactionInProgressRef.current) {
          console.log('Transaction appears to have been rejected in wallet');
          setIsProcessing(false);
          transactionInProgressRef.current = false;
          purchaseExecutedRef.current = false;
          setFacilityPurchaseError('Transaction was rejected or failed to send.');
        }
      }, 1000);
      
      return () => clearTimeout(checkRejection);
    }
  }, [isFacilityWritePending, facilityWriteStatus]);

  if (!isOpen) return null;

  // Get current and next facility images with cache busting
  const currentFacilityImage = getFacilityImage(validatedLevel);
  const nextFacilityImage = getFacilityImage(nextLevel);

  // Get current and next facility data
  const currentFacilityInfo = FACILITY_DATA[validatedLevel as keyof typeof FACILITY_DATA] || FACILITY_DATA[1];
  const nextFacilityInfo = FACILITY_DATA[nextLevel as keyof typeof FACILITY_DATA] || FACILITY_DATA[2];

  return (
    <Dialog
      open={isOpen}
      onClose={() => {
        if (!isProcessing && !isApprovingTokens && !isApprovePending && !isFacilityWritePending) {
          onClose();
        }
      }}
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

          <div className="grid grid-cols-1 gap-6 mb-6">
            <div className="bg-[#0a3049] p-4">
              <h3 className="font-press-start text-banana text-sm mb-3 text-center">FACILITY UPGRADE</h3>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-8 items-center justify-center w-full">
                {/* Current Facility */}
                <div className="text-center">
                  <div className="font-press-start text-white text-xs">PRE VEGAS</div>
                  <div className="mt-2 rounded-lg overflow-hidden w-24 h-24 sm:w-32 sm:h-32 relative">
                    <Image
                      src={currentFacilityImage}
                      alt="Current Facility"
                      fill
                      unoptimized={true}
                      className="object-cover"
                    />
                  </div>
                  <div className="mt-2 font-press-start text-banana text-xs">Level {validatedLevel}</div>
                  <div className="space-y-2 font-press-start text-white text-xs mt-2">
                    <p>{currentFacilityInfo.name}</p>
                    <p>MAX MINERS: {currentFacilityInfo.maxMiners}</p>
                    <p>POWER: {currentFacilityInfo.power} GW</p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="text-3xl text-banana">→</div>

                {/* Next Facility */}
                <div className="text-center">
                  <div className="font-press-start text-white text-xs">APEFEST VEGAS</div>
                  <div className="mt-2 rounded-lg overflow-hidden w-24 h-24 sm:w-32 sm:h-32 relative">
                    <Image
                      src={nextFacilityImage}
                      alt="Next Facility"
                      fill
                      unoptimized={true}
                      className="object-cover"
                    />
                  </div>
                  <div className="mt-2 font-press-start text-banana text-xs">Level {nextLevel}</div>
                  <div className="space-y-2 font-press-start text-white text-xs mt-2">
                    <p>{nextFacilityInfo.name}</p>
                    <p>MAX MINERS: {nextFacilityInfo.maxMiners}</p>
                    <p>POWER: {nextFacilityInfo.power} GW</p>
                  </div>
                </div>
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
            {hasSufficientBalance && !hasSufficientAllowance && (
              <p className="text-yellow-500 font-press-start text-xs">
                APPROVAL NEEDED TO SPEND $BIT TOKENS
              </p>
            )}
            {facilityPurchaseError && (
              <p className="text-red-500 font-press-start text-xs mt-2">{facilityPurchaseError}</p>
            )}
          </div>

          <div className="flex justify-center space-x-6">
            <button
              onClick={onClose}
              disabled={isProcessing || isApprovingTokens || isApprovePending || isFacilityWritePending}
              className="font-press-start px-8 py-2 border-2 border-banana text-banana hover:bg-banana hover:text-royal transition-colors disabled:opacity-50"
            >
              CANCEL
            </button>
            <button
              onClick={handleBuyNewFacility}
              disabled={isPurchasing || isProcessing || !hasSufficientBalance || isApprovingTokens || isApprovePending || isFacilityWritePending}
              className={`font-press-start px-8 py-2 ${hasSufficientBalance ? 'bg-banana text-royal hover:bg-banana/90' : 'bg-[#444444] text-[#888888]'} transition-colors disabled:opacity-50`}
            >
              {isPurchasing || isProcessing || isFacilityWritePending ? 'UPGRADING...' : 
               isApprovingTokens || isApprovePending ? 'APPROVING...' : 
               !hasSufficientAllowance ? 'APPROVE & UPGRADE' : 'UPGRADE NOW'}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default FacilityPurchaseModal; 