
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Platform } from './platform';

/**
 * Utility for providing haptic feedback on mobile devices
 */
export const hapticFeedback = {
  /**
   * Trigger light impact haptic feedback
   */
  light: async () => {
    if (Platform.isNative()) {
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch (error) {
        console.error('Haptic feedback error:', error);
      }
    }
  },

  /**
   * Trigger medium impact haptic feedback
   */
  medium: async () => {
    if (Platform.isNative()) {
      try {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } catch (error) {
        console.error('Haptic feedback error:', error);
      }
    }
  },

  /**
   * Trigger heavy impact haptic feedback
   */
  heavy: async () => {
    if (Platform.isNative()) {
      try {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      } catch (error) {
        console.error('Haptic feedback error:', error);
      }
    }
  },

  /**
   * Trigger vibration/notification haptic feedback
   */
  notification: async () => {
    if (Platform.isNative()) {
      try {
        await Haptics.notification();
      } catch (error) {
        console.error('Haptic notification error:', error);
      }
    }
  },

  /**
   * Trigger success haptic feedback pattern
   */
  success: async () => {
    if (Platform.isNative()) {
      try {
        await Haptics.impact({ style: ImpactStyle.Medium });
        setTimeout(async () => {
          await Haptics.impact({ style: ImpactStyle.Heavy });
        }, 150);
      } catch (error) {
        console.error('Haptic success pattern error:', error);
      }
    }
  },

  /**
   * Trigger error haptic feedback pattern
   */
  error: async () => {
    if (Platform.isNative()) {
      try {
        await Haptics.impact({ style: ImpactStyle.Heavy });
        setTimeout(async () => {
          await Haptics.impact({ style: ImpactStyle.Heavy });
        }, 150);
        setTimeout(async () => {
          await Haptics.impact({ style: ImpactStyle.Heavy });
        }, 300);
      } catch (error) {
        console.error('Haptic error pattern error:', error);
      }
    }
  }
};
