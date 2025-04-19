import React, { useEffect } from 'react';
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
  // Force close the modal after 500ms if user clicks the close button
  // This is a workaround for the stuck modal issue
  const handleForceClose = () => {
    onClose();
    
    // Force close after a delay as backup
    setTimeout(() => {
      // Try to force close by manipulating DOM if needed
      const modalBackdrops = document.querySelectorAll('.fixed.inset-0.bg-black\\/70');
      modalBackdrops.forEach(el => {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
      
      // Also try to hide any modal panels
      const modalPanels = document.querySelectorAll('.starter-miner-modal');
      modalPanels.forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.display = 'none';
        }
      });
      
      console.log('Forced modal close');
    }, 500);
  };

  // Add escape key handler as another way to close
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleForceClose();
      }
    };
    
    window.addEventListener('keydown', handleEscapeKey);
    return () => window.removeEventListener('keydown', handleEscapeKey);
  }, []);

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={handleForceClose}
      className="relative z-50"
    >
      <style jsx global>{minerPreviewStyle}</style>
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <Dialog.Panel className="relative bg-royal border-2 border-banana p-6 max-w-lg w-full m-4 starter-miner-modal">
          <Dialog.Title className="font-press-start text-2xl text-banana mb-6 text-center">
            CLAIM YOUR FREE BANANA MINER
          </Dialog.Title>
          
          <div className="bg-opacity-10 bg-white p-6 mb-8">
            <div className="space-y-4 font-press-start">
              {selectedTile ? (
                <p className="text-white text-center">
                  Selected Position: X:{selectedTile.x}, Y:{selectedTile.y}
                </p>
              ) : (
                <p className="text-yellow-300 text-center">
                  Please click "SHOW GRID" and select a mining tile first!
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
              onClick={handleForceClose}
              className="font-press-start px-6 py-2 border-2 border-banana text-banana hover:bg-banana hover:text-royal transition-colors"
            >
              CLOSE
            </button>
            {selectedTile ? (
              <button
                onClick={() => selectedTile && onClaim(selectedTile.x, selectedTile.y)}
                disabled={!selectedTile || isProcessing}
                className="font-press-start px-6 py-2 bg-banana text-royal hover:bg-opacity-90 transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'CLAIMING...' : 'CLAIM FREE MINER'}
              </button>
            ) : (
              <button
                onClick={handleForceClose}
                className="font-press-start px-6 py-2 bg-banana text-royal hover:bg-opacity-90 transition-colors"
              >
                CHOOSE LOCATION
              </button>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default StarterMinerModal;