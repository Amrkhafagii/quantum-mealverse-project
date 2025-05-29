
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

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      await this.setupServiceWorker();
    }
    
    return permission;
  }

  // Setup service worker for push notifications
  private async setupServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  // Subscribe to push notifications
  async subscribeToPush(userId: string): Promise<boolean> {
    if (!this.isSupported() || Notification.permission !== 'granted') {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidKey)
      });

      const token = JSON.stringify(subscription);
      
      // Register the token with our backend
      return await realtimeNotificationService.registerPushToken(
        userId,
        token,
        'web'
      );
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return false;
    }
  }

  // Register push token (added method)
  async registerToken(
    userId: string,
    token: string,
    platform: 'ios' | 'android' | 'web'
  ): Promise<boolean> {
    return await realtimeNotificationService.registerPushToken(
      userId,
      token,
      platform
    );
  }

  // Send notification (added method)
  async sendNotification(
    userId: string,
    title: string,
    body: string,
    data: Record<string, any> = {},
    notificationType: string
  ): Promise<string | null> {
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
  }

  // Show local notification (for web)
  showNotification(title: string, message: string, data?: any): void {
    if (!this.isSupported() || Notification.permission !== 'granted') {
      return;
    }

    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification(title, {
        body: message,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        data: data,
        tag: data?.orderId || 'default',
        requireInteraction: true
      });
    });
  }

  // Helper function to convert VAPID key
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
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
  }
}

export const pushNotificationService = new PushNotificationService();
