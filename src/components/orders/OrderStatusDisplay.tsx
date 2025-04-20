
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
  const showTimer = ['pending', 'awaiting_restaurant'].includes(order.status);
  const showCancelButton = ['pending', 'awaiting_restaurant'].includes(order.status);

  return (
    <div className="space-y-2">
      <OrderStatusMessage order={order} assignmentStatus={assignmentStatus} />
      
      {(showTimer && assignmentStatus?.expires_at) || showCancelButton ? (
        <div className="space-y-4 mt-4">
          {showTimer && assignmentStatus?.expires_at && (
            <OrderTimer expiresAt={assignmentStatus.expires_at} />
          )}
          
          {showCancelButton && onOrderUpdate && (
            <CancelOrderButton 
              orderId={order.id!} 
              onOrderUpdate={onOrderUpdate} 
            />
          )}
        </div>
      ) : null}
    </div>
  );
};
