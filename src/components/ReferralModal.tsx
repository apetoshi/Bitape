import React from 'react';
import { Dialog } from '@headlessui/react';
import { useAccount } from 'wagmi';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalReferrals: number;
  totalBitEarned: string;
}

const ReferralModal: React.FC<ReferralModalProps> = ({
  isOpen,
  onClose,
  totalReferrals,
  totalBitEarned
}) => {
  const { address } = useAccount();

  const referralLink = address 
    ? `https://bitape.tech?ref=${address}`
    : '';

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl bg-royal border-4 border-banana rounded-lg shadow-xl overflow-y-auto max-h-[90vh]">
          <div className="p-4 md:p-6">
            <Dialog.Title className="text-lg md:text-xl font-press-start text-center text-banana mb-4">
              REFER A FRIEND
            </Dialog.Title>
            
            <p className="text-xs md:text-sm font-press-start text-center text-white mb-6 md:mb-8">
              SHARE YOUR REFERRAL LINK WITH FRIENDS AND EARN A 2.5% BONUS OF WHATEVER $BIT THEY MINE!
            </p>

            <div className="bg-royal-dark p-3 md:p-4 mb-6 md:mb-8 rounded">
              <div className="flex flex-col sm:flex-row sm:justify-between mb-6 space-y-4 sm:space-y-0">
                <div>
                  <p className="font-press-start text-white text-xs md:text-sm mb-2">TOTAL REFERRALS</p>
                  <p className="font-press-start text-banana text-lg md:text-xl">{totalReferrals}</p>
                </div>
                <div className="sm:text-right">
                  <p className="font-press-start text-white text-xs md:text-sm mb-2">TOTAL BIT EARNED</p>
                  <p className="font-press-start text-banana text-lg md:text-xl">{totalBitEarned} $BIT</p>
                </div>
              </div>

              <p className="font-press-start text-white text-xs md:text-sm mb-2">YOUR REFERRAL LINK</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  readOnly
                  value={referralLink}
                  aria-label="Your referral link"
                  title="Your referral link"
                  className="flex-1 bg-royal font-press-start text-banana p-2 border-2 border-banana text-xs md:text-sm overflow-x-auto whitespace-nowrap"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(referralLink)}
                  className="px-6 py-2 bg-banana font-press-start text-royal hover:bg-banana-dark transition-colors text-xs md:text-sm whitespace-nowrap"
                >
                  COPY
                </button>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-transparent font-press-start text-banana border-2 border-banana hover:bg-banana hover:text-royal transition-colors text-xs md:text-sm"
              >
                CLOSE
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ReferralModal; 