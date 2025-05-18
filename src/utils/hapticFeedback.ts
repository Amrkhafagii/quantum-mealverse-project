
import { Capacitor } from '@capacitor/core';

// Define a simple interface for haptic feedback
interface HapticFeedback {
  impact: (style?: 'light' | 'medium' | 'heavy') => Promise<void>;
  notification: (type?: 'success' | 'warning' | 'error') => Promise<void>;
  selection: () => Promise<void>;
  vibrate: (duration?: number) => Promise<void>;
  success: () => Promise<void>;
  warning: () => Promise<void>;
  error: () => Promise<void>;
  light: () => Promise<void>;
  medium: () => Promise<void>;
  heavy: () => Promise<void>;
  contextual: (context: 'success' | 'error' | 'warning' | 'info' | 'selection' | 'confirmation') => Promise<void>;
}

class NativeHapticFeedback implements HapticFeedback {
  private haptics: any;

  constructor() {
    // Lazily load the haptics API to avoid issues in web environments
    this.initHaptics();
  }

  private async initHaptics() {
    if (Capacitor.isNativePlatform()) {
      try {
        const { Haptics } = await import('@capacitor/haptics');
        this.haptics = Haptics;
      } catch (err) {
        console.log('Haptics not available:', err);
      }
    }
  }

  async impact(style: 'light' | 'medium' | 'heavy' = 'medium'): Promise<void> {
    if (!this.haptics) return;
    
    try {
      await this.haptics.impact({ style });
    } catch (err) {
      console.error('Error triggering haptic impact:', err);
      // Fallback to vibration
      await this.vibrate(10);
    }
  }

  async notification(type: 'success' | 'warning' | 'error' = 'success'): Promise<void> {
    if (!this.haptics) return;
    
    try {
      await this.haptics.notification({ type });
    } catch (err) {
      console.error('Error triggering haptic notification:', err);
      // Fallback to vibration
      await this.vibrate(type === 'error' ? 100 : 20);
    }
  }

  async selection(): Promise<void> {
    if (!this.haptics) return;
    
    try {
      await this.haptics.selectionStart();
      setTimeout(async () => {
        try {
          await this.haptics.selectionChanged();
          setTimeout(async () => {
            try {
              await this.haptics.selectionEnd();
            } catch (err) {
              console.error('Error ending haptic selection:', err);
            }
          }, 10);
        } catch (err) {
          console.error('Error changing haptic selection:', err);
        }
      }, 10);
    } catch (err) {
      console.error('Error triggering haptic selection:', err);
      // Fallback to vibration
      await this.vibrate(5);
    }
  }

  async vibrate(duration: number = 20): Promise<void> {
    if (!this.haptics) return;
    
    try {
      await this.haptics.vibrate({ duration });
    } catch (err) {
      console.error('Error triggering vibration:', err);
      // Try using the navigator.vibrate API as fallback
      if (navigator && navigator.vibrate) {
        navigator.vibrate(duration);
      }
    }
  }

  async success(): Promise<void> {
    await this.notification('success');
  }

  async warning(): Promise<void> {
    await this.notification('warning');
  }

  async error(): Promise<void> {
    await this.notification('error');
  }

  async light(): Promise<void> {
    await this.impact('light');
  }

  async medium(): Promise<void> {
    await this.impact('medium');
  }

  async heavy(): Promise<void> {
    await this.impact('heavy');
  }

  async contextual(context: 'success' | 'error' | 'warning' | 'info' | 'selection' | 'confirmation'): Promise<void> {
    switch (context) {
      case 'success':
        await this.success();
        break;
      case 'error':
        await this.error();
        break;
      case 'warning':
        await this.warning();
        break;
      case 'info':
        await this.light();
        break;
      case 'selection':
        await this.selection();
        break;
      case 'confirmation':
        await this.medium();
        break;
    }
  }
}

// Web fallback using navigator.vibrate
class WebHapticFeedback implements HapticFeedback {
  async impact(): Promise<void> {
    await this.vibrate(10);
  }

  async notification(type: 'success' | 'warning' | 'error' = 'success'): Promise<void> {
    await this.vibrate(type === 'error' ? 100 : type === 'warning' ? 50 : 20);
  }

  async selection(): Promise<void> {
    await this.vibrate(5);
  }

  async vibrate(duration: number = 20): Promise<void> {
    if (navigator && navigator.vibrate) {
      navigator.vibrate(duration);
    }
  }

  async success(): Promise<void> {
    await this.vibrate(20);
  }

  async warning(): Promise<void> {
    await this.vibrate(50);
  }

  async error(): Promise<void> {
    await this.vibrate(100);
  }

  async light(): Promise<void> {
    await this.vibrate(5);
  }

  async medium(): Promise<void> {
    await this.vibrate(15);
  }

  async heavy(): Promise<void> {
    await this.vibrate(25);
  }

  async contextual(context: 'success' | 'error' | 'warning' | 'info' | 'selection' | 'confirmation'): Promise<void> {
    switch (context) {
      case 'success':
        await this.success();
        break;
      case 'error':
        await this.error();
        break;
      case 'warning':
        await this.warning();
        break;
      case 'info':
        await this.light();
        break;
      case 'selection':
        await this.selection();
        break;
      case 'confirmation':
        await this.medium();
        break;
    }
  }
}

// Create and export the appropriate implementation based on platform
export const hapticFeedback: HapticFeedback = 
  Capacitor.isNativePlatform() ? new NativeHapticFeedback() : new WebHapticFeedback();
