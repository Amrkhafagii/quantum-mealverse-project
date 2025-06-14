import { useState, useEffect, useCallback } from 'react';
import { realtimeNotificationService, OrderEvent } from '@/services/notifications/realtimeNotificationService';

export function useOrderEvents(orderId?: string) {
  const [events, setEvents] = useState<OrderEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const handleNewEvent = useCallback((event: OrderEvent) => {
    setEvents(prev => [event, ...prev]);
  }, []);

  useEffect(() => {
    if (!orderId) return;

    setIsConnected(true);
    // No {table}_user_id filter on order_event subscriptions; order_id is correct
    const unsubscribe = realtimeNotificationService.subscribeToOrderEvents(
      orderId,
      handleNewEvent
    );

    return () => {
      unsubscribe();
      setIsConnected(false);
    };
  }, [orderId, handleNewEvent]);

  const createEvent = useCallback(async (
    eventType: string,
    eventData: Record<string, any> = {},
    userId?: string,
    deliveryUserId?: string,
    restaurantId?: string
  ) => {
    if (!orderId) return null;
    
    // Use correct arg names - should already be {table}_user_id for custom columns
    return realtimeNotificationService.createOrderEvent(
      orderId,
      eventType,
      eventData,
      userId,
      deliveryUserId,
      restaurantId
    );
  }, [orderId]);

  return {
    events,
    isConnected,
    createEvent
  };
}
