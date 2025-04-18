import React, { useState, useEffect } from 'react';
import '@/styles/animations.css';
import { useWriteContract } from 'wagmi';
import { CONTRACT_ADDRESSES, MAIN_CONTRACT_ABI } from '@/config/contracts';

interface EnhancedMiningClaimSectionProps {
  minedBit: string;
  onClaimRewards: () => Promise<void>;
  isClaimingReward: boolean;
  miningRate?: string; // Optional - show daily mining rate if provided
}

export const EnhancedMiningClaimSection: React.FC<EnhancedMiningClaimSectionProps> = ({
  minedBit,
  onClaimRewards,
  isClaimingReward,
  miningRate
}) => {
  // Parse minedBit as a number to handle both "0" and "Loading..." cases
  const parsedAmount = isNaN(parseFloat(minedBit)) ? 0 : parseFloat(minedBit);
  const hasMinedBit = parsedAmount > 0;
  
  // Track claim success for animation
  const [showClaimSuccess, setShowClaimSuccess] = useState(false);
  const [previousAmount, setPreviousAmount] = useState(parsedAmount);
  const [isManualClaiming, setIsManualClaiming] = useState(false);

  // Access the writeContract hook
  const { writeContract, isPending, isSuccess, error } = useWriteContract();
  
  // Check for successful claim (when rewards drop to 0 after claiming)
  useEffect(() => {
    if (previousAmount > 0 && parsedAmount === 0 && !isClaimingReward && !isManualClaiming) {
      setShowClaimSuccess(true);
      const timer = setTimeout(() => setShowClaimSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
    setPreviousAmount(parsedAmount);
  }, [parsedAmount, isClaimingReward, previousAmount, isManualClaiming]);
  
  // Monitor the claim transaction status
  useEffect(() => {
    if (isSuccess && isManualClaiming) {
      console.log('Claim transaction successful!');
      setShowClaimSuccess(true);
      const timer = setTimeout(() => {
        setShowClaimSuccess(false);
        setIsManualClaiming(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
    
    if (error && isManualClaiming) {
      console.error('Claim transaction failed:', error);
      setIsManualClaiming(false);
    }
  }, [isSuccess, error, isManualClaiming]);
  
  // Handle claim with direct contract call
  const handleClaim = async () => {
    if (isClaimingReward || isPending || isManualClaiming || !hasMinedBit) return;
    
    try {
      console.log('Calling claimRewards contract function directly...');
      setIsManualClaiming(true);
      
      // Use custom ABI with the correct function name
      const claimRewardsAbi = [{
        inputs: [],
        name: 'claimRewards',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      }];
      
      writeContract({
        address: CONTRACT_ADDRESSES.MAIN,
        abi: claimRewardsAbi,
        functionName: 'claimRewards',
      });
      
      // Also call the original onClaimRewards to maintain compatibility
      onClaimRewards().catch(err => {
        console.log('Secondary claim method failed (this is normal):', err);
      });
    } catch (error) {
      console.error("Error claiming rewards:", error);
      setIsManualClaiming(false);
    }
  };
  
  // Determine if we're in a loading state
  const isLoading = isClaimingReward || isPending || isManualClaiming;
  
  return (
    <div className="relative p-4 bg-dark-blue border-2 border-banana rounded-lg text-center font-press-start overflow-hidden">
      {/* Success animation overlay */}
      {showClaimSuccess && (
        <div className="absolute inset-0 bg-banana bg-opacity-20 flex items-center justify-center z-10 animate-fade-out">
          <div className="bg-royal bg-opacity-90 px-4 py-2 rounded-lg border border-banana success-animation">
            <span className="text-banana text-lg">CLAIM SUCCESSFUL!</span>
          </div>
        </div>
      )}
      
      <div className="mb-3">
        <h3 className="text-banana text-base mb-2">MINING REWARDS</h3>
        <div className="flex items-center justify-center gap-2">
          <span className="text-white text-sm">YOU HAVE MINED</span>
          <span className={`text-banana font-bold ${hasMinedBit ? 'text-xl animate-pulse-custom' : 'text-lg'}`}>
            {minedBit}
          </span>
          <span className="text-white text-sm">BIT</span>
        </div>
        
        {miningRate && (
          <div className="text-white text-xs mt-2 opacity-75 flex items-center justify-center">
            <span className="mining-icon mr-1">⛏️</span> Mining {miningRate} BIT per day
          </div>
        )}
      </div>
      
      <button 
        onClick={handleClaim}
        disabled={isLoading || parsedAmount <= 0}
        className={`w-full py-2 px-3 text-sm border-2 transition-all duration-200 ${
          hasMinedBit && !isLoading
            ? 'bg-banana text-royal hover:bg-opacity-90 border-royal relative overflow-hidden'
            : 'bg-dark-blue text-banana border-banana opacity-60'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-banana" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            CLAIMING...
          </span>
        ) : (
          <span className="relative z-10">CLAIM MINED BIT</span>
        )}
        
        {/* Add a shine effect on hover when there are rewards to claim */}
        {hasMinedBit && !isLoading && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="shine-effect"></div>
          </div>
        )}
      </button>
      
      {error && (
        <p className="text-red-500 text-xs mt-2">Error: {error.message || 'Transaction failed'}</p>
      )}
      
      {!hasMinedBit && !isLoading && (
        <p className="text-white text-xs mt-2 opacity-70">Keep mining to earn rewards</p>
      )}
    </div>
  );
}; 