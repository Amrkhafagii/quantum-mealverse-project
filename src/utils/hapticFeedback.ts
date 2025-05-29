
import { Platform } from '@/utils/platform';

interface HapticFeedback {
  selection: () => void;
  impact: (style?: 'light' | 'medium' | 'heavy') => void;
  notification: (type?: 'success' | 'warning' | 'error') => void;
}

class HapticFeedbackService implements HapticFeedback {
  selection(): void {
    if (Platform.isNative()) {
      // For Capacitor apps, we would use the Haptics plugin
      // import { Haptics, ImpactStyle } from '@capacitor/haptics';
      // Haptics.selectionStart();
      
      // For now, we'll use web vibration API as fallback
      this.webVibrate(10);
    }
  }

  impact(style: 'light' | 'medium' | 'heavy' = 'medium'): void {
    if (Platform.isNative()) {
      // For Capacitor apps:
      // const impactStyle = style === 'light' ? ImpactStyle.Light : 
      //                    style === 'heavy' ? ImpactStyle.Heavy : ImpactStyle.Medium;
      // Haptics.impact({ style: impactStyle });
      
      // Web fallback
      const duration = style === 'light' ? 20 : style === 'heavy' ? 80 : 50;
      this.webVibrate(duration);
    }
  }

  notification(type: 'success' | 'warning' | 'error' = 'success'): void {
    if (Platform.isNative()) {
      // For Capacitor apps:
      // const notificationType = type === 'success' ? NotificationType.Success :
      //                         type === 'error' ? NotificationType.Error : NotificationType.Warning;
      // Haptics.notification({ type: notificationType });
      
      // Web fallback
      const pattern = type === 'success' ? [50, 50, 50] : 
                     type === 'error' ? [100, 100, 100] : [50, 100, 50];
      this.webVibrate(pattern);
    }
  }

  private webVibrate(duration: number | number[]): void {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(duration);
      } catch (error) {
        console.warn('Vibration not supported or failed:', error);
      }
    }
  }
}

export const hapticFeedback = new HapticFeedbackService();
