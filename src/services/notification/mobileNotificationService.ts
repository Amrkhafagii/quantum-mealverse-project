
import { Capacitor } from '@capacitor/core';
import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Platform } from '@/utils/platform';

// Track if notifications have been initialized to prevent multiple initializations
let notificationsInitialized = false;

/**
 * Initialize push notifications for mobile platforms
 */
export const initializePushNotifications = async (): Promise<boolean> => {
  // Only proceed if this is a native platform and not already initialized
  if (!Capacitor.isNativePlatform() || notificationsInitialized) {
    return false;
  }

  try {
    // Since push notifications are managed separately due to the missing dependency,
    // we'll just return false here to indicate they're not available
    console.log('Push notifications are not currently available');
    return false;
  } catch (error) {
    console.error('Error initializing push notifications:', error);
    return false;
  }
};

/**
 * Initialize local notifications capability for mobile platforms
 */
export const initializeLocalNotifications = async (): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) {
    return false;
  }

  try {
    const permissionStatus = await LocalNotifications.checkPermissions();
    
    if (permissionStatus.display === 'prompt') {
      const requestResult = await LocalNotifications.requestPermissions();
      if (requestResult.display !== 'granted') {
        console.log('User denied local notification permissions');
        return false;
      }
    } else if (permissionStatus.display !== 'granted') {
      console.log('No local notification permission granted');
      return false;
    }
    
    // Set up listeners for local notifications
    LocalNotifications.addListener('localNotificationReceived', 
      (notification) => {
        console.log('Local notification received:', notification);
      }
    );
    
    LocalNotifications.addListener('localNotificationActionPerformed', 
      (notificationAction) => {
        console.log('Local notification action:', notificationAction);
        if (notificationAction.notification.extra) {
          handleLocalNotificationAction(notificationAction);
        }
      }
    );
    
    return true;
  } catch (error) {
    console.error('Error initializing local notifications:', error);
    return false;
  }
};

/**
 * Save the device push notification token (using localStorage as fallback)
 */
const saveDeviceToken = async (token: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('No authenticated user found when saving device token');
      return false;
    }
    
    // Store token in localStorage as we don't have the user_devices table
    try {
      localStorage.setItem(`device_token_${user.id}`, token);
      console.log('Device token saved to localStorage');
      return true;
    } catch (error) {
      console.error('Error saving device token to localStorage:', error);
      return false;
    }
  } catch (error) {
    console.error('Error in saveDeviceToken:', error);
    return false;
  }
};

/**
 * Handle a user action on a local notification
 */
const handleLocalNotificationAction = (action: any) => {
  const notificationData = action.notification.extra;
  
  if (!notificationData) return;
  
  // Similar handling to push notifications
  if (notificationData.type === 'order_status') {
    if (notificationData.order_id) {
      window.location.href = `/order/${notificationData.order_id}`;
    }
  } else if (notificationData.type === 'delivery_approaching') {
    if (notificationData.order_id) {
      window.location.href = `/order/${notificationData.order_id}`;
    }
  }
};

/**
 * Send a local notification
 */
export const sendLocalNotification = async (
  title: string, 
  body: string, 
  id: number = Math.floor(Math.random() * 10000),
  extra?: Record<string, any>
): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) {
    // Fallback to toast notifications on web
    toast({
      title,
      description: body
    });
    return true;
  }
  
  try {
    const notificationOptions: ScheduleOptions = {
      notifications: [
        {
          id,
          title,
          body,
          sound: 'default',
          smallIcon: 'ic_notification', // needs to be added in android resources
          largeIcon: 'ic_notification_large', // needs to be added in android resources
          actionTypeId: '',
          extra
        }
      ]
    };
    
    await LocalNotifications.schedule(notificationOptions);
    return true;
  } catch (error) {
    console.error('Error sending local notification:', error);
    toast({
      title,
      description: body
    });
    return false;
  }
};

/**
 * Send a delivery approaching notification
 */
export const sendDeliveryApproachingNotification = async (
  orderId: string,
  estimatedMinutes: number
): Promise<boolean> => {
  const title = 'Delivery Update';
  const body = `Your delivery is about ${estimatedMinutes} minutes away!`;
  
  return sendLocalNotification(title, body, Date.now(), {
    type: 'delivery_approaching',
    order_id: orderId
  });
};

/**
 * Send an order status update notification
 */
export const sendOrderStatusNotification = async (
  orderId: string,
  status: string,
  restaurantName?: string
): Promise<boolean> => {
  let title = 'Order Update';
  let body = 'Your order status has changed.';
  
  // Create appropriate message based on order status
  switch (status) {
    case 'accepted':
      body = restaurantName ? 
        `${restaurantName} has accepted your order!` :
        'Your order has been accepted!';
      break;
    case 'preparing':
      body = 'Your order is now being prepared.';
      break;
    case 'ready_for_pickup':
      body = 'Your order is ready for pickup!';
      break;
    case 'picked_up':
      body = 'Your order has been picked up by a delivery driver.';
      break;
    case 'on_the_way':
      body = 'Your order is on the way to you now!';
      break;
    case 'delivered':
      body = 'Your order has been delivered. Enjoy!';
      break;
    default:
      body = `Your order status is now: ${status}`;
  }
  
  return sendLocalNotification(title, body, Date.now(), {
    type: 'order_status',
    order_id: orderId,
    status
  });
};

/**
 * Check if notifications are supported on this platform
 */
export const areNotificationsSupported = (): boolean => {
  return Platform.isNative() && (
    Capacitor.isPluginAvailable('LocalNotifications')
  );
};

/**
 * Check if the user has granted notification permissions
 */
export const checkNotificationPermissions = async (): Promise<{
  push: boolean,
  local: boolean
}> => {
  if (!Capacitor.isNativePlatform()) {
    return { push: false, local: false };
  }
  
  try {
    const result = { push: false, local: false };
    
    if (Capacitor.isPluginAvailable('LocalNotifications')) {
      const localStatus = await LocalNotifications.checkPermissions();
      result.local = localStatus.display === 'granted';
    }
    
    return result;
  } catch (error) {
    console.error('Error checking notification permissions:', error);
    return { push: false, local: false };
  }
};

/**
 * Request notification permissions on mobile devices
 */
export const requestNotificationPermissions = async (): Promise<{
  push: boolean,
  local: boolean
}> => {
  if (!Capacitor.isNativePlatform()) {
    return { push: false, local: false };
  }
  
  const result = { push: false, local: false };
  
  try {
    if (Capacitor.isPluginAvailable('LocalNotifications')) {
      const localStatus = await LocalNotifications.requestPermissions();
      result.local = localStatus.display === 'granted';
    }
    
    return result;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return result;
  }
};
