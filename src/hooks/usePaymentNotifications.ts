
import { useState, useEffect, useCallback } from 'react';
import { paymentFlowService } from '@/services/payment/paymentFlowService';
import { PaymentNotification } from '@/types/payment-flow';
import { toast } from '@/hooks/use-toast';

export function usePaymentNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<PaymentNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await paymentFlowService.getPaymentNotifications(userId);
      setNotifications(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load notifications';
      setError(errorMessage);
      console.error('Error loading payment notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await paymentFlowService.markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true, read_at: new Date().toISOString() }
            : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    const unreadNotifications = notifications.filter(n => !n.is_read);
    
    try {
      await Promise.all(
        unreadNotifications.map(notification => 
          paymentFlowService.markNotificationAsRead(notification.id)
        )
      );
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          is_read: true,
          read_at: notification.read_at || new Date().toISOString()
        }))
      );
      
      toast({
        title: 'Notifications Marked as Read',
        description: `${unreadNotifications.length} notifications marked as read`
      });
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      toast({
        title: 'Error',
        description: 'Failed to mark notifications as read',
        variant: 'destructive'
      });
    }
  }, [notifications]);

  // Get unread count
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Load initial data
  useEffect(() => {
    if (userId) {
      loadNotifications();
    }
  }, [userId, loadNotifications]);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = paymentFlowService.subscribeToNotifications(
      userId,
      (notification) => {
        setNotifications(prev => [notification, ...prev]);
        
        // Show toast for new notification
        toast({
          title: notification.title,
          description: notification.message,
          duration: 5000
        });
      }
    );

    return unsubscribe;
  }, [userId]);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refreshNotifications: loadNotifications
  };
}
