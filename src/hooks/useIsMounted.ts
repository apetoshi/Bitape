'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook to determine if a component has mounted.
 * Useful for avoiding hydration issues with server-side rendering.
 * 
 * @returns {boolean} True if component is mounted, false otherwise
 */
export function useIsMounted(): boolean {
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}

/**
 * A utility hook that always returns consistent values for conditional rendering
 * This helps prevent React hooks ordering issues
 */
export function useSafeHookValues<T>(value: T, defaultValue: T): T {
  const isMounted = useIsMounted();
  
  if (!isMounted) {
    return defaultValue;
  }
  
  return value;
} 