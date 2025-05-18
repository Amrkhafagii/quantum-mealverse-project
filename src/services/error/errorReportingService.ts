
import { Platform } from '@/utils/platform';
import analytics from '@/services/analytics/analyticsService';

interface ErrorInfo {
  componentStack: string;
}

interface ErrorReportingOptions {
  applicationName: string;
  version: string;
  environment: string;
  debug?: boolean;
}

class ErrorReportingService {
  private applicationName: string;
  private version: string;
  private environment: string;
  private debug: boolean;
  private initialized: boolean = false;
  
  constructor(options: ErrorReportingOptions) {
    this.applicationName = options.applicationName;
    this.version = options.version;
    this.environment = options.environment;
    this.debug = options.debug || process.env.NODE_ENV === 'development';
  }
  
  // Initialize the error reporting service
  public initialize(): void {
    if (this.initialized) return;
    
    // Set up global error handlers
    if (typeof window !== 'undefined') {
      // Handle uncaught exceptions
      window.addEventListener('error', this.handleWindowError);
      
      // Handle unhandled promise rejections
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
    }
    
    this.initialized = true;
    this.log('Error reporting initialized');
  }
  
  // Report an error manually
  public captureError(error: Error | string, context: Record<string, any> = {}): void {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    
    const errorReport = {
      name: errorObj.name,
      message: errorObj.message,
      stack: errorObj.stack,
      platform: Platform.isWeb ? 'web' : Platform.isIOS ? 'ios' : Platform.isAndroid ? 'android' : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      timestamp: new Date().toISOString(),
      application: this.applicationName,
      version: this.version,
      environment: this.environment,
      context,
    };
    
    this.log('Error captured:', errorReport);
    
    // Track the error with analytics
    analytics.trackError(errorObj, context);
    
    // In a real implementation, we would send the error to an error reporting service
    if (this.debug) {
      console.error('[ErrorReporting] Error details:', errorReport);
    } else {
      // Send to error reporting service like Sentry or LogRocket
      this.sendErrorReport(errorReport);
    }
  }
  
  // Report a React error boundary error
  public captureReactError(error: Error, errorInfo: ErrorInfo, componentContext?: string): void {
    this.captureError(error, {
      componentStack: errorInfo.componentStack,
      componentContext,
      source: 'react_error_boundary',
    });
  }
  
  // Dispose of resources
  public dispose(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('error', this.handleWindowError);
      window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
    }
    
    this.initialized = false;
  }
  
  // Handle window errors
  private handleWindowError = (event: ErrorEvent): void => {
    this.captureError(event.error || event.message, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      source: 'window_error',
    });
  };
  
  // Handle unhandled promise rejections
  private handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
    const error = event.reason instanceof Error
      ? event.reason
      : new Error(
          typeof event.reason === 'string'
            ? event.reason
            : 'Unhandled Promise rejection'
        );
    
    this.captureError(error, {
      source: 'unhandled_promise_rejection',
      reason: event.reason,
    });
  };
  
  // Send error report to backend service
  private sendErrorReport(report: any): void {
    // In a real implementation, we would send the error to a backend service
    // For now, we'll just log it
    this.log('Sending error report:', report);
  }
  
  // Debug logging
  private log(message: string, data?: any): void {
    if (this.debug) {
      console.log(`[ErrorReporting] ${message}`, data);
    }
  }
}

// Create a singleton instance
export const errorReporting = new ErrorReportingService({
  applicationName: 'QuantumMealverse',
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development',
});

export default errorReporting;
