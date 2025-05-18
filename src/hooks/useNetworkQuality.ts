
import { useState, useEffect, useCallback } from 'react';
import { useConnectionStatus } from './useConnectionStatus';

type NetworkQuality = 'high' | 'medium' | 'low' | 'unknown';

interface NetworkQualityResult {
  quality: NetworkQuality;
  isLowQuality: boolean;
  latency: number | null;
  bandwidth: number | null;
  checkQuality: () => Promise<void>;
}

export function useNetworkQuality(): NetworkQualityResult {
  const { isOnline, connectionType } = useConnectionStatus();
  const [quality, setQuality] = useState<NetworkQuality>('unknown');
  const [latency, setLatency] = useState<number | null>(null);
  const [bandwidth, setBandwidth] = useState<number | null>(null);
  const [isLowQuality, setIsLowQuality] = useState(false);

  const measureLatency = useCallback(async (): Promise<number> => {
    const start = performance.now();
    
    try {
      // Make a small request to measure latency
      // Using fetch with cache: 'no-store' to prevent cached responses
      const response = await fetch('/ping', { 
        method: 'GET',
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      if (!response.ok) throw new Error('Network response was not ok');
      
      const end = performance.now();
      return end - start;
    } catch (err) {
      console.error('Error measuring latency:', err);
      return 999; // High value to indicate poor connection
    }
  }, []);

  const estimateBandwidth = useCallback(async (): Promise<number> => {
    // In a real implementation, we would download a known-size file and measure time
    // For this demo, we'll estimate based on connection type
    switch (connectionType?.toLowerCase()) {
      case 'wifi':
        return 10000; // 10 Mbps
      case 'cellular':
        return 2000;  // 2 Mbps
      case '4g':
        return 5000;  // 5 Mbps
      case '3g':
        return 1000;  // 1 Mbps
      case '2g':
        return 100;   // 100 Kbps
      default:
        return 1000;  // Default assumption
    }
  }, [connectionType]);

  const determineQuality = useCallback((latency: number, bandwidth: number): NetworkQuality => {
    if (latency < 100 && bandwidth > 5000) return 'high';
    if (latency < 300 && bandwidth > 1000) return 'medium';
    return 'low';
  }, []);

  const checkQuality = useCallback(async () => {
    if (!isOnline) {
      setQuality('unknown');
      setIsLowQuality(false);
      setLatency(null);
      setBandwidth(null);
      return;
    }

    try {
      const measuredLatency = await measureLatency();
      setLatency(measuredLatency);
      
      const estimatedBandwidth = await estimateBandwidth();
      setBandwidth(estimatedBandwidth);
      
      const newQuality = determineQuality(measuredLatency, estimatedBandwidth);
      setQuality(newQuality);
      setIsLowQuality(newQuality === 'low');
    } catch (err) {
      console.error('Error checking network quality:', err);
      setQuality('unknown');
      setIsLowQuality(false);
    }
  }, [isOnline, measureLatency, estimateBandwidth, determineQuality]);

  // Check quality when online status or connection type changes
  useEffect(() => {
    checkQuality();
    
    // Set up periodic checks every 30 seconds
    const intervalId = setInterval(checkQuality, 30000);
    
    return () => clearInterval(intervalId);
  }, [isOnline, connectionType, checkQuality]);

  return { quality, isLowQuality, latency, bandwidth, checkQuality };
}
