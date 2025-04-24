import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer 
      className="w-full py-4 border-t border-apecoin-blue/30 z-50 relative mt-auto" 
      style={{
        background: 'var(--blue-gradient)',
        paddingBottom: `calc(1rem + env(safe-area-inset-bottom, 0px))`,
        boxShadow: '0 -4px 6px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-8">
          <div className="flex items-center">
            <Image
              src="/ApeChain/Powered by ApeCoin.png"
              alt="Powered by ApeCoin"
              width={180}
              height={50}
              className="hover:opacity-80 transition-opacity"
              priority
            />
          </div>
          
          <div className="flex justify-center space-x-6 md:space-x-8 items-center">
            <Link
              href="https://twitter.com/bitapexyz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-banana transition-colors py-2 px-3"
              aria-label="Twitter"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
              </svg>
            </Link>
            <Link
              href="https://discord.gg/bitape"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-banana transition-colors py-2 px-3"
              aria-label="Discord"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.6869-.2762-5.4862 0-.1636-.3847-.4058-.874-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"></path>
              </svg>
            </Link>
            <Link
              href="https://apechain.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-banana transition-colors py-2 px-3"
              aria-label="ApeChain"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
            </Link>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 justify-items-center items-center mb-4">
            <div className="hidden md:block"></div>
            <div className="w-full max-w-xs">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-banana/50 to-transparent my-3"></div>
            </div>
            <div className="hidden md:block"></div>
          </div>
          
          <div className="text-xs text-gm-blue/80">
            © {new Date().getFullYear()} BitApe - All rights reserved
          </div>
          
          <div className="text-[10px] text-gm-blue/60 mt-1 font-press-start">
            Powered by <span className="text-apecoin-blue">ApeChain</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 