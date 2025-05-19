
import { useState, useCallback, useEffect } from 'react';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';

interface RetryOptions {
  initialDelay?: number;
  maxDelay?: number;
  maxRetries?: number;
  factor?: number;
  jitter?: boolean;
  retryOnNetworkChange?: boolean;
}

interface RetryState {
  retries: number;
  isRetrying: boolean;
  error: Error | null;
  lastTry: Date | null;
  nextRetryTimestamp: number | null;
}

const defaultOptions: RetryOptions = {
  initialDelay: 1000,
  maxDelay: 30000,
  maxRetries: 5,
  factor: 2,
  jitter: true,
  retryOnNetworkChange: true,
};

/**
 * Hook for implementing exponential backoff retries with network awareness
 * @param operation Function to retry
 * @param options Retry configuration options
 */
export function useNetworkRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
) {
  const mergedOptions = { ...defaultOptions, ...options };
  const { isOnline } = useConnectionStatus();
  const [state, setState] = useState<RetryState>({
    retries: 0,
    isRetrying: false,
    error: null,
    lastTry: null,
    nextRetryTimestamp: null,
  });
  
  const [result, setResult] = useState<T | null>(null);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  
  const calculateBackoff = useCallback(() => {
    const { initialDelay, maxDelay, factor, jitter, maxRetries } = mergedOptions;
    const retries = state.retries;
    
    if (retries >= (maxRetries || 5)) {
      return null; // No more retries
    }
    
    // Calculate delay with exponential backoff
    let delay = (initialDelay || 1000) * Math.pow(factor || 2, retries);
    
    // Apply maximum delay
    delay = Math.min(delay, maxDelay || 30000);
    
    // Apply jitter (±25%) if enabled
    if (jitter) {
      const jitterFactor = 0.75 + Math.random() * 0.5; // Random between 0.75 and 1.25
      delay = Math.floor(delay * jitterFactor);
    }
    
    return delay;
  }, [state.retries, mergedOptions]);
  
  // Core execute function
  const execute = useCallback(async () => {
    // Clear any existing timer
    if (timer) {
      clearTimeout(timer);
      setTimer(null);
    }
    
    if (!isOnline) {
      setState(prev => ({
        ...prev,
        error: new Error('Network offline. Will retry when connection is restored.'),
      }));
      return;
    }
    
    setState(prev => ({ ...prev, isRetrying: true, error: null }));
    
    try {
      const response = await operation();
      setResult(response);
      setState({
        retries: 0,
        isRetrying: false,
        error: null,
        lastTry: new Date(),
        nextRetryTimestamp: null,
      });
      return response;
    } catch (error) {
      const newRetryCount = state.retries + 1;
      const backoffDelay = calculateBackoff();
      const nextRetryTimestamp = backoffDelay ? Date.now() + backoffDelay : null;
      
      setState({
        retries: newRetryCount,
        isRetrying: false,
        error: error as Error,
        lastTry: new Date(),
        nextRetryTimestamp,
      });
      
      // Schedule next retry if we haven't reached max retries
      if (backoffDelay && isOnline) {
        const newTimer = setTimeout(() => {
          execute();
        }, backoffDelay);
        
        setTimer(newTimer);
      }
      
      throw error;
    }
  }, [operation, isOnline, state.retries, calculateBackoff, timer]);
  
  // Reset the state and counter
  const reset = useCallback(() => {
    if (timer) {
      clearTimeout(timer);
      setTimer(null);
    }
    
    setState({
      retries: 0,
      isRetrying: false,
      error: null,
      lastTry: null,
      nextRetryTimestamp: null,
    });
  }, [timer]);
  
  // Auto-retry when network comes back online if option is enabled
  useEffect(() => {
    if (
      mergedOptions.retryOnNetworkChange &&
      isOnline && 
      state.error && 
      state.retries > 0 && 
      !state.isRetrying
    ) {
      const delayedRetry = setTimeout(() => {
        execute();
      }, 1000); // Small delay to ensure network is stable
      
      return () => clearTimeout(delayedRetry);
    }
  }, [isOnline, state.error, state.retries, state.isRetrying, mergedOptions.retryOnNetworkChange, execute]);
  
  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [timer]);
  
  return {
    execute,
    reset,
    result,
    isRetrying: state.isRetrying,
    error: state.error,
    retries: state.retries,
    maxRetries: mergedOptions.maxRetries,
    nextRetryTimestamp: state.nextRetryTimestamp,
  };
}

export default useNetworkRetry;
