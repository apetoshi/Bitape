import React, { useState, useEffect } from 'react';
import { useWriteContract } from 'wagmi';
import { CONTRACT_ADDRESSES, MAIN_CONTRACT_ABI } from '@/config/contracts';

interface MiningClaimSectionProps {
  minedBit: string;
  onClaimRewards: () => Promise<void>;
  isClaimingReward: boolean;
}

export const MiningClaimSection: React.FC<MiningClaimSectionProps> = ({
  minedBit,
  onClaimRewards,
  isClaimingReward
}) => {
  // Parse minedBit as a number to handle both "0" and "Loading..." cases
  const parsedAmount = isNaN(parseFloat(minedBit)) ? 0 : parseFloat(minedBit);
  const hasMinedBit = parsedAmount > 0;
  
  // State for direct contract calling
  const [isManualClaiming, setIsManualClaiming] = useState(false);
  
  // Access the writeContract hook
  const { writeContract, isPending, isSuccess, error } = useWriteContract();
  
  // Monitor transaction status
  useEffect(() => {
    if (isSuccess && isManualClaiming) {
      console.log('Claim transaction successful!');
      setIsManualClaiming(false);
    }
    
    if (error && isManualClaiming) {
      console.error('Claim transaction failed:', error);
      setIsManualClaiming(false);
    }
  }, [isSuccess, error, isManualClaiming]);
  
  // Determine if we're in a loading state
  const isLoading = isClaimingReward || isPending || isManualClaiming;
  
  // Handle claim with direct contract call
  const handleClaim = async () => {
    if (isLoading || !hasMinedBit) return;
    
    try {
      console.log('Calling claimRewardscontract function directly from MiningClaimSection...');
      setIsManualClaiming(true);
      
      writeContract({
        address: CONTRACT_ADDRESSES.MAIN,
        abi: MAIN_CONTRACT_ABI,
        functionName: 'claimReward',
      });
      
      // Also call the original onClaimRewardssto maintain compatibility
      onClaimRewards().catch(err => {
        console.log('Secondary claim method failed (this is normal):', err);
      });
    } catch (error) {
      console.error("Error claiming rewards:", error);
      setIsManualClaiming(false);
    }
  };
  
  return (
    <div className="p-4 bg-dark-blue border-2 border-banana rounded-lg text-center font-press-start">
      <div className="mb-3">
        <h3 className="text-banana text-base mb-1">MINING REWARDS</h3>
        <div className="flex items-center justify-center gap-2">
          <span className="text-white text-sm">YOU HAVE MINED</span>
          <span className={`text-banana font-bold ${hasMinedBit ? 'text-xl animate-pulse' : 'text-lg'}`}>
            {minedBit}
          </span>
          <span className="text-white text-sm">BIT</span>
        </div>
      </div>
      
      <button 
        onClick={handleClaim}
        disabled={isLoading || parsedAmount <= 0}
        className={`w-full py-2 px-3 text-sm border-2 transition-all duration-200 ${
          hasMinedBit && !isLoading
            ? 'bg-banana text-royal hover:bg-opacity-90 border-royal'
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
          <>CLAIM MINED BIT</>
        )}
      </button>
      
      {error && (
        <p className="text-red-500 text-xs mt-2">Error claiming rewards</p>
      )}
      
      {!hasMinedBit && !isLoading && (
        <p className="text-white text-xs mt-2 opacity-70">Keep mining to earn rewards</p>
      )}
    </div>
  );
};
