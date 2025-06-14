
/**
 * Centralized logging utilities for order operations
 */

interface LogContext {
  orderId?: string;
  userId?: string;
  restaurantId?: string;
  operation: string;
  [key: string]: any;
}

export const logOrderOperation = (operation: string, params: Record<string, any>) => {
  console.log(`Order operation: ${operation}`, params);
};

export const logOrderError = (operation: string, error: any, context: LogContext) => {
  console.error(`Error in order operation: ${operation}`, {
    error: error.message || error,
    context,
    timestamp: new Date().toISOString()
  });
};

export const logOrderSuccess = (operation: string, result: any, context: LogContext) => {
  console.log(`Order operation successful: ${operation}`, {
    result: result ? 'success' : 'completed',
    context,
    timestamp: new Date().toISOString()
  });
};

export const logOrderQuery = (queryType: string, params: Record<string, any>) => {
  console.log(`Order query: ${queryType}`, params);
};
