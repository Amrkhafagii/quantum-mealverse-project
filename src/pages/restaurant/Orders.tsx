
import React from 'react';
import { RestaurantLayout } from '@/components/restaurant/RestaurantLayout';
import OrderManagement from '@/components/restaurant/orders/OrderManagement';

const Orders = () => {
  return (
    <RestaurantLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-quantum-cyan">Order Management</h1>
        <OrderManagement />
      </div>
    </RestaurantLayout>
  );
};

export default Orders;
