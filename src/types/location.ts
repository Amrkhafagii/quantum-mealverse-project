
export type LocationSource = 'gps' | 'network' | 'passive' | 'manual' | 'cached' | 'wifi' | 'unknown';

export interface DeliveryLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | undefined;
  timestamp: number;
  source?: LocationSource;
}
