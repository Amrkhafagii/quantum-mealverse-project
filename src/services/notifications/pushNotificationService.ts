
import { supabase } from '@/integrations/supabase/client';
import type { PushNotificationToken, PushNotification } from '@/types/delivery-features';

class PushNotificationService {
  async registerToken(
    userId: string,
    token: string,
    platform: 'ios' | 'android' | 'web',
    deviceId?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('push_notification_tokens')
        .upsert({
          user_id: userId,
          token,
          platform,
          device_id: deviceId,
          is_active: true
        });

      return !error;
    } catch (error) {
      console.error('Error registering push token:', error);
      return false;
    }
  }

  async unregisterToken(userId: string, token: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('push_notification_tokens')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('token', token);

      return !error;
    } catch (error) {
      console.error('Error unregistering push token:', error);
      return false;
    }
  }

  async sendNotification(
    userId: string,
    title: string,
    body: string,
    data: Record<string, any> = {},
    notificationType: string
  ): Promise<string | null> {
    try {
      // Get user's active tokens
      const { data: tokens } = await supabase
        .from('push_notification_tokens')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (!tokens || tokens.length === 0) {
        console.log('No active tokens found for user:', userId);
        return null;
      }

      // Create notification record
      const { data: notification, error } = await supabase
        .from('push_notifications')
        .insert({
          user_id: userId,
          title,
          body,
          data,
          notification_type: notificationType
        })
        .select()
        .single();

      if (error) throw error;

      // Send to each platform
      for (const token of tokens) {
        await this.sendToDevice(token, title, body, data);
      }

      // Update notification status
      await supabase
        .from('push_notifications')
        .update({ 
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', notification.id);

      return notification.id;
    } catch (error) {
      console.error('Error sending push notification:', error);
      return null;
    }
  }

  private async sendToDevice(
    token: PushNotificationToken,
    title: string,
    body: string,
    data: Record<string, any>
  ): Promise<void> {
    try {
      if (token.platform === 'web') {
        // Web push notification
        await this.sendWebPush(token.token, title, body, data);
      } else {
        // Mobile push notification (FCM/APNS)
        await this.sendMobilePush(token, title, body, data);
      }
    } catch (error) {
      console.error(`Error sending to ${token.platform}:`, error);
    }
  }

  private async sendWebPush(
    token: string,
    title: string,
    body: string,
    data: Record<string, any>
  ): Promise<void> {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if we have permission
      if (Notification.permission === 'granted') {
        registration.showNotification(title, {
          body,
          data,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          vibrate: [200, 100, 200],
          tag: data.orderId || 'default'
        });
      }
    }
  }

  private async sendMobilePush(
    token: PushNotificationToken,
    title: string,
    body: string,
    data: Record<string, any>
  ): Promise<void> {
    // Call edge function to send mobile push
    const { error } = await supabase.functions.invoke('send-push-notification', {
      body: {
        token: token.token,
        platform: token.platform,
        title,
        body,
        data
      }
    });

    if (error) {
      console.error('Error calling push notification function:', error);
    }
  }

  async getUserNotifications(userId: string, limit = 50): Promise<PushNotification[]> {
    try {
      const { data, error } = await supabase
        .from('push_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      return data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission;
    }
    return 'denied';
  }
}

export const pushNotificationService = new PushNotificationService();
