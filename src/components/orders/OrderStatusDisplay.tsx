
import React from 'react';
import { OrderStatus } from '@/types/order';
import OrderStatusMessage from './status/OrderStatusMessage';
import OrderStatusTimeline from './OrderStatusTimeline';
import CancelOrderButton from './status/CancelOrderButton';
import OrderTimer from './status/OrderTimer';

interface OrderStatusDisplayProps {
  status: OrderStatus;
  orderId: string;
  estimatedTime?: number;
}

const OrderStatusDisplay: React.FC<OrderStatusDisplayProps> = ({
  status,
  orderId,
  estimatedTime
}) => {
  return (
    <div className="order-status-display p-4">
      <OrderStatusMessage status={status} />
      
      <OrderStatusTimeline status={status} />
      
      {estimatedTime && status !== 'completed' && status !== 'cancelled' && (
        <OrderTimer estimatedTime={estimatedTime} />
      )}
      
      {(status === 'pending' || status === 'confirmed') && (
        <CancelOrderButton orderId={orderId} />
      )}
    </div>
  );
};

export default OrderStatusDisplay;
