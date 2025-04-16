import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import Providers from '@/components/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BitApe - A Peer-to-Peer Electronic Ape Cash System',
  description: 'Mine BitApe tokens with your virtual mining facility on ApeChain',
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
      <body className={`${inter.className} bg-royal text-white`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
