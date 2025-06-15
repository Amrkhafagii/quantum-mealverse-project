
import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { OrderErrorService } from './OrderErrorService';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorCode: string;
  retryCount: number;
}

export class OrderErrorBoundary extends Component<Props, State> {
  private errorService: OrderErrorService;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorCode: '',
      retryCount: 0
    };
    this.errorService = new OrderErrorService();
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorCode: 'COMPONENT_ERROR',
      retryCount: 0
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('OrderErrorBoundary caught an error:', error, errorInfo);
    
    const handledError = this.errorService.handleOrderError(error);
    this.setState({ errorCode: handledError.code });
    
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    if (this.state.retryCount < 3) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorCode: '',
        retryCount: prevState.retryCount + 1
      }));
    } else {
      // Max retries reached, reload page
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="holographic-card border-red-500/30 max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Something went wrong
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300">
              {this.state.error?.message || 'An unexpected error occurred while processing your order.'}
            </p>
            
            <div className="flex gap-2">
              <Button 
                onClick={this.handleRetry}
                className="flex-1"
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {this.state.retryCount < 3 ? 'Try Again' : 'Reload Page'}
              </Button>
              
              <Button 
                onClick={() => window.location.href = '/'}
                variant="secondary"
              >
                Go Home
              </Button>
            </div>
            
            {this.state.retryCount > 0 && (
              <p className="text-sm text-gray-400">
                Retry attempts: {this.state.retryCount}/3
              </p>
            )}
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
