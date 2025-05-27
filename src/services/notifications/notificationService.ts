
import { supabase } from '@/integrations/supabase/client';
import type { OrderNotification } from '@/types/notifications';

export class NotificationService {
  // Get notifications for a restaurant
  async getRestaurantNotifications(restaurantId: string, limit = 50): Promise<OrderNotification[]> {
    const { data, error } = await supabase
      .from('order_notifications')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map(notification => ({
      ...notification,
      metadata: notification.metadata || {}
    }));
  }

  // Get unread notification count
  async getUnreadCount(restaurantId: string): Promise<number> {
    const { count, error } = await supabase
      .from('order_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurantId)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('order_notifications')
      .update({ 
        is_read: true, 
        read_at: new Date().toISOString() 
      })
      .eq('id', notificationId);

    if (error) throw error;
  }

  // Mark all notifications as read for a restaurant
  async markAllAsRead(restaurantId: string): Promise<void> {
    const { error } = await supabase
      .from('order_notifications')
      .update({ 
        is_read: true, 
        read_at: new Date().toISOString() 
      })
      .eq('restaurant_id', restaurantId)
      .eq('is_read', false);

    if (error) throw error;
  }

  // Create a new notification
  async createNotification(notification: Omit<OrderNotification, 'id' | 'created_at'>): Promise<OrderNotification> {
    const { data, error } = await supabase
      .from('order_notifications')
      .insert({
        ...notification,
        metadata: notification.metadata || {}
      })
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      metadata: data.metadata || {}
    };
  }

  // Subscribe to real-time notifications
  subscribeToRestaurantNotifications(
    restaurantId: string, 
    callback: (notification: OrderNotification) => void
  ) {
    return supabase
      .channel(`restaurant-notifications-${restaurantId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'order_notifications',
          filter: `restaurant_id=eq.${restaurantId}`
        },
        (payload) => {
          const notification = payload.new as any;
          callback({
            ...notification,
            metadata: notification.metadata || {}
          });
        }
      )
      .subscribe();
  }
}

export const notificationService = new NotificationService();
