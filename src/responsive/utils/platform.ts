
/**
 * Platform detection utilities
 */
export class Platform {
  static isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  static isAndroid(): boolean {
    return /Android/.test(navigator.userAgent);
  }

  static isWeb(): boolean {
    return !this.isNative();
  }

  static isNative(): boolean {
    return !!(window as any).Capacitor;
  }

  static isMobileDevice(): boolean {
    return this.isIOS() || this.isAndroid();
  }

  static isMobileBrowser(): boolean {
    return this.isMobileDevice() && this.isWeb();
  }

  static isTablet(): boolean {
    return /iPad/.test(navigator.userAgent) || 
           (this.isAndroid() && !/Mobile/.test(navigator.userAgent));
  }

  static getOS(): 'ios' | 'android' | 'web' {
    if (this.isIOS()) return 'ios';
    if (this.isAndroid()) return 'android';
    return 'web';
  }
}
