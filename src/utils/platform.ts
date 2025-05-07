
/**
 * Utility for platform-specific checks and functionality
 */
export const Platform = {
  /**
   * Checks if the app is running in a native environment (Capacitor)
   */
  isNative: () => {
    return typeof window !== 'undefined' && 
      window.hasOwnProperty('Capacitor') && 
      // @ts-ignore - Capacitor global
      window.Capacitor?.isNativePlatform();
  },

  /**
   * Checks if the app is running on iOS
   */
  isIOS: () => {
    if (typeof window !== 'undefined') {
      // Check for native iOS via Capacitor
      if (window.hasOwnProperty('Capacitor')) {
        // @ts-ignore - Capacitor global
        return window.Capacitor?.getPlatform() === 'ios';
      }
      
      // Check for iOS browser
      const userAgent = navigator.userAgent;
      return /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    }
    return false;
  },

  /**
   * Checks if the app is running on Android
   */
  isAndroid: () => {
    if (typeof window !== 'undefined') {
      // Check for native Android via Capacitor
      if (window.hasOwnProperty('Capacitor')) {
        // @ts-ignore - Capacitor global
        return window.Capacitor?.getPlatform() === 'android';
      }
      
      // Check for Android browser
      return /Android/.test(navigator.userAgent);
    }
    return false;
  },

  /**
   * Checks if the app is running in a web browser
   */
  isWeb: () => {
    return !Platform.isNative();
  },

  /**
   * Checks if the app is running in a mobile browser (not a native app)
   */
  isMobileBrowser: () => {
    if (typeof window !== 'undefined' && !Platform.isNative()) {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      
      // Basic mobile browser detection
      return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i.test(userAgent);
    }
    return false;
  },

  /**
   * Gets the current platform name
   */
  getPlatformName: () => {
    if (Platform.isNative()) {
      if (Platform.isIOS()) return 'ios';
      if (Platform.isAndroid()) return 'android';
      return 'native';
    }
    if (Platform.isMobileBrowser()) return 'mobile-web';
    return 'web';
  },

  /**
   * Gets the platform identifier
   * Added to fix getPlatform method references
   */
  getPlatform: () => {
    if (Platform.isIOS()) return 'ios';
    if (Platform.isAndroid()) return 'android';
    if (Platform.isNative()) return 'native';
    if (Platform.isMobileBrowser()) return 'mobile-web';
    return 'web';
  }
};
