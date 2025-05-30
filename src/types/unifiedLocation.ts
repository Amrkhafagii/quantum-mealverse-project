
export type NetworkQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'very-poor' | 'high' | 'medium' | 'low' | 'offline' | 'unknown';

export type NetworkType = '4G' | '5G' | 'WiFi' | '3G' | '2G' | 'none';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
  altitude?: number;
  speed?: number;
  heading?: number;
}
