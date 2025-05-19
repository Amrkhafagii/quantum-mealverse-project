
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Platform } from './platform';

/**
 * Cross-platform haptic feedback utility for providing tactile feedback
 * with fallbacks for web platforms.
 */
export const hapticFeedback = {
  /**
   * Light impact haptic feedback suitable for UI element changes
   */
  light: async () => {
    if (Platform.isNative()) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  },
  
  /**
   * Medium impact haptic feedback for typical interactions
   */
  medium: async () => {
    if (Platform.isNative()) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }
  },
  
  /**
   * Heavy impact haptic feedback for significant events
   */
  heavy: async () => {
    if (Platform.isNative()) {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    }
  },
  
  /**
   * Success notification haptic feedback for positive outcomes
   */
  success: async () => {
    if (Platform.isNative()) {
      await Haptics.notification({ type: NotificationType.Success });
    }
  },
  
  /**
   * Warning notification haptic feedback for attention
   */
  warning: async () => {
    if (Platform.isNative()) {
      await Haptics.notification({ type: NotificationType.Warning });
    }
  },
  
  /**
   * Error notification haptic feedback for critical errors
   */
  error: async () => {
    if (Platform.isNative()) {
      await Haptics.notification({ type: NotificationType.Error });
    }
  },
  
  /**
   * Selection feedback, gentle feedback for selection events
   */
  selection: async () => {
    if (Platform.isNative()) {
      await Haptics.selectionStart();
      setTimeout(() => Haptics.selectionChanged(), 10);
      setTimeout(() => Haptics.selectionEnd(), 50);
    }
  },
  
  /**
   * Vibration pattern fallback for non-native platforms that support vibration API
   * @param pattern - Vibration pattern in milliseconds
   */
  vibrate: (pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }
};
