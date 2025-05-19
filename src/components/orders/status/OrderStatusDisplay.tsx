
import React from 'react';
import { OrderStatusMessage } from './OrderStatusMessage';
import { OrderStatusTimeline } from '../OrderStatusTimeline';
import CancelOrderButton from './CancelOrderButton';
import { OrderTimer } from './OrderTimer';
import { Order } from '@/types/order';

interface OrderStatusDisplayProps {
  order: Order;
  assignmentStatus?: any;
  onOrderUpdate?: () => void;
}

export const OrderStatusDisplay: React.FC<OrderStatusDisplayProps> = ({
  order,
  assignmentStatus,
  onOrderUpdate
}) => {
  const status = order.status;
  const estimatedTime = assignmentStatus?.estimated_time;
  
  return (
    <div className="order-status-display p-4">
      <OrderStatusMessage status={status} order={order} />
      
      <OrderStatusTimeline orderId={order.id} status={status} />
      
      {estimatedTime && status !== 'completed' && status !== 'cancelled' && (
        <OrderTimer estimatedTime={estimatedTime} />
      )}
      
      {(status === 'pending' || status === 'confirmed') && (
        <CancelOrderButton orderId={order.id} onCancel={onOrderUpdate} />
      )}
    </div>
  );
};

export default OrderStatusDisplay;
