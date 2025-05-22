
import { useState, useEffect, useCallback } from 'react';
import { Network } from '@capacitor/network';
import { NetworkMetrics, NetworkType } from '@/types/unifiedLocation';

export type NetworkQuality = 'excellent' | 'good' | 'moderate' | 'poor' | 'very-poor' | 'offline' | 'unknown' | 'fair';

interface UseNetworkQualityOptions {
  pollingInterval?: number;
  historySize?: number;
}

export function useNetworkQuality(options: UseNetworkQualityOptions = {}) {
  const { pollingInterval = 30000, historySize = 5 } = options;
  
  const [quality, setQuality] = useState<NetworkQuality>('unknown');
  const [isLowQuality, setIsLowQuality] = useState(false);
  const [hasTransitioned, setHasTransitioned] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [connectionType, setConnectionType] = useState<NetworkType>('unknown');
  const [metrics, setMetrics] = useState<NetworkMetrics>({ latency: null });
  const [effectiveType, setEffectiveType] = useState('unknown');
  const [downlink, setDownlink] = useState(0);
  const [isFlaky, setIsFlaky] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  const [bandwidth, setBandwidth] = useState<number | null>(null);
  
  // Check network quality
  const checkQuality = useCallback(async () => {
    try {
      const status = await Network.getStatus();
      setIsConnected(status.connected);
      
      if (!status.connected) {
        setQuality('offline');
        setIsLowQuality(true);
        setConnectionType('none');
        return;
      }
      
      // Get connection type
      const connType = status.connectionType.toLowerCase() as NetworkType;
      setConnectionType(connType || 'unknown');
      
      // Simulate a network quality check
      const start = Date.now();
      try {
        // Perform a simple fetch to check latency
        const response = await fetch('https://www.google.com/favicon.ico', {
          mode: 'no-cors',
          cache: 'no-store'
        });
        const end = Date.now();
        const latencyValue = end - start;
        setLatency(latencyValue);
        
        // Estimate bandwidth based on connection type (very rough estimate)
        let estimatedBandwidth = 1;
        if (connType === 'wifi') {
          estimatedBandwidth = 10; // Mbps
        } else if (connType === 'cellular_4g') {
          estimatedBandwidth = 5; // Mbps
        } else if (connType === 'cellular_5g') {
          estimatedBandwidth = 20; // Mbps
        } else if (connType === 'ethernet') {
          estimatedBandwidth = 50; // Mbps
        }
        
        setBandwidth(estimatedBandwidth);
        
        // Use the latency to determine quality
        let newQuality: NetworkQuality = 'unknown';
        if (latencyValue < 100) {
          newQuality = 'excellent';
          setIsLowQuality(false);
        } else if (latencyValue < 300) {
          newQuality = 'good';
          setIsLowQuality(false);
        } else if (latencyValue < 600) {
          newQuality = 'moderate';
          setIsLowQuality(false);
        } else if (latencyValue < 1000) {
          newQuality = 'fair';
          setIsLowQuality(true);
        } else if (latencyValue < 2000) {
          newQuality = 'poor';
          setIsLowQuality(true);
        } else {
          newQuality = 'very-poor';
          setIsLowQuality(true);
        }
        
        // Check if quality has transitioned (improved or degraded significantly)
        if (quality !== 'unknown' && quality !== newQuality) {
          setHasTransitioned(true);
          setTimeout(() => setHasTransitioned(false), 3000);
        }
        
        setQuality(newQuality);
        
        // Update metrics
        setMetrics({
          latency: latencyValue,
          bandwidth: estimatedBandwidth,
          jitter: Math.random() * 20, // Simulated jitter
          packetLoss: Math.random() * 5  // Simulated packet loss percentage
        });
        
        return { quality: newQuality, isLowQuality };
      } catch (error) {
        console.error('Error checking network quality:', error);
        setQuality('poor');
        setIsLowQuality(true);
        return { quality: 'poor', isLowQuality: true };
      }
    } catch (e) {
      console.error('Could not check network status:', e);
      return { quality: 'unknown', isLowQuality: false };
    }
  }, [quality]);
  
  // Initialize the network quality check
  useEffect(() => {
    checkQuality();
    
    // Set up polling interval
    const interval = setInterval(() => {
      checkQuality();
    }, pollingInterval);
    
    // Check for Navigator.connection API (web)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      if (connection) {
        // Initial values
        setEffectiveType(connection.effectiveType);
        setDownlink(connection.downlink);
        
        // Listen for changes
        const handleChange = () => {
          setEffectiveType(connection.effectiveType);
          setDownlink(connection.downlink);
          checkQuality();
        };
        
        connection.addEventListener('change', handleChange);
        return () => {
          clearInterval(interval);
          connection.removeEventListener('change', handleChange);
        };
      }
    }
    
    // Capacitor network listener
    const setupListener = async () => {
      try {
        return await Network.addListener('networkStatusChange', (status) => {
          setIsConnected(status.connected);
          checkQuality();
        });
      } catch (error) {
        console.error('Error setting up network listener:', error);
        return null;
      }
    };
    
    const listenerPromise = setupListener();
    
    return () => {
      clearInterval(interval);
      // Clean up listener
      listenerPromise.then(listener => {
        if (listener) listener.remove();
      });
    };
  }, [checkQuality, pollingInterval]);
  
  return {
    quality,
    isLowQuality,
    hasTransitioned,
    isConnected,
    connectionType,
    metrics,
    effectiveType,
    isFlaky,
    latency,
    bandwidth,
    checkQuality
  };
}
