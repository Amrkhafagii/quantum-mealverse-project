
import { useState, useEffect } from 'react';
import { notificationService, Notification } from '@/services/notifications/notificationService';
import type { OrderNotification } from '@/types/notifications';
import { useRestaurantAuth } from './useRestaurantAuth';

// Helper function to convert Notification to OrderNotification
const convertToOrderNotification = (notification: Notification): OrderNotification => ({
  id: notification.id,
  title: notification.title,
  message: notification.message,
  order_id: '', // Default empty since not in Notification type
  notification_type: notification.type as any, // Type assertion
  is_read: notification.read,
  read_at: notification.read ? notification.updated_at : null,
  created_at: notification.created_at,
  metadata: null, // Default null since not in Notification type
  user_id: notification.user_id // Add missing user_id property
});

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
        
        // Convert Notification[] to OrderNotification[]
        const convertedNotifications = notificationsData.map(convertToOrderNotification);
        setNotifications(convertedNotifications);
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
        const convertedNotification = convertToOrderNotification(newNotification);
        setNotifications(prev => [convertedNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
      }
    );

    return () => {
      subscription.unsubscribe();
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
