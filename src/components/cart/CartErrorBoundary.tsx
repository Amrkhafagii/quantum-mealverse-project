
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { CartValidationService } from '@/services/cart/cartValidationService';

interface CartErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface CartErrorBoundaryProps {
  children: React.ReactNode;
  onError?: (error: Error) => void;
}

export class CartErrorBoundary extends React.Component<CartErrorBoundaryProps, CartErrorBoundaryState> {
  constructor(props: CartErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): CartErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Cart error caught by boundary:', error, errorInfo);
    
    // If it's a cart-related error, clear the cart
    if (error.message.includes('foreign key') || error.message.includes('menu_items')) {
      CartValidationService.clearStoredCart();
    }
    
    this.props.onError?.(error);
  }

  handleClearCart = () => {
    CartValidationService.clearStoredCart();
    this.setState({ hasError: false, error: undefined });
    window.location.reload(); // Force reload to reset cart state
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="holographic-card p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Cart Error</h3>
          <p className="text-gray-300 mb-4">
            There was an issue with your cart. This usually happens when items are no longer available.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={this.handleClearCart} variant="destructive">
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear Cart & Reload
            </Button>
            <Button onClick={this.handleRetry} variant="outline">
              Try Again
            </Button>
          </div>
          {this.state.error && (
            <details className="mt-4 text-left">
              <summary className="text-sm text-gray-400 cursor-pointer">Error Details</summary>
              <pre className="text-xs text-gray-500 mt-2 overflow-auto">
                {this.state.error.message}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
