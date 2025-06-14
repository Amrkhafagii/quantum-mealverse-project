
import { supabase } from '@/integrations/supabase/client';
import { Notification, NotificationPreferences } from '@/types/notifications';

export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('notifications_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    // Map database fields to Notification type
    return (data || []).map(item => ({
      id: item.id,
      notifications_user_id: item.notifications_user_id,
      title: item.title,
      message: item.message,
      type: item.notification_type as any, // Map notification_type to type
      link: item.link,
      data: typeof item.data === 'string' ? JSON.parse(item.data) : item.data || {},
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

export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ 
        is_read: true, 
        read_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
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

// Since notification_preferences table doesn't exist in schema, use in-memory storage
const userPreferences = new Map<string, NotificationPreferences>();

export const getNotificationPreferences = async (userId: string): Promise<NotificationPreferences | null> => {
  try {
    // Return stored preferences or default
    const defaultPrefs: NotificationPreferences = {
      id: userId,
      notification_preferences_user_id: userId,
      email_notifications: true,
      push_notifications: true,
      sms_notifications: false,
      order_updates: true,
      promotional_messages: false,
      delivery_updates: true,
      achievement_notifications: true,
      workout_reminders: true,
      meal_plan_reminders: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return userPreferences.get(userId) || defaultPrefs;
  } catch (error) {
    console.error('Error in getNotificationPreferences:', error);
    return null;
  }
};

export const updateNotificationPreferences = async (
  userId: string, 
  preferences: Partial<NotificationPreferences>
): Promise<boolean> => {
  try {
    const currentPrefs = await getNotificationPreferences(userId);
    const updatedPrefs = {
      ...currentPrefs,
      ...preferences,
      updated_at: new Date().toISOString()
    } as NotificationPreferences;
    
    userPreferences.set(userId, updatedPrefs);
    return true;
  } catch (error) {
    console.error('Error in updateNotificationPreferences:', error);
    return false;
  }
};
