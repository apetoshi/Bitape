// ApeChain Network Configuration
export const APECHAIN_ID = 33139;

// Contract Addresses on ApeChain
export const CONTRACT_ADDRESSES = {
  BIT_TOKEN: '0xd5f2A51440059C5E7B1E1E21634B5f48860A53f3', // BIT token address
  MINING_CONTROLLER: '0x9281b1D9291e2D1911a400877B5c5e3c85342672', // Mining controller address
  MAIN: '0x9281b1D9291e2D1911a400877B5c5e3c85342672' // Main contract address
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
] as const;

// Main Contract ABI
export const MAIN_CONTRACT_ABI = [
  {
    inputs: [{ name: 'referrer', type: 'address' }],
    name: 'purchaseInitialFacility',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'initializedStarterFacility',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getPlayerFacility',
    outputs: [
      { name: 'power', type: 'uint256' },
      { name: 'level', type: 'uint256' },
      { name: 'miners', type: 'uint256' },
      { name: 'capacity', type: 'uint256' },
      { name: 'used', type: 'uint256' },
      { name: 'resources', type: 'uint256' },
      { name: 'spaces', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getPlayerStats',
    outputs: [
      { name: 'totalMined', type: 'uint256' },
      { name: 'hashRate', type: 'uint256' },
      { name: 'miningRate', type: 'uint256' },
      { name: 'networkShare', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getUserReferralInfo',
    outputs: [
      { name: 'totalReferrals', type: 'uint256' },
      { name: 'totalEarned', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'x', type: 'uint256' },
      { name: 'y', type: 'uint256' }
    ],
    name: 'getFreeStarterMiner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'upgradeFacility',
    outputs: [],
    stateMutability: 'nonpayable',
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

export const BIT_TOKEN_ADDRESS = '0x1A4b46696b2bB4794Eb3D4c26f1c55F9170fa4C5' as const; 