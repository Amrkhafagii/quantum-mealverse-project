
import { NetworkQuality, NetworkType } from '@/types/unifiedLocation';

export interface NetworkMetrics {
  latency: number | null;
  bandwidth?: number | null;
  jitter?: number | null;
  packetLoss?: number | null;
  effectiveType?: string;
}

export interface NetworkQualityState {
  quality: NetworkQuality;
  isLowQuality: boolean;
  metrics: NetworkMetrics;
  hasTransitioned: boolean;
  isFlaky: boolean;
  latency: number | null;
  bandwidth?: number;
  checkQuality: () => Promise<NetworkQuality>;
}

export interface NetworkStatusState {
  isOnline: boolean;
  wasOffline: boolean;
  lastChecked: Date;
  nextCheck: Date | null;
  isMetered: boolean;
  networkType: string;
}

export interface NetworkQualityResult {
  quality: NetworkQuality;
  isLowQuality: boolean;
  hasTransitioned?: boolean;
  isFlaky?: boolean;
  metrics?: NetworkMetrics;
  checkQuality?: () => Promise<NetworkQuality>;
}
