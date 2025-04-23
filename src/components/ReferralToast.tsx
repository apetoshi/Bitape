'use client';

import React, { useState, useEffect } from 'react';
import { useReferral } from '@/hooks/useReferral';
import Image from 'next/image';

export function ReferralToast() {
  const { isReferralCaptured, referralAddress } = useReferral();
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    // Show toast when referral is captured
    if (isReferralCaptured) {
      setVisible(true);
      
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setVisible(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isReferralCaptured]);
  
  if (!visible) return null;
  
  // Format referral address for display
  const formatReferralAddress = (address: string) => {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-royal border border-banana px-4 py-3 rounded-lg shadow-lg max-w-sm animate-fadeIn">
      <div className="flex items-start">
        <div className="mr-3 mt-0.5">
          <Image 
            src="/apecoin.png" 
            alt="ApeCoin Logo" 
            width={20} 
            height={20} 
          />
        </div>
        <div>
          <h3 className="font-press-start text-banana text-xs mb-1">REFERRAL CAPTURED!</h3>
          <p className="text-white text-xs">
            You were invited by <span className="text-banana font-mono">{formatReferralAddress(referralAddress)}</span>
          </p>
        </div>
        <button 
          onClick={() => setVisible(false)}
          className="ml-3 text-white/60 hover:text-white"
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
} 