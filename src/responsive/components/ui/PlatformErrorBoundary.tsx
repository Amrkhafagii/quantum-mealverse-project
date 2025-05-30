
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  platformSpecific?: boolean;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class PlatformErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Platform Error Boundary caught an error:', error, errorInfo);
    
    // Log platform-specific errors differently
    if (this.props.platformSpecific) {
      console.error('Platform-specific error detected:', error.message);
    }
  }

  render() {
    if (this.state.hasError) {
      // Return fallback UI or a simple error message
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <h3 className="text-red-800 font-medium">Something went wrong</h3>
          <p className="text-red-600 text-sm mt-1">
            {this.props.platformSpecific 
              ? 'A platform-specific feature encountered an error.'
              : 'An error occurred while rendering this component.'
            }
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PlatformErrorBoundary;
