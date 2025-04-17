'use client';

import { WagmiConfig } from 'wagmi';
import { QueryClientProvider } from '@tanstack/react-query';
import { config, queryClient, projectId } from '@/config/web3';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { CacheProvider } from '@chakra-ui/next-js';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

// Initialize Web3Modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true,
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    'ecc4036f814562b41a5268adc86270fba1365471402006302e70169465b7ac18', // Coinbase Wallet
  ],
  themeMode: 'dark',
  chainImages: {
    33139: 'https://bitape.org/images/ape-logo.png', 
  },
  includeWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    'ecc4036f814562b41a5268adc86270fba1365471402006302e70169465b7ac18', // Coinbase Wallet 
  ],
  metadata: {
    name: 'BitApe',
    description: 'Mine BIT tokens on ApeChain',
    url: 'https://bitape.org',
    icons: ['https://bitape.org/images/bitape-logo.png']
  }
});

// Extend the theme
const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: 'transparent',
      },
    },
  },
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <CacheProvider>
          <ChakraProvider theme={theme}>
            {children}
          </ChakraProvider>
        </CacheProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
} 