
// This is a platform utility to check device capabilities and provide platform-specific info
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';

// Cache results to avoid repeated calls to Device API
const cache: Record<string, any> = {
  deviceInfo: null,
  highEndDevice: null,
  androidVersion: null,
  initialized: false
};

export const Platform = {
  isWeb: (): boolean => {
    return Capacitor.getPlatform() === 'web';
  },
  
  isAndroid: (): boolean => {
    return Capacitor.getPlatform() === 'android';
  },
  
  isIOS: (): boolean => {
    return Capacitor.getPlatform() === 'ios';
  },
  
  isMobile: (): boolean => {
    return Platform.isAndroid() || Platform.isIOS();
  },
  
  isNative: (): boolean => {
    return Platform.isAndroid() || Platform.isIOS();
  },
  
  isTablet: (): boolean => {
    // Simple check using screen dimensions
    const width = window.innerWidth;
    const height = window.innerHeight;
    const minDimension = Math.min(width, height);
    const maxDimension = Math.max(width, height);
    
    // Most tablets have a minimum dimension of at least 600dp
    return minDimension >= 600 || maxDimension >= 960;
  },
  
  isMobileBrowser: (): boolean => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },
  
  getDeviceInfo: async () => {
    if (cache.deviceInfo) return cache.deviceInfo;
    
    try {
      const info = await Device.getInfo();
      cache.deviceInfo = info;
      return info;
    } catch (err) {
      console.error('Error getting device info:', err);
      return {
        platform: 'web',
        model: 'unknown',
        operatingSystem: 'unknown',
        osVersion: 'unknown',
        manufacturer: 'unknown',
        webViewVersion: 'unknown'
      };
    }
  },
  
  // Check if the device is considered high-end
  isHighEndDevice: async (): Promise<boolean> => {
    if (cache.highEndDevice !== null) return cache.highEndDevice;
    
    try {
      const info = await Platform.getDeviceInfo();
      
      // For iOS, consider iPhone X and newer, iPad Pro, iPad Air 3rd gen+ as high-end
      if (info.platform === 'ios') {
        // Check for iPhone X or newer
        if (info.model.includes('iPhone') && parseInt(info.model.replace('iPhone', ''), 10) >= 10) {
          cache.highEndDevice = true;
          return true;
        }
        
        // Check for iPad Pro or iPad Air 3rd gen+
        if (info.model.includes('iPad Pro') || 
            (info.model.includes('iPad Air') && parseInt(info.model.split(',')[0].replace('iPad Air', ''), 10) >= 3)) {
          cache.highEndDevice = true;
          return true;
        }
      } 
      // For Android, use memory and OS version as indicators
      else if (info.platform === 'android') {
        // Consider Android 10+ with decent hardware as high-end
        const osVersion = parseInt(info.osVersion.split('.')[0], 10);
        if (osVersion >= 10) {
          cache.highEndDevice = true;
          return true;
        }
      }
      
      // For web, assume modern desktop browsers are high-end
      if (!Platform.isMobileBrowser()) {
        cache.highEndDevice = true;
        return true;
      }
      
      cache.highEndDevice = false;
      return false;
    } catch (err) {
      console.error('Error determining device capability:', err);
      cache.highEndDevice = false;
      return false;
    }
  },
  
  // Get Android version as a number
  getAndroidVersion: async (): Promise<number | null> => {
    if (cache.androidVersion !== null) return cache.androidVersion;
    
    try {
      if (!Platform.isAndroid()) {
        cache.androidVersion = null;
        return null;
      }
      
      const info = await Platform.getDeviceInfo();
      const version = parseInt(info.osVersion.split('.')[0], 10);
      
      cache.androidVersion = version;
      return version;
    } catch (err) {
      console.error('Error getting Android version:', err);
      return null;
    }
  },
  
  // Check if platform utilities are initialized
  isInitialized: (): boolean => {
    return cache.initialized;
  },
  
  // Initialize platform utilities
  initialize: async (): Promise<void> => {
    if (cache.initialized) return;
    
    try {
      // Pre-cache device info
      await Platform.getDeviceInfo();
      
      // Pre-cache high-end device status
      await Platform.isHighEndDevice();
      
      // Mark as initialized
      cache.initialized = true;
      console.log('Platform utilities initialized');
    } catch (err) {
      console.error('Error initializing platform utilities:', err);
    }
  }
};

// Initialize platform utilities on import
Platform.initialize().catch(console.error);
