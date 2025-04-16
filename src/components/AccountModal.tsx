'use client';

import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
} from '@chakra-ui/react';
import { useDisconnect } from 'wagmi';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  address?: string;
  apeBalance?: string;
  bitBalance?: string;
}

const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  address,
  apeBalance = '0',
  bitBalance = '0'
}) => {
  const { disconnect } = useDisconnect();

  const handleDisconnect = () => {
    disconnect();
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      isCentered
      motionPreset="slideInBottom"
    >
      <ModalOverlay bg="rgba(0, 0, 0, 0.8)" />
      <ModalContent
        position="relative"
        top="0"
        marginTop="0"
        marginX="auto"
        width="100%"
        maxWidth="500px"
        bg="rgba(0, 24, 38, 0.95)"
        border="2px solid #FFD700"
        borderRadius="8px"
        boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
      >
        <ModalBody p={6}>
          <div className="text-center">
            <h2 className="font-press-start text-2xl mb-6 text-white">ACCOUNT</h2>
            
            <div className="bg-[#001420] p-4 rounded mb-6">
              <h3 className="font-press-start text-lg mb-4 text-white">
                YOUR ACCOUNT INFORMATION AND BALANCES
              </h3>
              
              <div className="mb-4">
                <p className="font-press-start text-sm text-white mb-2">WALLET ADDRESS</p>
                <div className="flex items-center justify-between bg-[#002438] p-2 rounded">
                  <span className="text-white font-mono">
                    {address ? `${address.slice(0, 8)}...${address.slice(-8)}` : ''}
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText(address || '')}
                    className="px-4 py-1 bg-[#FFD700] text-black font-press-start text-sm rounded hover:bg-[#FFE55C]"
                  >
                    COPY
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-press-start text-sm text-white mb-2">APE BALANCE</p>
                  <p className="font-press-start text-lg text-[#FFD700]">{apeBalance} APE</p>
                </div>
                <div>
                  <p className="font-press-start text-sm text-white mb-2">BIT BALANCE</p>
                  <p className="font-press-start text-lg text-[#FFD700]">{bitBalance} BIT</p>
                </div>
              </div>
            </div>
            
            <div className="bg-[#001420] p-4 rounded mb-6">
              <p className="font-press-start text-sm text-white mb-2">
                NEED TO BRIDGE APE TO APECHAIN?
              </p>
              <button className="w-full px-4 py-2 bg-[#FFD700] text-black font-press-start rounded hover:bg-[#FFE55C]">
                BRIDGE APE →
              </button>
            </div>
            
            <div className="flex justify-between gap-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-[#FFD700] text-black font-press-start rounded hover:bg-[#FFE55C]"
              >
                CLOSE
              </button>
              <button
                onClick={handleDisconnect}
                className="flex-1 px-4 py-2 bg-[#FF4B4B] text-white font-press-start rounded hover:bg-[#FF6B6B]"
              >
                DISCONNECT
              </button>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default AccountModal;
