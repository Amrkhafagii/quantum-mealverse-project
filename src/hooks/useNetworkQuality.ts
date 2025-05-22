import { useState, useEffect } from 'react';
import { useConnectionStatus } from './useConnectionStatus';

/**
 * Network quality assessment
 */
export type NetworkQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';

/**
 * Network quality metrics
 */
interface NetworkMetrics {
  latency: number | null;
  downlink: number | null;
  rtt: number | null;
  effectiveType: string | null;
  successRate: number;
  jitter: number | null;
}

/**
 * Measures and monitors network quality
 */
export const useNetworkQuality = () => {
  const { isOnline, connectionType } = useConnectionStatus();
  const [quality, setQuality] = useState<NetworkQuality>('unknown');
  const [isLowQuality, setIsLowQuality] = useState(false);
  const [metrics, setMetrics] = useState<NetworkMetrics>({
    latency: null,
    downlink: null,
    rtt: null, 
    effectiveType: null,
    successRate: 1.0,
    jitter: null
  });

  // Use Network Information API if available
  useEffect(() => {
    if (!isOnline) {
      setQuality('poor');
      setIsLowQuality(true);
      return;
    }

    // Start with unknown quality
    if (quality === 'unknown') {
      // Use connection type as initial estimate
      if (connectionType === 'wifi' || connectionType === 'ethernet') {
        setQuality('good');
        setIsLowQuality(false);
      } else if (connectionType === 'cellular_5g' || connectionType === 'cellular_4g') {
        setQuality('fair');
        setIsLowQuality(false);
      } else if (connectionType === 'cellular_3g' || connectionType === 'cellular_2g') {
        setQuality('poor');
        setIsLowQuality(true);
      }
    }

    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        // Update metrics from Network Information API
        const updateConnectionInfo = () => {
          const newMetrics = {
            ...metrics,
            downlink: connection.downlink || null,
            rtt: connection.rtt || null,
            effectiveType: connection.effectiveType || null
          };
          setMetrics(newMetrics);
          
          // Determine quality based on effective type
          if (connection.effectiveType === '4g') {
            setQuality('excellent');
            setIsLowQuality(false);
          } else if (connection.effectiveType === '3g') {
            setQuality('good');
            setIsLowQuality(false);
          } else if (connection.effectiveType === '2g') {
            setQuality('fair');
            setIsLowQuality(true);
          } else if (connection.effectiveType === 'slow-2g') {
            setQuality('poor');
            setIsLowQuality(true);
          }
        };

        // Initial check
        updateConnectionInfo();
        
        // Listen for changes
        connection.addEventListener('change', updateConnectionInfo);
        return () => connection.removeEventListener('change', updateConnectionInfo);
      }
    }

    // If Network Information API is not available, use latency tests
    const latencyChecks: number[] = [];
    let lastCheckTime = 0;
    
    const checkLatency = async () => {
      // Don't check too frequently (at most once per 30 seconds)
      const now = Date.now();
      if (now - lastCheckTime < 30000) return;
      lastCheckTime = now;
      
      try {
        const start = performance.now();
        
        // Use a tiny request to check latency
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        await fetch('/favicon.ico', { 
          method: 'HEAD',
          cache: 'no-store',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        const latency = performance.now() - start;
        
        // Store latest measurements (keep last 5)
        latencyChecks.push(latency);
        if (latencyChecks.length > 5) {
          latencyChecks.shift();
        }
        
        // Calculate average and jitter
        const avgLatency = latencyChecks.reduce((sum, val) => sum + val, 0) / latencyChecks.length;
        let jitter = 0;
        if (latencyChecks.length > 1) {
          let sumSquaredDiffs = 0;
          for (const check of latencyChecks) {
            sumSquaredDiffs += Math.pow(check - avgLatency, 2);
          }
          jitter = Math.sqrt(sumSquaredDiffs / latencyChecks.length);
        }
        
        // Update metrics
        setMetrics(prev => ({
          ...prev,
          latency: avgLatency,
          jitter,
          successRate: (prev.successRate * 0.8) + 0.2 // Successful request improves rate
        }));
        
        // Update quality based on latency
        if (avgLatency < 100) {
          setQuality('excellent');
          setIsLowQuality(false);
        } else if (avgLatency < 300) {
          setQuality('good');
          setIsLowQuality(false);
        } else if (avgLatency < 600) {
          setQuality('fair');
          setIsLowQuality(true);
        } else {
          setQuality('poor');
          setIsLowQuality(true);
        }
      } catch (error) {
        console.error('Error measuring latency:', error);
        
        // Failed request decreases success rate
        setMetrics(prev => ({
          ...prev,
          successRate: prev.successRate * 0.8
        }));
        
        // If success rate drops too low, consider connection poor
        if (metrics.successRate < 0.5) {
          setQuality('poor');
          setIsLowQuality(true);
        }
      }
    };
    
    // Initial check with a delay
    const initialDelayId = setTimeout(checkLatency, 2000);
    
    // Schedule periodic checks
    const intervalId = setInterval(checkLatency, 60000); // Check every minute
    
    return () => {
      clearTimeout(initialDelayId);
      clearInterval(intervalId);
    };
  }, [isOnline, connectionType]);

  return { quality, isLowQuality, metrics };
};

export default useNetworkQuality;
