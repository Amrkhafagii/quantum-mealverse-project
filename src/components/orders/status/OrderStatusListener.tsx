
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Order } from '@/types/order';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { useOrderEvents } from '@/hooks/useOrderEvents';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface OrderStatusListenerProps {
  orderId: string;
  order?: Order;
}

/**
 * Component that listens for real-time order status changes
 * and triggers notifications across all platforms
 */
export const OrderStatusListener: React.FC<OrderStatusListenerProps> = ({
  orderId,
  order
}) => {
  const { user } = useAuth();
  const { showNotification, permission, requestPermission } = usePushNotifications();
  const { events } = useOrderEvents(orderId);
  
  // Request notification permission on mount
  useEffect(() => {
    if (permission === 'default') {
      requestPermission();
    }
  }, [permission, requestPermission]);

  // Handle order events for push notifications
  useEffect(() => {
    if (events.length > 0) {
      const latestEvent = events[0];
      
      if (latestEvent.event_type === 'status_changed' && permission === 'granted') {
        const eventData = latestEvent.event_data;
        const status = eventData.new_status;
        
        let title = 'Order Update';
        let message = `Your order status has changed to ${status}`;
        
        switch (status) {
          case 'restaurant_accepted':
            title = 'Order Accepted';
            message = 'Your order has been accepted and is being prepared';
            break;
          case 'preparing':
            title = 'Order Being Prepared';
            message = 'Your order is now being prepared';
            break;
          case 'ready_for_pickup':
            title = 'Order Ready';
            message = 'Your order is ready for pickup';
            break;
          case 'picked_up':
            title = 'Order Picked Up';
            message = 'Your order has been picked up and is on the way';
            break;
          case 'on_the_way':
            title = 'Order On The Way';
            message = 'Your order is on the way to you!';
            break;
          case 'delivered':
            title = 'Order Delivered';
            message = 'Your order has been delivered successfully!';
            break;
          case 'cancelled':
            title = 'Order Cancelled';
            message = 'Your order has been cancelled';
            break;
        }
        
        showNotification(title, message, {
          orderId,
          status,
          timestamp: eventData.timestamp
        });
      }
    }
  }, [events, permission, showNotification, orderId]);

  // This component doesn't render anything visible
  return null;
};

export default OrderStatusListener;
