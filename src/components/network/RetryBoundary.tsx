
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface RetryBoundaryProps {
  children: React.ReactNode;
  onRetry?: () => Promise<void> | void;
  retryText?: string;
  errorTitle?: string;
  errorDescription?: string;
}

const RetryBoundary: React.FC<RetryBoundaryProps> = ({
  children,
  onRetry,
  retryText = "Retry",
  errorTitle = "Something went wrong",
  errorDescription = "There was an error loading this content."
}) => {
  const [hasError, setHasError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  
  const handleRetry = async () => {
    if (!onRetry) return;
    
    setIsRetrying(true);
    try {
      await onRetry();
      setHasError(false);
    } catch (error) {
      console.error('Retry failed:', error);
      setHasError(true);
    } finally {
      setIsRetrying(false);
    }
  };
  
  if (hasError) {
    return (
      <div className="rounded-md border border-gray-200 dark:border-gray-800 p-6 flex flex-col items-center justify-center text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-gray-400" />
        <div>
          <h3 className="text-lg font-medium mb-1">{errorTitle}</h3>
          <p className="text-sm text-muted-foreground">{errorDescription}</p>
        </div>
        <Button 
          onClick={handleRetry} 
          disabled={isRetrying} 
          className="mt-2"
        >
          {isRetrying ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Retrying...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              {retryText}
            </>
          )}
        </Button>
      </div>
    );
  }
  
  return <>{children}</>;
};

export default RetryBoundary;
