
import React from 'react';
import { UnifiedOrderProvider } from '@/contexts/UnifiedOrderContext';
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
  // Do not include "order", "isLoading", or "error" in the provider value
  return (
    <UnifiedOrderProvider
      value={{
        restaurantId,
        onAssignmentUpdate,
        isProcessing,
        onUpdate: onAssignmentUpdate
      }}
    >
      {children}
    </UnifiedOrderProvider>
  );
};
