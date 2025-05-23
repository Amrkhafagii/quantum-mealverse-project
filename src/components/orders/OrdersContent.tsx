
import React from 'react';
import OrderTracker from '@/components/orders/OrderTracker';
import { ActiveOrdersList } from '@/components/orders/ActiveOrdersList';
import { PastOrdersList } from '@/components/orders/PastOrdersList';
import { EmptyOrdersState } from '@/components/orders/EmptyOrdersState';
import { SelectOrderPrompt } from '@/components/orders/SelectOrderPrompt';
import { NoActiveOrdersDisplay } from '@/components/orders/NoActiveOrdersDisplay';
import { useOrdersData } from '@/hooks/orders/useOrdersData';

interface OrdersContentProps {
  userId?: string;
  selectedOrderId: string | null;
  onOrderSelect: (orderId: string) => void;
  isSessionLoading: boolean;
}

export const OrdersContent: React.FC<OrdersContentProps> = ({ 
  userId, 
  selectedOrderId,
  onOrderSelect,
  isSessionLoading
}) => {
  const { orders, pastOrders, isLoading, isOnline, refetch } = useOrdersData(userId);
  
  // Show loading state
  if (isLoading && isOnline && !isSessionLoading) {
    return (
      <div className="text-2xl text-quantum-cyan flex justify-center items-center py-20">
        Loading your orders...
      </div>
    );
  }
  
  // No orders state
  if ((!orders || orders.length === 0) && (!pastOrders || pastOrders.length === 0)) {
    return <EmptyOrdersState />;
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <ActiveOrdersList 
          orders={orders || []} 
          selectedOrderId={selectedOrderId}
          onOrderSelect={onOrderSelect}
        />
        <PastOrdersList 
          orders={pastOrders || []} 
          onOrderSelect={onOrderSelect} 
        />
      </div>
      
      <div className="lg:col-span-2">
        {selectedOrderId ? (
          <OrderTracker orderId={selectedOrderId} />
        ) : (
          orders && orders.length > 0 ? (
            <SelectOrderPrompt />
          ) : (
            <NoActiveOrdersDisplay />
          )
        )}
      </div>
    </div>
  );
};
