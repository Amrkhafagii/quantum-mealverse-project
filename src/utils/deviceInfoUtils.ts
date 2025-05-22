
import { Device } from '@capacitor/device';
import { DeviceInfo } from '@/types/unifiedLocation';

/**
 * Get device info for enhanced location context
 */
export const getDeviceInfo = async (): Promise<DeviceInfo> => {
  try {
    const info = await Device.getInfo();
    const platform = info.platform === 'ios' || info.platform === 'android' 
      ? info.platform 
      : 'web';
      
    return {
      platform,
      model: info.model,
      osVersion: info.osVersion,
      // Remove the appVersion property that doesn't exist on DeviceInfo
    };
  } catch (err) {
    console.warn('Could not get device info:', err);
    return { platform: 'web' };
  }
};
