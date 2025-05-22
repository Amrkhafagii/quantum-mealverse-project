
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
