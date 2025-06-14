import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { pushNotificationService } from '@/services/notifications/pushNotificationService';

export function usePushNotifications() {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const status = pushNotificationService.getPermissionStatus();
    setPermission(status.permission);
    setIsSupported(status.isSupported);
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    const newPermission = await pushNotificationService.requestPermission();
    setPermission(newPermission);
    
    if (newPermission === 'granted' && user?.id) {
      const subscribed = await pushNotificationService.subscribeToPush(user.id);
      setIsSubscribed(subscribed);
      return subscribed;
    }
    return false;
  };

  const showNotification = (title: string, message: string, data?: any) => {
    pushNotificationService.showNotification(title, message, data);
  };

  return {
    permission,
    isSupported,
    isSubscribed,
    requestPermission,
    showNotification
  };
}
