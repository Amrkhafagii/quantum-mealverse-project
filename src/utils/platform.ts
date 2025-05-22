
/**
 * Platform detection and utilities
 * This class provides methods to detect the platform and device capabilities
 */
export class Platform {
  private static initialized: boolean = false;
  private static cache: {
    isIOS?: boolean;
    isAndroid?: boolean;
    isNative?: boolean;
    isWeb?: boolean;
    isMobile?: boolean;
    isTablet?: boolean;
    isMobileBrowser?: boolean;
    hasNotch?: boolean;
    hasDynamicIsland?: boolean;
    iPhoneModel?: string;
    androidVersion?: number;
    platformName?: string;
  } = {};
  
  /**
   * Check if platform detection has been initialized
   */
  static isInitialized(): boolean {
    return Platform.initialized;
  }
  
  /**
   * Mark platform detection as initialized
   */
  static setInitialized(value: boolean): void {
    Platform.initialized = value;
  }
  
  /**
   * Reset cached values
   */
  static resetCache(): void {
    Platform.cache = {};
  }
  
  /**
   * Check if the app is running on iOS
   */
  static isIOS(): boolean {
    if (Platform.cache.isIOS !== undefined) {
      return Platform.cache.isIOS;
    }
    
    try {
      // Check for Capacitor bridge
      const isCapacitoriOS = 
        typeof (window as any)?.Capacitor?.getPlatform === 'function' && 
        (window as any).Capacitor.getPlatform() === 'ios';
      
      // Fallback to user agent check if not using Capacitor
      const userAgentiOS = 
        typeof navigator !== 'undefined' && 
        /iPad|iPhone|iPod/.test(navigator.userAgent) &&
        !(window as any).MSStream;
        
      Platform.cache.isIOS = isCapacitoriOS || userAgentiOS;
      return Platform.cache.isIOS;
    } catch (e) {
      console.warn('Error detecting iOS platform:', e);
      return false;
    }
  }
  
  /**
   * Check if the app is running on Android
   */
  static isAndroid(): boolean {
    if (Platform.cache.isAndroid !== undefined) {
      return Platform.cache.isAndroid;
    }
    
    try {
      // Check for Capacitor bridge
      const isCapacitorAndroid = 
        typeof (window as any)?.Capacitor?.getPlatform === 'function' && 
        (window as any).Capacitor.getPlatform() === 'android';
      
      // Fallback to user agent check if not using Capacitor
      const userAgentAndroid = 
        typeof navigator !== 'undefined' && 
        /Android/.test(navigator.userAgent);
        
      Platform.cache.isAndroid = isCapacitorAndroid || userAgentAndroid;
      return Platform.cache.isAndroid;
    } catch (e) {
      console.warn('Error detecting Android platform:', e);
      return false;
    }
  }
  
  /**
   * Check if the app is running in a native environment
   */
  static isNative(): boolean {
    if (Platform.cache.isNative !== undefined) {
      return Platform.cache.isNative;
    }
    
    try {
      // Check for Capacitor bridge
      const isCapacitor = 
        typeof (window as any)?.Capacitor?.isNative === 'boolean' && 
        (window as any).Capacitor.isNative === true;
      
      Platform.cache.isNative = isCapacitor;
      return Platform.cache.isNative;
    } catch (e) {
      console.warn('Error detecting native environment:', e);
      return false;
    }
  }
  
  /**
   * Check if the app is running in a web environment
   */
  static isWeb(): boolean {
    if (Platform.cache.isWeb !== undefined) {
      return Platform.cache.isWeb;
    }
    
    try {
      // If not native, then it's web
      const isWeb = !Platform.isNative();
      Platform.cache.isWeb = isWeb;
      return isWeb;
    } catch (e) {
      console.warn('Error detecting web environment:', e);
      // Default to web if detection fails
      return true;
    }
  }
  
  /**
   * Check if the device is a mobile device
   */
  static isMobile(): boolean {
    if (Platform.cache.isMobile !== undefined) {
      return Platform.cache.isMobile;
    }
    
    try {
      // If native iOS or Android, it's mobile
      if (Platform.isNative() && (Platform.isIOS() || Platform.isAndroid())) {
        Platform.cache.isMobile = true;
        return true;
      }
      
      // For web, check screen size and user agent
      if (typeof window !== 'undefined') {
        const isMobileBySize = window.innerWidth <= 768;
        const isMobileByAgent = typeof navigator !== 'undefined' && 
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        Platform.cache.isMobile = isMobileBySize || isMobileByAgent;
        return Platform.cache.isMobile;
      }
      
      return false;
    } catch (e) {
      console.warn('Error detecting mobile device:', e);
      return false;
    }
  }
  
