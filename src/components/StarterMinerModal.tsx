import React from 'react';
import Image from 'next/image';

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
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-royal border-2 border-banana p-6 max-w-lg w-full m-4">
        <h2 className="font-press-start text-2xl text-banana mb-6">CLAIM YOUR FREE BANANA MINER</h2>
        
        <div className="bg-opacity-10 bg-white p-6 mb-8">
          <div className="space-y-4 font-press-start">
            <p className="text-white">Selected Position: {selectedTile ? `X:${selectedTile.x}, Y:${selectedTile.y}` : 'None'}</p>
            
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
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="font-press-start px-6 py-2 border-2 border-banana text-banana hover:bg-banana hover:text-royal transition-colors"
          >
            CANCEL
          </button>
          <button
            onClick={() => selectedTile && onClaim(selectedTile.x, selectedTile.y)}
            disabled={!selectedTile || isProcessing}
            className="font-press-start px-6 py-2 bg-banana text-royal hover:bg-opacity-90 transition-colors disabled:opacity-50"
          >
            {isProcessing ? 'CLAIMING...' : 'CLAIM FREE MINER'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StarterMinerModal;