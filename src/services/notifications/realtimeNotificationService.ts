
import { supabase } from '@/integrations/supabase/client';

export interface Notification {
  id: string;
  user_id: string;
  notifications_user_id: string;
  title: string;
  message: string;
  type: string;
  notification_type: string;
  link?: string | null;
  data: Record<string, any>;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderEvent {
  id: string;
  order_id: string;
  event_type: string;
  event_data: Record<string, any>;
  created_at: string;
  user_id?: string;
  delivery_user_id?: string;
  restaurant_id?: string;
}

export const subscribeToUserNotifications = (userId: string, callback: (notification: Notification) => void) => {
  const subscription = supabase
    .channel('user-notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `notifications_user_id=eq.${userId}`
      },
      (payload) => {
        console.log('New notification received:', payload);
        
        const notification: Notification = {
          id: payload.new.id,
          notifications_user_id: payload.new.notifications_user_id,
          user_id: payload.new.notifications_user_id,
          title: payload.new.title,
          message: payload.new.message,
          type: payload.new.notification_type,
          notification_type: payload.new.notification_type,
          link: payload.new.order_id ? `/orders/${payload.new.order_id}` : null,
          data: payload.new.data || {},
          is_read: payload.new.is_read,
          read_at: payload.new.read_at,
          created_at: payload.new.created_at,
          updated_at: payload.new.updated_at
        };
        
        callback(notification);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};

export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('notifications_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user notifications:', error);
      return [];
    }

    return (data || []).map(item => ({
      id: item.id,
      user_id: item.notifications_user_id,
      notifications_user_id: item.notifications_user_id,
      title: item.title,
      message: item.message,
      type: item.notification_type,
      notification_type: item.notification_type,
      link: item.order_id ? `/orders/${item.order_id}` : null,
      data: item.data || {},
      is_read: item.is_read,
      read_at: item.read_at,
      created_at: item.created_at,
      updated_at: item.updated_at
    })) as Notification[];
  } catch (error) {
    console.error('Error in getUserNotifications:', error);
    return [];
  }
};

export const markAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in markAsRead:', error);
    return false;
  }
};

export const markAllAsRead = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('notifications_user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in markAllAsRead:', error);
    return false;
  }
};

export const subscribeToNotifications = (userId: string, callback: (notification: Notification) => void) => {
  return subscribeToUserNotifications(userId, callback);
};

export const subscribeToOrderStatusUpdates = (orderId: string, callback: (notification: any) => void) => {
  const subscription = supabase
    .channel('order-status-updates')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`
      },
      (payload) => {
        console.log('Order status updated:', payload);
        callback(payload);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};

export const subscribeToOrderEvents = (orderId: string, callback: (event: OrderEvent) => void) => {
  const subscription = supabase
    .channel('order-events')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'order_events',
        filter: `order_id=eq.${orderId}`
      },
      (payload) => {
        console.log('Order event received:', payload);
        callback(payload.new as OrderEvent);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};

export const subscribeToDeliveryUpdates = (deliveryUserId: string, callback: (update: any) => void) => {
  const subscription = supabase
    .channel('delivery-updates')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'delivery_assignments',
        filter: `delivery_user_id=eq.${deliveryUserId}`
      },
      (payload) => {
        console.log('Delivery assignment updated:', payload);
        callback(payload);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};

export const createOrderEvent = async (
  orderId: string,
  eventType: string,
  eventData: Record<string, any> = {},
  userId?: string,
  deliveryUserId?: string,
  restaurantId?: string
) => {
  try {
    console.log('Mock creating order event:', { orderId, eventType, eventData });
    return { success: true };
  } catch (error) {
    console.error('Error creating order event:', error);
    return { success: false, error: 'Failed to create order event' };
  }
};

export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  notificationType: string,
  orderId?: string,
  restaurantId?: string,
  deliveryUserId?: string,
  data: Record<string, any> = {}
): Promise<string | null> => {
  try {
    const { data: result, error } = await supabase
      .from('notifications')
      .insert({
        notifications_user_id: userId,
        title,
        message,
        notification_type: notificationType,
        order_id: orderId,
        restaurant_id: restaurantId,
        delivery_user_id: deliveryUserId,
        data
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return null;
    }

    return result?.id || null;
  } catch (error) {
    console.error('Error in createNotification:', error);
    return null;
  }
};

export const sendPushNotification = async (userId: string, title: string, message: string, data?: any) => {
  try {
    console.log('Mock sending push notification to:', userId, title, message);
    return { success: true };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error: 'Failed to send push notification' };
  }
};

export const getAllUnreadNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('notifications_user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching unread notifications:', error);
      return [];
    }

    return (data || []).map(item => ({
      id: item.id,
      user_id: item.notifications_user_id,
      notifications_user_id: item.notifications_user_id,
      title: item.title,
      message: item.message,
      type: item.notification_type,
      notification_type: item.notification_type,
      link: item.order_id ? `/orders/${item.order_id}` : null,
      data: item.data || {},
      is_read: item.is_read,
      read_at: item.read_at,
      created_at: item.created_at,
      updated_at: item.updated_at
    })) as Notification[];
  } catch (error) {
    console.error('Error in getAllUnreadNotifications:', error);
    return [];
  }
};

export const registerPushToken = async (userId: string, token: string, platform: string, deviceId?: string) => {
  try {
    const { error } = await supabase
      .from('push_notification_tokens')
      .insert({
        push_notification_tokens_user_id: userId,
        token: token,
        platform: platform,
        device_id: deviceId,
        is_active: true
      });

    if (error) {
      console.error('Error registering push token:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in registerPushToken:', error);
    return { success: false, error: 'Failed to register push token' };
  }
};

export const unregisterPushToken = async (token: string) => {
  try {
    const { error } = await supabase
      .from('push_notification_tokens')
      .update({ is_active: false })
      .eq('token', token);

    if (error) {
      console.error('Error unregistering push token:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in unregisterPushToken:', error);
    return { success: false, error: 'Failed to unregister push token' };
  }
};

export const realtimeNotificationService = {
  subscribeToUserNotifications,
  subscribeToOrderStatusUpdates,
  subscribeToOrderEvents,
  subscribeToDeliveryUpdates,
  createOrderEvent,
  createNotification,
  sendPushNotification,
  getAllUnreadNotifications,
  registerPushToken,
  unregisterPushToken,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  subscribeToNotifications
};

export const notificationService = realtimeNotificationService;
