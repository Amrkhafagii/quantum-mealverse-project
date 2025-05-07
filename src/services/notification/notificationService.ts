
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/types/notification';

// Get notifications for a user
export const getNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    // Use the notifications table that exists
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
    
    return data as Notification[];
  } catch (error) {
    console.error('Error in getNotifications:', error);
    return [];
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
      
    if (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in markNotificationAsRead:', error);
    return false;
  }
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId);
      
    if (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in markAllNotificationsAsRead:', error);
    return false;
  }
};

// Store user notification preferences (in memory since we don't have the table)
const userPreferences = new Map<string, {
  order_status: boolean;
  delivery_alerts: boolean;
  promotions: boolean;
  reminders: boolean;
}>();

// Get user notification preferences
export const getUserNotificationPreferences = async (userId: string) => {
  // Return default preferences or stored preferences
  return userPreferences.get(userId) || {
    order_status: true,
    delivery_alerts: true,
    promotions: false,
    reminders: false
  };
};

// Save user notification preferences
export const saveUserNotificationPreferences = async (
  userId: string, 
  preferences: {
    order_status: boolean;
    delivery_alerts: boolean;
    promotions: boolean;
    reminders: boolean;
  }
) => {
  // Store preferences in memory
  userPreferences.set(userId, preferences);
  return true;
};
