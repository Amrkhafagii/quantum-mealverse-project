
import React, { useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';

interface RetryBoundaryProps {
  children: React.ReactNode;
  onRetry: () => Promise<any> | void;
  fallback?: React.ReactNode;
  retryText?: string;
  errorTitle?: string;
  errorDescription?: string;
  maxRetries?: number;
  className?: string;
}

export const RetryBoundary: React.FC<RetryBoundaryProps> = ({
  children,
  onRetry,
  fallback,
  retryText = "Retry",
  errorTitle = "Something went wrong",
  errorDescription = "We couldn't complete your request. Please try again.",
  maxRetries = 3,
  className = '',
}) => {
  const [error, setError] = useState<Error | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { isOnline } = useConnectionStatus();
  
  const handleRetry = async () => {
    if (retryCount >= maxRetries) {
      setError(new Error(`Maximum retry attempts (${maxRetries}) reached.`));
      return;
    }
    
    if (!isOnline) {
      setError(new Error('No internet connection. Please check your network.'));
      return;
    }
    
    setIsRetrying(true);
    
    try {
      await onRetry();
      setError(null);
      setRetryCount(0); // Reset count on success
    } catch (err) {
      setRetryCount(prev => prev + 1);
      setError(err as Error);
    } finally {
      setIsRetrying(false);
    }
  };
  
  // If there's an error, show the fallback or default error UI
  if (error) {
    if (fallback) {
      return <div className={className}>{fallback}</div>;
    }
    
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <span>{errorTitle}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{errorDescription}</p>
          <p className="text-sm text-muted-foreground mb-4">Error: {error.message}</p>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {retryCount > 0 ? `Attempts: ${retryCount}/${maxRetries}` : ''}
            </span>
            
            <Button 
              onClick={handleRetry} 
              disabled={isRetrying || retryCount >= maxRetries || !isOnline}
              variant="default"
              size="sm"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {retryText}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return <>{children}</>;
};

export default RetryBoundary;
