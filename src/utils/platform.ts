
import { Capacitor } from '@capacitor/core';

// Extend the Platform utility with performance detection capabilities
export class Platform {
  // Check if we're on a native platform
  static isNative(): boolean {
    return Capacitor.isNativePlatform();
  }
  
  // Check if we're on the web platform
  static isWeb(): boolean {
    return !this.isNative();
  }
  
  // Check if we're on Android
  static isAndroid(): boolean {
    return Capacitor.getPlatform() === 'android';
  }
  
  // Check if we're on iOS
  static isIOS(): boolean {
    return Capacitor.getPlatform() === 'ios';
  }
  
  // Check for low-end device
  static isLowEndDevice(): boolean {
    if (typeof navigator === 'undefined') return false;
    
    // Check for device memory (Chrome/Android)
    // @ts-ignore - deviceMemory is not in standard TypeScript definitions
    if ('deviceMemory' in navigator && navigator.deviceMemory !== undefined) {
      // @ts-ignore
      return navigator.deviceMemory < 2;
    }
    
    // Check for hardware concurrency (CPU cores)
    if ('hardwareConcurrency' in navigator) {
      return navigator.hardwareConcurrency <= 2;
    }
    
    // Check for connection speed
    // @ts-ignore - connection is not in standard TypeScript definitions
    if ('connection' in navigator && navigator.connection?.effectiveType !== undefined) {
      // @ts-ignore
      return ['slow-2g', '2g'].includes(navigator.connection.effectiveType);
    }
    
    return false;
  }
  
  // Detect if Save-Data header is enabled (user wants reduced data usage)
  static isSaveDataEnabled(): boolean {
    if (typeof navigator === 'undefined') return false;
    
    // @ts-ignore - connection is not in standard TypeScript definitions
    return navigator.connection?.saveData === true;
  }
  
  // Check if device is in battery saving mode (when available)
  static async isBatterySavingMode(): Promise<boolean> {
    if (typeof navigator === 'undefined') return false;
    
    try {
      // @ts-ignore - getBattery is not in standard TypeScript definitions
      if ('getBattery' in navigator) {
        // @ts-ignore
        const battery = await navigator.getBattery();
        return battery.charging === false && battery.level < 0.2;
      }
    } catch (e) {
      console.warn('Battery status check failed:', e);
    }
    
    return false;
  }
  
  // Check if we should use low performance mode
  static async shouldUseLowPerformanceMode(): Promise<boolean> {
    return this.isLowEndDevice() || this.isSaveDataEnabled() || await this.isBatterySavingMode();
  }
}

export default Platform;
