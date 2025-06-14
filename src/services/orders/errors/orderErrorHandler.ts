
/**
 * Standardized error handling for order operations
 */

export interface OrderError extends Error {
  code?: string;
  details?: any;
  operation?: string;
}

export const handleDatabaseError = (error: any, operation: string, context: Record<string, any>): void => {
  // Log the error instead of throwing it
  console.error('Database error context:', { operation, context, error });
  
  // Additional error logging can be added here for monitoring
  if (error.code) {
    console.error(`Database error code: ${error.code}`);
  }
  
  if (error.details) {
    console.error(`Database error details:`, error.details);
  }
};

export const isOrderNotFoundError = (error: any): boolean => {
  return error.code === 'PGRST116' || error.message?.includes('not found');
};

export const createValidationError = (message: string, field?: string): OrderError => {
  const error: OrderError = new Error(`Validation error: ${message}`);
  error.code = 'VALIDATION_ERROR';
  error.details = { field };
  return error;
};

export const logAndReturnDefault = <T>(
  error: any, 
  operation: string, 
  context: Record<string, any>, 
  defaultValue: T
): T => {
  if (isOrderNotFoundError(error)) {
    console.warn(`Order not found in operation: ${operation}`, context);
  } else {
    console.error(`Error in operation: ${operation}`, { error: error.message || error, context });
  }
  
  return defaultValue;
};
