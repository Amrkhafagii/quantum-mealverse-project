
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
      // For now, assume it's not a tablet
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
    if (maxDim === 812 && minDim === 375) return 'iPhoneX/XS/11Pro/12mini/13mini';
    if (maxDim === 896 && minDim === 414) return 'iPhoneXR/XSMax/11/11ProMax';
    if (maxDim === 844 && minDim === 390) return 'iPhone12/12Pro/13/13Pro/14';
    if (maxDim === 926 && minDim === 428) return 'iPhone12ProMax/13ProMax/14Plus';
    if (maxDim === 852 && minDim === 393) return 'iPhone14Pro';
    if (maxDim === 932 && minDim === 430) return 'iPhone14ProMax';
    if (maxDim === 667 && minDim === 375) return 'iPhone6/6s/7/8/SE2';
    if (maxDim === 736 && minDim === 414) return 'iPhone6Plus/6sPlus/7Plus/8Plus';
    if (maxDim === 568 && minDim === 320) return 'iPhoneSE/5s/5c/5';
    
    return 'unknown';
  }
  
  // Get status bar height for iOS devices
  static getStatusBarHeight(): number {
    if (this.isIOS()) {
      // Get the safe area inset top value
      const safeAreaTop = parseInt(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--sat')
          .replace('px', '')
      );
      
      // Return the safe area inset top or a default value if it's not available
      return isNaN(safeAreaTop) ? 44 : safeAreaTop;
    }
    
    // Default status bar height for other platforms
    return 0;
  }
  
  static hasNotch(): boolean {
    if (!this.isIOS()) return false;
    
    const model = this.getiPhoneModel();
    return model.includes('X') || 
           model.includes('11') || 
           model.includes('12') || 
           model.includes('13') || 
           model.includes('14');
  }
  
  static hasDynamicIsland(): boolean {
    if (!this.isIOS()) return false;
    
    const model = this.getiPhoneModel();
    return model.includes('14Pro');
  }
  
  static isMobileBrowser(): boolean {
    if (this.isNative()) return false;
    
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
}
