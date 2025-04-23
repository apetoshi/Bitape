import { useEffect, useState } from 'react';
import { isAddress } from 'viem';

// Default referral address if none provided
const DEFAULT_REFERRAL = '0x0000003b0d921e12Cc0CdB780b476F966bB16DaE';

export function useReferral() {
  const [referralAddress, setReferralAddress] = useState<string>(DEFAULT_REFERRAL);
  const [isReferralCaptured, setIsReferralCaptured] = useState(false);

  // Process referral on page load
  useEffect(() => {
    // Function to handle referral logic
    const processReferral = () => {
      // First check if we already have a stored referral
      const storedReferral = localStorage.getItem('bitape_referral');
      
      if (storedReferral && isAddress(storedReferral)) {
        // Use the stored referral and don't overwrite it
        setReferralAddress(storedReferral);
        return;
      }
      
      // If no stored referral, check URL parameters
      try {
        // Get referral from URL if present
        const urlParams = new URLSearchParams(window.location.search);
        const refParam = urlParams.get('ref');
        
        if (refParam && isAddress(refParam)) {
          // Valid Ethereum address found in URL
          localStorage.setItem('bitape_referral', refParam);
          setReferralAddress(refParam);
          setIsReferralCaptured(true);
          console.log('Referral captured:', refParam);
          return;
        }
      } catch (error) {
        console.error('Error processing referral:', error);
      }
      
      // If no valid referral in storage or URL, use default and store it
      localStorage.setItem('bitape_referral', DEFAULT_REFERRAL);
      setReferralAddress(DEFAULT_REFERRAL);
    };
    
    // Execute the referral processing
    processReferral();
  }, []);

  // Generate referral link for current user
  const generateReferralLink = (address: string) => {
    if (!address || !isAddress(address)) return '';
    
    // Build absolute URL regardless of current path
    const baseUrl = 'https://bitape.org';
    return `${baseUrl}?ref=${address}`;
  };

  return {
    referralAddress,
    isReferralCaptured,
    generateReferralLink
  };
} 