
import { useState, useEffect } from 'react';
import { NetworkQuality } from '@/types/unifiedLocation';
import { NetworkMetrics, NetworkQualityResult } from '@/types/networkQuality';

export type { NetworkQuality } from '@/types/unifiedLocation';

export function useNetworkQuality(): NetworkQualityResult {
  const [quality, setQuality] = useState<NetworkQuality>('unknown');
  const [isLowQuality, setIsLowQuality] = useState(false);
  const [metrics, setMetrics] = useState<NetworkMetrics>({
    latency: null,
    bandwidth: null,
    downlink: null,
    rtt: null,
    jitter: null,
    packetLoss: null,
    effectiveType: undefined
  });
  const [hasTransitioned, setHasTransitioned] = useState(false);
  const [isFlaky, setIsFlaky] = useState(false);

  const checkQuality = async (): Promise<NetworkQuality> => {
    try {
      // Check navigator connection API
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;
      
      if (connection) {
        const effectiveType = connection.effectiveType;
        const downlink = connection.downlink;
        const rtt = connection.rtt;
        
        // Update metrics
        setMetrics(prev => ({
          ...prev,
          latency: rtt || null,
          bandwidth: downlink || null,
          downlink: downlink || null,
          rtt: rtt || null,
          effectiveType: effectiveType
        }));
        
        // Determine quality based on effective type and metrics
        let detectedQuality: NetworkQuality = 'medium';
        
        if (effectiveType === '4g' && downlink > 10) {
          detectedQuality = 'excellent';
        } else if (effectiveType === '4g' && downlink > 5) {
          detectedQuality = 'good';
        } else if (effectiveType === '3g' || (downlink >= 1.5 && downlink <= 5)) {
          detectedQuality = 'fair';
        } else if (effectiveType === '2g' || downlink < 1.5) {
          detectedQuality = 'poor';
        }
        
        setQuality(detectedQuality);
        const lowQualityValues: NetworkQuality[] = ['poor', 'very-poor', 'low', 'offline'];
        setIsLowQuality(lowQualityValues.includes(detectedQuality));
        
        return detectedQuality;
      }
      
      // Fallback: check online status
      if (!navigator.onLine) {
        setQuality('offline');
        setIsLowQuality(true);
        return 'offline';
      }
      
      // Default to medium quality if we can't determine
      setQuality('medium');
      setIsLowQuality(false);
      return 'medium';
      
    } catch (error) {
      console.error('Error checking network quality:', error);
      setQuality('unknown');
      setIsLowQuality(true);
      return 'unknown';
    }
  };

  useEffect(() => {
    // Initial check
    checkQuality();
    
    // Listen for online/offline events
    const handleOnline = () => checkQuality();
    const handleOffline = () => {
      setQuality('offline');
      setIsLowQuality(true);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Listen for connection changes if supported
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;
    
    if (connection) {
      const handleConnectionChange = () => checkQuality();
      connection.addEventListener('change', handleConnectionChange);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        connection.removeEventListener('change', handleConnectionChange);
      };
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    quality,
    isLowQuality,
    metrics,
    hasTransitioned,
    isFlaky,
    latency: metrics.latency,
    bandwidth: metrics.bandwidth,
    checkQuality
  };
}
