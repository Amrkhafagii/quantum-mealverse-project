
import { NetworkMetrics, NetworkQuality } from '@/types/unifiedLocation';

export interface NetworkQualityState {
  quality: NetworkQuality;
  isLowQuality: boolean;
  metrics: NetworkMetrics;
  hasTransitioned: boolean;
  isFlaky: boolean;
  latency: number;
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
