'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useDisclosure } from '@chakra-ui/react';
import { useAccount } from 'wagmi';
import { FaHome, FaInfoCircle, FaExchangeAlt, FaBullhorn, FaUserFriends } from 'react-icons/fa';
import ReferralModal from './ReferralModal';
import { useGameState } from '@/hooks/useGameState';

const DockMenu: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isConnected, address } = useAccount();
  const { isOpen: isReferralOpen, onOpen: onReferralOpen, onClose: onReferralClose } = useDisclosure();
  const { totalReferrals, totalBitEarned } = useGameState();
  
  // Get the current route to highlight active item
  const isActive = (path: string) => {
    if (path === '/') {
      // Consider room pages as home
      return pathname === '/' || pathname?.startsWith('/room');
    }
    return pathname?.startsWith(path);
  };
  
  // Navigate or handle special routes
  const handleNavigate = (path: string, e: React.MouseEvent) => {
    if (path === '/refer') {
      e.preventDefault();
      onReferralOpen();
    } else if (path === '/' && isConnected && address) {
      e.preventDefault();
      router.push(`/room/${address}`);
    } else if (path !== pathname) {
      router.push(path);
    }
  };

  return (
    <>
      <nav className={`dock-menu md:hidden ${pathname?.startsWith('/room') ? 'hidden' : ''}`}>
        <Link 
          href="/" 
          className={`dock-item ${isActive('/') ? 'active' : ''}`}
          onClick={(e) => handleNavigate('/', e)}
        >
          <FaHome className="dock-icon" />
          <span className="dock-text">HOME</span>
        </Link>
        
        <Link 
          href="/about" 
          className={`dock-item ${isActive('/about') ? 'active' : ''}`}
          onClick={(e) => handleNavigate('/about', e)}
        >
          <FaInfoCircle className="dock-icon" />
          <span className="dock-text">ABOUT</span>
        </Link>
        
        <Link 
          href="/trade" 
          className={`dock-item ${isActive('/trade') ? 'active' : ''}`}
          onClick={(e) => handleNavigate('/trade', e)}
        >
          <FaExchangeAlt className="dock-icon" />
          <span className="dock-text">TRADE</span>
        </Link>
        
        <Link 
          href="/refer" 
          className={`dock-item ${isActive('/refer') ? 'active' : ''}`}
          onClick={(e) => handleNavigate('/refer', e)}
        >
          <FaUserFriends className="dock-icon" />
          <span className="dock-text">REFER</span>
        </Link>
        
        <Link 
          href="/announcements" 
          className={`dock-item ${isActive('/announcements') ? 'active' : ''}`}
          onClick={(e) => handleNavigate('/announcements', e)}
        >
          <FaBullhorn className="dock-icon" />
          <span className="dock-text">NEWS</span>
        </Link>
      </nav>
      
      <ReferralModal
        isOpen={isReferralOpen}
        onClose={onReferralClose}
        totalReferrals={totalReferrals || 0}
        totalBitEarned={totalBitEarned || '0'}
      />
    </>
  );
};

export default DockMenu; 