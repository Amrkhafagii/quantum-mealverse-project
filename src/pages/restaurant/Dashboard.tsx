
import React, { useEffect } from 'react';
import { RestaurantLayout } from '@/components/restaurant/RestaurantLayout';
import { RestaurantDashboard } from '@/components/restaurant/RestaurantDashboard';

const RestaurantDashboardPage = () => {
  useEffect(() => {
    console.log('Restaurant Dashboard Page Mounted');
    // Log any console errors that might happen
    const originalError = console.error;
    console.error = (...args) => {
      console.log('ERROR CAPTURED:', ...args);
      originalError(...args);
    };
    
    // Also capture warning logs
    const originalWarn = console.warn;
    console.warn = (...args) => {
      console.log('WARNING CAPTURED:', ...args);
      originalWarn(...args);
    };
    
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  return (
    <RestaurantLayout>
      <RestaurantDashboard />
    </RestaurantLayout>
  );
};

export default RestaurantDashboardPage;
