
import { useState, useEffect } from 'react';
import { pushNotificationService } from '@/services/notifications/pushNotificationService';
import { useAuth } from '@/hooks/useAuth';
import { Platform } from '@/utils/platform';

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    // Check if push notifications are supported
    const supported = 'Notification' in window && 'serviceWorker' in navigator;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) return false;

    const permission = await pushNotificationService.requestPermission();
    setPermission(permission);
    return permission === 'granted';
  };

  const registerToken = async (): Promise<boolean> => {
    if (!user?.id || !isSupported || permission !== 'granted') return false;

    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: 'your-vapid-public-key' // Replace with actual VAPID key
        });

        const token = JSON.stringify(subscription);
        const platform = Platform.isNative() ? 
          (Platform.isIOS() ? 'ios' : 'android') : 'web';

        const success = await pushNotificationService.registerToken(
          user.id,
          token,
          platform
        );

        setIsRegistered(success);
        return success;
      }
    } catch (error) {
      console.error('Error registering push token:', error);
    }

    return false;
  };

  const sendNotification = async (
    userId: string,
    title: string,
    body: string,
    data: Record<string, any> = {},
    notificationType: string
  ): Promise<string | null> => {
    return pushNotificationService.sendNotification(
      userId,
      title,
      body,
      data,
      notificationType
    );
  };

  return {
    isSupported,
    permission,
    isRegistered,
    requestPermission,
    registerToken,
    sendNotification
  };
};
