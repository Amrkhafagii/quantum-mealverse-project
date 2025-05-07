
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { OrderStatusBadge } from './OrderStatusBadge';
import { OrderStatusMessage } from './OrderStatusMessage';
import { CancelOrderButton } from './status/CancelOrderButton';
import { OrderTimer } from './status/OrderTimer';
import { Order } from '@/types/order';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { fixOrderStatus } from '@/utils/orderStatusFix';

interface OrderStatusDisplayProps {
  order: Order;
  assignmentStatus?: any;
  onOrderUpdate?: () => void;
  showCancelButton?: boolean;
}

export const OrderStatusDisplay: React.FC<OrderStatusDisplayProps> = ({
  order,
  assignmentStatus,
  onOrderUpdate,
  showCancelButton = true
}) => {
  const [isFixing, setIsFixing] = React.useState(false);
  
  // Calculate if the order is in a state where it can be cancelled
  const canBeCancelled = ['pending', 'awaiting_restaurant', 'restaurant_assigned'].includes(order.status);

  // Handle refreshing the order status
  const handleRefreshStatus = async () => {
    if (!order.id) return;
    
    setIsFixing(true);
    try {
      await fixOrderStatus(order.id);
      if (onOrderUpdate) {
        onOrderUpdate();
      }
    } catch (error) {
      console.error('Error refreshing order status:', error);
    } finally {
      setIsFixing(false);
    }
  };
  
  return (
    <Card className="bg-quantum-black/30 border-quantum-cyan/20">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div className="space-y-2 mb-4 md:mb-0">
            <div className="flex items-center gap-3">
              <h3 className="font-medium">Status:</h3>
              <OrderStatusBadge status={order.status} />
              
              <Button 
                variant="ghost" 
                size="sm"
                className="ml-2 h-6 w-6 p-0" 
                onClick={handleRefreshStatus}
                disabled={isFixing}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span className="sr-only">Refresh status</span>
              </Button>
            </div>
            
            <OrderStatusMessage
              status={order.status}
              restaurant={order.restaurant}
              assignmentStatus={assignmentStatus}
              order={order}
            />
            
            {['restaurant_assigned', 'accepted', 'preparing'].includes(order.status) && (
              <OrderTimer 
                updatedAt={order.updated_at || order.created_at || ''}
              />
            )}
          </div>
          
          {showCancelButton && canBeCancelled && (
            <CancelOrderButton 
              orderId={order.id!} 
              onCancelOrder={onOrderUpdate}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
