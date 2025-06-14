
/**
 * Standardized error handling for order operations
 */

export interface OrderError extends Error {
  code?: string;
  details?: any;
  operation?: string;
}

export const handleDatabaseError = (error: any, operation: string, context: Record<string, any>): never => {
  const orderError: OrderError = new Error(`Database error in ${operation}: ${error.message || error}`);
  orderError.code = error.code;
  orderError.details = error.details;
  orderError.operation = operation;
  
  // Add context for debugging
  console.error('Database error context:', { operation, context, error });
  
  throw orderError;
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
