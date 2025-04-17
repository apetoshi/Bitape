'use client';

import React from 'react';
import { usePWA } from '@/hooks/usePWA';

export default function PWAInstallButton() {
  const { canInstall, installApp } = usePWA();

  if (!canInstall) return null;

  return (
    <button
      onClick={installApp}
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-banana text-royal font-press-start py-2 px-4 rounded-lg shadow-lg flex items-center space-x-2 z-50 text-xs md:text-sm border-2 border-royal"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      <span>INSTALL APP</span>
    </button>
  );
} 