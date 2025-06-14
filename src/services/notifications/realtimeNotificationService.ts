
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Correct user id field for notifications is user_id (not notifications_user_id) for most real-time logic
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: string;
  order_id?: string;
  restaurant_id?: string;
  delivery_user_id?: string;
  data: Record<string, any>;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderEvent {
  id: string;
  order_id: string;
  event_type: string;
  event_data: Record<string, any>;
  user_id?: string;
  delivery_user_id?: string;
  restaurant_id?: string;
  created_at: string;
}

class RealtimeNotificationService {
  private channels: Map<string, any> = new Map();

  // Subscribe to user notifications
  subscribeToNotifications(
    userId: string,
    onNotification: (notification: Notification) => void
  ): () => void {
    const channelName = `notifications_${userId}`;
    
    if (this.channels.has(channelName)) {
      this.channels.get(channelName)?.unsubscribe();
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}` // always 'user_id', not notifications_user_id!
        },
        (payload) => {
          const notification = payload.new as any;
          const convertedNotification: Notification = {
            ...notification,
            data: typeof notification.data === 'string' 
              ? JSON.parse(notification.data) 
              : notification.data || {}
          };
          onNotification(convertedNotification);

          toast({
            title: convertedNotification.title,
            description: convertedNotification.message,
            duration: 5000,
          });
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);

    return () => {
      channel.unsubscribe();
      this.channels.delete(channelName);
    };
  }

  subscribeToOrderEvents(
    orderId: string,
    onEvent: (event: OrderEvent) => void
  ): () => void {
    const channelName = `order_events_${orderId}`;
    if (this.channels.has(channelName)) {
      this.channels.get(channelName)?.unsubscribe();
    }

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
          const event = payload.new as any;
          const convertedEvent: OrderEvent = {
            ...event,
            event_data: typeof event.event_data === 'string' 
              ? JSON.parse(event.event_data) 
              : event.event_data || {}
          };
          onEvent(convertedEvent);
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);

    return () => {
      channel.unsubscribe();
      this.channels.delete(channelName);
    };
  }

  async getUserNotifications(userId: string, limit = 50): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('notifications_user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    return (data || []).map(item => ({
      ...item,
      data: typeof item.data === 'string' 
        ? JSON.parse(item.data) 
        : item.data || {}
    })) as Notification[];
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', notificationId);

    return !error;
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('notifications_user_id', userId)
      .eq('is_read', false);

    return !error;
  }

  async registerPushToken(
    userId: string,
    token: string,
    platform: 'ios' | 'android' | 'web',
    deviceId?: string
  ): Promise<boolean> {
    const { error } = await supabase
      .from('push_notification_tokens')
      .upsert({
        user_id: userId, // always user_id
        token,
        platform,
        device_id: deviceId,
        is_active: true
      });

    return !error;
  }

  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: string,
    orderId?: string,
    restaurantId?: string,
    deliveryUserId?: string,
    data: Record<string, any> = {}
  ): Promise<string | null> {
    const { data: result, error } = await supabase
      .rpc('create_notification', {
        p_user_id: userId,
        p_title: title,
        p_message: message,
        p_notification_type: type,
        p_order_id: orderId,
        p_restaurant_id: restaurantId,
        p_delivery_user_id: deliveryUserId,
        p_data: data
      });

    if (error) {
      console.error('Error creating notification:', error);
      return null;
    }

    return result;
  }

  async createOrderEvent(
    orderId: string,
    eventType: string,
    eventData: Record<string, any> = {},
    userId?: string,
    deliveryUserId?: string,
    restaurantId?: string
  ): Promise<string | null> {
    const { data: result, error } = await supabase
      .rpc('create_order_event', {
        p_order_id: orderId,
        p_event_type: eventType,
        p_event_data: eventData,
        p_user_id: userId,
        p_delivery_user_id: deliveryUserId,
        p_restaurant_id: restaurantId
      });

    if (error) {
      console.error('Error creating order event:', error);
      return null;
    }

    return result;
  }

  cleanup(): void {
    this.channels.forEach(channel => channel.unsubscribe());
    this.channels.clear();
  }
}

export const realtimeNotificationService = new RealtimeNotificationService();

