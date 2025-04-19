
import React from 'react';
import { Loader2 } from 'lucide-react';

interface AssignmentStatus {
  status: string;
  assigned_restaurant_id?: string;
  assignment_id?: string;
  expires_at?: string;
  attempt_count: number;
}

interface OrderStatusDisplayProps {
  order: any;
  assignmentStatus: AssignmentStatus | null;
}

export const OrderStatusDisplay: React.FC<OrderStatusDisplayProps> = ({ order, assignmentStatus }) => {
  const renderOrderStatus = () => {
    if (!order) return null;
    
    let statusMessage = '';
    let statusDetails = '';
    
    switch (order.status) {
      case 'pending':
        statusMessage = 'Finding a restaurant to fulfill your order...';
        if (assignmentStatus?.attempt_count) {
          statusDetails = `Attempt ${assignmentStatus.attempt_count} of 3`;
        }
        break;
      case 'awaiting_restaurant':
        statusMessage = 'A restaurant is reviewing your order...';
        if (assignmentStatus?.expires_at) {
          const expiresAt = new Date(assignmentStatus.expires_at);
          const timeLeft = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
          statusDetails = `Restaurant has ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')} to respond`;
        }
        break;
      case 'processing':
        statusMessage = 'Your order is being prepared!';
        break;
      case 'on_the_way':
        statusMessage = 'Your order is on the way to you!';
        break;
      case 'delivered':
        statusMessage = 'Your order has been delivered. Enjoy!';
        break;
      case 'cancelled':
        statusMessage = 'Your order has been cancelled.';
        break;
      case 'assignment_failed':
        statusMessage = "We couldn't find a restaurant for your order right now.";
        statusDetails = 'Please try again in a few minutes.';
        break;
      case 'no_restaurants_available':
        statusMessage = 'No restaurants available in your area.';
        statusDetails = 'Please try a different delivery address or try again later.';
        break;
      default:
        statusMessage = `Order Status: ${order.status}`;
    }
    
    return (
      <div className="space-y-2">
        <p className="text-lg">{statusMessage}</p>
        {statusDetails && <p className="text-sm text-gray-400">{statusDetails}</p>}
        {assignmentStatus?.attempt_count > 0 && order.status !== 'processing' && (
          <p className="text-sm text-gray-400">
            Assignment attempt: {assignmentStatus.attempt_count} of 3
          </p>
        )}
      </div>
    );
  };

  return renderOrderStatus();
};
