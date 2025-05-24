
/**
 * Options for the retryWithBackoff function
 */
export interface BackoffOptions {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffFactor: number;
  jitterFactor?: number;
  shouldRetry?: (error: any) => boolean;
}

/**
 * Retry a function call with exponential backoff and optional jitter
 * @param fn Function to retry
 * @param options Backoff configuration
 * @returns Promise resolving to the function result or rejecting with the last error
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: BackoffOptions
): Promise<T> {
  const {
    maxRetries,
    initialDelayMs,
    maxDelayMs,
    backoffFactor,
    jitterFactor = 0.1,
    shouldRetry = () => true,
  } = options;
  
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Attempt to call the function
      return await fn();
    } catch (error) {
      // Save the error for potential re-throw
      lastError = error;
      
      // Check if we should retry
      if (!shouldRetry(error) || attempt >= maxRetries) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        initialDelayMs * Math.pow(backoffFactor, attempt),
        maxDelayMs
      );
      
      // Add jitter to prevent synchronized retries
      const jitter = jitterFactor > 0 
        ? Math.random() * jitterFactor * delay * 2 - jitterFactor * delay
        : 0;
      
      const finalDelay = Math.max(0, Math.floor(delay + jitter));
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, finalDelay));
    }
  }
  
  // If we reached this point, all retries failed
  throw lastError;
}

/**
 * Creates a retry function with predefined options
 * @param defaultOptions Default backoff options
 * @returns Function that retries with the specified options
 */
export function createRetrier(defaultOptions: Partial<BackoffOptions> = {}) {
  return <T>(
    fn: () => Promise<T>,
    options?: Partial<BackoffOptions>
  ): Promise<T> => {
    const mergedOptions = {
      maxRetries: 3,
      initialDelayMs: 1000,
      maxDelayMs: 30000,
      backoffFactor: 2,
      jitterFactor: 0.1,
      ...defaultOptions,
      ...options
    } as BackoffOptions;
    
    return retryWithBackoff(fn, mergedOptions);
  };
}

/**
 * Predefined retrier for network operations
 */
export const retryNetworkOperation = createRetrier({
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffFactor: 1.5,
  jitterFactor: 0.2,
  shouldRetry: error => {
    // Retry network and server errors, but not client errors
    const status = error?.response?.status;
    return !status || status >= 500 || status === 429;
  }
});
