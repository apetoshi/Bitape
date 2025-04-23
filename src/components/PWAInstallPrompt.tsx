'use client';

import { useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const PWAInstallPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Define the event handler
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Store the event so it can be triggered later
      setInstallPrompt(e as BeforeInstallPromptEvent);
      // Update UI to show install button
      setIsInstallable(true);
      
      // Show the install prompt after 15 seconds if user hasn't dismissed it
      setTimeout(() => {
        setIsVisible(true);
      }, 15000);
    };

    // Add event listener
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);

    // Check if PWA is already installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
      // Log to analytics
      console.log('PWA was installed');
      // Hide the prompt
      setIsVisible(false);
    });

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
      window.removeEventListener('appinstalled', () => {});
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    // Show the install prompt
    await installPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const choiceResult = await installPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // Clear the saved prompt since it can't be used again
    setInstallPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Don't show the prompt again for this session
    // You could also set a localStorage flag to remember this preference
    localStorage.setItem('pwaPromptDismissed', Date.now().toString());
  };

  if (!isInstallable || isInstalled || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-50 animate-slide-up">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg">Install App</h3>
        <button 
          onClick={handleDismiss}
          className="text-gray-400 hover:text-white focus:outline-none"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      <p className="mb-3">Install Bitape for faster access and a better experience when you're offline.</p>
      <div className="flex justify-end space-x-2">
        <button 
          onClick={handleDismiss}
          className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 transition"
        >
          Not now
        </button>
        <button 
          onClick={handleInstallClick}
          className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 transition"
        >
          Install
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt; 