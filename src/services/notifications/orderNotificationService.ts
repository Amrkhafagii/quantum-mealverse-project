
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface OrderNotification {
  id: string;
  order_id: string;
  restaurant_id?: string;
  user_id?: string;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

class OrderNotificationService {
  private channels: Map<string, RealtimeChannel> = new Map();

  /**
   * Subscribe to order notifications for a user
   */
  subscribeToUserNotifications(
    userId: string,
    onNotification: (notification: OrderNotification) => void
  ): () => void {
    const channelName = `user_notifications_${userId}`;
    
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
          table: 'order_notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          onNotification(payload.new as OrderNotification);
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);

    return () => {
      channel.unsubscribe();
      this.channels.delete(channelName);
    };
  }

  /**
   * Subscribe to restaurant notifications
   */
  subscribeToRestaurantNotifications(
    restaurantId: string,
    onNotification: (notification: OrderNotification) => void,
    onAssignment: (assignment: any) => void
  ): () => void {
    const channelName = `restaurant_notifications_${restaurantId}`;
    
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
          table: 'order_notifications',
          filter: `restaurant_id=eq.${restaurantId}`
        },
        (payload) => {
          onNotification(payload.new as OrderNotification);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'restaurant_assignments',
          filter: `restaurant_id=eq.${restaurantId}`
        },
        (payload) => {
          onAssignment(payload.new);
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);

    return () => {
      channel.unsubscribe();
      this.channels.delete(channelName);
    };
  }

  /**
   * Subscribe to order status changes
   */
  subscribeToOrderUpdates(
    orderId: string,
    onUpdate: (orderHistory: any) => void
  ): () => void {
    const channelName = `order_updates_${orderId}`;
    
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
          table: 'order_history',
          filter: `order_id=eq.${orderId}`
        },
        (payload) => {
          onUpdate(payload.new);
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);

    return () => {
      channel.unsubscribe();
      this.channels.delete(channelName);
    };
  }

  /**
   * Get unread notifications for a user
   */
  async getUserNotifications(userId: string, limit: number = 50): Promise<OrderNotification[]> {
    const { data, error } = await supabase
      .from('order_notifications')
      .select('*')
      .eq('order_notifications_user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching user notifications:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get restaurant notifications
   */
  async getRestaurantNotifications(restaurantId: string, limit: number = 50): Promise<OrderNotification[]> {
    const { data, error } = await supabase
      .from('order_notifications')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching restaurant notifications:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    const { error } = await supabase
      .from('order_notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', notificationId);

    return !error;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('order_notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('order_notifications_user_id', userId)
      .eq('is_read', false);

    return !error;
  }

  /**
   * Create a notification
   */
  async createNotification(notification: Omit<OrderNotification, 'id' | 'created_at' | 'is_read'>): Promise<boolean> {
    const { error } = await supabase
      .from('order_notifications')
      .insert(notification);

    return !error;
  }

  /**
   * Cleanup - unsubscribe from all channels
   */
  cleanup(): void {
    this.channels.forEach(channel => channel.unsubscribe());
    this.channels.clear();
  }
}

export const orderNotificationService = new OrderNotificationService();
