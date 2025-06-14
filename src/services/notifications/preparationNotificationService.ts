
import { supabase } from '@/integrations/supabase/client';

interface PreparationNotification {
  id?: string;
  user_id: string;
  order_id: string;
  restaurant_id?: string;
  title: string;
  message: string;
  stage?: string;
  estimated_completion?: string;
  data?: any;
}

export const sendStageUpdateNotification = async (notification: PreparationNotification) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        notifications_user_id: notification.user_id,
        title: notification.title,
        message: notification.message,
        notification_type: 'preparation_update',
        order_id: notification.order_id,
        restaurant_id: notification.restaurant_id,
        data: notification.data || {}
      });

    if (error) {
      console.error('Error sending stage update notification:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in sendStageUpdateNotification:', error);
    return { success: false, error: 'Failed to send notification' };
  }
};

export const sendDelayNotification = async (notification: PreparationNotification) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        notifications_user_id: notification.user_id,
        title: notification.title,
        message: notification.message,
        notification_type: 'preparation_delay',
        order_id: notification.order_id,
        restaurant_id: notification.restaurant_id,
        data: notification.data || {}
      });

    if (error) {
      console.error('Error sending delay notification:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in sendDelayNotification:', error);
    return { success: false, error: 'Failed to send notification' };
  }
};

export const sendCompletionNotification = async (notification: PreparationNotification) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        notifications_user_id: notification.user_id,
        title: notification.title,
        message: notification.message,
        notification_type: 'preparation_complete',
        order_id: notification.order_id,
        restaurant_id: notification.restaurant_id,
        data: notification.data || {}
      });

    if (error) {
      console.error('Error sending completion notification:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in sendCompletionNotification:', error);
    return { success: false, error: 'Failed to send notification' };
  }
};

export const getPreparationNotifications = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('notifications_user_id', userId)
      .in('notification_type', ['preparation_update', 'preparation_delay', 'preparation_complete'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching preparation notifications:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getPreparationNotifications:', error);
    return [];
  }
};
