
/**
 * Platform utility class for detecting and working with different device platforms
 * Handles iOS, Android, and web platforms with graceful degradation
 */
export class Platform {
  // Cache for platform detection results to avoid repeated calculations
  private static _cache: {
    platformName?: string;
    isIOS?: boolean;
    isAndroid?: boolean;
    iPhoneModel?: string;
    hasNotch?: boolean;
    hasDynamicIsland?: boolean;
    safeAreaInsets?: {top: number; right: number; bottom: number; left: number};
    statusBarHeight?: number;
    initialized?: boolean;
  } = {};

  /**
   * Safely get the platform name with fallbacks
   */
  static getPlatformName(): string {
    // Return cached value if available
    if (this._cache.platformName !== undefined) {
      return this._cache.platformName;
    }
    
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || !window) {
        this._cache.platformName = 'web';
        return 'web';
      }
      
      // Check for Capacitor global object
      const capacitorGlobal = (window as any).Capacitor;
      if (!capacitorGlobal) {
        this._cache.platformName = 'web';
        return 'web';
      }
      
      // Get platform from Capacitor
      try {
        const platform = capacitorGlobal.getPlatform();
        if (platform === 'ios') {
          this._cache.platformName = 'ios';
          return 'ios';
        }
        if (platform === 'android') {
          this._cache.platformName = 'android';
          return 'android';
        }
      } catch (innerError) {
        console.warn('Error getting platform from Capacitor:', innerError);
      }
      
