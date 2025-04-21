'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { cleanupWalletStorage, cleanupModalElements, resetWalletState } from '@/utils/walletUtils';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isRecovering: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    isRecovering: false
  };

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error, errorInfo: null, isRecovering: false };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to console
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Check if this is a wallet-related error
    const errorMessage = error.message?.toLowerCase() || '';
    const isWalletError = 
      errorMessage.includes('wallet') || 
      errorMessage.includes('ethereum') || 
      errorMessage.includes('metamask') || 
      errorMessage.includes('web3') || 
      errorMessage.includes('connect') ||
      errorMessage.includes('provider');
    
    if (isWalletError) {
      console.log('Detected wallet-related error, attempting automatic recovery...');
      this.attemptAutoRecovery();
    } else {
      // For non-wallet errors, try a basic cleanup
      try {
        cleanupWalletStorage();
        cleanupModalElements();
      } catch (cleanupError) {
        console.warn('Error during cleanup after crash:', cleanupError);
      }
    }
  }
  
  attemptAutoRecovery = () => {
    this.setState({ isRecovering: true });
    
    // Wait a moment before attempting recovery
    setTimeout(async () => {
      try {
        // Try to reset wallet state without page reload
        await resetWalletState(false);
        
        // After cleanup, try to recover the component
        this.setState({ 
          hasError: false, 
          error: null, 
          errorInfo: null,
          isRecovering: false
        });
      } catch (recoveryError) {
        console.error('Error during auto-recovery:', recoveryError);
        this.setState({ isRecovering: false });
      }
    }, 1000);
  };

  handleReset = () => {
    // Do a full reset with page reload
    resetWalletState(true);
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      return this.props.fallback || (
        <div className="flex items-center justify-center min-h-screen bg-[#001020] text-white p-4">
          <div className="max-w-md w-full bg-[#0a1f2f] p-6 rounded-lg border-2 border-yellow-400 shadow-xl">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-press-start text-yellow-400 mb-2">Something went wrong</h2>
              <p className="text-sm text-gray-300 mb-4">
                We encountered an error while loading the application. This is often caused by a wallet connection issue.
              </p>
              
              {/* Display error message */}
              <div className="bg-[#152535] p-3 rounded text-left mb-4 overflow-auto max-h-40">
                <p className="text-red-400 text-xs font-mono">
                  {this.state.error?.message || 'Unknown error occurred'}
                </p>
              </div>
              
              {this.state.isRecovering && (
                <div className="my-4 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                  <p className="ml-3 text-yellow-400">Attempting to recover...</p>
                </div>
              )}
            </div>
            
            <div className="flex flex-col space-y-3">
              <button
                onClick={this.attemptAutoRecovery}
                disabled={this.state.isRecovering}
                className={`w-full p-3 ${this.state.isRecovering 
                  ? 'bg-gray-500 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600'} text-white font-press-start text-sm rounded focus:outline-none transition-colors`}
              >
                TRY AGAIN
              </button>
              
              <button
                onClick={this.handleReset}
                className="w-full p-3 bg-yellow-500 hover:bg-yellow-600 text-black font-press-start text-sm rounded focus:outline-none transition-colors"
              >
                RESET APPLICATION
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 