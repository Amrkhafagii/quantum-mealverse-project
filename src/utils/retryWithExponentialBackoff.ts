
/**
 * Options for configuring exponential backoff retries
 */
export interface BackoffOptions {
  initialDelayMs: number;
  maxDelayMs: number;
  maxRetries: number;
  backoffFactor: number;
  jitterFactor?: number;
}

/**
 * Default options for exponential backoff
 */
export const DEFAULT_BACKOFF_OPTIONS: BackoffOptions = {
  initialDelayMs: 1000, // Start with 1 second
  maxDelayMs: 60000,    // Cap at 1 minute
  maxRetries: 5,        // Maximum 5 retry attempts
  backoffFactor: 2,     // Double the delay each time
  jitterFactor: 0.2     // Add randomness to prevent thundering herd
};

/**
 * Calculate the next delay for exponential backoff
 * @param retryAttempt Current retry attempt number (0-based)
 * @param options Backoff configuration options
 * @returns Delay in milliseconds before next retry
 */
export const calculateBackoffDelay = (
  retryAttempt: number,
  options: BackoffOptions = DEFAULT_BACKOFF_OPTIONS
): number => {
  const { initialDelayMs, maxDelayMs, backoffFactor, jitterFactor } = options;
  
  // Calculate base delay with exponential growth
  let delay = initialDelayMs * Math.pow(backoffFactor, retryAttempt);
  
  // Apply jitter to prevent synchronized retries
  if (jitterFactor) {
    const jitterRange = delay * jitterFactor;
    delay += (Math.random() * jitterRange * 2) - jitterRange;
  }
  
  // Cap at maximum delay
  return Math.min(delay, maxDelayMs);
};

/**
 * Retry a function with exponential backoff
 * @param fn Function to retry
 * @param options Backoff configuration options
 * @returns Promise resolving to the function result
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  options: BackoffOptions = DEFAULT_BACKOFF_OPTIONS
): Promise<T> => {
  const { maxRetries } = options;
  let retryAttempt = 0;
  
  while (true) {
    try {
      return await fn();
    } catch (error) {
      retryAttempt++;
      
      // If we've exceeded max retries, throw the error
      if (retryAttempt >= maxRetries) {
        console.error(`Failed after ${maxRetries} retries:`, error);
        throw error;
      }
      
      // Calculate delay for next attempt
      const delayMs = calculateBackoffDelay(retryAttempt, options);
      console.log(`Retry attempt ${retryAttempt} in ${Math.round(delayMs / 1000)}s`);
      
      // Wait for the calculated delay
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
};

/**
 * Queue an operation for retry with completion tracking
 */
export const queueWithRetry = <T>(
  fn: () => Promise<T>,
  options: BackoffOptions = DEFAULT_BACKOFF_OPTIONS
): { 
  promise: Promise<T>;
  cancel: () => void;
  isPending: () => boolean;
} => {
  let isCancelled = false;
  let isPending = true;
  
  const promise = new Promise<T>(async (resolve, reject) => {
    try {
      const result = await retryWithBackoff(
        async () => {
          if (isCancelled) {
            throw new Error('Operation was cancelled');
          }
          return fn();
        },
        options
      );
      
      isPending = false;
      resolve(result);
    } catch (error) {
      isPending = false;
      reject(error);
    }
  });
  
  return {
    promise,
    cancel: () => { isCancelled = true; },
    isPending: () => isPending
  };
};
