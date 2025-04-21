import { useAccount, useContractRead, useBalance, useWriteContract, usePublicClient } from 'wagmi';
import { formatEther, parseEther, zeroAddress, TransactionReceipt } from 'viem';
import { CONTRACT_ADDRESSES, ERC20_ABI, APECHAIN_ID, MAIN_CONTRACT_ABI, BIT_TOKEN_ADDRESS, BIT_TOKEN_ABI } from '../config/contracts';
import { MINERS, MinerType, MinerData } from '../config/miners';
import { useEffect, useState } from 'react';

interface PlayerFacility {
  facilityIndex: bigint;
  maxMiners: bigint;
  currMiners: bigint;
  totalPowerOutput: bigint;
  currPowerOutput: bigint;
  x: bigint;
  y: bigint;
}

interface PlayerStats {
  totalMined: bigint;
  hashRate: bigint;
  miningRate: bigint;
  networkShare: bigint;
}

// Export the PlayerMiner interface so it can be imported elsewhere
export interface PlayerMiner {
  id: string | number;
  minerType: MinerType | number;
  x: number;
  y: number;
  hashrate?: number;
  powerConsumption?: number;
  cost?: number;
  inProduction?: boolean;
  image?: string;
  type?: number;
  name?: string;
}

export interface GameState {
  // User state
  isConnected: boolean;
  address: string | undefined;
  
  // Resources
  apeBalance: string;
  bitBalance: string;
  spacesLeft: number;
  gigawattsAvailable: number;
  
  // Mining stats
  miningRate: string;
  hashRate: string;
  blocksUntilHalving: string;
  networkHashRatePercentage: string;
  totalNetworkHashRate: string;
  
  // Network stats
  totalMinedBit: string;
  burnedBit: string;
  rewardPerBlock: string;
  
  // Mining rewards
  minedBit: string;
  
  // Facility state
  hasFacility: boolean;
  facilityData: {
    power: number;
    level: number;
    miners: number;
    capacity: number;
    used: number;
    resources: number;
    spaces: number;
  } | null;
  stats: PlayerStats;
  
  // Actions
  purchaseFacility: () => Promise<void>;
  getStarterMiner: (x: number, y: number) => Promise<void>;
  purchaseMiner: (minerType: MinerType, x: number, y: number) => Promise<void>;
  claimReward: () => Promise<void>;
  upgradeFacility: () => Promise<void>;
  
  // Loading states
  isPurchasingFacility: boolean;
  isGettingStarterMiner: boolean;
  isPurchasingMiner: boolean;
  isClaimingReward: boolean;
  isUpgradingFacility: boolean;

  // New fields
  isGameActive: boolean;
  isUserActive: boolean;

  totalReferrals: number;
  totalBitEarned: string;
  refetch: () => void;

  // Referral info
  referralInfo: {
    referralCode: string;
    totalReferrals: number;
    rewardsEarned: string;
  };

  // Facility price
  initialFacilityPrice: string;

  // Miner status
  hasClaimedStarterMiner: boolean;
  
  // Player miners
  miners: PlayerMiner[];

  // Miner types directly from contract
  minerTypesFromContract: Record<number, any>;
}

/**
 * Utility to retry failed contract calls with exponential backoff
 */
async function retryContractCall<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 200
): Promise<T> {
  let retries = 0;
  let delay = initialDelay;
  
  while (true) {
    try {
      return await fn();
    } catch (error: any) {
      retries++;
      
      // Don't retry user rejections
      if (error.code === 4001 || 
          error.message?.includes('user rejected') || 
          error.message?.includes('user denied')) {
        throw error;
      }
      
      // MetaMask specific errors that should be retried
      const isMetaMaskError = error.message?.includes('MetaMask') || 
                             error.message?.includes('disconnected') ||
                             error.message?.includes('trouble starting');
      
      if (retries >= maxRetries || (!isMetaMaskError && !error.message?.includes('network'))) {
        console.error(`Contract call failed after ${retries} retries:`, error);
        throw error;
      }
      
      console.log(`Retrying contract call (${retries}/${maxRetries}) after ${delay}ms delay. Error:`, error.message);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Exponential backoff
      delay *= 2;
    }
  }
}

