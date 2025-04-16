import React from 'react';
import { Dialog } from '@headlessui/react';
import { useAccount } from 'wagmi';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalReferrals: number;
  totalBigEarned: string;
}

const ReferralModal: React.FC<ReferralModalProps> = ({
  isOpen,
  onClose,
  totalReferrals,
  totalBigEarned
}) => {
  const { address } = useAccount();

  const referralLink = address 
    ? `https://www.bigcoin.tech?ref=${address}`
    : '';

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl bg-royal border-4 border-banana rounded-lg shadow-xl">
          <div className="p-6">
            <Dialog.Title className="text-xl font-press-start text-center text-banana mb-4">
              REFER A FRIEND
            </Dialog.Title>
            
            <p className="text-sm font-press-start text-center text-white mb-8">
              SHARE YOUR REFERRAL LINK WITH FRIENDS AND EARN A 2.5% BONUS OF WHATEVER BIGCOIN THEY MINE!
            </p>

            <div className="bg-royal-dark p-4 mb-8 rounded">
              <div className="flex justify-between mb-6">
                <div>
                  <p className="font-press-start text-white mb-2">TOTAL REFERRALS</p>
                  <p className="font-press-start text-banana text-xl">{totalReferrals}</p>
                </div>
                <div>
                  <p className="font-press-start text-white mb-2">TOTAL BIG EARNED</p>
                  <p className="font-press-start text-banana text-xl">{totalBigEarned} $BIG</p>
                </div>
              </div>

              <p className="font-press-start text-white mb-2">YOUR REFERRAL LINK</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={referralLink}
                  aria-label="Your referral link"
                  title="Your referral link"
                  className="flex-1 bg-royal font-press-start text-banana p-2 border-2 border-banana"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(referralLink)}
                  className="px-6 py-2 bg-banana font-press-start text-royal hover:bg-banana-dark transition-colors"
                >
                  COPY
                </button>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-transparent font-press-start text-banana border-2 border-banana hover:bg-banana hover:text-royal transition-colors"
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