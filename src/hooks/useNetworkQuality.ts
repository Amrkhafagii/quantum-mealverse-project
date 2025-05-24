
import { useState, useEffect } from 'react';
import { getNetworkInfo, monitorNetworkQuality } from '@/utils/networkInfoUtils';
import { NetworkType } from '@/types/unifiedLocation';

interface NetworkQualityOptions {
  monitorChanges?: boolean;
  updateInterval?: number; // milliseconds
}

interface NetworkQualityResult {
  quality: 'high' | 'medium' | 'low' | 'offline';
  isLowQuality: boolean;
  isOffline: boolean;
  networkType: NetworkType;
  latency?: number; // milliseconds
  bandwidth?: number; // Mbps
}

export function useNetworkQuality(options: NetworkQualityOptions = {}): NetworkQualityResult {
  const {
    monitorChanges = true,
    updateInterval = 30000
  } = options;
  
  const [quality, setQuality] = useState<'high' | 'medium' | 'low' | 'offline'>('medium');
  const [isLowQuality, setIsLowQuality] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [networkType, setNetworkType] = useState<NetworkType>('unknown');
  const [latency, setLatency] = useState<number | undefined>(undefined);
  const [bandwidth, setBandwidth] = useState<number | undefined>(undefined);
  
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
      let newQuality: 'high' | 'medium' | 'low' = 'medium';
      
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
      }
    }
  };
  
  // Initial update and setup monitoring
  useEffect(() => {
    updateNetworkQuality();
    
    let intervalId: number | undefined;
    let cleanup: (() => void) | undefined;
    
    if (monitorChanges) {
      // Monitor network changes using event listeners
      cleanup = monitorNetworkQuality(() => {
        updateNetworkQuality();
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
    bandwidth
  };
}
