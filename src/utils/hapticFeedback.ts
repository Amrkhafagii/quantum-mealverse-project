
// Haptic feedback utilities for Capacitor apps
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Platform } from '@/responsive/utils/platform';

export const hapticFeedback = {
  impact: async (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (!Platform.isNative()) return;
    
    try {
      const impactStyle = style === 'light' ? ImpactStyle.Light :
                         style === 'heavy' ? ImpactStyle.Heavy :
                         ImpactStyle.Medium;
      
      await Haptics.impact({ style: impactStyle });
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  },
  
  selection: async () => {
    if (!Platform.isNative()) return;
    
    try {
      await Haptics.selectionChanged();
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  },
  
  success: async () => {
    if (!Platform.isNative()) return;
    
    try {
      await Haptics.notification({ type: 'SUCCESS' });
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  },
  
  warning: async () => {
    if (!Platform.isNative()) return;
    
    try {
      await Haptics.notification({ type: 'WARNING' });
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  },
  
  error: async () => {
    if (!Platform.isNative()) return;
    
    try {
      await Haptics.notification({ type: 'ERROR' });
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  },
  
  light: async () => {
    await hapticFeedback.impact('light');
  },
  
  medium: async () => {
    await hapticFeedback.impact('medium');
  }
};
