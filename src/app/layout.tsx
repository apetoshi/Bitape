import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

// Move viewport configuration to a separate export
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 1,
  userScalable: true
};

export const metadata: Metadata = {
  title: 'BitApe - A Peer-to-Peer Electronic Ape Cash System',
  description: 'Mine BitApe tokens with your virtual mining facility on ApeChain',
  manifest: '/manifest.json',
  themeColor: '#000000',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'BitApe'
  },
  icons: {
    icon: '/bitape.png',
    apple: '/bitape.png',
  },
  openGraph: {
    title: 'BitApe - A Peer-to-Peer Electronic Ape Cash System',
    description: 'Mine BitApe tokens with your virtual mining facility on ApeChain',
    images: [
      {
        url: '/bitape.png',
        width: 800,
        height: 600,
        alt: 'BitApe Logo',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BitApe - A Peer-to-Peer Electronic Ape Cash System',
    description: 'Mine BitApe tokens with your virtual mining facility on ApeChain',
    images: ['/bitape.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-US" suppressHydrationWarning>
      <head>
        <Script id="wallet-connect-fix" strategy="beforeInteractive">
          {`
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
          `}
        </Script>
      </head>
      <body className={`${inter.className} bg-royal text-white overflow-x-hidden`}>
        {children}
      </body>
    </html>
  );
}
