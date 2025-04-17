import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import Providers from '@/components/Providers';
import DockMenuWrapper from '@/components/DockMenuWrapper';

const inter = Inter({ subsets: ['latin'] });

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
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    minimumScale: 1,
    userScalable: true
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
    <html lang="en-US">
      <body className={`${inter.className} bg-royal text-white overflow-x-hidden`}>
        <Providers>
          {children}
          <DockMenuWrapper />
        </Providers>
      </body>
    </html>
  );
}
