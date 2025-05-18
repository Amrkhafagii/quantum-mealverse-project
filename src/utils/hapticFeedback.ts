
import { Capacitor } from '@capacitor/core';

// Define a simple interface for haptic feedback
interface HapticFeedback {
  impact: (style?: 'light' | 'medium' | 'heavy') => void;
  notification: (type?: 'success' | 'warning' | 'error') => void;
  selection: () => void;
  vibrate: (duration?: number) => void;
  success: () => void;
  warning: () => void;
  error: () => void;
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

  impact(style: 'light' | 'medium' | 'heavy' = 'medium') {
    if (!this.haptics) return;
    
    try {
      this.haptics.impact({
        style
      });
    } catch (err) {
      console.error('Error triggering haptic impact:', err);
      // Fallback to vibration
      this.vibrate(10);
    }
  }

  notification(type: 'success' | 'warning' | 'error' = 'success') {
    if (!this.haptics) return;
    
    try {
      this.haptics.notification({
        type
      });
    } catch (err) {
      console.error('Error triggering haptic notification:', err);
      // Fallback to vibration
      this.vibrate(type === 'error' ? 100 : 20);
    }
  }

  selection() {
    if (!this.haptics) return;
    
    try {
      this.haptics.selectionStart();
      setTimeout(() => {
        this.haptics.selectionChanged();
        setTimeout(() => {
          this.haptics.selectionEnd();
        }, 10);
      }, 10);
    } catch (err) {
      console.error('Error triggering haptic selection:', err);
      // Fallback to vibration
      this.vibrate(5);
    }
  }

  vibrate(duration: number = 20) {
    if (!this.haptics) return;
    
    try {
      this.haptics.vibrate({ duration });
    } catch (err) {
      console.error('Error triggering vibration:', err);
      // Try using the navigator.vibrate API as fallback
      if (navigator && navigator.vibrate) {
        navigator.vibrate(duration);
      }
    }
  }

  success() {
    this.notification('success');
  }

  warning() {
    this.notification('warning');
  }

  error() {
    this.notification('error');
  }
}

// Web fallback using navigator.vibrate
class WebHapticFeedback implements HapticFeedback {
  impact() {
    this.vibrate(10);
  }

  notification(type: 'success' | 'warning' | 'error' = 'success') {
    this.vibrate(type === 'error' ? 100 : type === 'warning' ? 50 : 20);
  }

  selection() {
    this.vibrate(5);
  }

  vibrate(duration: number = 20) {
    if (navigator && navigator.vibrate) {
      navigator.vibrate(duration);
    }
  }

  success() {
    this.vibrate(20);
  }

  warning() {
    this.vibrate(50);
  }

  error() {
    this.vibrate(100);
  }
}

// Create and export the appropriate implementation based on platform
export const hapticFeedback: HapticFeedback = 
  Capacitor.isNativePlatform() ? new NativeHapticFeedback() : new WebHapticFeedback();
