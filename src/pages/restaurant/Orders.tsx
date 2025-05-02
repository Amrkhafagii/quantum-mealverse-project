
import React from 'react';
import { RestaurantLayout } from '@/components/restaurant/RestaurantLayout';
import { OrderManagement } from '@/components/restaurant/orders/OrderManagement';

const RestaurantOrders = () => {
  return (
    <RestaurantLayout>
      <OrderManagement />
    </RestaurantLayout>
  );
};

export default RestaurantOrders;
