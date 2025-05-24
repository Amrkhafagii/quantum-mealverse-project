
export type LocationSource = 'gps' | 'network' | 'passive' | 'manual' | 'cached' | 'wifi' | 'unknown';

export type LocationFreshness = 'invalid' | 'fresh' | 'stale' | 'moderate' | 'expired';

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
  isMoving?: boolean;
}