  /**
   * Check if the device is a tablet
   */
  static isTablet(): boolean {
    if (Platform.cache.isTablet !== undefined) {
      return Platform.cache.isTablet;
    }
    
    try {
      // Only iPads will be treated as tablets on iOS
      if (Platform.isIOS() && 
          typeof navigator !== 'undefined' && 
          /iPad/i.test(navigator.userAgent)) {
        Platform.cache.isTablet = true;
        return true;
      }
      
      // For Android and web, check screen size
      if (typeof window !== 'undefined') {
        const isTabletBySize = window.innerWidth > 768 && window.innerWidth <= 1024;
        
        // Additional check for Android tablets
        const isAndroidTablet = Platform.isAndroid() && 
          typeof navigator !== 'undefined' && 
          !/Mobile/i.test(navigator.userAgent);
        
        Platform.cache.isTablet = isTabletBySize || isAndroidTablet;
        return Platform.cache.isTablet;
      }
      
      return false;
    } catch (e) {
      console.warn('Error detecting tablet device:', e);
      return false;
    }
  }
  
  /**
   * Check if the app is running in a mobile browser
   */
  static isMobileBrowser(): boolean {
    if (Platform.cache.isMobileBrowser !== undefined) {
      return Platform.cache.isMobileBrowser;
    }
    
    try {
      const isMobile = Platform.isMobile();
      const isWeb = Platform.isWeb();
      
      Platform.cache.isMobileBrowser = isMobile && isWeb;
      return Platform.cache.isMobileBrowser;
    } catch (e) {
      console.warn('Error detecting mobile browser:', e);
      return false;
    }
  }
  
  /**
   * Check if the device has a notch
   */
  static hasNotch(): boolean {
    if (Platform.cache.hasNotch !== undefined) {
      return Platform.cache.hasNotch;
    }
    
    try {
      if (!Platform.isIOS()) {
        Platform.cache.hasNotch = false;
        return false;
      }
      
      // Models with notch
      const notchModels = ['X', 'XS', 'XS Max', 'XR', '11', '11 Pro', '11 Pro Max', '12', '12 Mini', '12 Pro', '12 Pro Max', '13', '13 Mini', '13 Pro', '13 Pro Max'];
      const model = Platform.getiPhoneModel();
      
      Platform.cache.hasNotch = notchModels.some(notchModel => model.includes(notchModel));
      return Platform.cache.hasNotch;
    } catch (e) {
      console.warn('Error detecting device notch:', e);
      return false;
    }
  }
  
  /**
   * Check if the device has a Dynamic Island
   */
  static hasDynamicIsland(): boolean {
    if (Platform.cache.hasDynamicIsland !== undefined) {
      return Platform.cache.hasDynamicIsland;
    }
    
    try {
      if (!Platform.isIOS()) {
        Platform.cache.hasDynamicIsland = false;
        return false;
      }
      
      // Models with Dynamic Island
      const dynamicIslandModels = ['14 Pro', '14 Pro Max', '15', '15 Plus', '15 Pro', '15 Pro Max'];
      const model = Platform.getiPhoneModel();
      
      Platform.cache.hasDynamicIsland = dynamicIslandModels.some(dynamicIslandModel => model.includes(dynamicIslandModel));
      return Platform.cache.hasDynamicIsland;
    } catch (e) {
      console.warn('Error detecting Dynamic Island:', e);
      return false;
    }
  }
  
