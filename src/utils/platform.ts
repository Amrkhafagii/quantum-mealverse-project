
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
}
