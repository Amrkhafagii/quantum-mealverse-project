
import React from 'react';
import { Building } from 'lucide-react';
import { Order } from '@/types/order';
import { AssignmentStatus, OrderStatus } from '@/types/webhook';

interface OrderStatusMessageProps {
  order: Order;
  assignmentStatus?: AssignmentStatus | null;
  status?: string;
  restaurant?: { id: string; name: string; };
  deliveryMethod?: string;
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

  // Only show restaurant name if a restaurant has actually accepted the order
  const shouldShowRestaurantName = 
    (assignmentStatus?.restaurant_name && 
     assignmentStatus?.assigned_restaurant_id && 
     orderStatus !== 'pending' && 
     orderStatus !== 'awaiting_restaurant' && 
     assignmentStatus?.status !== 'awaiting_response') ||
    (orderRestaurant?.name && orderRestaurant.name !== '');

  const getStatusMessage = (): StatusMessage => {
    if (!orderStatus) return { message: '' };
    
    switch (orderStatus) {
      case OrderStatus.PENDING:
        return {
          message: 'Finding a restaurant to fulfill your order...',
          details: assignmentStatus?.attempt_count ? 
            `Attempt ${assignmentStatus.attempt_count} of 3` : undefined
        };
      case OrderStatus.AWAITING_RESTAURANT:
        return {
          message: shouldShowRestaurantName ? 
            `Waiting for confirmation from ${assignmentStatus?.restaurant_name || orderRestaurant?.name}...` :
            'Waiting for a restaurant to accept your order...',
          details: `Attempt ${assignmentStatus?.attempt_count || 1} of 3`
        };
      case OrderStatus.PROCESSING:
      case 'processing':
        return { 
          message: shouldShowRestaurantName ? 
            `Your order is being processed by ${assignmentStatus?.restaurant_name || orderRestaurant?.name}!` : 
            'Your order is being processed!' 
        };
      case OrderStatus.PREPARING:
      case 'preparing':
        return {
          message: shouldShowRestaurantName ? 
            `Your order is being prepared by ${assignmentStatus?.restaurant_name || orderRestaurant?.name}!` : 
            'Your order is being prepared!'
        };
      case OrderStatus.NO_RESTAURANT_AVAILABLE:
        return {
          message: 'No nearby restaurants available at the moment.',
          details: 'Please try again later.'
        };
      case OrderStatus.ON_THE_WAY:
      case 'delivering':
        return { message: 'Your order is on the way to you!' };
      case OrderStatus.DELIVERED:
      case 'completed':
        return { message: 'Your order has been delivered. Enjoy!' };
      case OrderStatus.CANCELLED:
        return { message: 'Your order has been cancelled.' };
      case OrderStatus.NO_RESTAURANT_ACCEPTED:
        return {
          message: 'No restaurants available in your area.',
          details: 'Please try a different delivery address or try again later.'
        };
      case OrderStatus.RESTAURANT_ACCEPTED:
      case 'accepted':
        return {
          message: `Order accepted by ${orderRestaurant?.name || 'restaurant'}`,
          details: 'Your food is being prepared!'
        };
      case OrderStatus.READY_FOR_PICKUP:
      case 'ready':
        return {
          message: 'Your order is ready for pickup!',
          details: orderRestaurant?.name ? `at ${orderRestaurant.name}` : undefined
        };
      default:
        return { message: `Order Status: ${orderStatus}` };
    }
  };

  const statusMessage = getStatusMessage();

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        {shouldShowRestaurantName && (
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