  /**
   * Get the iPhone model name (e.g. "iPhone 14 Pro")
   */
  static getiPhoneModel(): string {
    if (Platform.cache.iPhoneModel !== undefined) {
      return Platform.cache.iPhoneModel;
    }
    
    try {
      if (!Platform.isIOS()) {
        Platform.cache.iPhoneModel = '';
        return '';
      }
      
      if (typeof navigator === 'undefined' || !navigator.userAgent) {
        Platform.cache.iPhoneModel = '';
        return '';
      }
      
      const userAgent = navigator.userAgent;
      const match = userAgent.match(/iPhone(\s+\d+(?:,\d+)?)?/i);
      
      if (!match) {
        Platform.cache.iPhoneModel = '';
        return '';
      }
      
      let model = match[0];
      
      // Handle iPhone X variants and newer
      if (userAgent.includes('iPhone10,3') || userAgent.includes('iPhone10,6')) {
        model = 'iPhone X';
      } else if (userAgent.includes('iPhone11,2')) {
        model = 'iPhone XS';
      } else if (userAgent.includes('iPhone11,4') || userAgent.includes('iPhone11,6')) {
        model = 'iPhone XS Max';
      } else if (userAgent.includes('iPhone11,8')) {
        model = 'iPhone XR';
      } else if (userAgent.includes('iPhone12,1')) {
        model = 'iPhone 11';
      } else if (userAgent.includes('iPhone12,3')) {
        model = 'iPhone 11 Pro';
      } else if (userAgent.includes('iPhone12,5')) {
        model = 'iPhone 11 Pro Max';
      } else if (userAgent.includes('iPhone13,1')) {
        model = 'iPhone 12 Mini';
      } else if (userAgent.includes('iPhone13,2')) {
        model = 'iPhone 12';
      } else if (userAgent.includes('iPhone13,3')) {
        model = 'iPhone 12 Pro';
      } else if (userAgent.includes('iPhone13,4')) {
        model = 'iPhone 12 Pro Max';
      } else if (userAgent.includes('iPhone14,2')) {
        model = 'iPhone 13 Pro';
      } else if (userAgent.includes('iPhone14,3')) {
        model = 'iPhone 13 Pro Max';
      } else if (userAgent.includes('iPhone14,4')) {
        model = 'iPhone 13 Mini';
      } else if (userAgent.includes('iPhone14,5')) {
        model = 'iPhone 13';
      } else if (userAgent.includes('iPhone14,7')) {
        model = 'iPhone 14';
      } else if (userAgent.includes('iPhone14,8')) {
        model = 'iPhone 14 Plus';
      } else if (userAgent.includes('iPhone15,2')) {
        model = 'iPhone 14 Pro';
      } else if (userAgent.includes('iPhone15,3')) {
        model = 'iPhone 14 Pro Max';
      } else if (userAgent.includes('iPhone15,4')) {
        model = 'iPhone 15';
      } else if (userAgent.includes('iPhone15,5')) {
        model = 'iPhone 15 Plus';
      } else if (userAgent.includes('iPhone16,1')) {
        model = 'iPhone 15 Pro';
      } else if (userAgent.includes('iPhone16,2')) {
        model = 'iPhone 15 Pro Max';
      }
      
      Platform.cache.iPhoneModel = model;
      return model;
    } catch (e) {
      console.warn('Error detecting iPhone model:', e);
      return '';
    }
  }
  
  /**
   * Get Android version as a number (e.g. 10, 11, 12)
   */
  static getAndroidVersion(): number {
    if (Platform.cache.androidVersion !== undefined) {
      return Platform.cache.androidVersion;
    }
    
    try {
      if (!Platform.isAndroid()) {
        Platform.cache.androidVersion = 0;
        return 0;
      }
      
      if (typeof navigator === 'undefined' || !navigator.userAgent) {
        Platform.cache.androidVersion = 0;
        return 0;
      }
      
      const match = navigator.userAgent.match(/Android\s+([\d\.]+)/i);
      if (!match) {
        Platform.cache.androidVersion = 0;
        return 0;
      }
      
      // Get major version number
      const versionString = match[1];
      const versionNumber = parseInt(versionString.split('.')[0], 10);
      
      Platform.cache.androidVersion = versionNumber || 0;
      return Platform.cache.androidVersion;
    } catch (e) {
      console.warn('Error detecting Android version:', e);
      return 0;
    }
  }

  /**
   * Get platform name for logging and analytics
   */
  static getPlatformName(): string {
    if (Platform.cache.platformName !== undefined) {
      return Platform.cache.platformName;
    }
    
    try {
      if (Platform.isNative()) {
        if (Platform.isIOS()) {
          Platform.cache.platformName = `iOS-${Platform.getiPhoneModel()}`;
        } else if (Platform.isAndroid()) {
          Platform.cache.platformName = `Android-${Platform.getAndroidVersion()}`;
        } else {
          Platform.cache.platformName = 'Native-Unknown';
        }
      } else {
        // Web platform
        const browser = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
        if (Platform.isMobile()) {
          Platform.cache.platformName = 'Mobile-Web';
        } else if (Platform.isTablet()) {
          Platform.cache.platformName = 'Tablet-Web';
        } else {
          Platform.cache.platformName = 'Desktop-Web';
        }
      }
      
      return Platform.cache.platformName || 'Unknown';
    } catch (e) {
      console.warn('Error getting platform name:', e);
      return 'Unknown';
    }
  }
  
  /**
   * Get the window's safe area insets
   */
  static getSafeAreaInsets(): {
    top: number;
    right: number;
    bottom: number;
    left: number;
  } {
    try {
      if (typeof document === 'undefined') {
        return { top: 0, right: 0, bottom: 0, left: 0 };
      }
      
      const style = getComputedStyle(document.documentElement);
      
      return {
        top: parseInt(style.getPropertyValue('--sat').replace('px', '')) || 0,
        right: parseInt(style.getPropertyValue('--sar').replace('px', '')) || 0,
        bottom: parseInt(style.getPropertyValue('--sab').replace('px', '')) || 0,
        left: parseInt(style.getPropertyValue('--sal').replace('px', '')) || 0,
      };
    } catch (e) {
      console.warn('Error getting safe area insets:', e);
      return { top: 0, right: 0, bottom: 0, left: 0 };
    }
  }
}

export default Platform;
