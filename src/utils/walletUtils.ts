import { useDisconnect } from 'wagmi';

/**
 * Utility functions for handling wallet-related operations and cleanup
 */

/**
 * Cleans up wallet-related data from localStorage
 */
export const cleanupWalletStorage = () => {
  if (typeof window === 'undefined') return;
  
  try {
    const walletRelatedKeys = [
      'wagmi', 
      'wc', 
      'walletconnect', 
      'wallet', 
      'coinbase', 
      'web3',
      'WALLET_',
      '-wallet',
      'metamask',
      'claimedMinerPosition',
      'miner_',
      'BITAPE',
    ];
    
    // Clear known wallet-related localStorage items
    Object.keys(localStorage).forEach(key => {
      if (walletRelatedKeys.some(prefix => key.toLowerCase().includes(prefix.toLowerCase()))) {
        console.log('Cleaning up localStorage key:', key);
        localStorage.removeItem(key);
      }
    });
    
    // Clear any sessionStorage items that might be related
    Object.keys(sessionStorage).forEach(key => {
      if (walletRelatedKeys.some(prefix => key.toLowerCase().includes(prefix.toLowerCase()))) {
        console.log('Cleaning up sessionStorage key:', key);
        sessionStorage.removeItem(key);
      }
    });
    
    console.log('Wallet storage cleanup completed');
  } catch (error) {
    console.error('Error during wallet storage cleanup:', error);
  }
};

/**
 * Cleans up any modal DOM elements that might be stuck in the DOM
 */
export const cleanupModalElements = () => {
  if (typeof document === 'undefined') return;
  
  try {
    // Clean up wallet modal elements that might be stuck
    const modalElements = document.querySelectorAll('[class*="modal"], [class*="wallet"], [id*="modal"], [id*="wallet"]');
    modalElements.forEach(element => {
      if (element.parentNode) {
        console.log('Removing modal element:', element);
        element.parentNode.removeChild(element);
      }
    });
    
    // Clean up any backdrop/overlay elements
    const overlayElements = document.querySelectorAll('.backdrop, .overlay, [class*="backdrop"], [class*="overlay"]');
    overlayElements.forEach(element => {
      if (element.parentNode) {
        console.log('Removing overlay element:', element);
        element.parentNode.removeChild(element);
      }
    });
    
    console.log('Modal elements cleanup completed');
  } catch (error) {
    console.error('Error during modal elements cleanup:', error);
  }
};

/**
 * Attempts to disconnect from active wallet connections
 * This can be called from non-React contexts
 */
export async function disconnectWallet(redirect = false) {
  try {
    console.log('Starting wallet disconnection process...');
    
    // Set global flag
    if (typeof window !== 'undefined') {
      window.isDisconnecting = true;
    }
    
    // Create a timeout to ensure we don't get stuck
    const timeoutId = setTimeout(() => {
      console.log('Disconnect timeout triggered - forcing page reload');
      if (redirect) {
        window.location.replace('/');
      }
    }, 5000); // 5 second safety timeout

    // Attempt to disconnect from MetaMask if it's available
    if (window.ethereum && window.ethereum.disconnect) {
      await window.ethereum.disconnect();
    }
    
    // Attempt to disconnect from WalletConnect if present
    if (window.WalletConnect && window.WalletConnect.disconnect) {
      await window.WalletConnect.disconnect();
    }
    
    // Extra handling for web3Modal
    if (window.web3Modal) {
      if (window.web3Modal.clearCachedProvider) {
        window.web3Modal.clearCachedProvider();
      }
      if (window.web3Modal.disconnect) {
        await window.web3Modal.disconnect();
      }
    }

    // Prevent WalletConnect errors by adding safety wrappers around problematic methods
    if (typeof window !== 'undefined') {
      try {
        // Fix for "cannot convert undefined or null to object" error
        // Add a safety wrapper around Object.values if it's being called on null/undefined
        const originalObjectValues = Object.values;
        Object.values = function safeObjectValues(obj: any) {
          if (obj === null || obj === undefined) {
            console.warn('Attempted to call Object.values on null/undefined, returning empty array');
            return [];
          }
          return originalObjectValues(obj);
        };
        
        // Create empty explorer context if needed
        if (!window.wcmExplorerCtx) {
          window.wcmExplorerCtx = { listings: {}, recent: [] };
        }
        
        // Ensure the explorer context has the expected properties
        if (window.wcmExplorerCtx && !window.wcmExplorerCtx.listings) {
          window.wcmExplorerCtx.listings = {};
        }
      } catch (e) {
        console.warn('Error patching WalletConnect methods:', e);
      }
    }
    
    // Clear the timeout since disconnect succeeded
    clearTimeout(timeoutId);
    
    console.log('Wallet disconnection attempt completed');
    
    // Force a complete page refresh to reset all app state if requested
    if (redirect) {
      window.location.replace('/');
    }
    
  } catch (error) {
    console.error('Error during wallet disconnection:', error);
    
    // As a last resort, force a hard refresh if requested
    if (redirect) {
      window.location.replace('/');
    }
  } finally {
    // Reset the global flag
    if (typeof window !== 'undefined') {
      window.isDisconnecting = false;
    }
  }
}

