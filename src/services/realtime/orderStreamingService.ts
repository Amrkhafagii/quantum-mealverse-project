
import { supabase } from '@/integrations/supabase/client';
import type { OrderEvent } from '@/types/delivery-features';
import type { RealtimeChannel } from '@supabase/supabase-js';

class OrderStreamingService {
  private channels: Map<string, RealtimeChannel> = new Map();

  async createOrderEvent(
    orderId: string,
    eventType: string,
    eventData: Record<string, any> = {},
    userId?: string,
    deliveryUserId?: string,
    restaurantId?: string
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('create_order_event', {
        p_order_id: orderId,
        p_event_type: eventType,
        p_event_data: eventData,
        p_user_id: userId,
        p_delivery_user_id: deliveryUserId,
        p_restaurant_id: restaurantId
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating order event:', error);
      return null;
    }
  }

  subscribeToOrderEvents(
    orderId: string,
    onEvent: (event: OrderEvent) => void,
    onError?: (error: Error) => void
  ): () => void {
    const channelName = `order_events_${orderId}`;
    
    // Remove existing channel if it exists
    this.unsubscribeFromOrderEvents(orderId);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'order_events',
          filter: `order_id=eq.${orderId}`
        },
        (payload) => {
          console.log('Order event received:', payload);
          onEvent({
            ...payload.new,
            event_data: typeof payload.new.event_data === 'string' 
              ? JSON.parse(payload.new.event_data) 
              : (payload.new.event_data as Record<string, any>)
          } as OrderEvent);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to order events for order: ${orderId}`);
        } else if (status === 'CHANNEL_ERROR') {
          const error = new Error(`Failed to subscribe to order events: ${status}`);
          console.error(error);
          if (onError) onError(error);
        }
      });

    this.channels.set(orderId, channel);

    return () => this.unsubscribeFromOrderEvents(orderId);
  }

  subscribeToUserOrderEvents(
    userId: string,
    onEvent: (event: OrderEvent) => void,
    onError?: (error: Error) => void
  ): () => void {
    const channelName = `user_order_events_${userId}`;
    
    // Remove existing channel if it exists
    if (this.channels.has(channelName)) {
      this.channels.get(channelName)?.unsubscribe();
      this.channels.delete(channelName);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'order_events',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('User order event received:', payload);
          onEvent({
            ...payload.new,
            event_data: typeof payload.new.event_data === 'string' 
              ? JSON.parse(payload.new.event_data) 
              : (payload.new.event_data as Record<string, any>)
          } as OrderEvent);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to user order events for user: ${userId}`);
        } else if (status === 'CHANNEL_ERROR') {
          const error = new Error(`Failed to subscribe to user order events: ${status}`);
          console.error(error);
          if (onError) onError(error);
        }
      });

    this.channels.set(channelName, channel);

    return () => {
      channel.unsubscribe();
      this.channels.delete(channelName);
    };
  }

  unsubscribeFromOrderEvents(orderId: string): void {
    const channel = this.channels.get(orderId);
    if (channel) {
      channel.unsubscribe();
      this.channels.delete(orderId);
      console.log(`Unsubscribed from order events for order: ${orderId}`);
    }
  }

  async getOrderEvents(orderId: string, limit = 50): Promise<OrderEvent[]> {
    try {
      const { data, error } = await supabase
        .from('order_events')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false })
        .limit(limit);

      return (data || []).map(item => ({
        ...item,
        event_data: typeof item.event_data === 'string' 
          ? JSON.parse(item.event_data) 
          : (item.event_data as Record<string, any>)
      }));
    } catch (error) {
      console.error('Error fetching order events:', error);
      return [];
    }
  }

  unsubscribeAll(): void {
    this.channels.forEach(channel => channel.unsubscribe());
    this.channels.clear();
  }
}

export const orderStreamingService = new OrderStreamingService();
