
import { useState, useEffect } from 'react';
import { notificationService } from '@/services/notifications/notificationService';
import type { OrderNotification } from '@/types/notifications';
import { useRestaurantAuth } from './useRestaurantAuth';

export const useRestaurantNotifications = () => {
  const { restaurant } = useRestaurantAuth();
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!restaurant?.id) return;

    const loadNotifications = async () => {
      try {
        const [notificationsData, unreadCountData] = await Promise.all([
          notificationService.getRestaurantNotifications(restaurant.id),
          notificationService.getUnreadCount(restaurant.id)
        ]);
        
        setNotifications(notificationsData);
        setUnreadCount(unreadCountData);
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();

    // Subscribe to real-time notifications
    const subscription = notificationService.subscribeToRestaurantNotifications(
      restaurant.id,
      (newNotification) => {
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [restaurant?.id]);

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, is_read: true, read_at: new Date().toISOString() }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!restaurant?.id) return;
    
    try {
      await notificationService.markAllAsRead(restaurant.id);
      setNotifications(prev =>
        prev.map(notification => ({ 
          ...notification, 
          is_read: true, 
          read_at: new Date().toISOString() 
        }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead
  };
};
