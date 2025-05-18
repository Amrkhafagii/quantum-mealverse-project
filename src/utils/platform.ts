
/**
 * Platform detection utility for cross-platform code
 */
export class Platform {
  static get isWeb(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }

  static get isNative(): boolean {
    return !this.isWeb;
  }

  static get isIOS(): boolean {
    return this.isNative && this._getPlatformName() === 'ios';
  }

  static get isAndroid(): boolean {
    return this.isNative && this._getPlatformName() === 'android';
  }

  // Fix: Don't use function call syntax for boolean properties
  static isNative(): boolean {
    return !this.isWeb;
  }

  static isIOS(): boolean {
    return this.isNative && this._getPlatformName() === 'ios';
  }

  static isAndroid(): boolean {
    return this.isNative && this._getPlatformName() === 'android';
  }

  // Add new utility method to check Android version
  static getAndroidVersion(): number | null {
    if (!this.isAndroid) return null;
    
    try {
      const { Device } = require('@capacitor/device');
      const info = Device.getInfo();
      return info?.androidSDKVersion || null;
    } catch (e) {
      console.error('Error getting Android version:', e);
      return null;
    }
  }

  private static _getPlatformName(): string {
    try {
      // For React Native environments
      if (!this.isWeb) {
        const { Capacitor } = require('@capacitor/core');
        return Capacitor.getPlatform().toLowerCase();
      }
    } catch (e) {
      // Ignore errors when React Native is not available
    }
    return 'web';
  }
}
