import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer 
      className="w-full py-1 border-t border-apecoin-blue/30 z-50 relative" 
      style={{
        background: 'var(--blue-gradient)',
        paddingBottom: `calc(0.5rem + env(safe-area-inset-bottom, 0px))`,
        boxShadow: '0 -2px 4px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center space-y-1">
          <div className="flex items-center">
            <Image
              src="/ApeChain/Powered by ApeCoin-1.png"
              alt="Powered by ApeCoin"
              width={110}
              height={30}
              className="hover:opacity-80 transition-opacity"
              priority
            />
          </div>
          
          <div className="flex justify-center space-x-4 items-center mt-1">
            <Link
              href="https://twitter.com/bitapexyz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-banana transition-colors py-1 px-2"
              aria-label="X (Twitter)"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </Link>
            <Link
              href="https://apechain.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-banana transition-colors py-1 px-2"
              aria-label="ApeChain"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
            </Link>
          </div>
        </div>
        
        <div className="mt-1 text-center">
          <div className="text-[10px] text-gm-blue/60 font-press-start">
            © {new Date().getFullYear()} BitApe - All rights reserved | Powered by <span className="text-apecoin-blue">ApeChain</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 