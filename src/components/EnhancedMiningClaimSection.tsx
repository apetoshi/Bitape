import React, { useState, useEffect, useRef } from 'react';
import '@/styles/animations.css';
import { useWriteContract, useContractRead, useAccount } from 'wagmi';
import { CONTRACT_ADDRESSES, MAIN_CONTRACT_ABI } from '@/config/contracts';
import { formatEther, zeroAddress } from 'viem';

interface EnhancedMiningClaimSectionProps {
  minedBit: string;
  onClaimRewards: () => Promise<void>;
  isClaimingReward: boolean;
  miningRate?: string; // Optional - show daily mining rate if provided
}

export const EnhancedMiningClaimSection: React.FC<EnhancedMiningClaimSectionProps> = ({
  minedBit: initialMinedBit,
  onClaimRewards,
  isClaimingReward,
  miningRate
}) => {
  const { address } = useAccount();
  const [displayAmount, setDisplayAmount] = useState<string>('0');
  const [targetAmount, setTargetAmount] = useState<number>(0);
  const [showClaimSuccess, setShowClaimSuccess] = useState<boolean>(false);
  const [isManualClaiming, setIsManualClaiming] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [tickEffect, setTickEffect] = useState<boolean>(false);

  // Add refs for animation state that shouldn't trigger re-renders
  const lastTickRef = useRef<number>(0);
  const animationFrameIdRef = useRef<number>(0);

  // Direct read from contract for most up-to-date rewards
  const { data: pendingRewardsData, isLoading: isLoadingRewards, refetch: refetchRewards } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'pendingRewards',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  });

  // Animation for counting up the rewards
  useEffect(() => {
    // Convert to number, handle empty string case
    let end = 0;
    
    if (pendingRewardsData) {
      end = parseFloat(formatEther(pendingRewardsData));
    } else if (initialMinedBit) {
      const parsed = parseFloat(initialMinedBit);
      if (!isNaN(parsed)) end = parsed;
    }
    
    // Set target amount (current accumulated rewards)
    setTargetAmount(end);
    
    // Only animate if there are rewards
    if (end > 0) {
      setIsAnimating(true);
      const startTime = performance.now();
      const duration = 1200; // 1.2 seconds
      const tickInterval = 200; // Visual tick every 200ms
      
      // Reset variables
      lastTickRef.current = performance.now();
      
      const animateValue = () => {
        const now = performance.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuad = (t: number) => t * (2 - t);
        const currentValue = end * easeOutQuad(progress);
        
        // Format based on size
        let formatted;
        if (end >= 1000) {
          formatted = currentValue.toFixed(2);
        } else if (end >= 100) {
          formatted = currentValue.toFixed(3);
        } else if (end >= 10) {
          formatted = currentValue.toFixed(4);
        } else {
          formatted = currentValue.toFixed(5);
        }
        
        // Important: Store the current value to prevent recursion
        const newDisplayAmount = formatted;
        setDisplayAmount(newDisplayAmount);
        
        // Add tick effect at intervals using the ref
        if (now - lastTickRef.current > tickInterval && progress < 0.95) {
          setTickEffect(prev => !prev);
          lastTickRef.current = now;
        }
        
        if (progress < 1) {
          animationFrameIdRef.current = requestAnimationFrame(animateValue);
        } else {
          setIsAnimating(false);
          setDisplayAmount(end.toFixed(end >= 100 ? 2 : (end >= 10 ? 3 : 5)));
        }
      };
      
      animateValue();
      
      // Cleanup function to cancel animation if component unmounts or dependencies change
      return () => {
        if (animationFrameIdRef.current) {
          cancelAnimationFrame(animationFrameIdRef.current);
        }
      };
    } else {
      setDisplayAmount(isLoadingRewards ? 'Loading...' : '0');
    }
  }, [pendingRewardsData, isLoadingRewards, initialMinedBit]); // Only these dependencies

  // Access the writeContract hook
  const { writeContract, isPending, isSuccess, error } = useWriteContract();
  
  // Monitor claim success for animation
  useEffect(() => {
    if (isSuccess && isManualClaiming) {
      console.log('Claim transaction successful!');
      setShowClaimSuccess(true);
      setDisplayAmount('0');
      setTargetAmount(0);
      
      // Reset states after animation
      const timer = setTimeout(() => {
        setShowClaimSuccess(false);
        setIsManualClaiming(false);
        refetchRewards(); // Refresh rewards after claim
      }, 3000);
      
      return () => clearTimeout(timer);
    }
    
    if (error && isManualClaiming) {
      console.error('Claim transaction failed:', error);
      setIsManualClaiming(false);
    }
  }, [isSuccess, error, isManualClaiming, refetchRewards]);
  
  // Handle claim with direct contract call
  const handleClaim = async () => {
    if (isClaimingReward || isPending || isManualClaiming || isLoadingRewards || targetAmount <= 0) return;
    
    try {
      console.log('Calling claimRewards contract function...');
      setIsManualClaiming(true);
      
      // Only use writeContract, don't call onClaimRewards as well
      writeContract({
        address: CONTRACT_ADDRESSES.MAIN,
        abi: MAIN_CONTRACT_ABI,
        functionName: 'claimRewards',
      } as any);
      
      // DO NOT call onClaimRewards - that would cause duplicate transactions
      // The success effect will trigger refetchRewards when the transaction completes
    } catch (error) {
      console.error("Error claiming rewards:", error);
      setIsManualClaiming(false);
    }
  };
  
  // Determine if we're in a loading state
  const isLoading = isClaimingReward || isPending || isManualClaiming || isLoadingRewards;
  const hasMinedBit = targetAmount > 0;
  
  // Calculate real-time BIT accumulation to show increasing
  useEffect(() => {
    // Only increment if not in claim/loading state and there are rewards
    if (!isLoading && !showClaimSuccess && hasMinedBit && miningRate) {
      const rate = parseFloat(miningRate);
      if (!isNaN(rate) && rate > 0) {
        // Use ref to track the interval
        const incrementRef = { current: 0 };
        
        incrementRef.current = window.setInterval(() => {
          setTargetAmount(prev => {
            // Add tiny amount every second (daily rate / 86400)
            const increment = rate / 86400;
            return prev + increment;
          });
          
          // Only update display if not actively animating
          if (!isAnimating) {
            setDisplayAmount(prev => {
              const currentTarget = parseFloat(prev);
              if (isNaN(currentTarget)) return '0';
              // Format based on size
              if (currentTarget >= 100) {
                return currentTarget.toFixed(2);
              } else if (currentTarget >= 10) {
                return currentTarget.toFixed(3);
              } else {
                return currentTarget.toFixed(5);
              }
            });
          }
        }, 1000) as unknown as number;
        
        return () => window.clearInterval(incrementRef.current);
      }
    }
  }, [isLoading, showClaimSuccess, hasMinedBit, miningRate, isAnimating]); // Only include stable dependencies
  
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
          <span className={`text-banana font-bold ${hasMinedBit ? 'text-xl' : 'text-lg'} ${
            isAnimating || tickEffect ? 'animate-pulse-custom' : hasMinedBit ? 'animate-pulse-slow' : ''
          }`}>
            {displayAmount}
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
        disabled={isLoading || targetAmount <= 0}
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