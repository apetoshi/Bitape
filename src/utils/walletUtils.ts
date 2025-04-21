import { useDisconnect } from 'wagmi';

/**
 * Utility functions for handling wallet disconnection
 */

/**
 * Simple disconnection function for non-React contexts
 */
export async function disconnectWallet(redirect = true) {
  try {
    console.log('Attempting to disconnect wallet outside React context');
    // No direct access to wagmi's disconnect hook in non-React context,
    // so we just force a page refresh
    if (redirect) {
      window.location.href = '/';
    }
  } catch (error) {
    console.error('Error during wallet disconnection:', error);
    if (redirect) {
      window.location.href = '/';
    }
  }
}

/**
 * Simple React hook for wallet disconnection
 */
export function useWalletDisconnect() {
  const { disconnect } = useDisconnect();
  
  const handleDisconnect = async (redirect = true) => {
    try {
      console.log('Starting wallet disconnection process...');
      
      // Call wagmi's disconnect function
      await disconnect();
      console.log('Wallet disconnected successfully');
      
      // Simple page refresh to reset state
      if (redirect) {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error during wallet disconnection:', error);
      if (redirect) {
        window.location.href = '/';
      }
    }
  };

  return { handleDisconnect };
} 