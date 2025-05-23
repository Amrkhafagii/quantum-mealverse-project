
import { useState, useCallback } from 'react';
import { BridgeError, getUserFriendlyErrorMessage } from '@/utils/errorHandling';
import { toast } from 'sonner';

export interface BridgeErrorHandlerOptions {
  showToast?: boolean;
  toastOptions?: {
    duration?: number;
    position?: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center';
  };
  onError?: (error: BridgeError | Error) => void;
}

/**
 * Hook to handle bridge errors gracefully in components
 */
export function useBridgeErrorHandler(options: BridgeErrorHandlerOptions = {}) {
  const { showToast = true, toastOptions = {}, onError } = options;
  const [lastError, setLastError] = useState<BridgeError | Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle bridge function execution with error handling
  const executeBridgeFunction = useCallback(async <T>(
    fn: () => Promise<T>,
    errorMessage: string = 'An error occurred'
  ): Promise<T | null> => {
    setIsLoading(true);
    setLastError(null);
    
    try {
      const result = await fn();
      return result;
    } catch (error) {
      // Convert to bridge error if not already
      const bridgeError = error && typeof error === 'object' && 'type' in error
        ? error as BridgeError 
        : error instanceof Error 
          ? error 
          : new Error(String(error));
      
      setLastError(bridgeError);
      
      // Call onError callback if provided
      if (onError) {
        onError(bridgeError);
      }
      
      // Show toast if enabled
      if (showToast) {
        const userMessage = getUserFriendlyErrorMessage(bridgeError);
        toast.error(userMessage, toastOptions);
      }
      
      console.error(errorMessage, bridgeError);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [showToast, toastOptions, onError]);
  
  // Clear last error
  const clearError = useCallback(() => {
    setLastError(null);
  }, []);
  
  return {
    executeBridgeFunction,
    lastError,
    isLoading,
    clearError,
    getUserFriendlyErrorMessage
  };
}

/**
 * Create a bridge-safe function wrapper that handles errors appropriately
 */
export function createBridgeSafeFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  errorHandler?: (error: any) => void
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>> | null> {
  return async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      if (errorHandler) {
        errorHandler(error);
      } else {
        const message = getUserFriendlyErrorMessage(error);
        toast.error(message);
        console.error('Bridge function error:', error);
      }
      return null;
    }
  };
}
