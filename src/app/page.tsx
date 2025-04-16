"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import LandingPage from '@/components/LandingPage';

export default function Home() {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  
  useEffect(() => {
    if (isConnected && address) {
      router.push(`/room/${address}`);
    }
  }, [isConnected, address, router]);

  return <LandingPage />;
}
