'use client';

import React, { useState, useEffect } from 'react';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { WagmiConfig } from 'wagmi';
import { QueryClientProvider } from '@tanstack/react-query';
import { config, queryClient, projectId } from '@/config/web3';
import { CacheProvider } from '@chakra-ui/next-js';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

// Define the theme
const theme = extendTheme({
  styles: {
    global: {
      'html, body': {
        color: 'white',
        backgroundColor: 'black',
      }
    }
  },
  colors: {
    brand: {
      900: '#FFD700',
      800: '#FFD700',
      700: '#FFD700',
    },
  },
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
});

/**
 * Simplified Web3Modal initialization function with more reliable error recovery
 */
const createModal = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    console.log('Initializing Web3Modal with simplified configuration');
    
    // Clean localStorage to remove stale wallet data
    cleanLocalStorage();
    
    return createWeb3Modal({
      wagmiConfig: config,
      projectId,
      enableAnalytics: false,
      themeMode: 'dark',
      themeVariables: {
        '--w3m-accent': '#ffc107',
      },
      metadata: {
        name: 'BitApe Mining',
        description: 'Mine BIT tokens on ApeChain',
        url: 'https://bitape.org',
        icons: ['https://bitape.org/bitape.png'],
      },
      defaultChain: config.chains[0],
    });
  } catch (err) {
    console.error('Failed to initialize Web3Modal:', err);
    return null;
  }
};

/**
 * Clean localStorage of problematic wallet data
 */
const cleanLocalStorage = () => {
  if (typeof window === 'undefined') return;
  
  try {
    // Remove the most common keys that cause issues
    const problematicKeys = [
      'wagmi.store',
      'wagmi.wallet',
      'wagmi.connected',
      'wagmi.injected',
      'walletconnect',
      'wc@2:client:0'
    ];
    
    problematicKeys.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        // Ignore errors when removing
      }
    });
  } catch (e) {
    console.error('Error cleaning localStorage:', e);
  }
};

/**
 * Reset wallet connection in case of issues
 */
const resetWallet = () => {
  cleanLocalStorage();
  window.location.reload();
};

/**
 * Main Providers component with simplified structure
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [modalError, setModalError] = useState<Error | null>(null);
  
  // Initialize web3modal
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const modal = createModal();
      if (!modal) {
        setModalError(new Error('Failed to initialize wallet connection'));
      }
    } catch (error) {
      console.error('Error creating Web3Modal:', error);
      setModalError(error instanceof Error ? error : new Error('Unknown wallet initialization error'));
    }
    
    // Add wallet error listener to detect issues during use
    const handleWalletError = (event: ErrorEvent) => {
      if (event.error && 
         (event.error.message?.includes('wallet') || 
          event.error.message?.includes('connector') ||
          event.error.message?.includes('MetaMask') ||
          event.error.message?.includes('WalletConnect'))) {
        console.warn('Wallet error detected:', event.error.message);
      }
    };
    
    window.addEventListener('error', handleWalletError);
    
    return () => {
      window.removeEventListener('error', handleWalletError);
    };
  }, []);
  
  // Set mounted state for hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until client-side hydration completes
  if (!mounted) {
    return null;
  }

  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <CacheProvider>
          <ChakraProvider theme={theme}>
            {modalError ? (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50">
                <div className="bg-[#041e3a] p-6 rounded-lg border-2 border-[#ffc107] max-w-md w-full">
                  <h2 className="text-[#ffc107] text-xl font-bold mb-4">Wallet Connection Issue</h2>
                  <p className="text-white mb-4">
                    We encountered an issue with your wallet connection. This is often caused by cached data.
                  </p>
                  <button 
                    onClick={resetWallet}
                    className="bg-[#ffc107] text-[#041e3a] font-bold py-2 px-4 rounded hover:bg-opacity-90 w-full"
                  >
                    Reset Wallet Connection
                  </button>
                </div>
              </div>
            ) : (
              children
            )}
          </ChakraProvider>
        </CacheProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}

// Global type declarations
declare global {
  interface Window {
    __WEB3_MODAL_INSTANCE__?: any;
  }
} 