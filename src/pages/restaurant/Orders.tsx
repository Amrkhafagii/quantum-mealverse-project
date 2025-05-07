
import React from 'react';
import { RestaurantLayout } from '@/components/restaurant/RestaurantLayout';
import { OrderManagement } from '@/components/restaurant/orders/OrderManagement';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RestaurantOrders = () => {
  const { isOnline } = useConnectionStatus();
  
  return (
    <RestaurantLayout>
      {!isOnline && (
        <Alert variant="destructive" className="mb-4">
          <WifiOff className="h-4 w-4 mr-2" />
          <AlertDescription className="flex justify-between items-center">
            <span>
              You are currently offline. Some features may be limited and changes will be synchronized when you're back online.
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2 bg-white/10 hover:bg-white/20"
              onClick={() => window.location.reload()}
            >
              Retry Connection
            </Button>
          </AlertDescription>
        </Alert>
      )}
      <OrderManagement />
    </RestaurantLayout>
  );
};

export default RestaurantOrders;
