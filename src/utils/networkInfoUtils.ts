
import { NetworkInfo, NetworkType } from '@/types/unifiedLocation';

/**
 * Get information about the current network connection
 */
export const getNetworkInfo = async (): Promise<NetworkInfo> => {
  // Default network info
  const networkInfo: NetworkInfo = {
    type: 'unknown',
    connected: navigator.onLine
  };
  
  // Try to get more detailed network information if available
  try {
    // Check for Network Information API
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      if (connection) {
        let type: NetworkType = 'unknown';
        
        // Map connection type to our NetworkType enum
        switch (connection.type) {
          case 'wifi':
            type = 'wifi';
            break;
          case 'cellular':
            // Try to determine cellular generation from effectiveType
            if (connection.effectiveType === '4g') {
              type = 'cellular_4g';
            } else if (connection.effectiveType === '3g') {
              type = 'cellular_3g';
            } else if (connection.effectiveType === '2g') {
              type = 'cellular_2g';
            } else {
              type = 'cellular_3g'; // Default to 3G if unknown
            }
            break;
          case 'ethernet':
            type = 'ethernet';
            break;
          case 'none':
            type = 'none';
            break;
          default:
            type = 'unknown';
        }
        
        networkInfo.type = type;
        networkInfo.connectionType = connection.effectiveType || connection.type;
        networkInfo.estimatedBandwidth = connection.downlink ? connection.downlink * 1000 : undefined;
        networkInfo.metered = connection.metered;
      }
    }
    
    // Check for Capacitor for native apps
    if ((window as any).Capacitor) {
      const { Network } = (window as any).Capacitor.Plugins;
      const status = await Network.getStatus();
      
      networkInfo.connected = status.connected;
      
      if (status.connectionType === 'wifi') {
        networkInfo.type = 'wifi';
      } else if (status.connectionType === 'cellular') {
        networkInfo.type = 'cellular_4g'; // Default to 4G as we can't easily determine cellular type in Capacitor
      } else if (status.connectionType === 'none') {
        networkInfo.type = 'none';
      }
    }
  } catch (error) {
    console.error('Error getting network info:', error);
  }
  
  return networkInfo;
};
