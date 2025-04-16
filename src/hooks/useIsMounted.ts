import { useState, useEffect } from 'react';

/**
 * Custom hook to determine if a component has mounted.
 * Useful for avoiding hydration issues with server-side rendering.
 * 
 * @returns {boolean} True if component is mounted, false otherwise
 */
export function useIsMounted() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted;
} 