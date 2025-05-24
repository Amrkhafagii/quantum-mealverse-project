
import { toast } from 'sonner';
import { BridgeError, BridgeErrorType, createBridgeError } from '@/utils/errorHandling';

// Google Maps specific error types
export enum GoogleMapsErrorType {
  API_KEY_INVALID = 'api_key_invalid',
  API_KEY_EXPIRED = 'api_key_expired',
  QUOTA_EXCEEDED = 'quota_exceeded',
  REQUEST_DENIED = 'request_denied',
  INVALID_REQUEST = 'invalid_request',
  UNKNOWN_ERROR = 'unknown_error',
  ZERO_RESULTS = 'zero_results',
  OVER_QUERY_LIMIT = 'over_query_limit',
  NOT_FOUND = 'not_found',
  TIMEOUT = 'timeout',
  NETWORK_ERROR = 'network_error'
}

// Map Google Maps API error status to our error types
const statusToErrorType = {
  'ZERO_RESULTS': GoogleMapsErrorType.ZERO_RESULTS,
  'OVER_QUERY_LIMIT': GoogleMapsErrorType.QUOTA_EXCEEDED,
  'REQUEST_DENIED': GoogleMapsErrorType.REQUEST_DENIED,
  'INVALID_REQUEST': GoogleMapsErrorType.INVALID_REQUEST,
  'UNKNOWN_ERROR': GoogleMapsErrorType.UNKNOWN_ERROR,
  'NOT_FOUND': GoogleMapsErrorType.NOT_FOUND
};

/**
 * Parse Google Maps API error response
 */
export function parseGoogleMapsError(error: any): BridgeError {
  let errorType = BridgeErrorType.UNKNOWN;
  let errorCode = GoogleMapsErrorType.UNKNOWN_ERROR;
  let message = 'An unknown Google Maps error occurred';
  
  try {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('network')) {
      return createBridgeError(
        BridgeErrorType.COMMUNICATION,
        'Network connection error while accessing Google Maps',
        GoogleMapsErrorType.NETWORK_ERROR
      );
    }
    
    // Handle timeout errors
    if (error.name === 'TimeoutError' || (error.message && error.message.includes('timeout'))) {
      return createBridgeError(
        BridgeErrorType.TIMEOUT,
        'Google Maps request timed out',
        GoogleMapsErrorType.TIMEOUT
      );
    }
    
    // Handle structured Google Maps API errors
    if (error.status) {
      errorCode = statusToErrorType[error.status] || GoogleMapsErrorType.UNKNOWN_ERROR;
      message = error.error_message || `Google Maps API Error: ${error.status}`;
      
      // Determine bridge error type
      if (errorCode === GoogleMapsErrorType.QUOTA_EXCEEDED || errorCode === GoogleMapsErrorType.OVER_QUERY_LIMIT) {
        errorType = BridgeErrorType.PERMISSION;
      } else if (errorCode === GoogleMapsErrorType.REQUEST_DENIED) {
        // Check if it's an API key issue
        if (error.error_message && error.error_message.includes('API key')) {
          errorCode = GoogleMapsErrorType.API_KEY_INVALID;
          errorType = BridgeErrorType.PERMISSION;
          message = 'Invalid Google Maps API key';
        } else {
          errorType = BridgeErrorType.PERMISSION;
        }
      } else {
        errorType = BridgeErrorType.COMMUNICATION;
      }
    } else if (error.message) {
      message = error.message;
      
      // Try to determine type from message content
      if (error.message.includes('API key')) {
        errorCode = GoogleMapsErrorType.API_KEY_INVALID;
        errorType = BridgeErrorType.PERMISSION;
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        errorCode = GoogleMapsErrorType.QUOTA_EXCEEDED;
        errorType = BridgeErrorType.PERMISSION;
      } else if (error.message.includes('network') || error.message.includes('connection')) {
        errorCode = GoogleMapsErrorType.NETWORK_ERROR;
        errorType = BridgeErrorType.COMMUNICATION;
      } else if (error.message.includes('timeout')) {
        errorCode = GoogleMapsErrorType.TIMEOUT;
        errorType = BridgeErrorType.TIMEOUT;
      }
    }
    
    return createBridgeError(
      errorType,
      message,
      errorCode,
      error
    );
  } catch (parseError) {
    // If error parsing fails, return a generic error
    return createBridgeError(
      BridgeErrorType.UNKNOWN,
      'Failed to parse Google Maps error',
      GoogleMapsErrorType.UNKNOWN_ERROR,
      error
    );
  }
}

