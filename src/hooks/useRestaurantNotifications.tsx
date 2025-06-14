import { useState, useEffect } from 'react';
import type { Notification } from '@/types/notifications';
import { useRestaurantAuth } from './useRestaurantAuth';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from '@/services/notification/notificationService';

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
        // Get all notifications for the restaurant user
        const notificationsData = await getNotifications(restaurant.id);
        // Calculate the unread count locally
        const unreadCountData = notificationsData.filter((n: any) => !n.is_read).length;
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

    // The notificationService.subscribeToRestaurantNotifications is not present in the service you have.
    // You might need to remove or replace this part depending on your realtime setup.
    // For now, do not subscribe.

    // Cleanup: nothing to unsubscribe from now
    return undefined;
  }, [restaurant?.id]);

  const markAsRead = async (notificationId: string) => {
    if (!restaurant?.id) return;

    try {
      await markNotificationAsRead(notificationId);
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
      await markAllNotificationsAsRead(restaurant.id);
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
