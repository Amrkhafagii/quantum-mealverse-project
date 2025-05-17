
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Platform } from './platform';
import { enhancedHaptics } from './enhancedHapticFeedback';

/**
 * Utility for providing haptic feedback on mobile devices with enhanced patterns
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
   * Two-phase positive feedback
   */
  success: enhancedHaptics.success,

  /**
   * Trigger error haptic feedback pattern
   * Three strong pulses to indicate error
   */
  error: enhancedHaptics.error,
  
  /**
   * Trigger warning haptic feedback pattern
   */
  warning: enhancedHaptics.warning,
  
  /**
   * Trigger confirmation haptic feedback
   */
  confirmation: enhancedHaptics.confirmation,
  
  /**
   * Trigger selection change haptic feedback
   */
  selection: enhancedHaptics.selection,
  
  /**
   * Trigger long press activation haptic feedback
   */
  longPress: enhancedHaptics.longPress,

  /**
   * Trigger contextual haptic feedback based on action type
   * @param context The context for the haptic feedback
   */
  contextual: async (context: 'success' | 'error' | 'warning' | 'info' | 'selection' | 'confirmation') => {
    switch (context) {
      case 'success':
        await enhancedHaptics.success();
        break;
      case 'error':
        await enhancedHaptics.error();
        break;
      case 'warning':
        await enhancedHaptics.warning();
        break;
      case 'info':
        await hapticFeedback.light();
        break;
      case 'selection':
        await enhancedHaptics.selection();
        break;
      case 'confirmation':
        await enhancedHaptics.confirmation();
        break;
      default:
        await hapticFeedback.medium();
    }
  }
};

/**
 * Hook to use haptic feedback in components
 */
export const useHapticFeedback = () => {
  return hapticFeedback;
};
