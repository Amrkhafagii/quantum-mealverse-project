
import React, { createContext, useContext, ReactNode } from 'react';

interface RestaurantAssignmentContextValue {
  restaurantId: string;
  onAssignmentUpdate?: () => void;
  isProcessing?: boolean;
  assignments?: any[];
  loading?: boolean;
  error?: string | null;
}

const RestaurantAssignmentContext = createContext<RestaurantAssignmentContextValue | undefined>(undefined);

interface RestaurantAssignmentProviderProps {
  children: ReactNode;
  value: RestaurantAssignmentContextValue;
}

export const RestaurantAssignmentProvider: React.FC<RestaurantAssignmentProviderProps> = ({ 
  children, 
  value 
}) => {
  return (
    <RestaurantAssignmentContext.Provider value={value}>
      {children}
    </RestaurantAssignmentContext.Provider>
  );
};

export const useRestaurantAssignmentContext = () => {
  const context = useContext(RestaurantAssignmentContext);
  if (context === undefined) {
    throw new Error('useRestaurantAssignmentContext must be used within a RestaurantAssignmentProvider');
  }
  return context;
};
