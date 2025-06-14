
import { useState, useEffect } from 'react';
import { notificationService } from '@/services/notifications/notificationService';
import type { Notification } from '@/types/notifications';
import { useRestaurantAuth } from './useRestaurantAuth';

// Helper: convert backend to app Notification interface
const convertToNotification = (notification: any, restaurantId: string): Notification => ({
  id: notification.id,
  notifications_user_id: restaurantId,     // Restaurant user ID as per Notification type
  title: notification.title,
  message: notification.message,
  type: notification.type || notification.notification_type || '', // Must exist for UI
  link: notification.link,
  data: notification.metadata || notification.data || null,
  is_read: !!notification.read || notification.is_read,
  read_at: notification.read ? (notification.updated_at || notification.read_at) : null,
  created_at: notification.created_at,
  updated_at: notification.updated_at,
});

export const useRestaurantNotifications = () => {
  const { restaurant } = useRestaurantAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
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
        const convertedNotifications = notificationsData.map((n: any) =>
          convertToNotification(n, restaurant.id)
        );
        setNotifications(convertedNotifications);
        setUnreadCount(unreadCountData);
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();

    const subscription = notificationService.subscribeToRestaurantNotifications(
      restaurant.id,
      (newNotification: any) => {
        const convertedNotification = convertToNotification(newNotification, restaurant.id);
        setNotifications(prev => [convertedNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
      }
    );

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, [restaurant?.id]);

  const markAsRead = async (notificationId: string) => {
    if (!restaurant?.id) return;

    try {
      await notificationService.markAsRead(notificationId, restaurant.id);
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
