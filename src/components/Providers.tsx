'use client';

import React, { useState, useEffect } from 'react';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { WagmiConfig } from 'wagmi';
import { QueryClientProvider } from '@tanstack/react-query';
import { config, queryClient, projectId } from '@/config/web3';
import { CacheProvider } from '@chakra-ui/next-js';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

// Extend the theme
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
 * Improved web3modal initialization with better error handling and recovery
 */
const initializeWeb3Modal = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    console.log('Initializing Web3Modal...');
    
    // Clean up any corrupted wallet data before initialization
    cleanupStorageData();
    
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
      // Only include wallets that don't conflict with each other
      includeWalletIds: [
        // MetaMask sometimes conflicts with third-party wallets
        // If using Magic Eden wallet, disable MetaMask in the wallet list
        'a797aa35-d502-4c8b-b77b-1b86d2251450', // Magic Eden
        '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
        'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase Wallet
        '7674bb4e353bf52886768a3ddc2a4562ce2f4191c80831291218ebd90f5f5e26', // Rainbow
      ],
    });
  } catch (err) {
    console.error('Failed to initialize Web3Modal:', err);
    return null;
  }
};

/**
 * Clean up potentially corrupted localStorage data
 */
const cleanupStorageData = () => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  
  try {
    console.log('Cleaning up wallet storage data...');
    
    // Keys that could contain corrupted data
    const keysToCheck = [
      'wagmi.store', 
      'wagmi.connected',
      'wagmi.injected',
      'wagmi.wallet',
      'wagmi.cache',
      'walletconnect',
      'WALLETCONNECT_DEEPLINK_CHOICE',
      'WALLETCONNECT_DEEPLINK_NEW',
      'walletlink',
      'WALLETLINK:LAST_USED_CHAIN_ID',
      'WALLETLINK:APP_CONFIG',
      'WALLETLINK:SESSION',
      'wc:',
      'wc@2:client:0',
      'wc@2:core:0:metadata',
      'wc@2:universal_provider:0:session',
      'wc@2:core:0:pairing'
    ];
    
    // Find all matching keys in localStorage
    const allKeys = Object.keys(localStorage);
    const walletKeys = allKeys.filter(key => 
      keysToCheck.some(pattern => key.includes(pattern)) ||
      key.startsWith('wc@') ||
      key.startsWith('metamask')
    );
    
    // Check for corrupted values and remove them
    for (const key of walletKeys) {
      try {
        const value = localStorage.getItem(key);
        // Look for obviously corrupted data
        if (value && (
          value === '[object Object]' || 
          value === 'undefined' || 
          value.includes('{"undefined":') ||
          value.includes('NaN') ||
          value === '{}' && key.includes('store')
        )) {
          console.log(`Removing corrupted wallet data: ${key}`);
          localStorage.removeItem(key);
        }
      } catch (err) {
        console.warn(`Error checking localStorage key ${key}:`, err);
        // Try to remove problematic keys
        try {
          localStorage.removeItem(key);
        } catch (e) {
          // Ignore errors on removal
        }
      }
    }
  } catch (error) {
    console.warn('Error during storage cleanup:', error);
  }
};

/**
 * Completely reset wallet connections
 */
const resetWalletConnection = () => {
  if (typeof window === 'undefined') return;
  
  try {
    console.log('Performing complete wallet reset...');
    
    // Clear all wallet-related localStorage items
    const allKeys = Object.keys(localStorage);
    const walletKeys = allKeys.filter(key => 
      key.includes('walletconnect') || 
      key.includes('wagmi') || 
      key.includes('metamask') ||
      key.includes('coinbase') ||
      key.includes('wc@') ||
      key.includes('wallet')
    );
    
    walletKeys.forEach(key => {
      try {
        console.log(`Removing wallet key: ${key}`);
        localStorage.removeItem(key);
      } catch (e) {
        console.warn(`Failed to remove ${key}:`, e);
      }
    });
    
    // Reset Web3Modal instance
    if (window.__WEB3_MODAL_INSTANCE__) {
      window.__WEB3_MODAL_INSTANCE__ = null;
    }
    
    // Force reload the page after slight delay
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  } catch (error) {
    console.error('Error resetting wallet connection:', error);
    // If all else fails, just reload
    window.location.reload();
  }
};

