import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useSearchParams } from 'next/navigation';

export const useReferral = () => {
  const { address } = useAccount();
  const searchParams = useSearchParams();
  const [referralAddress, setReferralAddress] = useState<string>('0x0000003b0d921e12Cc0CdB780b476F966bB16DaE');
  const [isReferralCaptured, setIsReferralCaptured] = useState<boolean>(false);

  useEffect(() => {
    // Check URL for referral
    const ref = searchParams?.get('ref');
    if (ref && ref.startsWith('0x') && ref.length === 42) {
      console.log('Referral found in URL:', ref);
      setReferralAddress(ref);
      setIsReferralCaptured(true);
      
      // Store in localStorage
      try {
        localStorage.setItem('referralAddress', ref);
        localStorage.setItem('referralCaptureTime', Date.now().toString());
      } catch (error) {
        console.error('Failed to save referral to localStorage:', error);
      }
    } else {
      // Check localStorage for saved referral
      try {
        const savedReferral = localStorage.getItem('referralAddress');
        if (savedReferral && savedReferral.startsWith('0x') && savedReferral.length === 42) {
          console.log('Referral found in localStorage:', savedReferral);
          setReferralAddress(savedReferral);
          setIsReferralCaptured(true);
        }
      } catch (error) {
        console.error('Failed to retrieve referral from localStorage:', error);
      }
    }
  }, [searchParams, address]);

  return {
    referralAddress,
    isReferralCaptured,
    // Default referral code
    DEFAULT_REFERRAL: '0x0000003b0d921e12Cc0CdB780b476F966bB16DaE'
  };
};

export default useReferral; 