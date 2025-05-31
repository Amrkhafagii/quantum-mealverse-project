import { realtimeNotificationService } from './realtimeNotificationService';

export interface PushNotificationPermissionStatus {
  permission: NotificationPermission;
  isSupported: boolean;
}

class PushNotificationService {
  private vapidKey = 'BKqP1J2RqKjh6J4A5F8RzPo2FfG4J3k7N5m8V9c6X1y2Z3a4B5c6D7e8F9g0H1i2J3k4L5m6N7o8P9q0R1s2T3u4';

  // Check if push notifications are supported
  isSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  }

  // Get current permission status
  getPermissionStatus(): PushNotificationPermissionStatus {
    return {
      permission: this.isSupported() ? Notification.permission : 'denied',
      isSupported: this.isSupported()
    };
  }

  // Request notification permission with better error handling
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      console.warn('Push notifications not supported');
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        try {
          await this.setupServiceWorker();
        } catch (serviceWorkerError) {
          console.error('Service worker setup failed:', serviceWorkerError);
          // Don't fail the permission request if service worker setup fails
        }
      }
      
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  // Setup service worker for push notifications with retry logic
  private async setupServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker not supported');
    }

    const maxRetries = 3;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
        return;
      } catch (error) {
        retries++;
        console.error(`Service Worker registration attempt ${retries} failed:`, error);
        
        if (retries >= maxRetries) {
          throw new Error(`Service Worker registration failed after ${maxRetries} attempts`);
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      }
    }
  }

  // Subscribe to push notifications with comprehensive error handling
  async subscribeToPush(userId: string): Promise<boolean> {
    if (!this.isSupported()) {
      console.error('Push notifications not supported');
      return false;
    }

    if (Notification.permission !== 'granted') {
      console.error('Notification permission not granted');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log('Already subscribed to push notifications');
        const token = JSON.stringify(existingSubscription);
        return await realtimeNotificationService.registerPushToken(userId, token, 'web');
      }
      
      // Create new subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidKey)
      });

      const token = JSON.stringify(subscription);
      
      // Register the token with our backend
      const success = await realtimeNotificationService.registerPushToken(userId, token, 'web');
      
      if (success) {
        console.log('Successfully subscribed to push notifications');
      } else {
        console.error('Failed to register push token with backend');
      }
      
      return success;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('permission')) {
          console.error('Permission denied or revoked');
        } else if (error.message.includes('vapid')) {
          console.error('VAPID key configuration error');
        } else if (error.message.includes('endpoint')) {
          console.error('Push service endpoint error');
        }
      }
      
      return false;
    }
  }

  // Register push token with enhanced validation
  async registerToken(
    userId: string,
    token: string,
    platform: 'ios' | 'android' | 'web'
  ): Promise<boolean> {
    if (!userId || !token) {
      console.error('Invalid userId or token for registration');
      return false;
    }

    try {
      return await realtimeNotificationService.registerPushToken(userId, token, platform);
    } catch (error) {
      console.error('Error registering push token:', error);
      return false;
    }
  }

  // Send notification with validation
  async sendNotification(
    userId: string,
    title: string,
    body: string,
    data: Record<string, any> = {},
    notificationType: string
  ): Promise<string | null> {
    if (!userId || !title || !body) {
      console.error('Invalid parameters for sending notification');
      return null;
    }

    try {
      return await realtimeNotificationService.createNotification(
        userId,
        title,
        body,
        notificationType,
        data.orderId,
        data.restaurantId,
        data.deliveryUserId,
        data
      );
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  }

  // Show local notification with error handling
  showNotification(title: string, message: string, data?: any): void {
    if (!this.isSupported() || Notification.permission !== 'granted') {
      console.warn('Cannot show notification: not supported or permission denied');
      return;
    }

    try {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, {
          body: message,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          data: data,
          tag: data?.orderId || 'default',
          requireInteraction: true
        });
      }).catch(error => {
        console.error('Error showing notification:', error);
      });
    } catch (error) {
      console.error('Error preparing notification:', error);
    }
  }

  // Helper function to convert VAPID key
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    try {
      const padding = '='.repeat((4 - base64String.length % 4) % 4);
      const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);

      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    } catch (error) {
      console.error('Error converting VAPID key:', error);
      throw new Error('Invalid VAPID key format');
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe(): Promise<boolean> {
    if (!this.isSupported()) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        const success = await subscription.unsubscribe();
        console.log('Unsubscribed from push notifications:', success);
        return success;
      }
      
      return true; // Already unsubscribed
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  }
}

export const pushNotificationService = new PushNotificationService();
