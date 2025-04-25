import React, { useState } from 'react';
import { Order } from '@/types/order';
import { OrderStatus } from '@/types/webhook';
import { OrderRestaurantStatus } from './thank-you/OrderRestaurantStatus';
import { cancelOrder } from '@/services/orders/orderService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { checkAssignmentStatus, checkExpiredAssignments } from '@/services/orders/webhook';
import { mapToCanonicalStatus } from '@/utils/orderStatus';

interface OrderStatusDisplayProps {
  order: Order;
  assignmentStatus: any;
  onOrderUpdate?: () => void;
}

export const OrderStatusDisplay: React.FC<OrderStatusDisplayProps> = ({ 
  order, 
  assignmentStatus, 
  onOrderUpdate 
}) => {
  const [isCancelling, setIsCancelling] = useState(false);
  const navigate = useNavigate();

  const handleCancelOrder = async () => {
    if (isCancelling) return;
    
    try {
      setIsCancelling(true);
      
      // First check if all assignments are expired
      await checkExpiredAssignments();
      const updatedStatus = await checkAssignmentStatus(order.id);
      
      // If there are no pending assignments, no need to cancel
      if (updatedStatus && updatedStatus.pending_count === 0) {
        toast.error('Cannot cancel order - all restaurant assignments have expired or been rejected');
        return;
      }
      
      await cancelOrder(order.id);
      toast.success('Order cancelled successfully');
      onOrderUpdate?.();
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order');
    } finally {
      setIsCancelling(false);
    }
  };

  const canonicalStatus = mapToCanonicalStatus(order.status);
  
  if ([OrderStatus.PENDING, OrderStatus.AWAITING_RESTAURANT].includes(canonicalStatus)) {
    return (
      <OrderRestaurantStatus 
        status={order.status}
        restaurantName={order.restaurant?.name}
        assignmentStatus={assignmentStatus}
        isCancelling={isCancelling}
        onCancel={handleCancelOrder}
        orderId={order.id}
      />
    );
  }

  let statusMessage = '';
  let statusDetails = '';

  switch (canonicalStatus) {
    case OrderStatus.RESTAURANT_ACCEPTED:
      statusMessage = 'Your order has been accepted';
      statusDetails = order.restaurant?.name ? `by ${order.restaurant.name}` : '';
      break;
    case OrderStatus.PREPARING:
      statusMessage = 'Your order is being prepared';
      statusDetails = order.restaurant?.name ? `by ${order.restaurant.name}` : '';
      break;
    case OrderStatus.READY_FOR_PICKUP:
      statusMessage = 'Your order is ready for pickup';
      statusDetails = order.restaurant?.name ? `at ${order.restaurant.name}` : '';
      break;
    case OrderStatus.ON_THE_WAY:
      statusMessage = 'Your order is on the way';
      statusDetails = 'It should arrive soon!';
      break;
    case OrderStatus.DELIVERED:
      statusMessage = 'Your order has been delivered';
      statusDetails = 'Enjoy your meal!';
      break;
    case OrderStatus.CANCELLED:
      statusMessage = 'Your order was cancelled';
      statusDetails = 'No restaurant was able to accept your order';
      break;
    case OrderStatus.NO_RESTAURANT_ACCEPTED:
      statusMessage = 'No restaurant available';
      statusDetails = 'All restaurants were busy or too far away';
      break;
    case OrderStatus.RESTAURANT_REJECTED:
      statusMessage = 'Your order was rejected';
      statusDetails = 'We apologize for the inconvenience';
      break;
    default:
      statusMessage = `Order status: ${order.status}`;
      break;
  }

  return (
    <div className="text-center space-y-3 p-4">
      <h3 className="text-xl font-semibold">{statusMessage}</h3>
      {statusDetails && <p className="text-muted-foreground">{statusDetails}</p>}
      
      {(order.status === 'cancelled' || order.status === 'no_restaurant_accepted' || order.status === 'rejected') && (
        <button 
          onClick={() => navigate('/shop')}
          className="mt-4 px-6 py-2 bg-quantum-cyan text-black rounded-lg hover:bg-quantum-cyan/80 transition-all"
        >
          Order Again
        </button>
      )}
    </div>
  );
};
