
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/types/notification';
import { useAuth } from './useAuth';
import { Platform } from '@/utils/platform';
import { nativeServices } from '@/utils/nativeServices';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch notifications from database
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Convert data and properly type the notifications
      const typedNotifications: Notification[] = (data || []).map(item => ({
        ...item,
        data: typeof item.data === 'string' 
          ? JSON.parse(item.data) 
          : item.data || {}
      }));
      
      setNotifications(typedNotifications);
      
      // Count unread notifications
      const unread = typedNotifications.filter(n => !n.is_read).length;
      setUnreadCount(unread);
      
      // Update app icon badge if on native platform
      if (Platform.isNative()) {
        nativeServices.setBadgeCount(unread);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch notifications'));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Mark a notification as read
  const markAsRead = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id ? { ...notification, is_read: true } : notification
        )
      );
      
      // Decrement unread count
      setUnreadCount(prev => {
        const newCount = Math.max(0, prev - 1);
        
        // Update app badge if on native platform
        if (Platform.isNative()) {
          nativeServices.setBadgeCount(newCount);
        }
        
        return newCount;
      });

      return true;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return false;
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        throw error;
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      
      // Reset unread count and app badge
      setUnreadCount(0);
      
      // Clear app badge if on native platform
      if (Platform.isNative()) {
        nativeServices.clearBadgeCount();
      }

      return true;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      return false;
    }
  };

  // Load notifications on mount and when user changes
  useEffect(() => {
    fetchNotifications();
    
    // Subscribe to notifications
    if (user) {
      const channel = supabase
        .channel(`user-notifications-${user.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, () => {
          fetchNotifications();
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications
  };
};
