import { useAccount, useContractRead, useBalance, useWriteContract, usePublicClient } from 'wagmi';
import { formatEther, parseEther, zeroAddress, TransactionReceipt } from 'viem';
import { CONTRACT_ADDRESSES, ERC20_ABI, APECHAIN_ID, MAIN_CONTRACT_ABI, BIT_TOKEN_ADDRESS, BIT_TOKEN_ABI } from '../config/contracts';
import { MINERS, MinerType, MinerData } from '../config/miners';
import { useEffect, useState } from 'react';
import { useReferral } from '@/hooks/useReferral';
import { formatUnits } from 'viem';

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
  purchaseFacility: () => Promise<boolean>;
  getStarterMiner: (x: number, y: number) => Promise<boolean>;
  purchaseMiner: (minerType: MinerType, x: number, y: number) => Promise<boolean>;
  claimReward: () => Promise<boolean>;
  upgradeFacility: () => Promise<boolean>;
  removeMiner: (minerId: number) => Promise<boolean>;
  
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

  // Add removeMiner loading state
  isRemovingMiner: boolean;
}

// At the top of the file, after imports
type TransactionHash = `0x${string}` | undefined;

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
  const { writeContractAsync } = useWriteContract();
  const { referralAddress } = useReferral();
  
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
      
      // Remove all localStorage operations
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
  
  // Update balances when address changes
  useEffect(() => {
    const fetchBalances = async () => {
      if (address && publicClient) {
        try {
          // Fetch APE balance
          const apeBalance = await publicClient.getBalance({
            address: address as `0x${string}`
          });
          setApeBalance(formatEther(apeBalance));
          
          // Fetch BIT balance
          if (BIT_TOKEN_ADDRESS) {
            const bitBalance = await publicClient.readContract({
              address: BIT_TOKEN_ADDRESS as `0x${string}`,
              abi: BIT_TOKEN_ABI,
              functionName: 'balanceOf',
              args: [address as `0x${string}`]
            });
            setBitBalance(formatEther(bitBalance as bigint));
          }
        } catch (error) {
          console.error('Error fetching balances:', error);
        }
      }
    };
    
    fetchBalances();
  }, [address, publicClient]);

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

  // Define refetchUserInfo at the top of the hook
  const refetchUserInfo = async () => {
    console.log('Refetching user info...');
    
    // Use the refetch functions that exist in the hook
    if (refetchFacility) refetchFacility();
    if (refetchStats) refetchStats();
    if (refetchStarterMiner) refetchStarterMiner();
    if (refetchMinerIds) refetchMinerIds();
  };

  // Return type fix for purchaseFacility function
  const handlePurchaseFacility = async () => {
    setIsPurchasingFacility(true);
    
    try {
      if (!address) {
        throw new Error('Address not found');
      }
      
      console.log('Purchasing facility with referrer:', referralAddress);
      
      // First simulate transaction to check if it would succeed
      try {
        await publicClient?.simulateContract({
          address: CONTRACT_ADDRESSES.MAIN as `0x${string}`,
          abi: MAIN_CONTRACT_ABI,
          functionName: 'purchaseInitialFacility',
          account: address,
          args: [referralAddress as `0x${string}`],
          value: parseEther('10')
        });
        console.log('Simulation successful, proceeding with transaction');
      } catch (simError: any) {
        console.error('Simulation failed:', simError);
        // If simulation fails with a non-user rejection, show error and exit
        if (!simError.message?.includes('User rejected') && 
            !simError.message?.includes('user rejected') && 
            !simError.code === 4001) {
          alert(`Cannot purchase facility: ${simError.message}`);
          return false;
        }
        throw simError; // Rethrow to be caught by outer try-catch
      }
      
      // Send the transaction - this will open the wallet for user confirmation
      const hash = await writeContract({
        address: CONTRACT_ADDRESSES.MAIN as `0x${string}`,
        abi: MAIN_CONTRACT_ABI,
        functionName: 'purchaseInitialFacility',
        args: [referralAddress as `0x${string}`],
        account: address as `0x${string}`,
        value: parseEther('10'),
        chain: publicClient?.chain
      });
      
      console.log('Purchase transaction hash:', hash);
      
      // Once we have a hash, user has confirmed the transaction
      if (hash) {
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        console.log('Purchase confirmed:', receipt);
        
        // Update game state after successful purchase
        setTimeout(async () => {
          try {
            console.log("Refreshing game state after facility purchase");
            await refetchUserInfo();
            alert('Facility purchased successfully!');
          } catch (refreshError) {
            console.error("Error refreshing game state:", refreshError);
          }
        }, 2000);
        
        return true;
      }
      
      return false;
      
    } catch (error: any) {
      console.error('Error purchasing facility:', error);
      
      // Check for user rejection patterns
      const isUserRejection = 
        error.code === 4001 || 
        error.message?.includes('User rejected') || 
        error.message?.includes('user rejected') || 
        error.message?.includes('rejected') || 
        error.message?.includes('denied') || 
        error.message?.includes('cancelled') || 
        error.message?.includes('canceled');
      
      if (isUserRejection) {
        console.log('User canceled the transaction');
        alert('You canceled the facility purchase.');
      } else {
        // Only show error for non-rejection cases
        alert(`Error purchasing facility: ${error.message}`);
      }
      
      return false;
    } finally {
      setIsPurchasingFacility(false);
    }
  };

  // Fix handleClaimRewards
  const handleClaimRewards = async () => {
    setIsClaimingReward(true);
    try {
      if (!address) {
        throw new Error('Address not found');
      }
      
      console.log('Claiming rewards from', CONTRACT_ADDRESSES.MAIN);
      const hash = await writeContract({
        address: CONTRACT_ADDRESSES.MAIN as `0x${string}`,
        abi: MAIN_CONTRACT_ABI,
        functionName: 'claimRewards',
        account: address as `0x${string}`,
        chain: publicClient?.chain
      });
      
      console.log('Claim transaction hash:', hash);
      
      try {
        const receipt = await publicClient.waitForTransactionReceipt({
          hash,
        });
        console.log('Claim confirmed:', receipt);
        
        // Update game state after successful claim
        setTimeout(async () => {
          try {
            console.log("Refreshing game state after claiming rewards");
            await refetchUserInfo();
          } catch (refreshError) {
            console.error("Error refreshing game state:", refreshError);
          }
        }, 2000);
        
        return true;
      } catch (error) {
        console.error('Error waiting for claim confirmation:', error);
        throw new Error('Claim transaction failed');
      }
    } catch (error) {
      console.error('Error claiming rewards:', error);
      
      // Check if user rejected the transaction
      if (error.message?.includes('User rejected') || error.message?.includes('user rejected') || error.code === 4001) {
        console.log('User rejected claim transaction');
        return false;
      }
      
      throw error;
    } finally {
      setIsClaimingReward(false);
    }
  };

  // Fix handleUpgradeFacility with proper typescript return types
  const handleUpgradeFacility = async () => {
    setIsUpgrading(true);
    
    try {
      if (!address) {
        throw new Error('Address not found');
      }
      
      console.log('Upgrading facility...');
      let hash: `0x${string}` | undefined;
      
      try {
        hash = await writeContract({
          address: CONTRACT_ADDRESSES.MAIN as `0x${string}`,
          abi: MAIN_CONTRACT_ABI,
          functionName: 'upgradeFacility',
          args: [], // No arguments needed for upgradeFacility
          account: address as `0x${string}`,
          chain: publicClient?.chain
        });
        
        console.log('Upgrade transaction hash:', hash);
      } catch (writeError) {
        console.error('Error sending upgrade transaction:', writeError);
        throw writeError;
      }
      
      if (!hash) {
        throw new Error('Failed to get transaction hash');
      }
      
      try {
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: hash,
        });
        console.log('Upgrade confirmed:', receipt);
        
        // Update game state after successful upgrade
        setTimeout(async () => {
          try {
            console.log("Refreshing game state after facility upgrade");
            await refetchUserInfo();
            alert('Facility upgraded successfully!');
          } catch (refreshError) {
            console.error("Error refreshing game state:", refreshError);
          }
        }, 2000);
        
        return true;
      } catch (error) {
        console.error('Error waiting for upgrade confirmation:', error);
        throw new Error('Upgrade transaction failed');
      }
    } catch (error) {
      console.error('Error upgrading facility:', error);
      
      // Check if user rejected the transaction
      if (error.message?.includes('User rejected') || error.message?.includes('user rejected') || error.code === 4001) {
        console.log('User rejected upgrade transaction');
        alert('You canceled the facility upgrade.');
        return false;
      }
      
      alert(`Error upgrading facility: ${error.message}`);
      return false;
    } finally {
      setIsUpgrading(false);
    }
  };

  // Fix handleGetStarterMiner with proper typescript return types
  const handleGetStarterMiner = async () => {
    setIsGettingStarterMiner(true);
    
    try {
      console.log('Getting starter miner...');
      if (!address) {
        throw new Error('Address not found');
      }
      
      let hash: `0x${string}` | undefined;
      
      try {
        hash = await writeContract({
          address: CONTRACT_ADDRESSES.MAIN as `0x${string}`,
          abi: MAIN_CONTRACT_ABI,
          functionName: 'getFreeStarterMiner',
          args: [], // No arguments needed for getFreeStarterMiner
          account: address as `0x${string}`,
          chain: publicClient?.chain
        });
        
        console.log('Starter miner transaction hash:', hash);
      } catch (writeError) {
        console.error('Error sending starter miner transaction:', writeError);
        throw writeError;
      }
      
      if (!hash) {
        throw new Error('Failed to get transaction hash');
      }
      
      try {
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: hash,
        });
        console.log('Starter miner confirmed:', receipt);
        
        // Update game state after getting starter miner
        setTimeout(async () => {
          try {
            console.log("Refreshing game state after getting starter miner");
            await refetchUserInfo();
            alert('Starter miner claimed successfully!');
          } catch (refreshError) {
            console.error("Error refreshing game state:", refreshError);
          }
        }, 2000);
        
        return true;
      } catch (error) {
        console.error('Error waiting for starter miner confirmation:', error);
        throw new Error('Starter miner transaction failed');
      }
    } catch (error) {
      console.error('Error getting starter miner:', error);
      
      // Check if user rejected the transaction
      if (error.message?.includes('User rejected') || error.message?.includes('user rejected') || error.code === 4001) {
        console.log('User rejected starter miner transaction');
        alert('You canceled the starter miner claim.');
        return false;
      } else if (error.message?.includes('execution reverted')) {
        alert('You already have a starter miner!');
        return false;
      } else {
        alert(`Error getting starter miner: ${error.message}`);
        return false;
      }
    } finally {
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

  // Handle purchasing a miner with BIT token
  const handlePurchaseMiner = async (minerType: number, x: number, y: number) => {
    setIsPurchasingMiner(true);
    
    try {
      console.log("User has BIT balance:", formatEther(bitBalance));
      console.log(`Attempting to purchase miner of type ${minerType} at position (${x}, ${y})`);
      
      // Create a localStorage cache for allowances to avoid unnecessary approval requests
      const allowanceCacheKey = `bit_allowance_${address}`;
      let cachedAllowance = localStorage.getItem(allowanceCacheKey);
      let currentAllowance: bigint;
      
      if (cachedAllowance) {
        console.log("Using cached allowance:", cachedAllowance);
        currentAllowance = BigInt(cachedAllowance);
      } else {
        // Read allowance from contract
        if (!address) {
          throw new Error("Address not found");
        }
        
        try {
          console.log("Reading allowance from contract");
          const allowanceData = await publicClient.readContract({
            address: CONTRACT_ADDRESSES.BIT_TOKEN as `0x${string}`,
            abi: BIT_TOKEN_ABI,
            functionName: 'allowance',
            args: [address, CONTRACT_ADDRESSES.MAIN],
          });
          
          currentAllowance = allowanceData as bigint;
          console.log("Current allowance:", formatEther(currentAllowance));
          
          // Cache the allowance
          localStorage.setItem(allowanceCacheKey, currentAllowance.toString());
        } catch (error) {
          console.error("Error reading allowance:", error);
          throw new Error("Failed to read token allowance");
        }
      }
      
      // Get miner cost from contract
      const minerCostResult = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.MAIN as `0x${string}`,
        abi: MAIN_CONTRACT_ABI,
        functionName: 'miners',
        args: [BigInt(minerType)],
      });
      
      // Extract the cost from the miner data (index 6 is cost)
      const minerCost = Array.isArray(minerCostResult) && minerCostResult.length > 6 
        ? minerCostResult[6] as bigint 
        : BigInt(0);
      
      console.log("Miner cost:", formatEther(minerCost));
      
      // Check if we have enough allowance, if not, request approval
      if (currentAllowance < minerCost) {
        console.log("Allowance insufficient, requesting approval");
        // The max approval amount (uint256 max value)
        const maxApprovalAmount = BigInt("115792089237316195423570985008687907853269984665640564039457584007913129639935");
        
        try {
          // Request approval for spending BIT
          const hash = await publicClient.writeContract({
            address: CONTRACT_ADDRESSES.BIT_TOKEN as `0x${string}`,
            abi: BIT_TOKEN_ABI,
            functionName: 'approve',
            args: [CONTRACT_ADDRESSES.MAIN, maxApprovalAmount],
            account: address as `0x${string}`,
            chain: publicClient?.chain
          });
          
          console.log("Approval transaction submitted:", hash);
          
          // Wait for the approval to be confirmed
          try {
            const receipt = await publicClient.waitForTransactionReceipt({
              hash,
            });
            console.log("Approval confirmed:", receipt);
            
            // Update the cached allowance
            localStorage.setItem(allowanceCacheKey, maxApprovalAmount.toString());
            
            // Proceed with purchase after approval
            return await purchaseMinerAfterApproval(minerType, x, y);
          } catch (error) {
            console.error("Error waiting for approval:", error);
            throw new Error("Approval transaction failed");
          }
        } catch (error) {
          // Check if user rejected the transaction
          if (error.message?.includes('User rejected') || error.message?.includes('user rejected') || error.code === 4001) {
            console.log("User rejected approval transaction");
            alert("You need to approve the transaction to purchase a miner.");
            setIsPurchasingMiner(false);
            return false;
          }
          
          console.error("Error approving token:", error);
          throw new Error("Failed to approve token spending");
        }
      } else {
        console.log("Allowance sufficient, proceeding with purchase");
        return await purchaseMinerAfterApproval(minerType, x, y);
      }
    } catch (error) {
      console.error("Error in purchase miner flow:", error);
      
      // Check if user rejected the transaction
      if (error.message?.includes('User rejected') || error.message?.includes('user rejected') || error.code === 4001) {
        console.log("User rejected transaction");
        alert("Purchase canceled.");
      } else {
        alert(`Error purchasing miner: ${error.message}`);
      }
      
      return false;
    } finally {
      setIsPurchasingMiner(false);
    }
  };

  const purchaseMinerAfterApproval = async (minerType: number, x: number, y: number) => {
    try {
      console.log(`Executing miner purchase of type ${minerType} at (${x}, ${y})`);
      
      if (!address) {
        throw new Error("Address not found");
      }
      
      // Submit the transaction to purchase the miner
      const hash = await publicClient.writeContract({
        address: CONTRACT_ADDRESSES.MAIN as `0x${string}`,
        abi: MAIN_CONTRACT_ABI,
        functionName: 'buyMiner',
        args: [BigInt(minerType), BigInt(x), BigInt(y)],
        account: address as `0x${string}`,
        chain: publicClient?.chain
      });
      
      console.log("Purchase transaction submitted:", hash);
      
      // Wait for the transaction to be confirmed
      try {
        const receipt = await publicClient.waitForTransactionReceipt({
          hash,
        });
        console.log("Purchase confirmed:", receipt);
        
        // Update game state after successful purchase
        setTimeout(async () => {
          try {
            console.log("Refreshing game state after miner purchase");
            await refetchUserInfo();
            alert("Miner purchased successfully!");
          } catch (refreshError) {
            console.error("Error refreshing game state:", refreshError);
          }
        }, 2000);
        
        return true;
      } catch (error) {
        console.error("Error waiting for purchase confirmation:", error);
        throw new Error("Purchase transaction failed");
      }
    } catch (error) {
      // Check if user rejected the transaction
      if (error.message?.includes('User rejected') || error.message?.includes('user rejected') || error.code === 4001) {
        console.log("User rejected purchase transaction");
        return false;
      }
      
      console.error("Error purchasing miner:", error);
      throw error;
    }
  };

  const refetchAll = () => {
    console.log('Refetching all game state data...');
    refetchFacility();
    refetchStats();
    refetchStarterMiner();
    refetchMinerIds();
  };

  // Add removeMiner loading state
  const [isRemovingMiner, setIsRemovingMiner] = useState(false);
  
  // Add this function before the return statement
  const handleRemoveMiner = async (minerId: number): Promise<boolean> => {
    console.log(`Removing miner with ID: ${minerId}`);
    
    if (!address || !isConnected || !publicClient) {
      console.error('Cannot remove miner: wallet not connected');
      return false;
    }
    
    try {
      setIsRemovingMiner(true);
      
      // Call the sellMiner contract function
      const { request } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESSES.MAIN as Address,
        abi: MAIN_CONTRACT_ABI,
        functionName: 'sellMiner',
        args: [BigInt(minerId)],
        account: address
      });
      
      const hash = await writeContractAsync(request);
      console.log('Remove miner transaction submitted:', hash);
      
      // Wait for the transaction to be mined
      if (hash) {
        const receipt = await publicClient.waitForTransactionReceipt({ 
          hash: hash 
        });
        
        console.log('Remove miner transaction receipt:', receipt);
        
        // Refetch miners data
        await refetchMiners();
        
        // Force a refresh of the UI
        setForceRender(prev => !prev);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error removing miner:', error);
      return false;
    } finally {
      setIsRemovingMiner(false);
    }
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
    removeMiner: handleRemoveMiner,
    
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
    minerTypesFromContract,

    // Remove miner loading state
    isRemovingMiner
  };

  console.log('🔄 RETURNING GameState with facilityData:', finalGameState.facilityData);
  console.log('🔄 RETURNING GameState with miners count:', miners.length, 'hasClaimedStarterMiner:', Boolean(hasClaimedStarterMiner));
  return finalGameState;
}
