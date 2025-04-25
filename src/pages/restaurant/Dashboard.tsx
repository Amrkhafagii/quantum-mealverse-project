
import React from 'react';
import { RestaurantLayout } from '@/components/restaurant/RestaurantLayout';
import { RestaurantDashboard } from '@/components/restaurant/RestaurantDashboard';

const RestaurantDashboardPage = () => {
  return (
    <RestaurantLayout>
      <RestaurantDashboard />
    </RestaurantLayout>
  );
};

export default RestaurantDashboardPage;
