
export interface OrderError {
  message: string;
  code: string;
  recoverable: boolean;
}

export class OrderErrorService {
  handleOrderError(error: any): OrderError {
    if (error.message?.includes('validation')) {
      return {
        message: 'Please check your order details and try again',
        code: 'VALIDATION_ERROR',
        recoverable: true
      };
    }

    if (error.message?.includes('network') || error.message?.includes('fetch')) {
      return {
        message: 'Network error. Please check your connection and try again',
        code: 'NETWORK_ERROR',
        recoverable: true
      };
    }

    if (error.message?.includes('transaction') || error.message?.includes('database')) {
      return {
        message: 'Database error. Please try again in a moment',
        code: 'DATABASE_ERROR',
        recoverable: true
      };
    }

    // Generic error
    return {
      message: error.message || 'An unexpected error occurred. Please try again',
      code: 'UNKNOWN_ERROR',
      recoverable: true
    };
  }

  createRecoveryAction(errorCode: string): (() => void) | null {
    switch (errorCode) {
      case 'NETWORK_ERROR':
        return () => window.location.reload();
      case 'VALIDATION_ERROR':
        return () => {
          // Scroll to first error field
          const firstError = document.querySelector('[data-error="true"]');
          firstError?.scrollIntoView({ behavior: 'smooth' });
        };
      default:
        return null;
    }
  }
}
