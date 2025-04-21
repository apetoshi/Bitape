'use client';

import dynamic from 'next/dynamic';

const WalletRecovery = dynamic(() => import('@/components/WalletRecovery'), { 
  ssr: false 
});

export default function ClientWalletRecovery() {
  return <WalletRecovery />;
} 