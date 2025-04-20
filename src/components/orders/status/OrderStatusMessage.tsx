import React from 'react';
import { Building, Clock } from 'lucide-react';
import { Order } from '@/types/order';
import { AssignmentStatus } from '@/types/webhook';
import { Progress } from "@/components/ui/progress";
import { useCountdownTimer } from '@/hooks/useCountdownTimer';

interface OrderStatusMessageProps {
  order: Order;
  assignmentStatus: AssignmentStatus | null;
}

interface StatusMessage {
  message: string;
  details?: string;
}

export const OrderStatusMessage: React.FC<OrderStatusMessageProps> = ({ 
  order, 
  assignmentStatus 
}) => {
  const { formattedTime } = useCountdownTimer(assignmentStatus?.expires_at);
  
  const getStatusMessage = (): StatusMessage => {
    if (!order) return { message: '' };
    
    switch (order.status) {
      case 'pending':
        return {
          message: 'Finding a restaurant to fulfill your order...',
          details: assignmentStatus?.attempt_count ? 
            `Attempt ${assignmentStatus.attempt_count} of 3` : undefined
        };
      case 'awaiting_restaurant':
        return {
          message: assignmentStatus?.restaurant_name ? 
            `Waiting for confirmation from ${assignmentStatus.restaurant_name}...` :
            'A restaurant is reviewing your order...',
          details: `Attempt ${assignmentStatus?.attempt_count || 1} of 3`
        };
      case 'processing':
        return { message: 'Your order is being prepared!' };
      case 'assignment_failed':
        return {
          message: 'No nearby restaurants available at the moment.',
          details: 'Please try again later.'
        };
      case 'on_the_way':
        return { message: 'Your order is on the way to you!' };
      case 'delivered':
        return { message: 'Your order has been delivered. Enjoy!' };
      case 'cancelled':
        return { message: 'Your order has been cancelled.' };
      case 'no_restaurants_available':
        return {
          message: 'No restaurants available in your area.',
          details: 'Please try a different delivery address or try again later.'
        };
      default:
        return { message: `Order Status: ${order.status}` };
    }
  };

  const statusMessage = getStatusMessage();
  const showAttemptProgress = ['pending', 'awaiting_restaurant'].includes(order.status);
  const attemptCount = assignmentStatus?.attempt_count || 1;
  const progressValue = ((3 - attemptCount + 1) / 3) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        {order.status === 'awaiting_restaurant' && assignmentStatus?.restaurant_name && (
          <Building className="h-5 w-5 text-quantum-cyan mt-1 flex-shrink-0" />
        )}
        <div className="w-full">
          <p className="text-lg">{statusMessage.message}</p>
          {statusMessage.details && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm text-gray-400">
                <span>{statusMessage.details}</span>
                {showAttemptProgress && assignmentStatus?.expires_at && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formattedTime}</span>
                  </div>
                )}
              </div>
              {showAttemptProgress && (
                <div>
                  <Progress value={progressValue} className="h-2" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
