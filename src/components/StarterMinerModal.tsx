import React from 'react';
import Image from 'next/image';
import { Dialog } from '@headlessui/react';

interface StarterMinerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaim: (x: number, y: number) => Promise<void>;
  selectedTile?: { x: number, y: number };
  isProcessing: boolean;
}

const StarterMinerModal: React.FC<StarterMinerModalProps> = ({
  isOpen,
  onClose,
  onClaim,
  selectedTile,
  isProcessing
}) => {
  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="relative bg-royal border-2 border-banana p-6 max-w-lg w-full m-4">
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
              
              <div className="relative w-32 h-32 mx-auto mb-6">
                <Image
                  src="/banana-miner.gif"
                  alt="Banana Miner"
                  fill
                  className="object-contain"
                />
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
                onClick={onClose}
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