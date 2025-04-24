import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import ClientLayout from '@/components/ClientLayout';

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
  description: 'Mine BitApe with your virtual mining facility on ApeChain',
  manifest: '/manifest.json',
  metadataBase: new URL('https://www.bitape.org'),
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
    description: 'Mine BitApe with your virtual mining facility on ApeChain',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'BitApe Logo',
      },
    ],
    type: 'website',
    siteName: 'BitApe',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BitApe - A Peer-to-Peer Electronic Ape Cash System',
    description: 'Mine BitApe with your virtual mining facility on ApeChain',
    images: ['/opengraph-image.png'],
    creator: '@BitApeOrg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-US" suppressHydrationWarning>
      <body className={`${inter.className} bg-royal text-white overflow-x-hidden`}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
