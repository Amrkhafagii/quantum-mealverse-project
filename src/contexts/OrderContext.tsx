
import React, { createContext, useContext, ReactNode } from 'react';
import { Order } from '@/types/order';

interface OrderContextValue {
  order: Order;
  restaurantId?: string;
  onUpdate?: () => void;
  isLoading?: boolean;
  error?: string | null;
}

const OrderContext = createContext<OrderContextValue | undefined>(undefined);

interface OrderProviderProps {
  children: ReactNode;
  value: OrderContextValue;
}

export const OrderProvider: React.FC<OrderProviderProps> = ({ children, value }) => {
  return (
    <OrderContext.Provider value={value}>
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
