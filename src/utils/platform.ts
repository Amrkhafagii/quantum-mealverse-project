export class Platform {
  // Check if we're in a native platform
  static isNative(): boolean {
    try {
      // Using dynamic imports to avoid build-time issues
      // This function will be evaluated at runtime, not during the build
      return this.getPlatformName() !== 'web';
    } catch (e) {
      console.warn('Error checking native platform status:', e);
      return false;
    }
  }

  static isAndroid(): boolean {
    try {
      return this.getPlatformName() === 'android';
    } catch (e) {
      console.warn('Error checking Android platform:', e);
      return false;
    }
  }

  static isIOS(): boolean {
    try {
      return this.getPlatformName() === 'ios';
    } catch (e) {
      console.warn('Error checking iOS platform:', e);
      // Fall back to user agent detection as a backup
      return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
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
        return /iPad/.test(navigator.userAgent);
      }
      return false;
    } else {
      // For web: use screen dimensions as a heuristic
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
      // Dynamically import Device to avoid build issues
      const importModule = new Function('return import("@capacitor/device")')();
      const module = await importModule;
      const Device = module.Device;
      
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
      // Dynamically import Device to avoid build issues
      const importModule = new Function('return import("@capacitor/device")')();
      const module = await importModule;
      const Device = module.Device;
      
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
    if (!this.isIOS() || !this.isMobile()) return 'unknown';
    
    const { width, height } = window.screen;
    const maxDim = Math.max(width, height);
    const minDim = Math.min(width, height);
    
    // iPhone dimensions for different models (physical pixels in portrait)
    if (maxDim === 568 && minDim === 320) return 'iPhone5_SE1';
    if (maxDim === 667 && minDim === 375) return 'iPhone6_7_8';
    if (maxDim === 736 && minDim === 414) return 'iPhone6_7_8Plus';
    if (maxDim === 812 && minDim === 375) return 'iPhoneX_XS_11Pro_12mini_13mini';
    if (maxDim === 896 && minDim === 414) return 'iPhoneXR_XSMax_11';
    if (maxDim === 844 && minDim === 390) return 'iPhone12_12Pro_13_13Pro_14';
    if (maxDim === 926 && minDim === 428) return 'iPhone12ProMax_13ProMax_14Plus';
    if (maxDim === 852 && minDim === 393) return 'iPhone14Pro';
    if (maxDim === 932 && minDim === 430) return 'iPhone14ProMax';
    
    // iPad detection
    if (this.isTablet() && this.isIOS()) return 'iPad';
    
    return 'unknown';
  }
  
  // Get status bar height for iOS devices based on model
  static getStatusBarHeight(): number {
    if (this.isIOS()) {
      const model = this.getiPhoneModel();
      const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
      
      // Dynamic Island devices
      if (model === 'iPhone14Pro' || model === 'iPhone14ProMax') {
        return orientation === 'portrait' ? 54 : 21;
      }
      
      // Notched devices
      if (model.includes('iPhoneX') || 
          model.includes('iPhone11') || 
          model.includes('iPhone12') || 
          model.includes('iPhone13') || 
          (model.includes('iPhone14') && !model.includes('Pro'))) {
        return orientation === 'portrait' ? 44 : 0;
      }
      
      // Non-notched devices
      return orientation === 'portrait' ? 20 : 0;
    }
    
    // Default status bar height for other platforms
    return 0;
  }
  
  static hasNotch(): boolean {
    if (!this.isIOS()) return false;
    
    const model = this.getiPhoneModel();
    return model.includes('iPhoneX') || 
           model.includes('iPhone11') || 
           model.includes('iPhone12') || 
           model.includes('iPhone13') || 
           (model.includes('iPhone14') && !model.includes('Pro'));
  }
  
  static hasDynamicIsland(): boolean {
    if (!this.isIOS()) return false;
    
    const model = this.getiPhoneModel();
    return model.includes('iPhone14Pro');
  }
  
  static isMobileBrowser(): boolean {
    if (this.isNative()) return true;
    
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    return /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
  }
  
  static getPlatformName(): string {
    try {
      if (typeof window === 'undefined') return 'web';
      
      // Check for Capacitor global object
      const capacitorGlobal = (window as any).Capacitor;
      if (!capacitorGlobal) return 'web';
      
      const platform = capacitorGlobal.getPlatform();
      if (platform === 'ios') return 'ios';
      if (platform === 'android') return 'android';
      
      return 'web';
    } catch (error) {
      console.warn('Error detecting platform:', error);
      return 'web';
    }
  }
  
  // Get safe area insets directly from CSS environment variables
  static getSafeAreaInsets(): { top: number; right: number; bottom: number; left: number } {
    if (!this.isIOS()) {
      return { top: 0, right: 0, bottom: 0, left: 0 };
    }
    
    try {
      // Get computed values from CSS environment variables
      const style = getComputedStyle(document.documentElement);
      const top = parseInt(style.getPropertyValue('--sat').replace('px', '') || '0');
      const right = parseInt(style.getPropertyValue('--sar').replace('px', '') || '0');
      const bottom = parseInt(style.getPropertyValue('--sab').replace('px', '') || '0');
      const left = parseInt(style.getPropertyValue('--sal').replace('px', '') || '0');
      
      return {
        top: isNaN(top) ? 0 : top,
        right: isNaN(right) ? 0 : right,
        bottom: isNaN(bottom) ? 0 : bottom,
        left: isNaN(left) ? 0 : left
      };
    } catch (err) {
      console.warn('Error getting safe area insets:', err);
      return { top: 0, right: 0, bottom: 0, left: 0 };
    }
  }
}
