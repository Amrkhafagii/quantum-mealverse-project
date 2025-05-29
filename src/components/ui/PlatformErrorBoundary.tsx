
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Platform } from '@/utils/platform';
import { AlertTriangle, RefreshCw, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  platformSpecific?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class PlatformErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Platform-specific error caught:", error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
    
    // Log platform-specific context
    console.error("Platform context:", {
      isIOS: Platform.isIOS(),
      isAndroid: Platform.isAndroid(),
      isWeb: Platform.isWeb(),
      isNative: Platform.isNative(),
      userAgent: navigator.userAgent
    });
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isPlatformSpecific = this.props.platformSpecific && 
        (this.state.error?.message.includes('platform') || 
         this.state.error?.message.includes('native') ||
         this.state.error?.message.includes('iOS') ||
         this.state.error?.message.includes('Android'));

      return (
        <div className="p-6 bg-quantum-darkBlue/50 border border-red-500/30 rounded-lg text-center">
          <div className="flex items-center justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-red-500 mr-2" />
            {isPlatformSpecific && (
              <Smartphone className="h-8 w-8 text-yellow-500" />
            )}
          </div>
          
          <h2 className="text-xl font-bold mb-2">
            {isPlatformSpecific ? 'Platform Compatibility Issue' : 'Something went wrong'}
          </h2>
          
          <p className="text-gray-400 mb-4">
            {isPlatformSpecific 
              ? `This feature may not be fully supported on ${Platform.getPlatformName()}`
              : (this.state.error?.message || "An unexpected error occurred")
            }
          </p>
          
          {isPlatformSpecific && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
              <p className="text-yellow-400 text-sm">
                Platform: {Platform.getPlatformName()} | 
                Device: {Platform.isMobile() ? 'Mobile' : 'Desktop'}
              </p>
            </div>
          )}
          
          <div className="flex justify-center space-x-4">
            <Button 
              variant="outline"
              className="border-quantum-cyan/30"
              onClick={this.handleReset}
            >
              Try Again
            </Button>
            <Button
              className="bg-quantum-cyan hover:bg-quantum-cyan/80 text-quantum-black"
              onClick={this.handleReload}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload Page
            </Button>
          </div>
          
          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 mb-2">
                Debug Information
              </summary>
              <pre className="text-xs bg-black/20 p-2 rounded overflow-auto">
                {this.state.error?.stack}
                {'\n\n'}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default PlatformErrorBoundary;
