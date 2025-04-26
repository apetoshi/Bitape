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
  userScalable: true,
  themeColor: '#000000'
};

export const metadata: Metadata = {
  title: 'BitApe - A Peer-to-Peer Electronic Ape Cash System',
  description: 'Mine BitApe with your virtual mining facility on ApeChain',
  manifest: '/manifest.json',
  metadataBase: new URL('https://www.bitape.org'),
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
    url: 'https://www.bitape.org',
    siteName: 'BitApe',
    images: [
      {
        url: 'https://www.bitape.org/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'BitApe Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BitApe - A Peer-to-Peer Electronic Ape Cash System',
    description: 'Mine BitApe with your virtual mining facility on ApeChain',
    site: '@BitApeOrg',
    creator: '@BitApeOrg',
    images: ['https://www.bitape.org/opengraph-image.png'],
  },
  alternates: {
    canonical: 'https://www.bitape.org',
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
        {/* Manual OpenGraph and Twitter tags for maximum compatibility */}
        <meta property="og:title" content="BitApe - A Peer-to-Peer Electronic Ape Cash System" />
        <meta property="og:description" content="Mine BitApe with your virtual mining facility on ApeChain" />
        <meta property="og:image" content="https://www.bitape.org/opengraph-image.png" />
        <meta property="og:url" content="https://www.bitape.org" />
        <meta property="og:site_name" content="BitApe" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="BitApe - A Peer-to-Peer Electronic Ape Cash System" />
        <meta name="twitter:description" content="Mine BitApe with your virtual mining facility on ApeChain" />
        <meta name="twitter:image" content="https://www.bitape.org/opengraph-image.png" />
        <meta name="twitter:site" content="@BitApeOrg" />
        <meta name="twitter:creator" content="@BitApeOrg" />
      </head>
      <body className={`${inter.className} bg-royal text-white overflow-x-hidden`}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
