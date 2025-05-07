
import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';

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

  /**
   * Check if the device is online
   * @returns Promise with connection status
   */
  static async isOnline(): Promise<boolean> {
    if (Capacitor.isNativePlatform()) {
      try {
        const status = await Network.getStatus();
        return status.connected;
      } catch (error) {
        console.error('Error checking network status:', error);
        // Fallback to browser API
        return navigator.onLine;
      }
    } else {
      return navigator.onLine;
    }
  }

  /**
   * Get current connection type
   * @returns Promise with connection type
   */
  static async getConnectionType(): Promise<string> {
    if (Capacitor.isNativePlatform()) {
      try {
        const status = await Network.getStatus();
        return status.connectionType;
      } catch (error) {
        console.error('Error getting connection type:', error);
        return 'unknown';
      }
    } else {
      return navigator.onLine ? 'wifi' : 'none';
    }
  }
}
