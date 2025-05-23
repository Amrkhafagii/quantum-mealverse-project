
/**
 * Error handling utilities for JavaScript-to-Native bridge communications
 */

// Standardized error types to help classify bridge errors
export enum BridgeErrorType {
  INITIALIZATION = 'initialization_error',
  PERMISSION = 'permission_error',
  COMMUNICATION = 'communication_error',
  TIMEOUT = 'timeout_error',
  STORAGE = 'storage_error',
  LOCATION = 'location_error',
  UNKNOWN = 'unknown_error'
}

// Interface for structured bridge errors
export interface BridgeError {
  type: BridgeErrorType;
  code: string;
  message: string;
  originalError?: any;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Create a standardized bridge error object
 */
export function createBridgeError(
  type: BridgeErrorType,
  message: string,
  code: string = 'unknown',
  originalError?: any,
  metadata?: Record<string, any>
): BridgeError {
  return {
    type,
    code,
    message,
    originalError,
    timestamp: Date.now(),
    metadata
  };
}

/**
 * Log a bridge error with enhanced details
 */
export function logBridgeError(error: BridgeError): void {
  const details = {
    ...error,
    originalError: error.originalError ? String(error.originalError) : undefined
  };
  
  console.error(`BRIDGE ERROR [${error.type}][${error.code}]: ${error.message}`, details);
}

/**
 * Parse and enhance native error messages
 */
export function parseNativeError(error: any): BridgeError {
  // Default values
  let type = BridgeErrorType.UNKNOWN;
  let code = 'unknown';
  let message = 'An unknown error occurred in native bridge';
  
  try {
    // Try to extract structured error data
    if (typeof error === 'string') {
      // Simple string error
      message = error;
    } else if (error instanceof Error) {
      // Standard JS Error object
      message = error.message;
    } else if (error && typeof error === 'object') {
      // Capacitor or custom error object
      message = error.message || error.error?.message || String(error);
      
      // Try to determine error type based on content
      if (message.includes('permission') || message.includes('authorize')) {
        type = BridgeErrorType.PERMISSION;
      } else if (message.includes('timeout') || message.includes('timed out')) {
        type = BridgeErrorType.TIMEOUT;
      } else if (message.includes('storage') || message.includes('database')) {
        type = BridgeErrorType.STORAGE;
      } else if (message.includes('location')) {
        type = BridgeErrorType.LOCATION;
      }
      
      // Extract error code if available
      code = error.code || error.error?.code || 'unknown';
    }
    
    // Create the structured error
    return createBridgeError(type, message, code, error);
  } catch (parseError) {
    // Fallback for errors that occur during parsing
    return createBridgeError(
      BridgeErrorType.UNKNOWN,
      'Failed to parse native error',
      'parse_error',
      error
    );
  }
}

/**
 * Wrap a native bridge function with standardized error handling
 */
export function withBridgeErrorHandling<T extends (...args: any[]) => Promise<any>>(
  functionName: string,
  fn: T,
  options: {
    retryCount?: number;
    retryDelay?: number;
    timeout?: number;
    fallback?: (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>;
  } = {}
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
  
  return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    const { retryCount = 0, retryDelay = 500, timeout } = options;
    let attempts = 0;
    
    const executeWithRetry = async (): Promise<Awaited<ReturnType<T>>> => {
      attempts++;
      
      try {
        console.log(`BRIDGE [${functionName}]: Executing (attempt ${attempts}/${retryCount + 1})`, 
          args.length > 0 ? { args } : '');
        
        // Create a promise that can timeout
        let timeoutId: ReturnType<typeof setTimeout> | undefined;
        
        const timeoutPromise = new Promise<never>((_, reject) => {
          if (timeout) {
            timeoutId = setTimeout(() => {
              const timeoutError = createBridgeError(
                BridgeErrorType.TIMEOUT,
                `Bridge call to ${functionName} timed out after ${timeout}ms`,
                'timeout'
              );
              reject(timeoutError);
            }, timeout);
          }
        });
        
        // Execute the function with timeout race
        const result = await (timeout
          ? Promise.race([fn(...args), timeoutPromise])
          : fn(...args));
          
        // Clear timeout if it was set
        if (timeoutId) clearTimeout(timeoutId);
        
        console.log(`BRIDGE [${functionName}]: Success`);
        return result as Awaited<ReturnType<T>>;
      } catch (error) {
        const bridgeError = parseNativeError(error);
        bridgeError.metadata = {
          ...bridgeError.metadata,
          functionName,
          attempt: attempts,
          args: args.length > 0 ? JSON.stringify(args) : undefined
        };
        
        logBridgeError(bridgeError);
        
        // Determine if we should retry
        if (attempts <= retryCount) {
          console.warn(`BRIDGE [${functionName}]: Retrying in ${retryDelay}ms (attempt ${attempts}/${retryCount + 1})`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return executeWithRetry();
        }
        
        // If we have a fallback and have exhausted retries, use it
        if (options.fallback) {
          console.warn(`BRIDGE [${functionName}]: Using fallback after ${attempts} failed attempts`);
          return options.fallback(...args);
        }
        
        // No more retries and no fallback, rethrow with enhanced error
        throw bridgeError;
      }
    };
    
    return executeWithRetry();
  };
}

/**
 * Create a bridge safe-caller that handles all errors with detailed messaging
 */
export function createSafeBridge<T>(
  bridgeName: string,
  bridge: T,
  defaultOptions: {
    retryCount?: number;
    retryDelay?: number;
    timeout?: number;
  } = {}
): T {
  // Create a new object with the same shape as the original
  const safeBridge = {} as T;
  
  // Iterate over all properties of the original bridge object
  for (const key in bridge) {
    // Only process methods (functions)
    if (typeof bridge[key] === 'function') {
      // Use type assertion to tell TypeScript this is a function
      const method = bridge[key] as unknown as (...args: any[]) => Promise<any>;
      
      // Wrap the method with error handling and assign it to the safe bridge
      safeBridge[key] = withBridgeErrorHandling(
        `${bridgeName}.${key}`,
        method,
        defaultOptions
      ) as any;
    } else {
      // Copy non-method properties directly
      safeBridge[key] = bridge[key];
    }
  }
  
  return safeBridge;
}

/**
 * Convert bridge errors to user-friendly messages
 * @param error The bridge error to convert
 * @returns A user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: BridgeError | any): string {
  // Handle our structured bridge errors
  if (error && error.type && error.message) {
    switch (error.type) {
      case BridgeErrorType.PERMISSION:
        return 'Permission denied. Please check your device settings.';
      
      case BridgeErrorType.LOCATION:
        return 'Unable to access your location. Please check your device settings.';
        
      case BridgeErrorType.STORAGE:
        return 'Unable to access storage. Please check your device settings.';
        
      case BridgeErrorType.TIMEOUT:
        return 'Operation timed out. Please try again.';
        
      case BridgeErrorType.COMMUNICATION:
        return 'Unable to communicate with the app. Please try again.';
        
      case BridgeErrorType.INITIALIZATION:
        return 'App initialization error. Please restart the app.';
        
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }
  
  // Handle raw errors
  if (error instanceof Error) {
    return error.message || 'An unexpected error occurred.';
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred.';
}
