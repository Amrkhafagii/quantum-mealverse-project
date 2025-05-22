
import { DeviceInfo, Platform } from '@/types/unifiedLocation';

/**
 * Get information about the current device
 */
export const getDeviceInfo = async (): Promise<DeviceInfo> => {
  // Default to web platform
  const deviceInfo: DeviceInfo = {
    platform: 'web',
    model: 'Browser',
    osVersion: navigator.userAgent
  };
  
  // Try to get more specific information if available
  try {
    // Check for Capacitor for native apps
    if ((window as any).Capacitor) {
      const { Device } = (window as any).Capacitor.Plugins;
      const info = await Device.getInfo();
      
      deviceInfo.platform = info.platform.toLowerCase();
      deviceInfo.model = info.model;
      deviceInfo.osVersion = info.osVersion;
    }
  } catch (error) {
    console.error('Error getting device info:', error);
  }
  
  return deviceInfo;
};
