'use client';

import React from 'react';
import { useAccount, useDisconnect } from 'wagmi';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
  apeBalance: string;
  bitBalance: string;
}

const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  address,
  apeBalance,
  bitBalance
}) => {
  const { disconnect } = useDisconnect();

  if (!isOpen) return null;

  // Format address for display (truncate middle)
  const displayAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
      <div className="bg-royal p-6 max-w-lg w-full mx-4 border-2 border-banana">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-press-start text-2xl text-banana">ACCOUNT</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-banana font-press-start text-xl"
          >
            ×
          </button>
        </div>

        {/* Account Info Section */}
        <div className="bg-royal-dark p-4 mb-6">
          <h3 className="font-press-start text-white mb-4">
            YOUR ACCOUNT INFORMATION AND BALANCES
          </h3>

          {/* Wallet Address */}
          <div className="mb-6">
            <p className="font-press-start text-sm mb-2">WALLET ADDRESS</p>
            <div className="flex justify-between items-center bg-royal p-2">
              <span className="font-press-start text-sm text-white">{displayAddress}</span>
              <button 
                className="bg-transparent border-2 border-banana text-banana hover:bg-banana hover:text-royal px-4 py-1 font-press-start text-sm transition-colors"
                onClick={() => navigator.clipboard.writeText(address)}
              >
                COPY
              </button>
            </div>
          </div>

          {/* Balances */}
          <div className="mb-2">
            <p className="font-press-start text-sm">APE BALANCE</p>
            <p className="font-press-start text-banana">{apeBalance} APE</p>
          </div>

          <div className="mb-6">
            <p className="font-press-start text-sm">BIT BALANCE</p>
            <p className="font-press-start text-banana">{bitBalance} BIT</p>
          </div>

          {/* Bridge Section */}
          <div className="bg-royal p-4">
            <p className="font-press-start text-sm mb-2">NEED TO BRIDGE APE TO APECHAIN?</p>
            <button className="w-full bg-transparent border-2 border-banana text-banana hover:bg-banana hover:text-royal py-2 font-press-start flex justify-center items-center transition-colors">
              BRIDGE APE <span className="ml-2">→</span>
            </button>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-between">
          <button 
            onClick={onClose}
            className="bg-transparent border-2 border-banana text-banana hover:bg-banana hover:text-royal px-6 py-2 font-press-start transition-colors"
          >
            CLOSE
          </button>
          <button 
            onClick={() => {
              disconnect();
              onClose();
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 font-press-start transition-colors"
          >
            DISCONNECT
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountModal;
