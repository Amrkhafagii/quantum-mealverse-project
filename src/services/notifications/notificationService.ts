
import { supabase } from '@/integrations/supabase/client';

export interface Notification {
  id: string;
  user_id: string; // UUID from auth
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'order_status' | 'workout_reminder';
  read: boolean;
  link?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Create a new notification for a user
 */
export const createNotification = async (
  userId: string, // UUID from auth
  title: string,
  message: string,
  type: Notification['type'] = 'info',
  link?: string
): Promise<{ success: boolean; notification?: Notification; error?: any }> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId, // Use UUID string directly
        title,
        message,
        notification_type: type, // Map to database column
        link,
        is_read: false // Map to database column
      })
      .select()
      .single();
      
    if (error) throw error;
    
    // Transform database response to match our interface
    const notification: Notification = {
      id: data.id,
      user_id: data.user_id,
      title: data.title,
      message: data.message,
      type: data.notification_type as Notification['type'],
      read: data.is_read,
      link: data.link,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
    
    return { success: true, notification };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error };
  }
};

/**
 * Get notifications for a user
 */
export const getUserNotifications = async (
  userId: string, // UUID from auth
  limit: number = 20,
  unreadOnly: boolean = false
): Promise<Notification[]> => {
  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId) // Use UUID string
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (unreadOnly) {
      query = query.eq('is_read', false);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Transform database response to match our interface
    return (data || []).map(item => ({
      id: item.id,
      user_id: item.user_id,
      title: item.title,
      message: item.message,
      type: item.notification_type as Notification['type'],
      read: item.is_read,
      link: item.link,
      created_at: item.created_at,
      updated_at: item.updated_at
    }));
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (
  notificationId: string,
  userId: string // UUID from auth
): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('user_id', userId); // Use UUID string
      
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error };
  }
};

/**
 * Mark all notifications as read for a user
 */
export const markAllNotificationsAsRead = async (
  userId: string // UUID from auth
): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq('user_id', userId) // Use UUID string
      .eq('is_read', false);
      
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false, error };
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (
  notificationId: string,
  userId: string // UUID from auth
): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', userId); // Use UUID string
      
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting notification:', error);
    return { success: false, error };
  }
};

/**
 * Get unread notification count for a user
 */
export const getUnreadNotificationCount = async (
  userId: string // UUID from auth
): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId) // Use UUID string
      .eq('is_read', false);
      
    if (error) throw error;
    
    return count || 0;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return 0;
  }
};

/**
 * Send workout reminder notification
 */
export const sendWorkoutReminder = async (
  userId: string, // UUID from auth
  workoutName: string,
  scheduledTime: string
): Promise<{ success: boolean; error?: any }> => {
  return createNotification(
    userId,
    'Workout Reminder',
    `Don't forget about your ${workoutName} workout scheduled for ${scheduledTime}`,
    'workout_reminder',
    '/fitness'
  );
};

/**
 * Send goal achievement notification
 */
export const sendGoalAchievementNotification = async (
  userId: string, // UUID from auth
  goalTitle: string
): Promise<{ success: boolean; error?: any }> => {
  return createNotification(
    userId,
    'Goal Achieved! 🎉',
    `Congratulations! You've successfully completed your goal: ${goalTitle}`,
    'success',
    '/fitness/goals'
  );
};

// Export notification service object for backward compatibility
export const notificationService = {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadNotificationCount,
  sendWorkoutReminder,
  sendGoalAchievementNotification,
  getRestaurantNotifications: getUserNotifications, // Alias for compatibility
  getUnreadCount: getUnreadNotificationCount, // Alias for compatibility
  markAsRead: markNotificationAsRead, // Alias for compatibility
  markAllAsRead: markAllNotificationsAsRead, // Alias for compatibility
  subscribeToRestaurantNotifications: (restaurantId: string, callback: (notification: Notification) => void) => {
    // Simplified subscription - in a real app you'd use Supabase realtime
    return { unsubscribe: () => {} };
  }
};
