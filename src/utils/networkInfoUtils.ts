
import { NetworkType } from '@/types/unifiedLocation';

export interface NetworkInfo {
  type: NetworkType;
  connected: boolean;
  downlink?: number;
  effectiveType?: string;
  rtt?: number;
}

export const getNetworkInfo = (): NetworkInfo => {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  if (!connection) {
    return {
      type: 'none',
      connected: navigator.onLine
    };
  }

  let networkType: NetworkType = 'none';
  
  if (connection.type) {
    switch (connection.type) {
      case 'wifi':
        networkType = 'WiFi';
        break;
      case 'cellular':
        if (connection.effectiveType === '4g') networkType = '4G';
        else if (connection.effectiveType === '3g') networkType = '3G';
        else if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') networkType = '2G';
        else networkType = '4G'; // default for cellular
        break;
      default:
        networkType = 'none';
    }
  } else if (connection.effectiveType) {
    networkType = 'none';
  }

  return {
    type: networkType,
    connected: navigator.onLine,
    downlink: connection.downlink,
    effectiveType: connection.effectiveType,
    rtt: connection.rtt
  };
};

export const isHighSpeedConnection = (networkInfo: NetworkInfo): boolean => {
  return networkInfo.type === 'WiFi' || networkInfo.type === '5G' || networkInfo.type === '4G';
};

export const getConnectionSpeed = (networkInfo: NetworkInfo): 'high' | 'medium' | 'low' => {
  if (networkInfo.type === 'WiFi' || networkInfo.type === '5G') return 'high';
  if (networkInfo.type === '4G') return 'medium';
  return 'low';
};
