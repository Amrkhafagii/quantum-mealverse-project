
import React, { useEffect } from 'react';
import { RestaurantLayout } from '@/components/restaurant/RestaurantLayout';
import { RestaurantDashboard } from '@/components/restaurant/RestaurantDashboard';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { useNavigate } from 'react-router-dom';

const RestaurantDashboardPage = () => {
  const { user } = useRestaurantAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log('Restaurant Dashboard Page Mounted, user:', user?.email);
    
    // Redirect to auth if no user is found
    if (!user) {
      console.log("No user found, redirecting to auth");
      navigate('/auth');
      return;
    }
    
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
  }, [user, navigate]);

  return (
    <RestaurantLayout>
      <RestaurantDashboard />
    </RestaurantLayout>
  );
};

export default RestaurantDashboardPage;
