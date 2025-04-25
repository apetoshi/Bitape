// ApeChain Network Configuration
export const APECHAIN_ID = 33139;

// Contract Addresses on ApeChain
export const CONTRACT_ADDRESSES = {
  BIT_TOKEN: '0xb9be704a40b1500d39fe4264a1c46e43a5c614bd', // BIT token address
  MINING_CONTROLLER: '0x409Ec46CdA55E8C7A2Ec971745985bf7Dd58f533', // Mining controller address (old)
  MAIN: '0x409Ec46CdA55E8C7A2Ec971745985bf7Dd58f533' // Main contract address from user's task
} as const;

// Minimal ABIs for token interactions
export const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
  },
] as const;

// BIT Token ABI - Updated from Bitape_ABI.json
export const BIT_TOKEN_ABI = [
  // Essential read functions
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Allowance function
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Essential write functions
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'value', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'value', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'from', type: 'address' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'value', type: 'uint256' }
    ],
    name: 'transferFrom',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

// Main Contract ABI - Key functions from Main_ABI.json
export const MAIN_CONTRACT_ABI = [
  // Essential user functions
  {
    inputs: [{ internalType: 'address', name: 'referrer', type: 'address' }],
    name: 'purchaseInitialFacility',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'initializedStarterFacility',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'acquiredStarterMiner',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Game state functions
  {
    inputs: [],
    name: 'miningHasStarted',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Stats functions
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getPlayerStats',
    outputs: [
      { internalType: 'uint256', name: 'totalMined', type: 'uint256' },
      { internalType: 'uint256', name: 'hashRate', type: 'uint256' },
      { internalType: 'uint256', name: 'miningRate', type: 'uint256' },
      { internalType: 'uint256', name: 'networkShare', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getUserReferralInfo',
    outputs: [
      { internalType: 'uint256', name: 'totalReferrals', type: 'uint256' },
      { internalType: 'uint256', name: 'totalEarned', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // Facility-related functions
  {
    inputs: [{ internalType: 'address', name: 'player', type: 'address' }],
    name: 'getPlayerFacility',
    outputs: [
      { internalType: 'uint256', name: 'power', type: 'uint256' },
      { internalType: 'uint256', name: 'level', type: 'uint256' },
      { internalType: 'uint256', name: 'miners', type: 'uint256' },
      { internalType: 'uint256', name: 'capacity', type: 'uint256' },
      { internalType: 'uint256', name: 'used', type: 'uint256' },
      { internalType: 'uint256', name: 'resources', type: 'uint256' },
      { internalType: 'uint256', name: 'spaces', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'upgradeFacility',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Add buyNewFacility function for purchasing larger facilities
  {
    inputs: [],
    name: 'buyNewFacility',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Miner-related functions - Fixed the miner index issue here
  {
    inputs: [
      { internalType: 'uint256', name: 'x', type: 'uint256' },
      { internalType: 'uint256', name: 'y', type: 'uint256' }
    ],
    name: 'getFreeStarterMiner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'minerIndex', type: 'uint256' },
      { internalType: 'uint256', name: 'x', type: 'uint256' },
      { internalType: 'uint256', name: 'y', type: 'uint256' }
    ],
    name: 'buyMiner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'minerId', type: 'uint256' }],
    name: 'sellMiner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'player', type: 'address' },
      { internalType: 'uint256', name: 'startIndex', type: 'uint256' },
      { internalType: 'uint256', name: 'size', type: 'uint256' }
    ],
    name: 'getPlayerMinersPaginated',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'minerIndex', type: 'uint256' },
          { internalType: 'uint256', name: 'id', type: 'uint256' },
          { internalType: 'uint256', name: 'x', type: 'uint256' },
          { internalType: 'uint256', name: 'y', type: 'uint256' },
          { internalType: 'uint256', name: 'hashrate', type: 'uint256' },
          { internalType: 'uint256', name: 'powerConsumption', type: 'uint256' },
          { internalType: 'uint256', name: 'cost', type: 'uint256' },
          { internalType: 'bool', name: 'inProduction', type: 'bool' }
        ],
        internalType: 'struct Miner[]',
        name: '',
        type: 'tuple[]'
      }
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'miners',
    outputs: [
      { internalType: 'uint256', name: 'minerIndex', type: 'uint256' },
      { internalType: 'uint256', name: 'id', type: 'uint256' },
      { internalType: 'uint256', name: 'x', type: 'uint256' },
      { internalType: 'uint256', name: 'y', type: 'uint256' },
      { internalType: 'uint256', name: 'hashrate', type: 'uint256' },
      { internalType: 'uint256', name: 'powerConsumption', type: 'uint256' },
      { internalType: 'uint256', name: 'cost', type: 'uint256' },
      { internalType: 'bool', name: 'inProduction', type: 'bool' }
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // Rewards and mining stats
  {
    inputs: [],
    name: 'claimRewards',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'player', type: 'address' }],
    name: 'pendingRewards',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'playerHashrate',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalHashrate',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'player', type: 'address' }],
    name: 'playerBitapePerBlock',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'STARTER_MINER_INDEX',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  // New facility data function
  {
    inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
    name: 'ownerToFacility',
    outputs: [
      { internalType: 'uint256', name: 'facilityIndex', type: 'uint256' },
      { internalType: 'uint256', name: 'maxMiners', type: 'uint256' },
      { internalType: 'uint256', name: 'currMiners', type: 'uint256' },
      { internalType: 'uint256', name: 'totalPowerOutput', type: 'uint256' },
      { internalType: 'uint256', name: 'currPowerOutput', type: 'uint256' },
      { internalType: 'uint256', name: 'x', type: 'uint256' },
      { internalType: 'uint256', name: 'y', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // Fallback function for facility data in case ownerToFacility doesn't work
  {
    inputs: [{ internalType: 'address', name: 'player', type: 'address' }],
    name: 'facilities',
    outputs: [
      { internalType: 'uint256', name: 'power', type: 'uint256' },
      { internalType: 'uint256', name: 'level', type: 'uint256' },
      { internalType: 'uint256', name: 'lastClaimBlock', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Mining Controller ABI 
export const MINING_CONTROLLER_ABI = [
  // Read functions
  'function facilities(address user) view returns (uint256 power, uint256 level, uint256 lastClaimBlock)',
  'function totalPower() view returns (uint256)',
  'function rewardPerBlock() view returns (uint256)',
  'function getUnclaimedRewards(address user) view returns (uint256)',
  'function getUserMiningRate(address user) view returns (uint256)',
  'function getNetworkHashRate() view returns (uint256)',
  'function getUserHashRate(address user) view returns (uint256)',
  'function getBlocksUntilHalving() view returns (uint256)',
  'function getTotalMinedBit() view returns (uint256)',
  'function getBurnedBit() view returns (uint256)',
  
  // Write functions
  'function purchaseInitialFacility(address referrer) payable returns (bool)',
  'function getStarterMiner() returns (bool)',
  'function claimReward() returns (bool)',
  'function upgradeFacility() returns (bool)',
] as const;

// Direct export of BIT_TOKEN_ADDRESS for consistency
export const BIT_TOKEN_ADDRESS = '0xb9be704a40b1500d39fe4264a1c46e43a5c614bd';

// Add the getMiner function to the ABI if it doesn't already exist
export const MAIN_CONTRACT_ABI_EXTENDED = [
  ...MAIN_CONTRACT_ABI,
  // Add specific function for getting miner details - needed for API
  {
    inputs: [{ name: 'minerId', type: 'uint256' }],
    name: 'getMiner',
    outputs: [
      { name: 'minerIndex', type: 'uint256' },
      { name: 'x', type: 'uint256' },
      { name: 'y', type: 'uint256' },
      { name: 'hashrate', type: 'uint256' },
      { name: 'powerConsumption', type: 'uint256' },
      { name: 'cost', type: 'uint256' },
      { name: 'owner', type: 'address' },
      { name: 'inProduction', type: 'bool' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  // Add specific function for player miners
  {
    inputs: [
      { name: 'player', type: 'address' },
      { name: 'startIndex', type: 'uint256' },
      { name: 'size', type: 'uint256' }
    ],
    name: 'getPlayerMinersPaginated',
    outputs: [
      {
        components: [
          { name: 'minerIndex', type: 'uint256' },
          { name: 'id', type: 'uint256' },
          { name: 'x', type: 'uint256' },
          { name: 'y', type: 'uint256' },
          { name: 'hashrate', type: 'uint256' },
          { name: 'powerConsumption', type: 'uint256' },
          { name: 'cost', type: 'uint256' },
          { name: 'inProduction', type: 'bool' }
        ],
        name: '',
        type: 'tuple[]'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  }
]; 