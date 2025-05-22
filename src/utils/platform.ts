
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
    hasNotch?: boolean;
    hasDynamicIsland?: boolean;
    iPhoneModel?: string;
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
