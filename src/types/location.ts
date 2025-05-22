
// If the file doesn't exist, create it
export type LocationSource = 'gps' | 'wifi' | 'cell' | 'manual' | 'ip' | 'cached';
export type LocationFreshness = 'fresh' | 'moderate' | 'stale' | 'invalid' | 'recent' | 'expired';

export interface DeliveryLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  source: LocationSource;
  speed?: number;
  isMoving?: boolean;
  altitude?: number | null;
  heading?: number | null;
  address?: {
    formattedAddress?: string;
    locality?: string;  
    adminArea?: string;
    country?: string;
    postalCode?: string;
  };
}

export interface LocationHistory {
  locations: DeliveryLocation[];
  lastUpdated: number;
}

export interface LocationPermission {
  status: 'granted' | 'denied' | 'prompt';
  lastChecked: number;
}

export interface LocationSettings {
  highAccuracy: boolean;
  trackingEnabled: boolean;
  updateInterval: number;
  backgroundTracking: boolean;
}
