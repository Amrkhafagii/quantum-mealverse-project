
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

type HapticStyle = 'light' | 'medium' | 'heavy';

export const hapticFeedback = {
  impact: async (style: HapticStyle = 'medium') => {
    try {
      const impactStyle = style === 'light' ? ImpactStyle.Light : 
                         style === 'heavy' ? ImpactStyle.Heavy : 
                         ImpactStyle.Medium;
      await Haptics.impact({ style: impactStyle });
    } catch (error) {
      console.log('Haptic feedback not available:', error);
    }
  },

  selection: async () => {
    try {
      await Haptics.selectionStart();
    } catch (error) {
      console.log('Haptic feedback not available:', error);
    }
  },

  success: async () => {
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch (error) {
      console.log('Haptic feedback not available:', error);
    }
  },

  warning: async () => {
    try {
      await Haptics.notification({ type: NotificationType.Warning });
    } catch (error) {
      console.log('Haptic feedback not available:', error);
    }
  },

  error: async () => {
    try {
      await Haptics.notification({ type: NotificationType.Error });
    } catch (error) {
      console.log('Haptic feedback not available:', error);
    }
  },

  light: async () => {
    return hapticFeedback.impact('light');
  },

  medium: async () => {
    return hapticFeedback.impact('medium');
  },

  heavy: async () => {
    return hapticFeedback.impact('heavy');
  },

  contextual: async () => {
    return hapticFeedback.selection();
  }
};
