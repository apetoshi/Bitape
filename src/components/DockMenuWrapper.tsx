'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const DockMenu = dynamic(() => import('./DockMenu'), {
  ssr: false
});

const DockMenuWrapper: React.FC = () => {
  return <DockMenu />;
};

export default DockMenuWrapper; 