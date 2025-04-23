import React from 'react';
import Image from 'next/image';

const FullLogo: React.FC = () => {
  return (
    <div className="flex items-center">
      <div className="relative w-10 h-10 mr-2">
        <Image
          src="/bitape.png" 
          alt="BitApe Logo"
          width={40}
          height={40}
          className="object-contain"
          priority
        />
      </div>
      <div className="font-press-start text-lg tracking-wider">
        <span className="text-banana">B</span>
        <span className="text-banana">I</span>
        <span className="text-banana">T</span>
        <span className="ape-holographic-text">APE</span>
      </div>
    </div>
  );
};

export default FullLogo; 