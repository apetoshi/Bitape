import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import Providers from '@/components/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BitApe - A Peer-to-Peer Electronic Ape Cash System',
  description: 'Mine BitApe tokens with your virtual mining facility on ApeChain',
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
