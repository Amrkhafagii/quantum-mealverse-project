
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
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
    // Check if the device has notification permissions
    const permissionStatus = await PushNotifications.checkPermissions();
    
    if (permissionStatus.receive === 'prompt') {
      // Request permission
      const requestResult = await PushNotifications.requestPermissions();
      if (requestResult.receive !== 'granted') {
        console.log('User denied push notification permissions');
        return false;
      }
    } else if (permissionStatus.receive !== 'granted') {
      console.log('No push notification permission granted');
      return false;
    }

    // Register with FCM/APNS
    await PushNotifications.register();

    // Success listener
    PushNotifications.addListener('registration', 
      async (token: Token) => {
        console.log('Push registration success:', token.value);
        await saveDeviceToken(token.value);
      }
    );

    // Error listener
    PushNotifications.addListener('registrationError', 
      (error: any) => {
        console.error('Push registration error:', error);
      }
    );

    // Notification received listener
    PushNotifications.addListener('pushNotificationReceived', 
      (notification: PushNotificationSchema) => {
        console.log('Push notification received:', notification);
        handleReceivedNotification(notification);
      }
    );

    // Action performed listener (user tapped notification)
    PushNotifications.addListener('pushNotificationActionPerformed', 
      (action: ActionPerformed) => {
        console.log('Push notification action performed:', action);
        handleNotificationAction(action);
      }
    );
    
    notificationsInitialized = true;
    return true;
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
 * Save the device push notification token to the database
 */
const saveDeviceToken = async (token: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('No authenticated user found when saving device token');
      return false;
    }
    
    // Save device token to user's profile
    const { error } = await supabase
      .from('user_devices')
      .upsert({
        user_id: user.id,
        device_token: token,
        platform: Capacitor.getPlatform(),
        last_updated: new Date().toISOString()
      });
      
    if (error) {
      console.error('Error saving device token:', error);
      return false;
    }
    
    console.log('Device token saved successfully');
    return true;
  } catch (error) {
    console.error('Error in saveDeviceToken:', error);
    return false;
  }
};

/**
 * Handle a received push notification
 */
const handleReceivedNotification = (notification: PushNotificationSchema) => {
  // Show a toast for the notification
  toast({
    title: notification.title || 'New notification',
    description: notification.body || '',
  });
  
  // Process any notification data
  if (notification.data) {
    // Handle specific notification types based on the data
    // This might include updating app state, etc.
    console.log('Notification data:', notification.data);
  }
};

/**
 * Handle a user action on a push notification (e.g., tap)
 */
const handleNotificationAction = (action: ActionPerformed) => {
  // Extract data
  const notificationData = action.notification.data;
  
  if (!notificationData) return;
  
  // Handle different notification types
  if (notificationData.type === 'order_status') {
    // Navigate to order details if order_id is available
    if (notificationData.order_id) {
      window.location.href = `/order/${notificationData.order_id}`;
    }
  } else if (notificationData.type === 'delivery_alert') {
    // Handle delivery alerts
    if (notificationData.order_id) {
      window.location.href = `/order/${notificationData.order_id}`;
    }
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
    Capacitor.isPluginAvailable('PushNotifications') || 
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
    
    if (Capacitor.isPluginAvailable('PushNotifications')) {
      const pushStatus = await PushNotifications.checkPermissions();
      result.push = pushStatus.receive === 'granted';
    }
    
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
    if (Capacitor.isPluginAvailable('PushNotifications')) {
      const pushStatus = await PushNotifications.requestPermissions();
      result.push = pushStatus.receive === 'granted';
    }
    
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
