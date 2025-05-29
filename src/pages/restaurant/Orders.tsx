
import React from 'react';
import { RestaurantLayout } from '@/components/restaurant/RestaurantLayout';
import OrderManagement from '@/components/restaurant/orders/OrderManagement';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';

const Orders = () => {
  const { restaurant, isLoading } = useRestaurantAuth();

  if (isLoading) {
    return (
      <RestaurantLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quantum-cyan"></div>
        </div>
      </RestaurantLayout>
    );
  }

  if (!restaurant) {
    return (
      <RestaurantLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Restaurant not found</p>
        </div>
      </RestaurantLayout>
    );
  }

  return (
    <RestaurantLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-quantum-cyan">Order Management</h1>
        <OrderManagement restaurantId={restaurant.id} />
      </div>
    </RestaurantLayout>
  );
};

export default Orders;
