
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

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
 * Error boundary specifically for biometric authentication components
 * Prevents biometric errors from crashing the entire application
 */
export class BiometricErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error in biometric authentication:", error, errorInfo);
    
    // Call the onError prop if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Provide minimal fallback UI
      return (
        <div className="text-sm text-amber-500 flex items-center gap-2 mt-2">
          <AlertTriangle className="h-4 w-4" />
          <span>Biometric authentication unavailable</span>
        </div>
      );
    }

    return this.props.children;
  }
}

export default BiometricErrorBoundary;
