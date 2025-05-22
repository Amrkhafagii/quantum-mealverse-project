
/**
 * Utility for platform detection
 */
export class Platform {
  private static initialized = false;
  
  /**
   * Check if platform detection has been initialized
   */
  static isInitialized(): boolean {
    return Platform.initialized;
  }
  
  /**
   * Set initialized state (for internal use)
   */
  static setInitialized(value: boolean): void {
    Platform.initialized = value;
  }
  
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
   * Check if app is running on mobile browser (not native app)
   */
  static isMobileBrowser(): boolean {
    return !Platform.isNative() && Platform.isMobile();
  }
  
  /**
   * Check if app is running on a tablet device
   */
  static isTablet(): boolean {
    if (typeof navigator === 'undefined') return false;
    
    // iOS tablet detection
    if (Platform.isIOS() && navigator.maxTouchPoints > 1) {
      return !(/iPhone/.test(navigator.userAgent));
    }
    
    // Android tablet detection
    if (Platform.isAndroid()) {
      return /Tablet|tablet/.test(navigator.userAgent);
    }
    
    // Generic tablet detection based on screen size
    return typeof window !== 'undefined' && 
      Math.min(window.screen.width, window.screen.height) >= 600;
  }
  
  /**
   * Check if app is running on a mobile device (phone or tablet)
   */
  static isMobile(): boolean {
    return Platform.isIOS() || Platform.isAndroid() || 
      (typeof navigator !== 'undefined' && /Mobi|mobile/i.test(navigator.userAgent));
  }
  
  /**
   * Check if app is running on a native platform (iOS or Android)
   */
  static isNative(): boolean {
    return Platform.isIOS() || Platform.isAndroid() || 
      (typeof (window as any)?.Capacitor !== 'undefined');
  }
  
  /**
   * Check if device has a notch
   */
  static hasNotch(): boolean {
    if (Platform.isIOS()) {
      const model = Platform.getiPhoneModel();
      const notchedModels = ['X', 'XR', 'XS', '11', '12', '13', '14', '15'];
      return notchedModels.some(m => model.includes(m));
    }
    
    // For Android, we can't reliably detect a notch without native APIs
    // So we use a heuristic based on device pixel ratio and year
    if (Platform.isAndroid() && typeof window !== 'undefined') {
      const pixelRatio = window.devicePixelRatio || 1;
      const year = new Date().getFullYear();
      return pixelRatio >= 2.5 && year >= 2018;
    }
    
    return false;
  }
  
  /**
   * Check if device has a dynamic island (iPhone 14 Pro and newer)
   */
  static hasDynamicIsland(): boolean {
    if (!Platform.isIOS()) return false;
    
    const model = Platform.getiPhoneModel();
    return model.includes('14 Pro') || model.includes('15 Pro') || parseInt(model) >= 14;
  }
  
  /**
   * Get iPhone model string
   */
  static getiPhoneModel(): string {
    if (!Platform.isIOS()) return '';
    
    const userAgent = navigator.userAgent;
    const match = userAgent.match(/iPhone(?:\s+|\w+)*\s+(\d+)/i);
    if (match && match[1]) {
      return `iPhone ${match[1]}`;
    }
    
    if (/iPhone/i.test(userAgent)) {
      return 'iPhone';
    }
    
    return '';
  }
  
  /**
   * Get Android version number
   */
  static getAndroidVersion(): number {
    if (!Platform.isAndroid()) return 0;
    
    const match = navigator.userAgent.match(/Android\s+([0-9.]+)/);
    if (match && match[1]) {
      return parseFloat(match[1]);
    }
    
    return 0;
  }
  
  /**
   * Get platform name in a consistent format
   */
  static getPlatformName(): string {
    if (Platform.isIOS()) return 'ios';
    if (Platform.isAndroid()) return 'android';
    return 'web';
  }
  
  /**
   * Reset platform detection cache
   */
  static resetCache(): void {
    Platform.initialized = false;
  }
}
