'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-royal">
      {/* Header */}
      <header className="nav-bar flex justify-between items-center px-6 py-4 border-b border-banana/20">
        <Link href="/" className="flex items-center">
          <Image
            src="/bitape.png"
            alt="BitApe Logo"
            width={64}
            height={64}
            className="hover:opacity-80 transition-opacity"
            priority
          />
        </Link>
      </header>

      {/* PDF Viewer */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-black/50 rounded-lg shadow-lg overflow-hidden h-[calc(100vh-8rem)]">
          <object
            data="/bitape-whitepaper.pdf"
            type="application/pdf"
            className="w-full h-full"
          >
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <p className="text-white text-center p-4 font-press-start">
                PDF viewer not supported in your browser.
              </p>
              <a 
                href="/bitape-whitepaper.pdf" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-banana hover:text-white transition-colors font-press-start text-sm px-6 py-2 border-2 border-banana hover:bg-banana/20"
              >
                Open PDF in New Tab
              </a>
              <a 
                href="/bitape-whitepaper.pdf" 
                download 
                className="text-banana hover:text-white transition-colors font-press-start text-sm px-6 py-2 border-2 border-banana hover:bg-banana/20"
              >
                Download PDF
              </a>
            </div>
          </object>
        </div>
      </div>
    </div>
  );
} 