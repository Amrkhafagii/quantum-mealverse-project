
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Platform } from './platform';

/**
 * Enhanced haptic feedback utility that provides more advanced patterns
 * by combining multiple haptic impacts with timing delays
 */
export const enhancedHaptics = {
  /**
   * Success pattern: medium impact followed by heavy impact
   */
  success: async () => {
    if (Platform.isNative()) {
      try {
        await Haptics.impact({ style: ImpactStyle.Medium });
        setTimeout(async () => {
          await Haptics.impact({ style: ImpactStyle.Heavy });
        }, 150);
      } catch (error) {
        console.error('Enhanced haptic success pattern error:', error);
      }
    }
  },

  /**
   * Error pattern: three heavy impacts in sequence
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
        console.error('Enhanced haptic error pattern error:', error);
      }
    }
  },

  /**
   * Warning pattern: medium, light, medium
   */
  warning: async () => {
    if (Platform.isNative()) {
      try {
        await Haptics.impact({ style: ImpactStyle.Medium });
        setTimeout(async () => {
          await Haptics.impact({ style: ImpactStyle.Light });
        }, 150);
        setTimeout(async () => {
          await Haptics.impact({ style: ImpactStyle.Medium });
        }, 300);
      } catch (error) {
        console.error('Enhanced haptic warning pattern error:', error);
      }
    }
  },

  /**
   * Selection change pattern: subtle double tap
   */
  selection: async () => {
    if (Platform.isNative()) {
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
        setTimeout(async () => {
          await Haptics.impact({ style: ImpactStyle.Light });
        }, 80);
      } catch (error) {
        console.error('Enhanced haptic selection pattern error:', error);
      }
    }
  },

  /**
   * Action confirmation pattern: single medium impact
   */
  confirmation: async () => {
    if (Platform.isNative()) {
      try {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } catch (error) {
        console.error('Enhanced haptic confirmation pattern error:', error);
      }
    }
  },

  /**
   * Long press activation pattern: light to medium progression
   */
  longPress: async () => {
    if (Platform.isNative()) {
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
        setTimeout(async () => {
          await Haptics.impact({ style: ImpactStyle.Medium });
        }, 200);
      } catch (error) {
        console.error('Enhanced haptic long press pattern error:', error);
      }
    }
  }
};

/**
 * Hook to use the enhanced haptic feedback in components
 */
export const useEnhancedHaptics = () => {
  return enhancedHaptics;
};