/**
 * Convert Google Maps errors to user-friendly messages
 */
export function getUserFriendlyGoogleMapsErrorMessage(error: BridgeError | any): string {
  const parsedError = error.type ? error : parseGoogleMapsError(error);
  
  switch (parsedError.code) {
    case GoogleMapsErrorType.API_KEY_INVALID:
      return 'Invalid Google Maps API key. Please check your API key configuration.';
      
    case GoogleMapsErrorType.API_KEY_EXPIRED:
      return 'Your Google Maps API key has expired. Please update your API key.';
      
    case GoogleMapsErrorType.QUOTA_EXCEEDED:
    case GoogleMapsErrorType.OVER_QUERY_LIMIT:
      return 'Google Maps quota exceeded. Please try again later or check your API key usage limits.';
      
    case GoogleMapsErrorType.REQUEST_DENIED:
      return 'Google Maps request denied. Your API key may not have the necessary permissions.';
      
    case GoogleMapsErrorType.INVALID_REQUEST:
      return 'Invalid request to Google Maps API. Please check your request parameters.';
      
    case GoogleMapsErrorType.ZERO_RESULTS:
      return 'No results found for your Google Maps request.';
      
    case GoogleMapsErrorType.NOT_FOUND:
      return 'The requested resource was not found on Google Maps.';
      
    case GoogleMapsErrorType.TIMEOUT:
      return 'Google Maps request timed out. Please check your connection and try again.';
      
    case GoogleMapsErrorType.NETWORK_ERROR:
      return 'Network error while accessing Google Maps. Please check your internet connection.';
      
    default:
      return parsedError.message || 'An unexpected Google Maps error occurred.';
  }
}

/**
 * Wrap Google Maps operations with error handling
 */
export function withGoogleMapsErrorHandling<T>(
  operation: () => Promise<T>,
  options: {
    showToast?: boolean;
    fallback?: T;
    onError?: (error: BridgeError) => void;
    context?: string;
  } = {}
): Promise<T> {
  const { showToast = true, fallback, onError, context = 'Google Maps operation' } = options;
  
  return new Promise<T>(async (resolve, reject) => {
    try {
      const result = await operation();
      resolve(result);
    } catch (error) {
      // Parse the error
      const bridgeError = parseGoogleMapsError(error);
      
      // Add context
      bridgeError.metadata = {
        ...bridgeError.metadata,
        context
      };
      
      // Log the error
      console.error(`Google Maps Error [${context}]:`, bridgeError);
      
      // Show toast if enabled
      if (showToast) {
        const userMessage = getUserFriendlyGoogleMapsErrorMessage(bridgeError);
        toast.error(userMessage);
      }
      
      // Call onError callback if provided
      if (onError) {
        onError(bridgeError);
      }
      
      // Return fallback or reject
      if (fallback !== undefined) {
        resolve(fallback);
      } else {
        reject(bridgeError);
      }
    }
  });
}

/**
 * Create a Google Maps API safe function wrapper
 */
export function createGoogleMapsSafeFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: {
    showToast?: boolean;
    fallbackValue?: any;
    onError?: (error: BridgeError) => void;
    context?: string;
  } = {}
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>> | null> {
  
  return async (...args: Parameters<T>) => {
    return withGoogleMapsErrorHandling(
      () => fn(...args),
      {
        showToast: options.showToast,
        fallback: options.fallbackValue || null,
        onError: options.onError,
        context: options.context || fn.name
      }
    );
  };
}
