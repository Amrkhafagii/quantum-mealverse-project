
import { useState, useEffect } from 'react';
// Import notificationService as a default import (adjust this if you have named export).
import notificationService from '@/services/notifications/notificationService';
// Import Notification type from types/notifications (fall back to local type if necessary)
import type { Notification } from '@/types/notifications';
// If Notification type does not exist, define a local fallback. Adjust as needed for your actual Notification structure:

// Fallback interface (delete if correct type exists in @/types/notifications)
export interface RestaurantNotification {
  id: string;
  title: string;
  message: string;
  order_id?: string;
  notification_type?: string;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
  metadata?: any;
  user_id?: string;
  updated_at?: string;
}

import { useRestaurantAuth } from './useRestaurantAuth';

// Helper function to convert backend notification to local Notification type
const convertToRestaurantNotification = (notification: any): RestaurantNotification => ({
  id: notification.id,
  title: notification.title,
  message: notification.message,
  order_id: notification.order_id || '',
  notification_type: notification.type || '',
  is_read: !!notification.read,
  read_at: notification.read ? notification.updated_at : null,
  created_at: notification.created_at,
  metadata: notification.metadata || null,
  user_id: notification.user_id || '',
  updated_at: notification.updated_at
});

export const useRestaurantNotifications = () => {
  const { restaurant } = useRestaurantAuth();
  const [notifications, setNotifications] = useState<RestaurantNotification[]>([]);
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
        const convertedNotifications = notificationsData.map(convertToRestaurantNotification);
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
        const convertedNotification = convertToRestaurantNotification(newNotification);
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

