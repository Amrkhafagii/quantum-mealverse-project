
import React from 'react';
import { Building } from 'lucide-react';
import { Order } from '@/types/order';
import { AssignmentStatus } from '@/types/webhook';

interface OrderStatusMessageProps {
  order: Order;
  assignmentStatus: AssignmentStatus | null;
  status?: string; // Add this field to match usage in OrderStatusDisplay
  restaurant?: { id: string; name: string; }; // Add this field
  deliveryMethod?: string; // Add this field
}

interface StatusMessage {
  message: string;
  details?: string;
}

export const OrderStatusMessage: React.FC<OrderStatusMessageProps> = ({ 
  order, 
  assignmentStatus,
  status,
  restaurant,
  deliveryMethod
}) => {
  // Use order properties or fallback to direct props for backward compatibility
  const orderStatus = status || order?.status;
  const orderRestaurant = restaurant || order?.restaurant;
  const orderDeliveryMethod = deliveryMethod || order?.delivery_method;

  const getStatusMessage = (): StatusMessage => {
    if (!orderStatus) return { message: '' };
    
    switch (orderStatus) {
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
      case 'no_restaurant_accepted':
        return {
          message: 'No restaurants available in your area.',
          details: 'Please try a different delivery address or try again later.'
        };
      case 'no_restaurants_available':
        return {
          message: 'No restaurants available in your area.',
          details: 'Please try a different delivery address or try again later.'
        };
      default:
        return { message: `Order Status: ${orderStatus}` };
    }
  };

  const statusMessage = getStatusMessage();

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        {orderStatus === 'awaiting_restaurant' && assignmentStatus?.restaurant_name && (
          <Building className="h-5 w-5 text-quantum-cyan mt-1 flex-shrink-0" />
        )}
        <div className="w-full">
          <p className="text-lg">{statusMessage.message}</p>
          {statusMessage.details && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm text-gray-400">
                <span>{statusMessage.details}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
