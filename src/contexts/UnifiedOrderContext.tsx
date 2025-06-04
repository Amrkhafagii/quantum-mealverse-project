
import React, { createContext, useContext, ReactNode } from 'react';
import { Order } from '@/types/order';

interface UnifiedOrderContextValue {
  // Order data
  order: Order;
  
  // Restaurant assignment data
  restaurantId: string;
  onAssignmentUpdate?: () => void;
  isProcessing?: boolean;
  
  // General update handlers
  onUpdate?: () => void;
  isLoading?: boolean;
  error?: string | null;
}

const UnifiedOrderContext = createContext<UnifiedOrderContextValue | undefined>(undefined);

interface UnifiedOrderProviderProps {
  children: ReactNode;
  value: UnifiedOrderContextValue;
}

export const UnifiedOrderProvider: React.FC<UnifiedOrderProviderProps> = ({ 
  children, 
  value 
}) => {
  return (
    <UnifiedOrderContext.Provider value={value}>
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
    error: context.error
  };
};

export const useRestaurantAssignmentContext = () => {
  const context = useUnifiedOrderContext();
  return {
    restaurantId: context.restaurantId,
    onAssignmentUpdate: context.onAssignmentUpdate,
    isProcessing: context.isProcessing
  };
};
