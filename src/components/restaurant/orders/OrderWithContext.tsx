
import React from 'react';
import { OrderProvider } from '@/contexts/OrderContext';
import { RestaurantAssignmentProvider } from '@/contexts/RestaurantAssignmentContext';
import { Order } from '@/types/order';

interface OrderWithContextProps {
  order: Order;
  restaurantId: string;
  onAssignmentUpdate?: () => void;
  isProcessing?: boolean;
  children: React.ReactNode;
}

export const OrderWithContext: React.FC<OrderWithContextProps> = ({
  order,
  restaurantId,
  onAssignmentUpdate,
  isProcessing,
  children
}) => {
  return (
    <OrderProvider
      value={{
        order,
        restaurantId,
        onUpdate: onAssignmentUpdate
      }}
    >
      <RestaurantAssignmentProvider
        value={{
          restaurantId,
          onAssignmentUpdate,
          isProcessing
        }}
      >
        {children}
      </RestaurantAssignmentProvider>
    </OrderProvider>
  );
};