// Improved Providers component with better error recovery
export default function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [needsReset, setNeedsReset] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);
  
  // Initialize wallet on client-side only
  useEffect(() => {
    if (typeof window === 'undefined' || initialized) return;
    
    let initAttemptCount = 0;
    const maxAttempts = 3;
    let initTimer: NodeJS.Timeout;

    const attemptInitialization = () => {
      initAttemptCount++;
      console.log(`Web3Modal initialization attempt ${initAttemptCount}/${maxAttempts}`);
      
      try {
        // Clean storage first
        cleanupStorageData();
        
        // Try to initialize Web3Modal
        const instance = initializeWeb3Modal();
        
        if (instance) {
          console.log('Web3Modal initialized successfully');
          window.__WEB3_MODAL_INSTANCE__ = instance;
          setInitialized(true);
          setInitError(null);
        } else if (initAttemptCount < maxAttempts) {
          console.warn(`Web3Modal initialization failed, will retry in ${initAttemptCount * 1000}ms`);
          initTimer = setTimeout(attemptInitialization, initAttemptCount * 1000);
        } else {
          console.error('Maximum Web3Modal initialization attempts reached');
          setNeedsReset(true);
          setInitError(new Error('Failed to initialize wallet after multiple attempts'));
        }
      } catch (error) {
        console.error('Error during Web3Modal initialization:', error);
        
        if (initAttemptCount < maxAttempts) {
          initTimer = setTimeout(attemptInitialization, initAttemptCount * 1000);
        } else {
          setNeedsReset(true);
          setInitError(error instanceof Error ? error : new Error('Unknown wallet initialization error'));
        }
      }
    };
    
    // Start initialization process
    attemptInitialization();
    
    // Cleanup on unmount
    return () => {
      if (initTimer) clearTimeout(initTimer);
    };
  }, [initialized]);
  
  // Set up client-side hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle errors in transactions
  useEffect(() => {
    const handleWalletTransactionError = (event: ErrorEvent) => {
      // Only handle wallet-related errors
      if (event.error && 
          (event.error.message?.includes('wallet') || 
           event.error.message?.includes('transaction') ||
           event.error.message?.includes('MetaMask') ||
           event.error.message?.includes('Coinbase'))) {
        console.error('Wallet transaction error:', event.error);
        // Show user-friendly notification here if needed
      }
    };

    // Listen for wallet transaction errors
    window.addEventListener('error', handleWalletTransactionError);
    
    return () => {
      window.removeEventListener('error', handleWalletTransactionError);
    };
  }, []);

  // Don't render until hydrated
  if (!mounted) {
    return null;
  }

  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <CacheProvider>
          <ChakraProvider theme={theme}>
            {needsReset ? (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50">
                <div className="bg-[#041e3a] p-6 rounded-lg border-2 border-[#ffc107] max-w-md w-full">
                  <h2 className="text-[#ffc107] text-xl font-bold mb-4">Wallet Connection Issue</h2>
                  <p className="text-white mb-4">
                    {initError?.message || 'We encountered an issue connecting to your wallet. This might be due to corrupted data or a temporary issue.'}
                  </p>
                  <p className="text-gray-300 text-sm mb-6">
                    To fix this issue, we need to reset your wallet connection. This won't affect your wallet or assets, just the connection to this app.
                  </p>
                  <button 
                    onClick={resetWalletConnection}
                    className="bg-[#ffc107] text-[#041e3a] font-bold py-2 px-4 rounded hover:bg-opacity-90 w-full"
                  >
                    Reset Wallet Connection
                  </button>
                </div>
              </div>
            ) : children}
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