
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, Package } from 'lucide-react';
import { useRestaurantOrderActions } from '@/hooks/restaurant/useRestaurantOrderActions';
import { OrderStatus } from '@/types/webhook';
import { Order } from '@/types/order';

interface OrderPreparationProps {
  order: Order;
  restaurantId: string;
  onStatusUpdate?: () => void;
}

export const OrderPreparation: React.FC<OrderPreparationProps> = ({
  order,
  restaurantId,
  onStatusUpdate
}) => {
  const { startPreparation, markReady, isUpdating } = useRestaurantOrderActions(restaurantId);
  const [currentStatus, setCurrentStatus] = useState(order.status);

  const handleStartPreparation = async () => {
    const success = await startPreparation(order.id!);
    if (success) {
      setCurrentStatus('preparing');
      onStatusUpdate?.();
    }
  };

  const handleMarkReady = async () => {
    const success = await markReady(order.id!);
    if (success) {
      setCurrentStatus(OrderStatus.READY_FOR_PICKUP);
      onStatusUpdate?.();
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case OrderStatus.RESTAURANT_ACCEPTED:
        return 'secondary';
      case OrderStatus.PREPARING:
        return 'default';
      case OrderStatus.READY_FOR_PICKUP:
        return 'default'; // Changed from 'success' to 'default' since 'success' is not a valid variant
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case OrderStatus.RESTAURANT_ACCEPTED:
        return <Clock className="h-4 w-4" />;
      case OrderStatus.PREPARING:
        return <Package className="h-4 w-4" />;
      case OrderStatus.READY_FOR_PICKUP:
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-quantum-cyan">
            Order #{order.formatted_order_id || order.id?.slice(0, 8)}
          </CardTitle>
          <Badge variant={getStatusBadgeVariant(currentStatus)} className="flex items-center gap-1">
            {getStatusIcon(currentStatus)}
            {currentStatus.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Customer Information</h4>
          <p className="text-sm text-gray-300">{order.customer_name}</p>
          <p className="text-sm text-gray-400">{order.delivery_address}</p>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Order Items</h4>
          <div className="space-y-2">
            {order.order_items?.map((item, index) => (
              <div key={item.id || index} className="flex justify-between text-sm">
                <span>{item.quantity}x {item.name}</span>
                <span>${item.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-600 pt-4">
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>${order.total?.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          {currentStatus === OrderStatus.RESTAURANT_ACCEPTED && (
            <Button
              onClick={handleStartPreparation}
              disabled={isUpdating}
              className="flex-1"
            >
              {isUpdating ? 'Starting...' : 'Start Preparation'}
            </Button>
          )}
          
          {currentStatus === OrderStatus.PREPARING && (
            <Button
              onClick={handleMarkReady}
              disabled={isUpdating}
              className="flex-1"
            >
              {isUpdating ? 'Marking Ready...' : 'Mark Ready for Pickup'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderPreparation;
