
import React, { createContext, useContext, ReactNode } from 'react';
import { useOrderStore } from '@/stores/orderStore';
import { Order } from '@/types/order';

interface UnifiedOrderContextValue {
  order: Order | null;
  restaurantId: string;
  onAssignmentUpdate?: () => void;
  isProcessing?: boolean;
  onUpdate?: () => void;
  isLoading?: boolean;
  error?: string | null;
}

const UnifiedOrderContext = createContext<UnifiedOrderContextValue | undefined>(undefined);

interface UnifiedOrderProviderProps {
  children: ReactNode;
  value: Omit<UnifiedOrderContextValue, 'order' | 'isLoading' | 'error'>;
}

export const UnifiedOrderProvider: React.FC<UnifiedOrderProviderProps> = ({
  children,
  value,
}) => {
  const currentOrder = useOrderStore(state => state.currentOrder);
  const isLoading = useOrderStore(state => state.isCreatingOrder || state.isLoadingOrders);
  const error = useOrderStore(state => state.orderError);

  const contextValue: UnifiedOrderContextValue = {
    order: currentOrder,
    restaurantId: value.restaurantId,
    onAssignmentUpdate: value.onAssignmentUpdate,
    isProcessing: value.isProcessing,
    onUpdate: value.onUpdate,
    isLoading,
    error,
  };

  return (
    <UnifiedOrderContext.Provider value={contextValue}>
      {children}
    </UnifiedOrderContext.Provider>
  );
};

export const useUnifiedOrderContext = () => {
  const context = useContext(UnifiedOrderContext);
  if (context === undefined) {
    throw new Error('useUnifiedOrderContext must be used within a UnifiedOrderProvider');
  }
  return context;
};

// Legacy hooks for backward compatibility
export const useOrderContext = () => {
  const context = useUnifiedOrderContext();
  return {
    order: context.order,
    restaurantId: context.restaurantId,
    onUpdate: context.onUpdate,
    isLoading: context.isLoading,
    error: context.error,
  };
};

export const useRestaurantAssignmentContext = () => {
  const context = useUnifiedOrderContext();
  return {
    restaurantId: context.restaurantId,
    onAssignmentUpdate: context.onAssignmentUpdate,
    isProcessing: context.isProcessing,
  };
};
