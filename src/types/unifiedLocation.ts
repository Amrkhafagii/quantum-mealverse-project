
export type NetworkQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'very-poor' | 'high' | 'medium' | 'low' | 'offline' | 'unknown';

export type NetworkType = '4G' | '5G' | 'WiFi' | '3G' | '2G' | 'none';

export type LocationSource = 'gps' | 'network' | 'passive' | 'fused' | 'unknown';

export type LocationPermissionStatus = 'granted' | 'denied' | 'prompt';

export type LocationFreshness = 'fresh' | 'stale' | 'expired' | 'invalid';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
  altitude?: number;
  speed?: number;
  heading?: number;
}

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
  isMoving?: boolean;
  networkInfo?: NetworkInfo;
}

export interface NetworkInfo {
  type: NetworkType;
  connected: boolean;
  quality?: NetworkQuality;
}

export interface ConfidenceScore {
  overall: number;
  accuracy: number;
  recency: number;
  source: number;
  network: number;
}

export interface LocationHistoryEntry {
  id: string;
  location: UnifiedLocation;
  timestamp: number;
  confidence: ConfidenceScore;
}

export interface NetworkMetrics {
  latency: number | null;
  bandwidth: number | null;
  jitter: number | null;
  packetLoss: number | null;
  effectiveType: string | undefined;
  downlink: number;
  rtt: number;
}
