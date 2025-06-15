
import React, { createContext, useContext, ReactNode } from 'react';
import { useOrderStore } from '@/stores/orderStore';
import { Order } from '@/types/order';

interface OrderContextValue {
  order: Order | null;
  restaurantId?: string;
  onUpdate?: () => void;
  isLoading?: boolean;
  error?: string | null;
}

const OrderContext = createContext<OrderContextValue | undefined>(undefined);

interface OrderProviderProps {
  children: ReactNode;
  value?: Omit<OrderContextValue, 'order' | 'isLoading' | 'error'>;
}

export const OrderProvider: React.FC<OrderProviderProps> = ({ children, value }) => {
  // Get state from Zustand store
  const currentOrder = useOrderStore(state => state.currentOrder);
  const isLoading = useOrderStore(state => state.isCreatingOrder || state.isLoadingOrders);
  const error = useOrderStore(state => state.orderError);

  const contextValue: OrderContextValue = {
    order: currentOrder,
    restaurantId: value?.restaurantId,
    onUpdate: value?.onUpdate,
    isLoading,
    error,
  };

  return (
    <OrderContext.Provider value={contextValue}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrderContext = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrderContext must be used within an OrderProvider');
  }
  return context;
};
