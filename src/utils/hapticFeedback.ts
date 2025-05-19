
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Platform } from './platform';

type HapticFeedbackType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection' | 'action' | 'info' | 'confirmation';

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
   * Info notification, alias for light impact
   */
  info: async () => {
    return hapticFeedback.light();
  },
  
  /**
   * Confirmation notification, alias for medium impact
   */
  confirmation: async () => {
    return hapticFeedback.medium();
  },
  
  /**
   * Default action feedback, alias for medium impact
   */
  action: async () => {
    return hapticFeedback.medium();
  },
  
  /**
   * Vibration pattern fallback for non-native platforms that support vibration API
   * @param pattern - Vibration pattern in milliseconds
   */
  vibrate: (pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  },
  
  /**
   * Contextual haptic feedback based on action type
   * @param type - The type of action
   */
  contextual: async (type: HapticFeedbackType) => {
    switch (type) {
      case 'success':
        return hapticFeedback.success();
      case 'error': 
        return hapticFeedback.error();
      case 'warning':
        return hapticFeedback.warning();
      case 'selection':
        return hapticFeedback.selection();
      case 'light':
        return hapticFeedback.light();
      case 'medium':
        return hapticFeedback.medium();
      case 'heavy':
        return hapticFeedback.heavy();
      case 'info':
        return hapticFeedback.info();
      case 'confirmation':
        return hapticFeedback.confirmation();
      case 'action':
      default:
        return hapticFeedback.medium();
    }
  },
  
  /**
   * Impact feedback for buttons and UI controls
   * @param strength - Strength of the impact
   */
  impact: async (strength: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (Platform.isNative()) {
      switch (strength) {
        case 'light':
          await Haptics.impact({ style: ImpactStyle.Light });
          break;
        case 'heavy':
          await Haptics.impact({ style: ImpactStyle.Heavy });
          break;
        case 'medium':
        default:
          await Haptics.impact({ style: ImpactStyle.Medium });
      }
    }
  }
};

export type { HapticFeedbackType };
