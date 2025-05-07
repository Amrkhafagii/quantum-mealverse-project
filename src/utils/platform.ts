
import { Capacitor } from '@capacitor/core';

export const Platform = {
  // Check if running on native mobile
  isNative: (): boolean => {
    return Capacitor.isNativePlatform();
  },
  
  // Check if running on iOS
  isIOS: (): boolean => {
    return Capacitor.getPlatform() === 'ios';
  },
  
  // Check if running on Android
  isAndroid: (): boolean => {
    return Capacitor.getPlatform() === 'android';
  },
  
  // Check if running on web
  isWeb: (): boolean => {
    return Capacitor.getPlatform() === 'web';
  },
  
  // Get platform name
  getPlatform: (): 'ios' | 'android' | 'web' => {
    const platform = Capacitor.getPlatform();
    if (platform === 'ios') return 'ios';
    if (platform === 'android') return 'android';
    return 'web';
  },
  
  // Apply platform specific styles
  applyPlatformClasses: (baseClasses: string): string => {
    const platform = Platform.getPlatform();
    let classes = baseClasses;
    
    if (platform === 'ios') {
      classes += ' ios-safe-area';
    } else if (platform === 'android') {
      classes += ' android-safe-area';
    }
    
    return classes;
  },
  
  // Check if device is in dark mode
  isDarkMode: (): boolean => {
    if (typeof window !== 'undefined') {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  },
  
  // Get safe area insets for the current device
  getSafeAreaInsets: (): { top: number; right: number; bottom: number; left: number } => {
    const defaultInsets = { top: 0, right: 0, bottom: 0, left: 0 };
    
    if (typeof window === 'undefined') return defaultInsets;
    
    // Get CSS variables for safe area insets
    const computedStyle = getComputedStyle(document.documentElement);
    
    return {
      top: parseInt(computedStyle.getPropertyValue('--sat') || '0', 10),
      right: parseInt(computedStyle.getPropertyValue('--sar') || '0', 10),
      bottom: parseInt(computedStyle.getPropertyValue('--sab') || '0', 10),
      left: parseInt(computedStyle.getPropertyValue('--sal') || '0', 10)
    };
  }
};
