
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/types/notifications';

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
          user_id: payload.new.notifications_user_id,
          notifications_user_id: payload.new.notifications_user_id,
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
  sendPushNotification,
  getAllUnreadNotifications,
  registerPushToken,
  unregisterPushToken
};

export const notificationService = realtimeNotificationService;
