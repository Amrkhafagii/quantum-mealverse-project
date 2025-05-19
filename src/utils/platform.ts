import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';

export class Platform {
  static isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  static isAndroid(): boolean {
    return Capacitor.getPlatform() === 'android';
  }

  static isIOS(): boolean {
    return Capacitor.getPlatform() === 'ios';
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
    if (this.isIOS()) return 'ios';
    if (this.isAndroid()) return 'android';
    if (this.isMobileBrowser()) return 'mobile-web';
    return 'web';
  }
}
