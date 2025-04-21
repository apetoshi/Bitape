import React, { useEffect, useCallback, useState } from 'react';
import Image from 'next/image';
import { Dialog } from '@headlessui/react';

interface StarterMinerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaim: (x: number, y: number) => Promise<void>;
  selectedTile?: { x: number, y: number };
  isProcessing: boolean;
}

// Add keyframes for the modal miner animation
const minerPreviewStyle = `
  @keyframes float {
    0% { transform: translateY(0px) rotate(0deg); }
    25% { transform: translateY(-5px) rotate(-3deg); }
    50% { transform: translateY(0px) rotate(0deg); }
    75% { transform: translateY(5px) rotate(3deg); }
    100% { transform: translateY(0px) rotate(0deg); }
  }

  .miner-float {
    animation: float 3s ease-in-out infinite;
  }
  
  @keyframes pulse {
    0% { opacity: 0.7; }
    50% { opacity: 1; }
    100% { opacity: 0.7; }
  }
  
  .instruction-pulse {
    animation: pulse 2s infinite;
  }
  
  /* Ensure modal is scrollable on mobile */
  .starter-miner-modal {
    max-height: 90vh;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
`;

const StarterMinerModal: React.FC<StarterMinerModalProps> = ({
  isOpen,
  onClose,
  onClaim,
  selectedTile,
  isProcessing
}) => {
  // Track error state
  const [error, setError] = useState<string | null>(null);
  
  // Reset error when the modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setError(null);
    }
  }, [isOpen]);
  
  // Add escape key handler as another way to close
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscapeKey);
    return () => window.removeEventListener('keydown', handleEscapeKey);
  }, [isOpen, onClose]);

  // Safe claim function with error handling
  const handleClaim = async () => {
    if (!selectedTile) return;
    
    try {
      setError(null);
      
      // Add a timeout to detect wallet-related issues
      const timeoutId = setTimeout(() => {
        if (isProcessing) {
          console.warn('Miner claim is taking too long - likely wallet issue');
          setError('Wallet not responding. Try closing and reopening your wallet.');
        }
      }, 15000);
      
      await onClaim(selectedTile.x, selectedTile.y);
      clearTimeout(timeoutId);
    } catch (err: any) {
      console.error('Error claiming starter miner:', err);
      setError(err?.message || 'Failed to claim starter miner. Please try again.');
    }
  };

  // Don't render anything if not open
  if (!isOpen) return null;

  return (
    <Dialog
      open={true}
      onClose={onClose}
      className="relative z-50"
    >
      <style jsx global>{minerPreviewStyle}</style>
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <Dialog.Panel className="relative bg-royal border-2 border-banana p-6 max-w-lg w-full m-4 starter-miner-modal">
          <Dialog.Title className="font-press-start text-2xl text-banana mb-6 text-center">
            CLAIM YOUR FREE BANANA MINER
          </Dialog.Title>
          
          <div className="bg-royal-dark p-6 mb-8 border border-banana/20">
            <div className="space-y-4 font-press-start">
              {/* Show error message if present */}
              {error && (
                <div className="bg-red-900/50 border border-red-500 p-3 mb-4">
                  <p className="text-red-400 text-sm break-words">{error}</p>
                  <button 
                    onClick={() => setError(null)}
                    className="text-yellow-300 text-xs mt-2 underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}
              
              <div className="mb-4 border border-banana/50 p-3 bg-black/50">
                <p className="text-white text-center font-bold">HOW TO CLAIM YOUR MINER:</p>
                <ol className="list-decimal pl-6 text-white mt-2 space-y-2">
                  <li className="text-yellow-300 font-bold">
                    Select a tile for your miner
                  </li>
                  <li className="text-yellow-300 font-bold">
                    Click "CLAIM FREE MINER" button below
                  </li>
                  <li className="text-yellow-300 font-bold">
                    Confirm the transaction in your wallet
                  </li>
                  <li className="text-yellow-300 font-bold">
                    Start earning BIT!
                  </li>
                </ol>
              </div>

              {selectedTile ? (
                <p className="text-green-400 text-center font-bold">
                  ✓ Tile Selected: X:{selectedTile.x}, Y:{selectedTile.y}
                </p>
              ) : (
                <p className="text-yellow-300 text-center animate-pulse">
                  No tile selected yet
                </p>
              )}
              
              <div className="relative w-48 h-48 mx-auto mb-6">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`relative w-40 h-40 ${selectedTile ? "miner-float" : ""}`}>
                    <Image
                      src="/banana-miner.gif"
                      alt="Banana Miner"
                      fill
                      className="object-contain"
                      style={{
                        filter: selectedTile ? 'drop-shadow(0 0 10px #FFDD00)' : 'none'
                      }}
                    />
                  </div>
                </div>
                {selectedTile && (
                  <div className="absolute bottom-0 w-full">
                    <div className="bg-royal border border-banana rounded-full w-24 h-6 mx-auto flex items-center justify-center">
                      <p className="text-banana text-xs font-press-start">POSITION {selectedTile.x},{selectedTile.y}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-white">
                <p>- HASH RATE: 100 GH/S</p>
                <p>- ENERGY: 1 WATT</p>
                <p>- PRICE: FREE</p>
                <p className="text-yellow-300 mt-4">
                  This is your free starter miner! You can only claim one per wallet.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between space-x-4">
            <button
              onClick={onClose}
              className="font-press-start px-6 py-2 border-2 border-banana text-banana hover:bg-banana hover:text-royal transition-colors"
              disabled={isProcessing}
            >
              {isProcessing ? 'PROCESSING...' : 'CLOSE'}
            </button>
            {selectedTile ? (
              <button
                onClick={handleClaim}
                disabled={!selectedTile || isProcessing}
                className="font-press-start px-6 py-2 bg-banana text-royal hover:bg-opacity-90 transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'PROCESSING...' : 'CLAIM FREE MINER'}
              </button>
            ) : (
              <button
                onClick={onClose}
                className="font-press-start px-6 py-2 bg-banana text-royal hover:bg-opacity-90 transition-colors"
              >
                CLOSE & SELECT TILE
              </button>
            )}
          </div>
          
          {isProcessing && (
            <div className="mt-4 text-center">
              <p className="text-yellow-400 text-sm animate-pulse">
                Transaction in progress... Please confirm in your wallet.
              </p>
              <p className="text-gray-400 text-xs mt-2">
                If your wallet doesn't open, try clicking the wallet icon in your browser.
              </p>
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default StarterMinerModal;