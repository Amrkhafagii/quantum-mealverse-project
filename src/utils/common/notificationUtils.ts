
import { useToast } from '@/hooks/use-toast';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationOptions {
  title: string;
  description?: string;
  type?: NotificationType;
  duration?: number;
}

export const createNotificationHook = () => {
  const { toast } = useToast();

  const showNotification = ({ title, description, type = 'info', duration }: NotificationOptions) => {
    const variant = type === 'error' ? 'destructive' : 'default';
    
    toast({
      title,
      description,
      variant,
      duration
    });
  };

  const showSuccess = (title: string, description?: string) => {
    showNotification({ title, description, type: 'success' });
  };

  const showError = (title: string, description?: string) => {
    showNotification({ title, description, type: 'error' });
  };

  const showWarning = (title: string, description?: string) => {
    showNotification({ title, description, type: 'warning' });
  };

  const showInfo = (title: string, description?: string) => {
    showNotification({ title, description, type: 'info' });
  };

  return {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};
