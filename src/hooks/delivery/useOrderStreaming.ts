
import { useState, useEffect, useCallback } from 'react';
import { orderStreamingService } from '@/services/realtime/orderStreamingService';
import type { OrderEvent } from '@/types/delivery-features';

export const useOrderStreaming = (orderId?: string, userId?: string) => {
  const [events, setEvents] = useState<OrderEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNewEvent = useCallback((event: OrderEvent) => {
    setEvents(prev => [event, ...prev]);
  }, []);

  const handleError = useCallback((error: Error) => {
    setError(error.message);
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (!orderId && !userId) return;

    let unsubscribe: (() => void) | undefined;

    if (orderId) {
      // By order id
      unsubscribe = orderStreamingService.subscribeToOrderEvents(
        orderId,
        handleNewEvent,
        handleError
      );
    } else if (userId) {
      // Use correct column: user_id or related _user_id (see backend, default 'user_id')
      unsubscribe = orderStreamingService.subscribeToUserOrderEvents(
        userId,
        handleNewEvent,
        handleError
      );
    }

    setIsConnected(true);
    setError(null);

    return () => {
      if (unsubscribe) unsubscribe();
      setIsConnected(false);
    };
  }, [orderId, userId, handleNewEvent, handleError]);

  const createEvent = async (
    orderIdParam: string,
    eventType: string,
    eventData: Record<string, any> = {},
    userIdParam?: string,
    deliveryUserId?: string,
    restaurantId?: string
  ): Promise<string | null> => {
    // Args are forwarded as before
    return orderStreamingService.createOrderEvent(
      orderIdParam,
      eventType,
      eventData,
      userIdParam,
      deliveryUserId,
      restaurantId
    );
  };

  const loadOrderEvents = async (orderIdParam: string): Promise<void> => {
    const orderEvents = await orderStreamingService.getOrderEvents(orderIdParam);
    setEvents(orderEvents);
  };

  return {
    events,
    isConnected,
    error,
    createEvent,
    loadOrderEvents
  };
};

