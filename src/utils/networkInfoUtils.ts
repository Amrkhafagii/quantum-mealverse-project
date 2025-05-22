
import { Network } from '@capacitor/network';
import { NetworkType } from '@/types/unifiedLocation';

/**
 * Get network information
 */
export const getNetworkInfo = async (): Promise<{ type: NetworkType }> => {
  try {
    const status = await Network.getStatus();
    let networkType: NetworkType = 'unknown';
    
    if (!status.connected) {
      networkType = 'none';
    } else if (status.connectionType === 'wifi') {
      networkType = 'wifi';
    } else if (status.connectionType === 'cellular') {
      // In a real app, you might want to detect the cellular generation
      networkType = 'cellular_4g';
    }
    
    return { type: networkType };
  } catch (err) {
    console.warn('Could not get network info:', err);
    return { type: 'unknown' };
  }
};
