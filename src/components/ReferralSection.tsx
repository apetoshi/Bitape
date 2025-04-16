import { useGameState } from '@/hooks/useGameState';
import { useState } from 'react';
import { Dialog } from '@headlessui/react';
// ... existing code ... 

export const ReferralSection = () => {
  const { referralInfo } = useGameState();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
      >
        View Referral Info
      </button>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
            <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">
              Referral Information
            </Dialog.Title>
            
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Your referral code: {referralInfo?.referralCode || 'Loading...'}
              </p>
              <p className="text-sm text-gray-500">
                Total referrals: {referralInfo?.totalReferrals || 0}
              </p>
              <p className="text-sm text-gray-500">
                Rewards earned: {referralInfo?.rewardsEarned || 0}
              </p>
            </div>

            <div className="mt-4">
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                onClick={() => setIsOpen(false)}
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}; 