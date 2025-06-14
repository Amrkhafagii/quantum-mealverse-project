import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { realtimeNotificationService, Notification, OrderEvent } from '@/services/notifications/realtimeNotificationService';

export function useRealtimeNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Use user.id for the 'user_id' filters, but watch for notifications logic in service hook.
  const loadNotifications = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await realtimeNotificationService.getUserNotifications(user.id);
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const handleNewNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.is_read) {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    const success = await realtimeNotificationService.markAsRead(notificationId);
    if (success) {
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    return success;
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return false;
    const success = await realtimeNotificationService.markAllAsRead(user.id);
    if (success) {
      setNotifications(prev => 
        prev.map(n => ({
          ...n,
          is_read: true,
          read_at: n.read_at || new Date().toISOString()
        }))
      );
      setUnreadCount(0);
    }
    return success;
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    loadNotifications();

    // Pass user id, not {table}_user_id - mapping handled in the service.
    const unsubscribe = realtimeNotificationService.subscribeToNotifications(
      user.id,
      handleNewNotification
    );
    return unsubscribe;
  }, [user?.id, loadNotifications, handleNewNotification]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refreshNotifications: loadNotifications
  };
}
