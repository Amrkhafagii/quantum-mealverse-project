
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
  }
};
