'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component to catch JavaScript errors anywhere in the child component tree.
 * It logs error information and displays a fallback UI instead of crashing the entire app.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Uncaught error:', error, errorInfo);
    
    // Log the error to an error reporting service
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private resetError = () => {
    // Reset wallet connection data
    // Remove the localStorage clearing code
    
    // Reset the error state
    this.setState({ hasError: false, error: null });
    
    // Reload the page
    window.location.href = '/';
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default fallback UI
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50 p-4">
          <div className="bg-[#041e3a] p-6 rounded-lg border-2 border-[#ffc107] max-w-md w-full">
            <h2 className="text-[#ffc107] text-xl font-bold mb-4">Something went wrong</h2>
            <p className="text-white mb-4">
              The application encountered an unexpected error. This may be related to your wallet connection.
            </p>
            <div className="text-white text-sm bg-black bg-opacity-40 p-3 rounded mb-4 max-h-32 overflow-auto">
              <p>{this.state.error?.name}: {this.state.error?.message}</p>
            </div>
            <button 
              onClick={this.resetError}
              className="bg-[#ffc107] text-[#041e3a] font-bold py-2 px-4 rounded hover:bg-opacity-90 w-full"
            >
              Reset & Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 