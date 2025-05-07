
import { useState, useEffect } from 'react';
import { useConnectionStatus } from './useConnectionStatus';

interface NetworkQualityResult {
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'very-poor' | 'unknown';
  isLowQuality: boolean;
  latency?: number;
  bandwidth?: number;
  isLowBandwidth: boolean;
}

export function useNetworkQuality(): NetworkQualityResult {
  const { isOnline, connectionType } = useConnectionStatus();
  const [quality, setQuality] = useState<NetworkQualityResult['quality']>('unknown');
  const [latency, setLatency] = useState<number | undefined>(undefined);
  const [bandwidth, setBandwidth] = useState<number | undefined>(undefined);
  const [isLowBandwidth, setIsLowBandwidth] = useState(false);
  
  useEffect(() => {
    // Initial assessment based on connection type
    if (!isOnline) {
      setQuality('very-poor');
      return;
    }
    
    // Use connection type as initial quality assessment
    if (connectionType) {
      if (connectionType.includes('wifi') || connectionType.includes('ethernet')) {
        setQuality('good');
        setIsLowBandwidth(false);
      } else if (connectionType.includes('4g')) {
        setQuality('fair');
        setIsLowBandwidth(false);
      } else if (connectionType.includes('3g')) {
        setQuality('poor');
        setIsLowBandwidth(true);
      } else if (connectionType.includes('2g') || connectionType.includes('slow')) {
        setQuality('very-poor');
        setIsLowBandwidth(true);
      }
    }
    
    // Perform network quality test
    measureNetworkQuality();
    
    // Set up periodic quality checks
    const intervalId = setInterval(() => {
      if (isOnline) {
        measureNetworkQuality();
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, [isOnline, connectionType]);
  
  // Measure network quality with a simple ping test
  const measureNetworkQuality = async () => {
    try {
      const startTime = Date.now();
      
      // Simple ping test to measure latency
      await fetch('/ping', { 
        method: 'HEAD',
        cache: 'no-cache',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      const endTime = Date.now();
      const pingLatency = endTime - startTime;
      setLatency(pingLatency);
      
      // Update quality based on latency
      if (pingLatency < 100) {
        setQuality('excellent');
      } else if (pingLatency < 300) {
        setQuality('good');
      } else if (pingLatency < 600) {
        setQuality('fair');
      } else if (pingLatency < 1000) {
        setQuality('poor');
        setIsLowBandwidth(true);
      } else {
        setQuality('very-poor');
        setIsLowBandwidth(true);
      }
    } catch (error) {
      console.error('Error measuring network quality:', error);
      // If measurement fails, use connection type as fallback
    }
  };
  
  // Determine if quality is considered "low" overall
  const isLowQuality = quality === 'poor' || quality === 'very-poor' || !isOnline;
  
  return {
    quality,
    isLowQuality,
    latency,
    bandwidth,
    isLowBandwidth
  };
}
