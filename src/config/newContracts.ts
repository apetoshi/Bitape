// ApeChain Network Configuration
export const APECHAIN_ID = 33139;

// Contract Addresses on ApeChain
export const CONTRACT_ADDRESSES = {
  BIT_TOKEN: '0xb9BE704a40b1500D39FE4264a1C46E43a5C614bD', // BIT token address
  MINING_CONTROLLER: '0x409Ec46CdA55E8C7A2Ec971745985bf7Dd58f533', // Mining controller address
  MAIN: '0x409Ec46CdA55E8C7A2Ec971745985bf7Dd58f533' // Main contract address
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

// Use the same address as in CONTRACT_ADDRESSES for consistency
export const BIT_TOKEN_ADDRESS = '0xb9BE704a40b1500D39FE4264a1C46E43a5C614bD' as const; 