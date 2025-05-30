
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
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'very-poor' | 'high' | 'medium' | 'low' | 'offline' | 'unknown';
  isLowQuality: boolean;
  metrics: NetworkMetrics;
  hasTransitioned: boolean;
  isFlaky: boolean;
  latency: number | null;
  bandwidth: number | null;
  checkQuality: () => Promise<'excellent' | 'good' | 'fair' | 'poor' | 'very-poor' | 'high' | 'medium' | 'low' | 'offline' | 'unknown'>;
}