/**
 * Full wallet reset - combination of all cleanup methods
 */
export const resetWalletState = async (reloadPage = true) => {
  await disconnectWallet(false); // Don't redirect from this function
  cleanupWalletStorage();
  cleanupModalElements();
  
  // Flag to prevent repeated reloads
  const resetFlag = 'wallet_reset_in_progress';
  if (typeof window !== 'undefined' && reloadPage && !sessionStorage.getItem(resetFlag)) {
    try {
      // Set flag to prevent reload loops
      sessionStorage.setItem(resetFlag, 'true');
      
      // Use a small delay before reloading to allow cleanup to complete
      setTimeout(() => {
        window.location.href = window.location.pathname;
      }, 500);
      
      // Clear the flag after reload
      setTimeout(() => {
        sessionStorage.removeItem(resetFlag);
      }, 5000);
    } catch (error) {
      console.error('Error during page reload:', error);
    }
  }
};

/**
 * React hook that provides a disconnectWallet function
 * This is designed to be used in React components
 */
export function useWalletDisconnect() {
  const { disconnect } = useDisconnect();
  
  // Function that can be called within React components
  const handleDisconnect = async (redirect = true) => {
    try {
      console.log('Starting wallet disconnection process...');
      
      // Set global flag
      if (typeof window !== 'undefined') {
        window.isDisconnecting = true;
      }
      
      // Create a timeout to ensure we don't get stuck
      const timeoutId = setTimeout(() => {
        console.log('Disconnect timeout triggered - forcing page reload');
        if (redirect) {
          window.location.replace('/');
        }
      }, 5000); // 5 second safety timeout
      
      // First disconnect using wagmi's hook
      await disconnect();
      console.log('Wagmi disconnect completed');
      
      // Clear the timeout since disconnect succeeded
      clearTimeout(timeoutId);
      
      // Clean localStorage and DOM elements
      cleanupWalletStorage();
      cleanupModalElements();
      
      // Attempt to clear Ethereum provider
      if (typeof window !== 'undefined' && window.ethereum) {
        console.log('Closing ethereum provider connection');
        try {
          if (window.ethereum.close && typeof window.ethereum.close === 'function') {
            await window.ethereum.close();
          }
        } catch (err) {
          console.warn('Error closing ethereum provider:', err);
        }
      }
      
      console.log('Disconnect cleanup completed');
      
      // Force a complete page refresh to reset all app state
      if (redirect) {
        window.location.replace('/');
      }
      
    } catch (error) {
      console.error('Error during wallet disconnection:', error);
      
      // As a last resort, force a hard refresh
      if (redirect) {
        window.location.replace('/');
      }
    } finally {
      // Reset the global flag
      if (typeof window !== 'undefined') {
        window.isDisconnecting = false;
      }
    }
  };

  return { handleDisconnect };
} 