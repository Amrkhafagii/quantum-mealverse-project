
import { NetworkQuality } from '@/hooks/useNetworkQuality';

export type LocationMode = 'high' | 'balanced' | 'low' | 'passive';
export type NetworkType = 'wifi' | 'cellular_4g' | 'cellular_5g' | 'cellular_3g' | 'cellular_2g' | 'ethernet' | 'unknown' | 'none';
export type LocationSource = 'gps' | 'wifi' | 'cell' | 'manual' | 'ip' | 'cached' | 'fusion' | 'unknown';
export type LocationType = 'current' | 'destination' | 'pickup' | 'dropoff' | 'waypoint' | 'history';

export interface DeviceInfo {
  platform: string;
  model?: string;
  manufacturer?: string;
  osVersion?: string;
  appVersion?: string;
  batteryLevel?: number;
}

export interface Platform {
  name: string;
  version?: string;
  isWeb?: boolean;
  isNative?: boolean;
}

export interface NetworkInfo {
  type: NetworkType;
  connectionType?: string;
  connected: boolean;
  estimatedBandwidth?: number;
  metered?: boolean;
}

export interface NetworkMetrics {
  latency: number | null;
  bandwidth?: number | null;
  jitter?: number | null;
  packetLoss?: number | null;
  effectiveType?: string;
}

export interface NetworkQualityData {
  quality: NetworkQuality;
  isLowQuality: boolean;
  metrics: NetworkMetrics;
  hasTransitioned: boolean;
  isFlaky: boolean;
}

export interface UnifiedLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
  speed?: number;
  altitude?: number;
  heading?: number;
  isMoving?: boolean;
  source: LocationSource;
  deviceInfo?: DeviceInfo;
  networkInfo?: NetworkInfo;
}

export interface LocationHistoryEntry extends UnifiedLocation {
  id: string;
  userId?: string;
  tripId?: string;
  batteryLevel?: number;
  networkQuality?: NetworkQuality;
}

export interface LocationQueryParams {
  userId?: string;
  tripId?: string;
  startTime?: string;
  endTime?: string;
  limit?: number;
  minAccuracy?: number;
  source?: LocationSource[];
  type?: LocationType;
}

export interface LocationPrivacySettings {
  allowBackgroundTracking: boolean;
  precisionLevel: 'high' | 'medium' | 'low' | 'approximate';
  shareWith: 'none' | 'app' | 'selected' | 'all';
  retentionPeriod: number; // days
  allowThirdPartySharing: boolean;
}
