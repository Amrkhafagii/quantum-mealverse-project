
import { Capacitor } from '@capacitor/core';

export class Platform {
  /**
   * Check if the app is running on iOS
   */
  static isIOS(): boolean {
    return Capacitor.getPlatform() === 'ios';
  }
  
  /**
   * Check if the app is running on Android
   */
  static isAndroid(): boolean {
    return Capacitor.getPlatform() === 'android';
  }
  
  /**
   * Check if the app is running on web
   */
  static isWeb(): boolean {
    return Capacitor.getPlatform() === 'web';
  }
  
  /**
   * Check if the app is running on a native platform
   */
  static isNative(): boolean {
    return Capacitor.isNativePlatform();
  }
  
  /**
   * Get the current platform
   */
  static getPlatform(): string {
    return Capacitor.getPlatform();
  }
}
