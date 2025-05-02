
import React, { useState } from 'react';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { EnhancedAnalyticsDashboard } from './EnhancedAnalyticsDashboard';

export const RestaurantAnalytics = () => {
  const { restaurant } = useRestaurantAuth();
  
  if (!restaurant) {
    return <div>Loading restaurant information...</div>;
  }
  
  return <EnhancedAnalyticsDashboard />;
};