      this._cache.platformName = 'web';
      return 'web';
    } catch (error) {
      console.warn('Error detecting platform:', error);
      this._cache.platformName = 'web';
      return 'web';
    }
  }

  /**
   * Check if the platform utility has been initialized
   */
  static isInitialized(): boolean {
    // Return cached initialization status if available
    if (this._cache.initialized !== undefined) {
      return this._cache.initialized;
    }
    
    // Consider initialized if we have successfully determined the platform
    const initialized = this._cache.platformName !== undefined;
    this._cache.initialized = initialized;
    return initialized;
  }

  /**
   * Mark the platform as initialized
   */
  static setInitialized(value: boolean = true): void {
    this._cache.initialized = value;
  }

  // Check if we're in a native platform
  static isNative(): boolean {
    try {
      return this.getPlatformName() !== 'web';
    } catch (e) {
      console.warn('Error checking native platform status:', e);
      return false;
    }
  }

  static isAndroid(): boolean {
    // Return cached value if available
    if (this._cache.isAndroid !== undefined) {
      return this._cache.isAndroid;
    }
    
    try {
      const isAndroid = this.getPlatformName() === 'android';
      this._cache.isAndroid = isAndroid;
      return isAndroid;
    } catch (e) {
      console.warn('Error checking Android platform:', e);
      this._cache.isAndroid = false;
      return false;
    }
  }

  static isIOS(): boolean {
    // Return cached value if available
    if (this._cache.isIOS !== undefined) {
      return this._cache.isIOS;
    }
    
    try {
      const platformName = this.getPlatformName();
      const isIOS = platformName === 'ios';
      this._cache.isIOS = isIOS;
      
      // If not detected as iOS through Capacitor, fall back to user agent check
      if (!isIOS && typeof navigator !== 'undefined' && navigator.userAgent) {
        const iosCheck = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        this._cache.isIOS = iosCheck;
        return iosCheck;
      }
      
      return isIOS;
    } catch (e) {
      console.warn('Error checking iOS platform:', e);
      this._cache.isIOS = false;
      return false;
    }
  }

  static isWeb(): boolean {
    return !this.isNative();
  }
  
  static isTablet(): boolean {
    // Simple heuristic for tablet detection
    if (this.isNative()) {
      // For native, we'll need to implement platform-specific logic in future
      // For now, check for iPad in iOS
      if (this.isIOS()) {
        if (typeof navigator !== 'undefined' && navigator.userAgent) {
          return /iPad/.test(navigator.userAgent);
        }
        return false;
      }
      return false;
    } else {
      // For web: use screen dimensions as a heuristic
      if (typeof window === 'undefined') return false;
      
      const minTabletWidth = 768; // Common breakpoint for tablets
      return window.innerWidth >= minTabletWidth && !this.isMobileBrowser();
    }
  }
  
  static isMobile(): boolean {
    // If on native platform, it's mobile
    if (this.isNative()) return true;
    
    // Otherwise check if it's a mobile browser
    return this.isMobileBrowser();
  }
  
  static async getAndroidVersion(): Promise<number> {
    if (!this.isAndroid()) {
      return 0;
    }
    
    try {
      // Use standard dynamic import instead of Function constructor
      const Device = await import('@capacitor/device').then(m => m.Device);
      
      const info = await Device.getInfo();
      const versionString = info.osVersion || '';
      const majorVersion = parseInt(versionString.split('.')[0]);
      return isNaN(majorVersion) ? 0 : majorVersion;
    } catch (err) {
      console.error('Error getting Android version', err);
      return 0;
    }
  }
  
  // Get iOS version number
  static async getIOSVersion(): Promise<number> {
    if (!this.isIOS()) {
      return 0;
    }
    
    try {
      // Use standard dynamic import instead of Function constructor
      const Device = await import('@capacitor/device').then(m => m.Device);
      
      const info = await Device.getInfo();
      const versionString = info.osVersion || '';
      const majorVersion = parseInt(versionString.split('.')[0]);
      return isNaN(majorVersion) ? 0 : majorVersion;
    } catch (err) {
      console.error('Error getting iOS version', err);
      return 0;
    }
  }

  // Detect iPhone model using screen dimensions
  static getiPhoneModel(): string {
    // Return cached value if available
    if (this._cache.iPhoneModel) {
      return this._cache.iPhoneModel;
    }
    
    if (!this.isIOS() || !this.isMobile() || typeof window === 'undefined') {
      this._cache.iPhoneModel = 'unknown';
      return 'unknown';
    }
    
    try {
      const { width, height } = window.screen;
      if (!width || !height) {
        this._cache.iPhoneModel = 'unknown';
        return 'unknown';
      }
      
      const maxDim = Math.max(width, height);
      const minDim = Math.min(width, height);
      
      // iPhone dimensions for different models (physical pixels in portrait)
      if (maxDim === 568 && minDim === 320) {
        this._cache.iPhoneModel = 'iPhone5_SE1';
        return 'iPhone5_SE1';
      }
      if (maxDim === 667 && minDim === 375) {
        this._cache.iPhoneModel = 'iPhone6_7_8';
        return 'iPhone6_7_8';
      }
      if (maxDim === 736 && minDim === 414) {
        this._cache.iPhoneModel = 'iPhone6_7_8Plus';
        return 'iPhone6_7_8Plus';
      }
      if (maxDim === 812 && minDim === 375) {
        this._cache.iPhoneModel = 'iPhoneX_XS_11Pro_12mini_13mini';
        return 'iPhoneX_XS_11Pro_12mini_13mini';
      }
      if (maxDim === 896 && minDim === 414) {
        this._cache.iPhoneModel = 'iPhoneXR_XSMax_11';
        return 'iPhoneXR_XSMax_11';
      }
      if (maxDim === 844 && minDim === 390) {
        this._cache.iPhoneModel = 'iPhone12_12Pro_13_13Pro_14';
        return 'iPhone12_12Pro_13_13Pro_14';
      }
      if (maxDim === 926 && minDim === 428) {
        this._cache.iPhoneModel = 'iPhone12ProMax_13ProMax_14Plus';
        return 'iPhone12ProMax_13ProMax_14Plus';
      }
      if (maxDim === 852 && minDim === 393) {
        this._cache.iPhoneModel = 'iPhone14Pro';
        return 'iPhone14Pro';
      }
      if (maxDim === 932 && minDim === 430) {
        this._cache.iPhoneModel = 'iPhone14ProMax';
        return 'iPhone14ProMax';
      }
      
      // iPad detection
      if (this.isTablet() && this.isIOS()) {
        this._cache.iPhoneModel = 'iPad';
        return 'iPad';
      }
    } catch (e) {
      console.warn('Error detecting iPhone model:', e);
    }
    
    this._cache.iPhoneModel = 'unknown';
    return 'unknown';
  }
  
  // Get status bar height for iOS devices based on model
  static getStatusBarHeight(): number {
    // Return cached value if available
    if (this._cache.statusBarHeight !== undefined) {
      return this._cache.statusBarHeight;
    }
    
    if (!this.isIOS() || typeof window === 'undefined') {
      this._cache.statusBarHeight = 0;
      return 0;
    }
    
    try {
      const model = this.getiPhoneModel();
      const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
      
      let height = 0;
      
      // Dynamic Island devices
      if (model === 'iPhone14Pro' || model === 'iPhone14ProMax') {
        height = orientation === 'portrait' ? 54 : 21;
      }
      // Notched devices
      else if (model.includes('iPhoneX') || 
          model.includes('iPhone11') || 
          model.includes('iPhone12') || 
          model.includes('iPhone13') || 
          (model.includes('iPhone14') && !model.includes('Pro'))) {
        height = orientation === 'portrait' ? 44 : 0;
      }
      // Non-notched devices
      else {
        height = orientation === 'portrait' ? 20 : 0;
      }
      
      this._cache.statusBarHeight = height;
      return height;
    } catch (e) {
      console.warn('Error determining status bar height:', e);
      this._cache.statusBarHeight = 0;
      return 0;
    }
  }
  
  static hasNotch(): boolean {
    // Return cached value if available
    if (this._cache.hasNotch !== undefined) {
      return this._cache.hasNotch;
    }
    
    if (!this.isIOS()) {
      this._cache.hasNotch = false;
      return false;
    }
    
    try {
      const model = this.getiPhoneModel();
      const hasNotch = model.includes('iPhoneX') || 
                      model.includes('iPhone11') || 
                      model.includes('iPhone12') || 
                      model.includes('iPhone13') || 
                      (model.includes('iPhone14') && !model.includes('Pro'));
      
      this._cache.hasNotch = hasNotch;
      return hasNotch;
    } catch (e) {
      console.warn('Error determining if device has notch:', e);
      this._cache.hasNotch = false;
      return false;
    }
  }
  
  static hasDynamicIsland(): boolean {
    // Return cached value if available
    if (this._cache.hasDynamicIsland !== undefined) {
      return this._cache.hasDynamicIsland;
    }
    
    if (!this.isIOS()) {
      this._cache.hasDynamicIsland = false;
      return false;
    }
    
    try {
      const model = this.getiPhoneModel();
      const hasDynamicIsland = model.includes('iPhone14Pro');
      
      this._cache.hasDynamicIsland = hasDynamicIsland;
      return hasDynamicIsland;
    } catch (e) {
      console.warn('Error determining if device has dynamic island:', e);
      this._cache.hasDynamicIsland = false;
      return false;
    }
  }
  
  static isMobileBrowser(): boolean {
    if (this.isNative()) return true;
    
    try {
      if (typeof navigator === 'undefined') return false;
      
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      return /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
    } catch (e) {
      console.warn('Error determining if device is mobile browser:', e);
      return false;
    }
  }
  
  // Get safe area insets directly from CSS environment variables
  static getSafeAreaInsets(): { top: number; right: number; bottom: number; left: number } {
    // Return cached value if available
    if (this._cache.safeAreaInsets) {
      return this._cache.safeAreaInsets;
    }
    
    if (!this.isIOS() || typeof document === 'undefined') {
      const defaultInsets = { top: 0, right: 0, bottom: 0, left: 0 };
      this._cache.safeAreaInsets = defaultInsets;
      return defaultInsets;
    }
    
    try {
      // Add CSS variables to document if not present
      if (!document.documentElement.style.getPropertyValue('--sat')) {
        document.documentElement.style.setProperty('--sat', 'env(safe-area-inset-top, 0px)');
        document.documentElement.style.setProperty('--sar', 'env(safe-area-inset-right, 0px)');
        document.documentElement.style.setProperty('--sab', 'env(safe-area-inset-bottom, 0px)');
        document.documentElement.style.setProperty('--sal', 'env(safe-area-inset-left, 0px)');
      }
      
      // Get computed values from CSS environment variables
      const style = getComputedStyle(document.documentElement);
      
      const topValue = style.getPropertyValue('--sat').replace('px', '') || '0';
      const rightValue = style.getPropertyValue('--sar').replace('px', '') || '0';
      const bottomValue = style.getPropertyValue('--sab').replace('px', '') || '0';
      const leftValue = style.getPropertyValue('--sal').replace('px', '') || '0';
      
      const top = parseInt(topValue);
      const right = parseInt(rightValue);
      const bottom = parseInt(bottomValue);
      const left = parseInt(leftValue);
      
      const insets = {
        top: isNaN(top) ? 0 : top,
        right: isNaN(right) ? 0 : right,
        bottom: isNaN(bottom) ? 0 : bottom,
        left: isNaN(left) ? 0 : left
      };
      
      // If we got all zeros but this is a device with a notch or dynamic island,
      // use fallback values
      if (insets.top === 0 && (this.hasNotch() || this.hasDynamicIsland())) {
        insets.top = this.getStatusBarHeight();
        
        // Add bottom inset for notched devices
        if (this.hasNotch() || this.hasDynamicIsland()) {
          insets.bottom = 34; // Standard bottom safe area for notched devices
        }
      }
      
      this._cache.safeAreaInsets = insets;
      return insets;
    } catch (err) {
      console.warn('Error getting safe area insets:', err);
      const defaultInsets = { top: 0, right: 0, bottom: 0, left: 0 };
      this._cache.safeAreaInsets = defaultInsets;
      return defaultInsets;
    }
  }
  
  // Reset the cache - useful for testing or when device orientation changes
  static resetCache() {
    this._cache = {};
  }
}

// Add CSS variables for safe area insets to the document root
if (typeof document !== 'undefined' && document.documentElement) {
  document.documentElement.style.setProperty('--sat', 'env(safe-area-inset-top, 0px)');
  document.documentElement.style.setProperty('--sar', 'env(safe-area-inset-right, 0px)');
  document.documentElement.style.setProperty('--sab', 'env(safe-area-inset-bottom, 0px)');
  document.documentElement.style.setProperty('--sal', 'env(safe-area-inset-left, 0px)');
}
