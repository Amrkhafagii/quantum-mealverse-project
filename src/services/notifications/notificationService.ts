
import { supabase } from '@/integrations/supabase/client';
import { Notification, NotificationPreferences } from '@/types/notifications';

export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('notifications_user_id', userId) // Updated field name
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    return data || [];
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

export const getNotificationPreferences = async (userId: string): Promise<NotificationPreferences | null> => {
  try {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('notification_preferences_user_id', userId) // Updated field name
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching notification preferences:', error);
      return null;
    }

    return data || null;
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
    const { error } = await supabase
      .from('notification_preferences')
      .upsert({
        notification_preferences_user_id: userId, // Updated field name
        ...preferences,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'notification_preferences_user_id' // Updated field name
      });

    if (error) {
      console.error('Error updating notification preferences:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateNotificationPreferences:', error);
    return false;
  }
};
