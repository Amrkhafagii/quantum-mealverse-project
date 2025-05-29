
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const notification = payload.new as Notification;
          onNotification(notification);
          
          // Show toast notification
          toast({
            title: notification.title,
            description: notification.message,
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

  // Subscribe to order events
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
          const event = payload.new as OrderEvent;
          onEvent(event);
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);

    return () => {
      channel.unsubscribe();
      this.channels.delete(channelName);
    };
  }

  // Subscribe to all notifications for a user (for restaurant/delivery users)
  subscribeToAllUserNotifications(
    userId: string,
    onNotification: (notification: Notification) => void,
    onOrderEvent: (event: OrderEvent) => void
  ): () => void {
    const notificationUnsubscribe = this.subscribeToNotifications(userId, onNotification);
    
    // Also subscribe to order events where user is involved
    const eventChannelName = `user_order_events_${userId}`;
    
    if (this.channels.has(eventChannelName)) {
      this.channels.get(eventChannelName)?.unsubscribe();
    }

    const eventChannel = supabase
      .channel(eventChannelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'order_events',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const event = payload.new as OrderEvent;
          onOrderEvent(event);
        }
      )
      .subscribe();

    this.channels.set(eventChannelName, eventChannel);

    return () => {
      notificationUnsubscribe();
      eventChannel.unsubscribe();
      this.channels.delete(eventChannelName);
    };
  }

  // Get user notifications
  async getUserNotifications(userId: string, limit = 50): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    return data || [];
  }

  // Mark notification as read
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

  // Mark all notifications as read
  async markAllAsRead(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('is_read', false);

    return !error;
  }

  // Register push notification token
  async registerPushToken(
    userId: string,
    token: string,
    platform: 'ios' | 'android' | 'web',
    deviceId?: string
  ): Promise<boolean> {
    const { error } = await supabase
      .from('push_notification_tokens')
      .upsert({
        user_id: userId,
        token,
        platform,
        device_id: deviceId,
        is_active: true
      });

    return !error;
  }

  // Create manual notification (for testing or admin use)
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

  // Create order event
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

  // Cleanup all subscriptions
  cleanup(): void {
    this.channels.forEach(channel => channel.unsubscribe());
    this.channels.clear();
  }
}

export const realtimeNotificationService = new RealtimeNotificationService();
