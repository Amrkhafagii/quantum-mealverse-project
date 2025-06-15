
import React from 'react';

// Define OrderStatus directly since the import failed
type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'in_transit' | 'delivered' | 'completed' | 'cancelled' | 'awaiting_restaurant' | 'restaurant_accepted' | 'no_restaurant_accepted' | 'no_restaurant_available';

import { OrderStatusMessage } from './status/OrderStatusMessage';
import { OrderStatusTimeline } from './OrderStatusTimeline';
import CancelOrderButton from './status/CancelOrderButton';
import { OrderTimer } from './status/OrderTimer';

interface OrderStatusDisplayProps {
  status: OrderStatus;
  orderId: string;
  estimatedTime?: string | Date;
  order?: any;
}

const OrderStatusDisplay: React.FC<OrderStatusDisplayProps> = ({
  status,
  orderId,
  estimatedTime,
  order
}) => {
  return (
    <div className="order-status-display p-4">
      <OrderStatusMessage status={status} order={order} />
      
      <OrderStatusTimeline status={status} orderId={orderId} />
      
      {estimatedTime && status !== 'completed' && status !== 'cancelled' && status !== 'delivered' && (
        <OrderTimer estimatedTime={estimatedTime} />
      )}
      
      {(status === 'pending' || status === 'awaiting_restaurant') && (
        <CancelOrderButton orderId={orderId} />
      )}
    </div>
  );
};

export default OrderStatusDisplay;
