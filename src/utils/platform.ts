
/**
 * Utility for platform detection
 */
export class Platform {
  /**
   * Check if app is running on iOS
   */
  static isIOS(): boolean {
    return typeof navigator !== 'undefined' && 
      (/iPad|iPhone|iPod/.test(navigator.userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
  }
  
  /**
   * Check if app is running on Android
   */
  static isAndroid(): boolean {
    return typeof navigator !== 'undefined' && /Android/.test(navigator.userAgent);
  }
  
  /**
   * Check if app is running on web
   */
  static isWeb(): boolean {
    return !Platform.isNative();
  }
  
  /**
   * Check if app is running on a native platform (iOS or Android)
   */
  static isNative(): boolean {
    return Platform.isIOS() || Platform.isAndroid() || 
      (typeof (window as any)?.Capacitor !== 'undefined');
  }
}
