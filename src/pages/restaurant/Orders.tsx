
import React from 'react';
import { RestaurantLayout } from '@/components/restaurant/RestaurantLayout';
import { OrderManagement } from '@/components/restaurant/orders/OrderManagement';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff } from 'lucide-react';

const RestaurantOrders = () => {
  const { isOnline } = useConnectionStatus();
  
  return (
    <RestaurantLayout>
      {!isOnline && (
        <Alert variant="destructive" className="mb-4">
          <WifiOff className="h-4 w-4 mr-2" />
          <AlertDescription>
            You are currently offline. Some features may be limited and changes will be synchronized when you're back online.
          </AlertDescription>
        </Alert>
      )}
      <OrderManagement />
    </RestaurantLayout>
  );
};

export default RestaurantOrders;
