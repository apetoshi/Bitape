'use client';

import React from 'react';
import Script from 'next/script';
import Providers from '@/components/Providers';

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  return (
    <Providers>
      <Script
        id="wallet-connect-fix"
        strategy="afterInteractive"
      >{`
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            // Try to clean up potentially corrupted WalletConnect data
            try {
              // More comprehensive wallet data cleanup
              const walletKeys = [
                'walletconnect', 'WALLETCONNECT_DEEPLINK_CHOICE',
                'wc@2:client:0.3', 'wc@2:core:0.3:injected', 'wc@2:core:0.3:2',
                'wagmi.wallet', 'wagmi.connectors', 'wagmi.connected'
              ];
              
              walletKeys.forEach(key => {
                try {
                  const value = window.localStorage.getItem(key);
                  if (value) {
                    try {
                      // Try to parse JSON data
                      if (value.startsWith('{') || value.startsWith('[')) {
                        JSON.parse(value);
                      }
                    } catch (e) {
                      console.warn('Found corrupted wallet data: ' + key + ', removing it');
                      window.localStorage.removeItem(key);
                    }
                  }
                } catch (e) {
                  // If any error occurs while checking, remove the key
                  console.warn('Error checking ' + key + ', removing it');
                  window.localStorage.removeItem(key);
                }
              });

              // Add a connection recovery mechanism
              window.addEventListener('error', function(event) {
                // Check if error is related to wallet connection
                if (event.message && (
                  event.message.includes('walletconnect') || 
                  event.message.includes('Wallet') ||
                  event.message.includes('connect')
                )) {
                  console.warn('Detected wallet connection error, attempting recovery');
                  // Add a button to attempt recovery
                  if (!document.getElementById('wallet-recovery-btn')) {
                    setTimeout(() => {
                      try {
                        const btn = document.createElement('button');
                        btn.id = 'wallet-recovery-btn';
                        btn.innerText = 'Reconnect Wallet';
                        btn.style.position = 'fixed';
                        btn.style.bottom = '10px';
                        btn.style.right = '10px';
                        btn.style.zIndex = '9999';
                        btn.style.padding = '8px 16px';
                        btn.style.background = '#FFD700';
                        btn.style.color = '#000';
                        btn.style.border = 'none';
                        btn.style.borderRadius = '4px';
                        btn.style.cursor = 'pointer';
                        btn.onclick = function() {
                          // Clear wallet data and reload
                          walletKeys.forEach(k => window.localStorage.removeItem(k));
                          window.location.reload();
                        };
                        document.body.appendChild(btn);
                      } catch (e) {
                        console.error('Failed to add recovery button', e);
                      }
                    }, 2000);
                  }
                }
              });
            } catch (e) {
              console.warn('Error in wallet connection cleanup:', e);
            }
          }
        } catch (e) {
          console.error('Error in cleanup script:', e);
        }
      `}</Script>
      {children}
    </Providers>
  );
};

export default ClientLayout; 