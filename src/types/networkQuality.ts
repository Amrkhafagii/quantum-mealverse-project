
import { NetworkQuality } from '@/types/unifiedLocation';

export interface NetworkMetrics {
  latency: number | null;
  bandwidth?: number | null;
  jitter?: number | null;
  packetLoss?: number | null;
  effectiveType?: string;
  connectionType?: string;
}

export interface NetworkQualityResult {
  quality: NetworkQuality;
  isLowQuality: boolean;
  metrics: NetworkMetrics;
  hasTransitioned: boolean;
  isFlaky: boolean;
  latency: number | null;
  bandwidth?: number | null;
  checkQuality: () => Promise<NetworkQuality>;
}
