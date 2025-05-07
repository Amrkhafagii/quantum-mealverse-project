
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/types/notification';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from '@/services/notification/notificationService';
import { useSupabaseChannel } from './useSupabaseChannel';
import { useConnectionStatus } from './useConnectionStatus';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { isOnline } = useConnectionStatus();

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const fetchedNotifications = await getNotifications(user.id);
      setNotifications(fetchedNotifications);
      
      // Calculate unread count
      const unread = fetchedNotifications.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const handleReadNotification = useCallback(async (notificationId: string) => {
    const success = await markNotificationAsRead(notificationId);
    if (success) {
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    return success;
  }, []);

  const handleReadAllNotifications = useCallback(async () => {
    if (!user?.id) return false;
    
    const success = await markAllNotificationsAsRead(user.id);
    if (success) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
    return success;
  }, [user?.id]);

  // Initial fetch
  useEffect(() => {
    if (user?.id && isOnline) {
      fetchNotifications();
    }
  }, [user?.id, fetchNotifications, isOnline]);

  // Use the optimized Supabase channel hook for notifications
  useSupabaseChannel({
    channelName: `notifications_${user?.id || 'none'}`,
    event: 'INSERT',
    table: 'notifications',
    schema: 'public',
    filter: user?.id ? `user_id=eq.${user.id}` : undefined,
    enabled: !!user?.id && isOnline,
    onMessage: (payload) => {
      const newNotification = payload.new as Notification;
      
      // Add notification to state
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show toast notification
      toast({
        title: newNotification.title,
        description: newNotification.message,
      });
    },
  });

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead: handleReadNotification,
    markAllAsRead: handleReadAllNotifications
  };
};
