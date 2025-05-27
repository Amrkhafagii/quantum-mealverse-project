
import React from 'react';
import { RestaurantLayout } from '@/components/restaurant/RestaurantLayout';
import { RestaurantOnboarding } from '@/components/restaurant/onboarding/RestaurantOnboarding';
import ProtectedRoute from '@/components/ProtectedRoute';

const Onboarding = () => {
  return (
    <ProtectedRoute allowedUserTypes={['restaurant']}>
      <RestaurantLayout>
        <RestaurantOnboarding />
      </RestaurantLayout>
    </ProtectedRoute>
  );
};

export default Onboarding;