export function useGameState(): GameState {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  
  // State variables
  const [apeBalance, setApeBalance] = useState('0');
  const [bitBalance, setBitBalance] = useState('0');
  const [minedBit] = useState('0');
  const [hasFacility, setHasFacility] = useState(false);
  const [spacesLeft] = useState(0);
  const [gigawattsAvailable] = useState(0);
  const [miningRate] = useState('0');
  const [hashRate] = useState('0');
  const [blocksUntilHalving] = useState('0');
  const [networkHashRatePercentage] = useState('0');
  const [totalNetworkHashRate] = useState('0');
  const [isPurchasingFacility, setIsPurchasingFacility] = useState(false);
  const [isGettingStarterMiner, setIsGettingStarterMiner] = useState(false);
  const [isClaimingReward, setIsClaimingReward] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [totalBitEarned, setTotalBitEarned] = useState('0');
  const [miners, setMiners] = useState<PlayerMiner[]>([]);
  const [isPurchasingMiner, setIsPurchasingMiner] = useState(false);
  const [forceRender, setForceRender] = useState(false);

  // Track the current connected wallet to clear state on wallet changes
  const [lastConnectedAddress, setLastConnectedAddress] = useState<string | undefined>(undefined);

  // Clear state when wallet changes
  useEffect(() => {
    if (address && lastConnectedAddress && address !== lastConnectedAddress) {
      console.log('Wallet changed, clearing state...');
      // Reset all user-specific state
      setHasFacility(false);
      setMiners([]);
      // Store new address
      setLastConnectedAddress(address);
      
      // Clear any localStorage data from previous wallet
      if (typeof window !== 'undefined') {
        try {
          // Clear any miner data for the previous wallet
          const allKeys = Object.keys(localStorage);
          const minerKeys = allKeys.filter(key => 
            key.startsWith('miner_') || 
            key.includes('_position') || 
            key.includes('_purchased')
          );
          
          for (const key of minerKeys) {
            localStorage.removeItem(key);
          }
          console.log('Cleared miner data from localStorage for wallet change');
        } catch (err) {
          console.error('Error clearing localStorage during wallet change:', err);
        }
      }
    } else if (address && !lastConnectedAddress) {
      // First connection
      setLastConnectedAddress(address);
    }
  }, [address, lastConnectedAddress]);

  // Define the facility data state
  const [facilityData, setFacilityData] = useState<PlayerFacility | null>(null);
  
  // Contract reads
  const { data: gameActiveState } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'miningHasStarted',
    query: {
      enabled: true,
    },
  });

  // Get native APE balance
  const { data: apeBalanceData } = useBalance({
    address: address as `0x${string}`,
    chainId: APECHAIN_ID,
    query: {
      enabled: !!address,
    },
  });

  // Get BIT token balance
  const { data: bitBalanceData } = useContractRead({
    address: BIT_TOKEN_ADDRESS,
    abi: BIT_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address || zeroAddress],
    query: {
      enabled: !!address,
    },
  });

  // Direct contract read for facilityData using ownerToFacility
  const { data: rawFacilityData, isLoading: isFacilityLoading, refetch: refetchFacility } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'ownerToFacility',
    args: [address || zeroAddress],
    query: {
      enabled: Boolean(address),
      refetchInterval: 10000, // Refetch every 10 seconds
    }
  });

  // Get referral info
  const { data: referralData } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'getUserReferralInfo',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    },
  });

  // Process facility data from contract - THIS IS NOW THE SINGLE SOURCE OF TRUTH FOR FACILITY OWNERSHIP
  useEffect(() => {
    if (rawFacilityData) {
      try {
        console.log('🔍 GameState - Raw facility data received:', rawFacilityData);
        
        if (Array.isArray(rawFacilityData) && rawFacilityData.length >= 7) {
          // Log each field with its name for debugging
          console.log('ownerToFacility fields:');
          console.log('facilityIndex:', Number(rawFacilityData[0]));
          console.log('maxMiners:', Number(rawFacilityData[1]));
          console.log('currMiners:', Number(rawFacilityData[2]));
          console.log('totalPowerOutput:', Number(rawFacilityData[3]));
          console.log('currPowerOutput:', Number(rawFacilityData[4]));
          console.log('x:', Number(rawFacilityData[5]));
          console.log('y:', Number(rawFacilityData[6]));
          
          // [facilityIndex, maxMiners, currMiners, totalPowerOutput, currPowerOutput, x, y]
          const facilityProcessed = {
            facilityIndex: Number(rawFacilityData[0]),
            maxMiners: Number(rawFacilityData[1]),
            currMiners: Number(rawFacilityData[2]),
            totalPowerOutput: Number(rawFacilityData[3]),
            currPowerOutput: Number(rawFacilityData[4]),
            x: Number(rawFacilityData[5]),
            y: Number(rawFacilityData[6])
          };
          
          console.log('📊 GameState - Processed facility data:', facilityProcessed);
          
          // Update facility data in state
          setFacilityData({
            facilityIndex: BigInt(facilityProcessed.facilityIndex),
            maxMiners: BigInt(facilityProcessed.maxMiners),
            currMiners: BigInt(facilityProcessed.currMiners),
            totalPowerOutput: BigInt(facilityProcessed.totalPowerOutput),
            currPowerOutput: BigInt(facilityProcessed.currPowerOutput),
            x: BigInt(facilityProcessed.x),
            y: BigInt(facilityProcessed.y)
          });
          
          // If we have a facility, mark as true (facilityIndex > 0)
          const userHasFacility = facilityProcessed.facilityIndex > 0;
          setHasFacility(userHasFacility);
          
          if (userHasFacility) {
            console.log('✅ User has a facility with index:', facilityProcessed.facilityIndex);
          } else {
            console.log('❌ User does not have a facility (facilityIndex is 0)');
          }
        } else {
          console.warn('⚠️ GameState - Facility data format unexpected:', rawFacilityData);
          setHasFacility(false);
        }
      } catch (error) {
        console.error('🛑 GameState - Error processing facility data:', error);
        setHasFacility(false);
      }
    } else {
      console.warn('⚠️ GameState - No facility data received from ownerToFacility call');
      setHasFacility(false);
    }
  }, [rawFacilityData, address]);

  // Get player stats
  const { data: playerStats, refetch: refetchStats } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'getPlayerStats',
    args: [address || zeroAddress],
    query: {
      enabled: Boolean(address)
    }
  });

  // Check if user has already claimed starter miner
  const { data: hasClaimedStarterMiner, refetch: refetchStarterMiner } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'acquiredStarterMiner' as any,
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    },
  });

  // Log the exact value coming from the contract for debugging
  useEffect(() => {
    console.log('Raw starter miner claimed status from contract:', hasClaimedStarterMiner);
    console.log('Data type of hasClaimedStarterMiner:', typeof hasClaimedStarterMiner);
    console.log('After Boolean conversion:', Boolean(hasClaimedStarterMiner));
  }, [hasClaimedStarterMiner]);

  // Get user miners - update to use correct contract calls pattern
  const { data: playerMiners, refetch: refetchMinerIds } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'getPlayerMinersPaginated',
    args: [address || zeroAddress, BigInt(0), BigInt(100)], // Get up to 100 miners starting at index 0
    query: {
      enabled: !!address && hasFacility,
    },
  });

  // Get miner types directly from contract
  const { data: miner1Data } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'miners',
    args: [BigInt(1)], // Get BANANA_MINER data (type 1)
    query: {
      enabled: !!address,
    }
  });

  const { data: miner2Data } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'miners',
    args: [BigInt(2)], // Get MONKEY_TOASTER data (type 2)
    query: {
      enabled: !!address,
    }
  });

  const { data: miner3Data } = useContractRead({
    address: CONTRACT_ADDRESSES.MAIN,
    abi: MAIN_CONTRACT_ABI,
    functionName: 'miners',
    args: [BigInt(3)], // Get GORILLA_GADGET data (type 3)
    query: {
      enabled: !!address,
    }
  });

  // Store contract miner type data
  const [minerTypesFromContract, setMinerTypesFromContract] = useState<Record<number, any>>({});

  // Process miner type data from direct contract reads
  useEffect(() => {
    const minerTypes: Record<number, any> = {};
    
    // Process miner type 1 (BANANA_MINER)
    if (miner1Data) {
      minerTypes[1] = {
        minerIndex: Number(miner1Data[0] || 0),
        hashrate: Number(miner1Data[4] || 0),
        powerConsumption: Number(miner1Data[5] || 0),
        cost: Number(miner1Data[6] || 0),
        inProduction: Boolean(miner1Data[7] || false),
      };
      console.log('Loaded BANANA_MINER data from contract:', minerTypes[1]);
    }
    
    // Process miner type 2 (MONKEY_TOASTER)
    if (miner2Data) {
      minerTypes[2] = {
        minerIndex: Number(miner2Data[0] || 0),
        hashrate: Number(miner2Data[4] || 0),
        powerConsumption: Number(miner2Data[5] || 0),
        cost: Number(miner2Data[6] || 0),
        inProduction: Boolean(miner2Data[7] || false),
      };
      console.log('Loaded MONKEY_TOASTER data from contract:', minerTypes[2]);
    }
    
    // Process miner type 3 (GORILLA_GADGET)
    if (miner3Data) {
      minerTypes[3] = {
        minerIndex: Number(miner3Data[0] || 0),
        hashrate: Number(miner3Data[4] || 0),
        powerConsumption: Number(miner3Data[5] || 0),
        cost: Number(miner3Data[6] || 0),
        inProduction: Boolean(miner3Data[7] || false),
      };
      console.log('Loaded GORILLA_GADGET data from contract:', minerTypes[3]);
    }
    
    setMinerTypesFromContract(minerTypes);
  }, [miner1Data, miner2Data, miner3Data]);

  // Process miner data from contract
  useEffect(() => {
    const fetchMinersData = async () => {
      if (!address || !playerMiners || !Array.isArray(playerMiners) || playerMiners.length === 0) {
        console.log('No miners to fetch or user not connected');
        setMiners([]);
        return;
      }
      
      console.log('Found player miners:', playerMiners.length);
      
      try {
        // Since getPlayerMinersPaginated already returns full miner data, we can parse it directly
        const minersList: PlayerMiner[] = playerMiners.map((miner: any, index: number) => {
          // Important: Make sure we're interpreting the minerIndex field correctly
          // Based on user info, minerType 1 = Banana Miner, minerType 2 = Monkey Toaster
          const minerType = Number(miner.minerIndex || 1);
          // Enhance with contract data if available
          const contractData = minerTypesFromContract[minerType];
          
          console.log(`Processing miner ${index}:`, miner);
          console.log(`Miner type from contract: ${minerType}`);
          
          // Get associated data from our config
          const minerConfig = MINERS[minerType];
          const minerImage = minerConfig?.image || '/banana-miner.gif';
          const minerName = minerConfig?.name || (minerType === 1 ? 'BANANA MINER' : 
                           (minerType === 2 ? 'MONKEY TOASTER' : 
                           (minerType === 3 ? 'GORILLA GADGET' : 'UNKNOWN')));
          
          console.log(`Miner name from config: ${minerName}`);
          
          return {
            id: Number(miner.id || index),
            minerType: minerType,
            x: Number(miner.x || 0),
            y: Number(miner.y || 0),
            hashrate: Number(contractData?.hashrate || (minerConfig?.hashrate || 0)),
            powerConsumption: Number(contractData?.powerConsumption || (minerConfig?.energyConsumption || 0)),
            cost: Number(contractData?.cost || (minerConfig?.price || 0)),
            inProduction: Boolean(miner.inProduction),
            // Add miner image based on type
            image: minerImage,
            name: minerName
          };
        });
        
        console.log('Processed miners:', minersList);
        setMiners(minersList);
      } catch (error) {
        console.error('Error processing miner data:', error);
        setMiners([]);
      }
    };
    
    // Call the fetch function
    fetchMinersData();
  }, [address, playerMiners, hasFacility, minerTypesFromContract]);

  // Add debug function to print miner information
  useEffect(() => {
    if (miners.length > 0) {
      console.log('========= MINER INFORMATION (DEBUG) =========');
      console.log(`Total miners: ${miners.length}`);
      
      miners.forEach((miner, index) => {
        console.log(`Miner #${index + 1}:`);
        console.log(`- ID: ${miner.id}`);
        console.log(`- Type: ${miner.minerType} (${miner.name || 'Unknown'})`);
        console.log(`- Position: (${miner.x}, ${miner.y})`);
        console.log(`- Hashrate: ${miner.hashrate} GH/s`);
        console.log(`- Power: ${miner.powerConsumption} GW`);
        console.log(`- In Production: ${miner.inProduction ? 'Yes' : 'No'}`);
        console.log(`- Image: ${miner.image}`);
      });
      
      console.log('============================================');
    }
  }, [miners]);

  // Update state when data changes
  useEffect(() => {
    if (apeBalanceData) {
      setApeBalance(apeBalanceData.formatted);
    }
  }, [apeBalanceData]);

  useEffect(() => {
    if (bitBalanceData) {
      setBitBalance(formatEther(bitBalanceData as bigint));
    }
  }, [bitBalanceData]);
  
  // Contract write functions
  const { writeContract } = useWriteContract();

  // Monitor wallet connection status changes
  useEffect(() => {
    // When wallet connection state changes
    if (isConnected) {
      console.log('Wallet connected:', address);
    } else {
      console.log('Wallet disconnected');
      // Clear any pending transaction states
      setIsPurchasingFacility(false);
      setIsGettingStarterMiner(false);
      setIsPurchasingMiner(false);
      setIsClaimingReward(false);
      setIsUpgrading(false);
    }
  }, [isConnected, address]);

  const handlePurchaseFacility = async () => {
    if (!address) {
      console.error('Cannot purchase facility: wallet not connected');
      alert('Please connect your wallet to purchase a facility');
      return;
    }

    try {
      console.log('Starting facility purchase transaction...');
      setIsPurchasingFacility(true);
      
      // Validate APE balance first
      const requiredBalance = parseEther('0.005');
      const currentBalance = apeBalanceData?.value || BigInt(0);
      
      if (currentBalance < requiredBalance) {
        console.error(`Insufficient APE balance: have ${formatEther(currentBalance)}, need 0.005`);
        alert('You need at least 0.005 APE to purchase a facility');
        setIsPurchasingFacility(false);
        return;
      }
      
      // Verify we're on ApeChain
      if (publicClient?.chain?.id !== APECHAIN_ID) {
        console.error(`Wrong network: connected to ${publicClient?.chain?.name} but need ApeChain`);
        alert('Please switch to ApeChain network to purchase a facility');
        setIsPurchasingFacility(false);
        return;
      }

      // Add timeout to reset state if transaction takes too long
      const resetTimeout = setTimeout(() => {
        if (isPurchasingFacility) {
          console.warn('Facility purchase timeout - resetting state');
          setIsPurchasingFacility(false);
        }
      }, 60000); // 1 minute timeout

      try {
        // Execute transaction with retry logic
        await retryContractCall(async () => {
          const config = {
            address: CONTRACT_ADDRESSES.MAIN as `0x${string}`,
            abi: MAIN_CONTRACT_ABI,
            functionName: 'purchaseInitialFacility',
            args: [zeroAddress as `0x${string}`],
            value: requiredBalance,
          };
          
          return writeContract({
            ...config,
            chain: publicClient?.chain,
            account: address
          } as any);
        });
      } catch (txError) {
        clearTimeout(resetTimeout);
        console.error('Transaction error:', txError);
        
        // Provide helpful message based on error type
        if (txError.message?.includes('MetaMask') && txError.message?.includes('restart')) {
          alert('MetaMask requires a restart. Please refresh your browser and try again.');
        } else if (txError.message?.includes('underpriced')) {
          alert('Transaction underpriced. Please try again with higher gas settings.');
        } else {
          alert('Failed to send transaction. Please try again.');
        }
        
        setIsPurchasingFacility(false);
      }
    } catch (error) {
      console.error('Unexpected error in facility purchase:', error);
      alert('An unexpected error occurred. Please try again later.');
      setIsPurchasingFacility(false);
    }
  };
  
  const handleClaimRewards = async () => {
    try {
      setIsClaimingReward(true);
      await writeContract({
        address: CONTRACT_ADDRESSES.MAIN,
        abi: MAIN_CONTRACT_ABI,
        functionName: 'claimRewards',
      });
      await refetchStats();
    } catch (error) {
      console.error('Error claiming rewards:', error);
    } finally {
      setIsClaimingReward(false);
    }
  };
  
  const handleUpgradeFacility = async () => {
    try {
      setIsUpgrading(true);
      await writeContract({
        address: CONTRACT_ADDRESSES.MAIN,
        abi: MAIN_CONTRACT_ABI,
        functionName: 'upgradeFacility',
      });
      await refetchStats();
    } catch (error) {
      console.error('Error upgrading facility:', error);
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleGetStarterMiner = async (x: number, y: number) => {
    if (!address) {
      console.error('No wallet connected');
      alert('Please connect your wallet to claim your starter miner');
      return;
    }

    try {
      setIsGettingStarterMiner(true);
      
      // Submit transaction but don't show success yet
      writeContract({
        address: CONTRACT_ADDRESSES.MAIN,
        abi: MAIN_CONTRACT_ABI,
        functionName: 'getFreeStarterMiner',
        args: [BigInt(x), BigInt(y)],
      }, {
        onSuccess: async (txHash) => {
          console.log('Starter miner transaction submitted:', txHash);
          
          // Wait for confirmation before showing success
          if (publicClient) {
            try {
              // Set up a manual timeout
              let receiptReceived = false;
              let receipt;
              
              // Start a timeout that will check if we've received the receipt
              const timeoutId = setTimeout(() => {
                if (!receiptReceived) {
                  console.log('Transaction receipt wait timed out after 60 seconds');
                  
                  // Still update the state since the transaction might still succeed
                  refetchStarterMiner();
                  refetchMinerIds();
                  
                  // Alert the user about the timeout but don't treat it as an error
                  alert('Your transaction was submitted but is taking longer than expected to confirm. The game UI will update if your claim was successful.');
                  
                  setIsGettingStarterMiner(false);
                }
              }, 60000);
              
              try {
                receipt = await publicClient.waitForTransactionReceipt({
                  hash: txHash
                });
                receiptReceived = true;
                clearTimeout(timeoutId);
                
                console.log('Starter miner transaction confirmed:', receipt);
                
                // Only now show success message
                alert('Starter miner claimed successfully!');
                
                // Update data after success
                await refetchStarterMiner();
                await refetchMinerIds();
                
                // Force a refresh to ensure UI is updated
                setTimeout(() => {
                  refetchAll();
                }, 2000);
              } catch (waitError) {
                console.error('Error waiting for transaction receipt:', waitError);
                if (!receiptReceived) {
                  clearTimeout(timeoutId);
                  throw waitError;
                }
              }
            } catch (error) {
              console.error('Error waiting for starter miner confirmation:', error);
              
              // Still update the state
              await refetchStarterMiner();
              await refetchMinerIds();
              
              // Alert the user
              alert('Error confirming your transaction. Please check your wallet for the status.');
            } finally {
              setIsGettingStarterMiner(false);
            }
          } else {
            // No public client available, wait a bit and update state
            setTimeout(async () => {
              await refetchStarterMiner();
              await refetchMinerIds();
              setIsGettingStarterMiner(false);
            }, 5000);
          }
        },
        onError: (error) => {
          console.error('Error claiming starter miner:', error);
          
          // Show user-friendly error
          if (error.message?.includes('user rejected')) {
            alert('Transaction cancelled by user');
          } else if (error.message?.includes('insufficient funds')) {
            alert('Insufficient funds for gas. Please make sure you have enough APE for transaction fees.');
          } else if (error.message?.includes('already claimed')) { 
            alert('You have already claimed your free starter miner');
            // Force refresh to update UI
            refetchStarterMiner();
            refetchMinerIds();
          } else {
            alert(`Failed to claim starter miner: ${error.message || 'Unknown error'}`);
          }
          
          setIsGettingStarterMiner(false);
        }
      });
    } catch (error) {
      console.error('Error preparing starter miner transaction:', error);
      alert('Failed to prepare starter miner transaction. Please try again.');
      setIsGettingStarterMiner(false);
    }
  };

  // Update referral info
  useEffect(() => {
    if (referralData) {
      const [totalRefs, totalEarned] = referralData as [bigint, bigint];
      setTotalReferrals(Number(totalRefs));
      setTotalBitEarned(formatEther(totalEarned));
    }
  }, [referralData]);

  // Make refetchMiners include the new IDs fetch + individual miners fetch
  const refetchMiners = async () => {
    console.log('Refetching all miner data...');
    await refetchMinerIds();
  };

  // Add purchase miner function
  const handlePurchaseMiner = async (minerType: MinerType, x: number, y: number) => {
    if (!address) {
      console.error('Cannot purchase miner: wallet not connected');
      alert('Please connect your wallet to purchase a miner');
      return;
    }
    
    try {
      console.log(`=== MINER PURCHASE FLOW STARTED ===`);
      console.log(`Attempting to purchase miner type ${minerType} at position (${x}, ${y})`);
      console.log(`Using BIT token address: ${BIT_TOKEN_ADDRESS}`);
      console.log(`Using MAIN contract address: ${CONTRACT_ADDRESSES.MAIN}`);
      
      setIsPurchasingMiner(true);
      
      // Validate contract addresses first to prevent undefined errors
      if (!BIT_TOKEN_ADDRESS) {
        throw new Error('BIT token address is not defined');
      }
      
      if (!CONTRACT_ADDRESSES.MAIN) {
        throw new Error('Main contract address is not defined');
      }
      
      // Verify we're on ApeChain
      if (publicClient?.chain?.id !== APECHAIN_ID) {
        console.error(`Wrong network: connected to ${publicClient?.chain?.name} but need ApeChain`);
        alert('Please switch to ApeChain network to purchase a miner');
        setIsPurchasingMiner(false);
        return;
      }
      
      // Validate that user has a facility
      if (!hasFacility) {
        console.error('You must purchase a facility before buying miners');
        alert('You need to purchase a facility before buying miners. Please buy a facility first.');
        setIsPurchasingMiner(false);
        return;
      }
      
      // For the free starter miner
      if (minerType === MinerType.BANANA_MINER && !hasClaimedStarterMiner) {
        console.log(`Processing free starter miner claim...`);
        await handleGetStarterMiner(x, y);
        return;
      }
      
      // For paid miners
      const minerConfig = MINERS[minerType];
      console.log(`Miner config for type ${minerType}:`, minerConfig);
      
      // Log miner type information
      if (minerType === MinerType.BANANA_MINER) {
        console.log('Purchasing a BANANA MINER (Type 1)');
      } else if (minerType === MinerType.MONKEY_TOASTER) {
        console.log('Purchasing a MONKEY TOASTER (Type 2)');
      } else if (minerType === MinerType.GORILLA_GADGET) {
        console.log('Purchasing a GORILLA GADGET (Type 3)');
      }
      
      const minerPrice = minerConfig.price.toString();
      const formattedPrice = parseEther(minerPrice);
      
      console.log(`=== MINER TRANSACTION INFO ===`);
      console.log(`Miner price: ${minerPrice} BIT (${formattedPrice} wei)`);
      
      // Check if user has enough BIT tokens
      const bitBalanceBigInt = bitBalanceData ? (bitBalanceData as bigint) : BigInt(0);
      if (bitBalanceBigInt < formattedPrice) {
        console.error(`Insufficient BIT balance: have ${formatEther(bitBalanceBigInt)}, need ${minerPrice}`);
        alert(`You don't have enough BIT tokens. You need ${minerPrice} BIT to purchase this miner.`);
        setIsPurchasingMiner(false);
        return;
      }
      
      // Check and handle token approval for paid miners
      if (minerPrice !== '0') {
        console.log(`=== CHECKING TOKEN APPROVAL ===`);
        
        // IMPORTANT: Make sure we have publicClient before proceeding
        if (!publicClient) {
          throw new Error('Public client not available, cannot check allowance');
        }
        
        // First check current allowance
        try {
          const allowanceResult = await publicClient.readContract({
            address: BIT_TOKEN_ADDRESS as `0x${string}`,
            abi: BIT_TOKEN_ABI,
            functionName: 'allowance',
            args: [address as `0x${string}`, CONTRACT_ADDRESSES.MAIN as `0x${string}`]
          });
          
          const currentAllowance = allowanceResult as bigint;
          console.log(`Current token allowance: ${formatEther(currentAllowance)} BIT`);
          
          // If allowance is insufficient, request approval first
          if (currentAllowance < formattedPrice) {
            console.log('Insufficient allowance. Requesting approval first...');
            
            // Use a safe approval amount (100 BIT)
            const safeApprovalAmount = parseEther('100');
            
            // Request token approval
            writeContract({
              address: BIT_TOKEN_ADDRESS as `0x${string}`,
              abi: BIT_TOKEN_ABI,
              functionName: 'approve',
              args: [CONTRACT_ADDRESSES.MAIN as `0x${string}`, safeApprovalAmount]
            }, {
              onSuccess: async (txHash) => {
                console.log('Approval transaction submitted:', txHash);
                
                try {
                  // Wait for approval to be confirmed
                  const receipt = await publicClient.waitForTransactionReceipt({
                    hash: txHash
                  });
                  
                  console.log('Approval confirmed:', receipt);
                  
                  // Now proceed with the purchase
                  purchaseMinerAfterApproval(minerType, x, y);
                } catch (error) {
                  console.error('Error waiting for approval confirmation:', error);
                  alert('There was an error confirming your approval transaction. Please try again.');
                  setIsPurchasingMiner(false);
                }
              },
              onError: (error) => {
                console.error('Error approving token spend:', error);
                alert('Failed to approve BIT token spending: ' + error.message);
                setIsPurchasingMiner(false);
              }
            });
          } else {
            // Allowance is sufficient, proceed with purchase
            console.log('Token allowance is sufficient. Proceeding with purchase...');
            purchaseMinerAfterApproval(minerType, x, y);
          }
        } catch (error) {
          console.error('Error checking allowance:', error);
          alert('Failed to check your token allowance. Please try again.');
          setIsPurchasingMiner(false);
        }
      } else {
        // Free miner (should not reach here, as free miners are handled above)
        console.log('Free miner detected, proceeding with purchase...');
        purchaseMinerAfterApproval(minerType, x, y);
      }
    } catch (error: any) {
      console.error('Error during miner purchase flow:', error);
      alert(`Error purchasing miner: ${error.message || 'Unknown error'}`);
      setIsPurchasingMiner(false);
    }
  };
  
  // Helper function to handle the actual miner purchase after approval
  const purchaseMinerAfterApproval = (minerType: MinerType, x: number, y: number) => {
    console.log(`Executing miner purchase for type ${minerType} at (${x}, ${y})`);
    
    // Add retry logic for the miner purchase
    retryContractCall(async () => {
      const config = {
        address: CONTRACT_ADDRESSES.MAIN as `0x${string}`,
        abi: MAIN_CONTRACT_ABI,
        functionName: 'buyMiner',
        args: [BigInt(minerType), BigInt(x), BigInt(y)]
      };
      
      return writeContract({
        ...config,
        chain: publicClient?.chain,
        account: address
      } as any);
    }).catch(error => {
      console.error('Final miner purchase error:', error);
      setIsPurchasingMiner(false);
      
      // Provide specific error message for MetaMask issues
      if (error.message?.includes('MetaMask')) {
        alert('MetaMask is having trouble. Please refresh the page or restart MetaMask, then try again.');
      } else {
        alert(`Error purchasing miner: ${error.message || 'Unknown error'}`);
      }
    });
  };

  const refetchAll = () => {
    console.log('Refetching all game state data...');
    refetchFacility();
    refetchStats();
    refetchStarterMiner();
    refetchMinerIds();
  };

  // Add a final check before return to ensure hardcoded values are used
  const finalGameState = {
    // User state
    isConnected,
    address,
    
    // Resources - Use real data from contract
    apeBalance,
    bitBalance,
    spacesLeft: facilityData ? 
      Number(facilityData.maxMiners) - Number(facilityData.currMiners) : 0,
    gigawattsAvailable: facilityData ? 
      Number(facilityData.totalPowerOutput) - Number(facilityData.currPowerOutput) : 0,
    
    // Mining stats
    miningRate,
    hashRate,
    blocksUntilHalving,
    networkHashRatePercentage,
    totalNetworkHashRate,
    
    // Network stats
    totalMinedBit: playerStats ? playerStats[0].toString() : '0',
    burnedBit: '1,238,626.5',
    rewardPerBlock: '2.5',
    
    // Mining rewards
    minedBit,
    
    // Facility state - Use actual contract data
    hasFacility, // Use the real value from contract
    facilityData: facilityData ? {
      power: Number(facilityData.totalPowerOutput),
      level: Number(facilityData.facilityIndex),
      miners: Number(facilityData.currMiners),
      capacity: Number(facilityData.maxMiners),
      used: Number(facilityData.currPowerOutput),
      resources: 0,
      spaces: Number(facilityData.maxMiners) - Number(facilityData.currMiners)
    } : null,
    stats: playerStats ? {
      totalMined: playerStats[0],
      hashRate: playerStats[1],
      miningRate: playerStats[2],
      networkShare: playerStats[3],
    } : {
      totalMined: BigInt(0),
      hashRate: BigInt(0),
      miningRate: BigInt(0),
      networkShare: BigInt(0),
    },
    
    // Actions
    purchaseFacility: handlePurchaseFacility,
    getStarterMiner: handleGetStarterMiner,
    purchaseMiner: handlePurchaseMiner,
    claimReward: handleClaimRewards,
    upgradeFacility: handleUpgradeFacility,
    
    // Loading states
    isPurchasingFacility,
    isGettingStarterMiner,
    isPurchasingMiner,
    isClaimingReward,
    isUpgradingFacility: isUpgrading,

    // Game status
    isGameActive: Boolean(gameActiveState),
    isUserActive: Boolean(gameActiveState),

    totalReferrals,
    totalBitEarned,
    refetch: refetchAll,

    // Referral info
    referralInfo: {
      referralCode: address ? address.slice(2, 8).toUpperCase() : '',
      totalReferrals: Number(totalReferrals),
      rewardsEarned: totalBitEarned,
    },

    // Facility price
    initialFacilityPrice: '5',

    // Miner status
    hasClaimedStarterMiner: Boolean(hasClaimedStarterMiner),
    
    // Player miners - ONLY return actual miners, no default dummy miners
    miners: miners,

    // Miner types from contract
    minerTypesFromContract
  };

  console.log('🔄 RETURNING GameState with facilityData:', finalGameState.facilityData);
  console.log('🔄 RETURNING GameState with miners count:', miners.length, 'hasClaimedStarterMiner:', Boolean(hasClaimedStarterMiner));
  return finalGameState;
}
