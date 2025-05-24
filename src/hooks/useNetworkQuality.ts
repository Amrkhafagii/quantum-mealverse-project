
import { useState, useEffect } from 'react';
import { getNetworkInfo, monitorNetworkQuality } from '@/utils/networkInfoUtils';
import { NetworkType, NetworkQuality, NetworkMetrics } from '@/types/unifiedLocation';

interface NetworkQualityOptions {
  monitorChanges?: boolean;
  updateInterval?: number; // milliseconds
}

export interface NetworkQualityResult {
  quality: NetworkQuality;
  isLowQuality: boolean;
  isOffline: boolean;
  networkType: NetworkType;
  latency?: number; // milliseconds
  bandwidth?: number; // Mbps
  hasTransitioned?: boolean;
  isFlaky?: boolean;
  metrics?: NetworkMetrics;
  checkQuality?: () => Promise<NetworkQuality>;
}

export function useNetworkQuality(options: NetworkQualityOptions = {}): NetworkQualityResult {
  const {
    monitorChanges = true,
    updateInterval = 30000
  } = options;
  
  const [quality, setQuality] = useState<NetworkQuality>('medium');
  const [isLowQuality, setIsLowQuality] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [networkType, setNetworkType] = useState<NetworkType>('unknown');
  const [latency, setLatency] = useState<number | undefined>(undefined);
  const [bandwidth, setBandwidth] = useState<number | undefined>(undefined);
  const [hasTransitioned, setHasTransitioned] = useState<boolean>(false);
  const [isFlaky, setIsFlaky] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<NetworkMetrics | undefined>(undefined);
  
  // Update network quality information
  const updateNetworkQuality = () => {
    const info = getNetworkInfo();
    
    // Update offline status
    setIsOffline(!info.connected);
    
    // Update network type
    setNetworkType(info.type);
    
    // Determine quality based on type
    if (!info.connected) {
      setQuality('offline');
      setIsLowQuality(true);
    } else {
      let newQuality: NetworkQuality = 'medium';
      
      switch (info.type) {
        case 'wifi':
        case '5g':
          newQuality = 'high';
          break;
        case '4g':
          newQuality = 'medium';
          break;
        case '3g':
        case '2g':
        case 'cellular':
          newQuality = 'low';
          break;
        default:
          if ('connection' in navigator) {
            const conn = (navigator as any).connection;
            if (conn && conn.downlink) {
              if (conn.downlink > 5) newQuality = 'high';
              else if (conn.downlink > 2) newQuality = 'medium';
              else newQuality = 'low';
            }
          }
      }
      
      setQuality(newQuality);
      setIsLowQuality(newQuality === 'low');
    }
    
    // Update latency and bandwidth if available
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      if (conn) {
        if (conn.downlink) setBandwidth(conn.downlink);
        if (conn.rtt) setLatency(conn.rtt);
        
        // Update metrics
        setMetrics({
          latency: conn.rtt || 0,
          bandwidth: conn.downlink || 0,
          connectionType: info.type,
          effectiveType: conn.effectiveType
        });
      }
    }
  };
  
  // Check quality method for components
  const checkQuality = async (): Promise<NetworkQuality> => {
    updateNetworkQuality();
    return quality;
  };
  
  // Initial update and setup monitoring
  useEffect(() => {
    updateNetworkQuality();
    
    let intervalId: number | undefined;
    let cleanup: (() => void) | undefined;
    
    if (monitorChanges) {
      // Monitor network changes using event listeners
      cleanup = monitorNetworkQuality(() => {
        const prevQuality = quality;
        updateNetworkQuality();
        
        // Set transition flag if quality changed
        if (prevQuality !== quality) {
          setHasTransitioned(true);
          
          // Reset after a delay
          setTimeout(() => {
            setHasTransitioned(false);
          }, 5000);
        }
      });
      
      // Periodically check for more subtle changes
      intervalId = window.setInterval(() => {
        updateNetworkQuality();
      }, updateInterval);
    }
    
    return () => {
      if (cleanup) cleanup();
      if (intervalId) clearInterval(intervalId);
    };
  }, [monitorChanges, updateInterval]);
  
  return {
    quality,
    isLowQuality,
    isOffline,
    networkType,
    latency,
    bandwidth,
    hasTransitioned,
    isFlaky,
    metrics,
    checkQuality
  };
}
