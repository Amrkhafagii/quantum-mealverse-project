
import React from 'react';
import { Order } from '@/types/order';
import { OrderTimer } from './status/OrderTimer';
import { OrderStatusMessage } from './status/OrderStatusMessage';
import { CancelOrderButton } from './status/CancelOrderButton';
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Info, AlertTriangle } from 'lucide-react';
import { simulateRestaurantResponse } from '@/services/orders/webhookService';
import { toast } from '@/hooks/use-toast';

interface OrderStatusDisplayProps {
  order: Order;
  assignmentStatus: any;
  onOrderUpdate: () => void;
}

export const OrderStatusDisplay: React.FC<OrderStatusDisplayProps> = ({ 
  order, 
  assignmentStatus,
  onOrderUpdate
}) => {
  if (!order) return null;

  // Only check for pending/awaiting_restaurant status
  const isPendingOrAwaitingRestaurant = order.status === 'pending' || order.status === 'awaiting_restaurant';
  const isNoRestaurantAccepted = order.status === 'no_restaurant_accepted';

  if (isPendingOrAwaitingRestaurant || isNoRestaurantAccepted) {
    return (
      <Card>
        <CardContent className="p-4">
          {assignmentStatus?.status === 'awaiting_response' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Waiting for restaurant confirmation</h3>
                  <p className="text-sm text-gray-500">Restaurant: {assignmentStatus.restaurant_name}</p>
                </div>
                {assignmentStatus.expires_at && (
                  <div className="ml-4 w-64 max-w-xs">
                    <OrderTimer 
                      expiresAt={assignmentStatus.expires_at}
                      orderId={order.id!}
                      onTimerExpire={onOrderUpdate}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {isNoRestaurantAccepted && (
            <Alert className="bg-amber-50 border-amber-200">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <AlertTitle className="text-amber-800">No restaurant available</AlertTitle>
              <AlertDescription className="text-amber-700">
                We're sorry, all restaurants are currently busy or unavailable. 
                Please try again later or choose a different delivery location.
              </AlertDescription>
            </Alert>
          )}

          {(!assignmentStatus || assignmentStatus.status === 'error' || 
           (assignmentStatus.status !== 'awaiting_response' && 
            !isNoRestaurantAccepted)) && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Processing your order</AlertTitle>
              <AlertDescription>
                We're finding a restaurant to prepare your order...
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-4">
            <CancelOrderButton 
              orderId={order.id!} 
              onCancelSuccess={onOrderUpdate}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {['processing', 'preparing', 'ready_for_pickup', 'out_for_delivery'].includes(order.status) && (
        <div className="mb-4">
          <OrderTimer orderId={order.id!} />
        </div>
      )}

      <OrderStatusMessage 
        order={order}
        assignmentStatus={assignmentStatus}
      />
    </div>
  );
};
