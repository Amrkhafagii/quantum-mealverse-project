
/**
 * Unified location types that standardize location data across different components
 */

export type LocationFreshness = 'invalid' | 'fresh' | 'stale' | 'moderate' | 'expired';

export type LocationSource = 'gps' | 'network' | 'passive' | 'manual' | 'cached' | 'unknown';

export type LocationPermissionStatus = 'granted' | 'denied' | 'prompt';

export interface UnifiedLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp: number;
  source?: LocationSource;
}
