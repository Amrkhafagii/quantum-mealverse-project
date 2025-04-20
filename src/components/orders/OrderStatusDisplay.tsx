
import React from 'react';
import { Order } from '@/types/order';
import { AssignmentStatus } from '@/types/webhook';
import { OrderStatusMessage } from './status/OrderStatusMessage';
import { OrderTimer } from './status/OrderTimer';
import { CancelOrderButton } from './status/CancelOrderButton';

interface OrderStatusDisplayProps {
  order: Order;
  assignmentStatus: AssignmentStatus | null;
  onOrderUpdate?: () => void;
}

export const OrderStatusDisplay: React.FC<OrderStatusDisplayProps> = ({ 
  order, 
  assignmentStatus,
  onOrderUpdate 
}) => {
  console.log('OrderStatusDisplay Render:', {
    order: order.id,
    status: order.status,
    assignmentStatus: assignmentStatus,
    expiresAt: assignmentStatus?.expires_at
  });

  const showTimer = ['pending', 'awaiting_restaurant'].includes(order.status);
  const showCancelButton = ['pending', 'awaiting_restaurant'].includes(order.status);
  
  // Check if we have a valid expires_at in assignment status
  const hasValidExpiryTime = Boolean(
    showTimer && 
    assignmentStatus && 
    assignmentStatus.expires_at &&
    !isNaN(new Date(assignmentStatus.expires_at).getTime())
  );

  const handleTimerExpire = () => {
    console.log('Timer expired, refreshing order status...');
    onOrderUpdate?.();
  };

  return (
    <div className="space-y-2">
      <OrderStatusMessage order={order} assignmentStatus={assignmentStatus} />
      
      {hasValidExpiryTime && (
        <div className="border border-gray-700 bg-gray-900 rounded-md p-4 mt-4">
          <OrderTimer 
            expiresAt={assignmentStatus?.expires_at} 
            orderId={order.id}
            onTimerExpire={handleTimerExpire}
          />
        </div>
      )}
      
      {showCancelButton && onOrderUpdate && (
        <div className="mt-4">
          <CancelOrderButton 
            orderId={order.id!} 
            onOrderUpdate={onOrderUpdate} 
          />
        </div>
      )}
    </div>
  );
};
