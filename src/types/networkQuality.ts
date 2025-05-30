
export interface NetworkMetrics {
  latency: number | null;
  bandwidth: number | null;
  downlink: number | null;
  rtt: number | null;
  jitter: number | null;
  packetLoss: number | null;
  effectiveType?: string;
}

export interface NetworkQualityResult {
  quality: 'high' | 'medium' | 'low' | 'offline' | 'unknown';
  isLowQuality: boolean;
  metrics: NetworkMetrics;
  hasTransitioned: boolean;
  isFlaky: boolean;
  latency: number | null;
  bandwidth: number | null;
  checkQuality: () => Promise<'high' | 'medium' | 'low' | 'offline' | 'unknown'>;
}
