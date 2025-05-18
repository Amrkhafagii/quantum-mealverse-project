
import React from 'react';
import { QueryProvider } from './QueryProvider'; 
import { ResponsiveProvider } from '@/contexts/ResponsiveContext';
import { Platform } from '@/utils/platform';
import errorReporting from '@/services/error/errorReportingService';
import analytics from '@/services/analytics/analyticsService';

// Initialize error reporting
errorReporting.initialize();

// Initialize analytics with a placeholder key (this would be the actual key in production)
analytics.initialize('YOUR_ANALYTICS_KEY');

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Track initial page load
  React.useEffect(() => {
    analytics.trackScreen(
      Platform.isNative() ? 'app_launch' : 'initial_page_load',
      {
        platform: Platform.isWeb ? 'web' : Platform.isIOS ? 'ios' : 'android',
        environment: process.env.NODE_ENV
      }
    );
    
    // Add additional startup metrics here if needed
    
    return () => {
      // Cleanup analytics when the app unmounts
      analytics.dispose();
      errorReporting.dispose();
    };
  }, []);
  
  return (
    <QueryProvider>
      <ResponsiveProvider>
        {children}
      </ResponsiveProvider>
    </QueryProvider>
  );
};

export default AppProvider;
