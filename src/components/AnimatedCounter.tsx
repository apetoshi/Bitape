'use client';

import React, { useState, useEffect, useRef } from 'react';

interface AnimatedCounterProps {
  targetValue: number;
  offset?: number;
  duration?: number;
  formatFn?: (value: number) => string;
  className?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  targetValue,
  offset = 5000,
  duration = 8000, // 8 seconds for one full cycle
  formatFn = (value: number) => value.toFixed(2),
  className = '',
}) => {
  // Current displayed value
  const [displayValue, setDisplayValue] = useState(targetValue - offset);
  
  // Track animation state
  const [isAccelerating, setIsAccelerating] = useState(true);
  const [animationIntensity, setAnimationIntensity] = useState(0);
  
  // Reference to track the animation
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const prevTargetRef = useRef<number>(targetValue);
  
  // Function to start the animation cycle
  const startAnimation = () => {
    // Reset if the target value changed significantly
    if (Math.abs(prevTargetRef.current - targetValue) > offset / 10) {
      setDisplayValue(targetValue - offset);
      prevTargetRef.current = targetValue;
    }
    
    startTimeRef.current = Date.now();
    setIsAccelerating(true);
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // Start the animation loop
    animateCounter();
  };
  
  // Animation loop
  const animateCounter = () => {
    const now = Date.now();
    const elapsed = now - startTimeRef.current;
    const cycleProgress = (elapsed % duration) / duration;
    
    // Calculate current value based on progress
    let newValue;
    
    if (cycleProgress < 0.85) {
      // First 85% of the cycle: accelerate to target
      // Use easeInQuad for acceleration effect
      const easeProgress = cycleProgress / 0.85;
      const easeFactor = easeProgress * easeProgress;
      
      newValue = (targetValue - offset) + (offset * easeFactor);
      setIsAccelerating(true);
      
      // Increase the animation intensity as we approach the target
      const intensityValue = Math.min(easeFactor * 1.2, 1);
      setAnimationIntensity(intensityValue);
    } else {
      // Last 15% of the cycle: reset quickly
      const resetProgress = (cycleProgress - 0.85) / 0.15;
      
      // Use easeInQuad to make the reset look more natural
      const easeFactor = 1 - (1 - resetProgress) * (1 - resetProgress);
      
      newValue = targetValue - (offset * easeFactor);
      setIsAccelerating(false);
      
      // Decrease animation intensity during reset
      const intensityValue = Math.max(1 - resetProgress, 0);
      setAnimationIntensity(intensityValue);
    }
    
    // Update the display value
    setDisplayValue(newValue);
    
    // Continue the animation
    animationRef.current = requestAnimationFrame(animateCounter);
  };
  
  // Start the animation on mount and when the target changes
  useEffect(() => {
    startAnimation();
    
    // Cleanup on unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue]);
  
  // Determine dynamic styling based on animation state
  const dynamicStyle = {
    color: isAccelerating 
      ? `rgb(255, ${255 - Math.floor(animationIntensity * 130)}, ${70 - Math.floor(animationIntensity * 70)})`
      : '#FFDD00',
    transform: `scale(${1 + animationIntensity * 0.05})`,
    textShadow: `0 0 ${animationIntensity * 8}px rgba(255, 221, 0, ${animationIntensity * 0.8})`,
    transition: 'color 0.1s, transform 0.1s, text-shadow 0.1s'
  };
  
  return (
    <span className={className} style={dynamicStyle}>
      {formatFn(displayValue)}
    </span>
  );
};

export default AnimatedCounter; 