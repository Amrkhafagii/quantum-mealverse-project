
import React from 'react';
import { RestaurantLayout } from '@/components/restaurant/RestaurantLayout';
import RestaurantSettings from '@/components/restaurant/profile/RestaurantSettings';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';

const RestaurantSettingsPage = () => {
  const { restaurant, isLoading } = useRestaurantAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-quantum-cyan mx-auto mb-4"></div>
          <p className="text-quantum-cyan">Loading restaurant settings...</p>
        </div>
      </div>
    );
  }

  return (
    <RestaurantLayout>
      <RestaurantSettings restaurant={restaurant} />
    </RestaurantLayout>
  );
};

export default RestaurantSettingsPage;
