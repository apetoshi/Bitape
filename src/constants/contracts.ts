// This file contains the BitApe contract ABIs and addresses for easy reference

// BitApe Token Contract Address
export const BITAPE_TOKEN_ADDRESS = '0xd5f2A51440059C5E7B1E1E21634B5f48860A53f3';

// Main Contract Address
export const MAIN_CONTRACT_ADDRESS = '0x9281b1D9291e2D1911a400877B5c5e3c85342672';

// ApeChain RPC URL
export const APECHAIN_RPC_URL = 'https://apechain-mainnet.g.alchemy.com/v2/o5UPoUhml8_h72VaE2QIglR76E8dQg42';

// ApeChain Network Configuration
export const APECHAIN_CONFIG = {
  id: 16350,
  name: 'ApeChain',
  network: 'apechain',
  nativeCurrency: {
    decimals: 18,
    name: 'ApeCoin',
    symbol: 'APE',
  },
  rpcUrls: {
    public: { http: [APECHAIN_RPC_URL] },
    default: { http: [APECHAIN_RPC_URL] },
  },
  blockExplorers: {
    etherscan: { name: 'ApeScan', url: 'https://apescan.io' },
    default: { name: 'ApeScan', url: 'https://apescan.io' },
  },
};

// Game Constants
export const GAME_CONSTANTS = {
  INITIAL_FACILITY_PRICE: '10', // in APE
  FACILITY_UPGRADE_PRICE: '100', // in BIT
  BLOCKS_PER_DAY: 7200, // Approximate blocks per day on ApeChain
  HALVING_BLOCKS: 4320000, // ~2 years
};
