"use client";

import { useAccount } from 'wagmi';
import GameLayout from '@/components/GameLayout';
import LandingPage from '@/components/LandingPage';

export default function Home() {
  const { isConnected } = useAccount();
  
  return isConnected ? <GameLayout /> : <LandingPage />;
}
