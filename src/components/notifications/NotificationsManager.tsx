
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { useNotificationPermissions } from '@/hooks/useNotificationPermissions';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications'; 
import { supabase } from '@/integrations/supabase/client';
import { sendLocalNotification } from '@/services/notification/mobileNotificationService';
import { Platform } from '@/utils/platform';

/**
 * NotificationsManager is a component that manages the notification system
 * It should be rendered once at the app root level
 */
export const NotificationsManager = () => {
  const { user } = useAuth();
  const { isSupported, isPermissionGranted, initializeNotifications } = useNotificationPermissions();
  const { fetchNotifications } = useNotifications();

  // Initialize notifications when the user logs in and permissions are granted
  useEffect(() => {
    if (user && isPermissionGranted && isSupported) {
      initializeNotifications();
      fetchNotifications();
    }
  }, [user, isPermissionGranted, isSupported, initializeNotifications, fetchNotifications]);

  // Listen for real-time notifications
  useEffect(() => {
    if (!user || !isPermissionGranted) return;

    // Set up a Supabase subscription to listen for new notifications
    const channel = supabase
      .channel(`notifications_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          handleNewNotification(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isPermissionGranted]);

  // Handle new notifications from Supabase
  const handleNewNotification = (notification: any) => {
    if (!notification) return;

    // If on a native platform, show a local notification
    if (Platform.isNative() && isPermissionGranted) {
      sendLocalNotification(
        notification.title || 'New notification',
        notification.message || '',
        Date.now(),
        {
          type: notification.type || 'system',
          id: notification.id,
          link: notification.link
        }
      );
    }
    
    // The fetchNotifications() call will handle updating the UI
    fetchNotifications();
  };

  // This component doesn't render anything
  return null;
};

export default NotificationsManager;
