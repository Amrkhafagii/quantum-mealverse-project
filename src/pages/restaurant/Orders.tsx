
import React from 'react';
import { RestaurantLayout } from '@/components/restaurant/RestaurantLayout';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import OrderManagement from '@/components/restaurant/orders/OrderManagement';

const Orders = () => {
  const { restaurant } = useRestaurantAuth();

  return (
    <RestaurantLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-quantum-cyan">Order Management</h1>
        <OrderManagement restaurantId={restaurant?.id} />
      </div>
    </RestaurantLayout>
  );
};

export default Orders;
