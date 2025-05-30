
import { HapticEngine } from '@capacitor/haptics';

type HapticStyle = 'light' | 'medium' | 'heavy';

export const hapticFeedback = {
  impact: async (style: HapticStyle = 'medium') => {
    try {
      await HapticEngine.impact({ style });
    } catch (error) {
      console.log('Haptic feedback not available:', error);
    }
  },

  selection: async () => {
    try {
      await HapticEngine.selectionStart();
    } catch (error) {
      console.log('Haptic feedback not available:', error);
    }
  },

  success: async () => {
    try {
      await HapticEngine.notification({ type: 'success' });
    } catch (error) {
      console.log('Haptic feedback not available:', error);
    }
  },

  warning: async () => {
    try {
      await HapticEngine.notification({ type: 'warning' });
    } catch (error) {
      console.log('Haptic feedback not available:', error);
    }
  },

  error: async () => {
    try {
      await HapticEngine.notification({ type: 'error' });
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
