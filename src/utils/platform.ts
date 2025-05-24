
import { Capacitor } from '@capacitor/core';

// Extend the Platform utility with performance detection capabilities
export class Platform {
  private static deviceInfo: any = {};
  private static cacheInit: boolean = false;
  
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
  
  // Check if platform has been initialized
  static isInitialized(): boolean {
    return this.cacheInit;
  }
  
  // Get the device platform name
  static getPlatformName(): string {
    return Capacitor.getPlatform();
  }
  
  // Get Android version (returns 0 if not Android)
  static getAndroidVersion(): number {
    if (!this.isAndroid()) return 0;
    
    const userAgent = navigator.userAgent;
    const match = userAgent.match(/Android\s([0-9\.]*)/);
    return match ? parseFloat(match[1]) : 0;
  }
  
  // Check if device has a notch (simplified detection)
  static hasNotch(): boolean {
    if (!this.isIOS()) return false;
    
    const model = this.getiPhoneModel();
    const notchedModels = ['X', 'XS', 'XR', 'XS Max', '11', '12', '13', '14', '15'];
    return notchedModels.some(m => model.includes(m));
  }
  
  // Check if device has Dynamic Island
  static hasDynamicIsland(): boolean {
    if (!this.isIOS()) return false;
    
    const model = this.getiPhoneModel();
    const dynamicIslandModels = ['14 Pro', '14 Pro Max', '15 Pro', '15 Pro Max'];
    return dynamicIslandModels.some(m => model.includes(m));
  }
  
  // Get iPhone model (simplified detection)
  static getiPhoneModel(): string {
    if (!this.isIOS()) return '';
    
    const userAgent = navigator.userAgent;
    const match = userAgent.match(/iPhone(\d+),(\d+)/);
    if (!match) return 'Unknown iPhone';
    
    // This is a simplified mapping - a real implementation would have a complete map
    const modelMap: { [key: string]: string } = {
      '10,3': 'iPhone X', 
      '11,2': 'iPhone XS',
      '12,1': 'iPhone 11',
      '13,2': 'iPhone 12',
      '14,5': 'iPhone 13',
      '15,2': 'iPhone 14 Pro'
      // Add more mappings as needed
    };
    
    const modelKey = `${match[1]},${match[2]}`;
    return modelMap[modelKey] || 'Unknown iPhone';
  }
  
  // Check for tablet devices
  static isTablet(): boolean {
    const userAgent = navigator.userAgent;
    return /(iPad|tablet)/i.test(userAgent);
  }
  
  // Check for mobile browsers
  static isMobileBrowser(): boolean {
    const userAgent = navigator.userAgent;
    return /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) && !this.isTablet();
  }
  
  // Check if device is mobile (either native or browser)
  static isMobile(): boolean {
    return this.isMobileBrowser() || (this.isNative() && !this.isTablet());
  }
  
  // Reset internal cache
  static resetCache(): void {
    this.deviceInfo = {};
    this.cacheInit = false;
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
