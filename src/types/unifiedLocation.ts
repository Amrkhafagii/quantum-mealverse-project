
import { NetworkQuality } from '@/hooks/useNetworkQuality';

export type LocationMode = 'high' | 'balanced' | 'low' | 'passive';
export type NetworkType = 'wifi' | 'cellular_4g' | 'cellular_3g' | 'cellular_2g' | 'ethernet' | 'unknown' | 'none';

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
