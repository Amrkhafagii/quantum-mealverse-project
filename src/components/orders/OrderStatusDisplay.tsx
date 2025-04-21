import React from 'react';
import { Order } from '@/types/order';
import { CircularTimer } from './status/CircularTimer';
import { OrderTimer } from './status/OrderTimer';
import { OrderStatusMessage } from './status/OrderStatusMessage';
import { CancelOrderButton } from './status/CancelOrderButton';
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { CircleCheck, CircleX, Clock, Info, AlertTriangle } from 'lucide-react';
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
  
  // For debugging simulators
  const showDebugButtons = process.env.NODE_ENV === 'development';

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
                  <CircularTimer 
                    expires_at={assignmentStatus.expires_at} 
                    onExpired={onOrderUpdate}
                  />
                )}
              </div>
              
              {showDebugButtons && assignmentStatus.assignment_id && (
                <div className="pt-2 mt-4 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-2">Debug Controls (Development Only)</p>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-xs h-8"
                      onClick={async () => {
                        const response = await simulateRestaurantResponse(
                          order.id!,
                          assignmentStatus.assigned_restaurant_id!,
                          assignmentStatus.assignment_id,
                          'accept',
                          order.latitude || 0,
                          order.longitude || 0
                        );
                        
                        if (response.success) {
                          toast({
                            title: 'Restaurant accepted',
                            description: 'The restaurant has accepted your order'
                          });
                          onOrderUpdate();
                        } else {
                          toast({
                            title: 'Error',
                            description: response.error || 'Failed to accept',
                            variant: 'destructive'
                          });
                        }
                      }}
                    >
                      <CircleCheck className="h-3 w-3 mr-1" />
                      Simulate Accept
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-xs h-8"
                      onClick={async () => {
                        const response = await simulateRestaurantResponse(
                          order.id!,
                          assignmentStatus.assigned_restaurant_id!,
                          assignmentStatus.assignment_id,
                          'reject',
                          order.latitude || 0,
                          order.longitude || 0
                        );
                        
                        if (response.success) {
                          toast({
                            title: 'Restaurant rejected',
                            description: 'The restaurant has rejected your order, trying other restaurants'
                          });
                          onOrderUpdate();
                        } else {
                          toast({
                            title: 'Error',
                            description: response.error || 'Failed to reject',
                            variant: 'destructive'
                          });
                        }
                      }}
                    >
                      <CircleX className="h-3 w-3 mr-1" />
                      Simulate Reject
                    </Button>
                  </div>
                </div>
              )}
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
