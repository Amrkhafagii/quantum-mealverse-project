
import { useState, useEffect, useCallback } from 'react';
import { Network } from '@capacitor/network';
import { Capacitor } from '@capacitor/core';

export type NetworkQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'very-poor' | 'offline' | 'unknown';
export type NetworkType = 'wifi' | 'cellular' | 'none' | 'unknown';

export function useNetworkQuality() {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [connectionType, setConnectionType] = useState<NetworkType>('unknown');
  const [quality, setQuality] = useState<NetworkQuality>('good');
  const [isLowQuality, setIsLowQuality] = useState<boolean>(false);
  const [effectiveType, setEffectiveType] = useState<string>('4g');
  const [downlink, setDownlink] = useState<number | null>(null);
  const [bandwidth, setBandwidth] = useState<number | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [isFlaky, setIsFlaky] = useState<boolean>(false);
  const [hasTransitioned, setHasTransitioned] = useState<boolean>(false);
  const [previousQuality, setPreviousQuality] = useState<NetworkQuality | null>(null);

  const determineNetworkQuality = useCallback(() => {
    if (!isConnected) {
      setQuality('offline');
      setIsLowQuality(true);
      return;
    }

    let newQuality: NetworkQuality = 'unknown';

    if (connectionType === 'wifi') {
      // On WiFi, check if the effective type is slow
      if (effectiveType === '2g') {
        newQuality = 'poor';
        setIsLowQuality(true);
      } else if (effectiveType === '3g') {
        newQuality = 'fair';
        setIsLowQuality(false);
      } else {
        newQuality = 'excellent';
        setIsLowQuality(false);
      }
    } else if (connectionType === 'cellular') {
      // On cellular, classify by effective connection
      if (effectiveType === '2g') {
        newQuality = 'poor';
        setIsLowQuality(true);
      } else if (effectiveType === '3g') {
        newQuality = 'fair';
        setIsLowQuality(true);
      } else if (effectiveType === '4g') {
        newQuality = 'good';
        setIsLowQuality(false);
      } else if (effectiveType === '5g') {
        newQuality = 'excellent';
        setIsLowQuality(false);
      }
    } else {
      // Unknown or none
      newQuality = 'unknown';
      setIsLowQuality(true);
    }

    // Also check if we have downlink speed info
    if (downlink !== null) {
      // Downlink is in Mbps
      if (downlink < 0.5) {
        newQuality = 'very-poor';
        setIsLowQuality(true);
      } else if (downlink < 2) {
        newQuality = 'poor';
        setIsLowQuality(true);
      } else if (downlink < 10) {
        newQuality = 'good';
        setIsLowQuality(false);
      } else {
        newQuality = 'excellent';
        setIsLowQuality(false);
      }
    }

    // Estimate bandwidth in Mbps based on downlink or connection type
    const estimatedBandwidth = downlink
      ? downlink
      : connectionType === 'wifi'
      ? 25 // Default WiFi estimate
      : effectiveType === '5g'
      ? 100
      : effectiveType === '4g'
      ? 20
      : effectiveType === '3g'
      ? 5
      : 0.5; // 2g or below
      
    setBandwidth(estimatedBandwidth);

    // Check if quality has changed significantly
    if (previousQuality && newQuality !== previousQuality) {
      setHasTransitioned(true);
      // Reset transition flag after 5 seconds
      setTimeout(() => setHasTransitioned(false), 5000);
    }

    setPreviousQuality(newQuality);
    setQuality(newQuality);
  }, [isConnected, connectionType, effectiveType, downlink, previousQuality]);

  // Check quality actively
  const checkQuality = useCallback(async (): Promise<NetworkQuality> => {
    await updateNetworkInfo();
    return quality;
  }, [quality]);

  // Update network information
  const updateNetworkInfo = useCallback(async () => {
    try {
      const status = await Network.getStatus();
      setIsConnected(status.connected);
      setConnectionType(status.connectionType as NetworkType);
      
      // Estimate latency with a simple ping
      try {
        const start = Date.now();
        await fetch('/favicon.ico', { method: 'HEAD', cache: 'no-store' });
        const pingLatency = Date.now() - start;
        setLatency(pingLatency);
        
        // Set flaky if latency is inconsistent (simplified logic for demo)
        setIsFlaky(pingLatency > 300);
      } catch (error) {
        setIsFlaky(true);
      }
      
      // Web-only: get more detailed connection information if available
      if (typeof navigator !== 'undefined' && 'connection' in navigator) {
        const conn = (navigator as any).connection;
        if (conn) {
          setEffectiveType(conn.effectiveType || '4g');
          setDownlink(conn.downlink || null);
        }
      }
      
      determineNetworkQuality();
    } catch (error) {
      console.error('Error getting network status:', error);
    }
  }, [determineNetworkQuality]);

  // Initialize and set up listeners
  useEffect(() => {
    // Initial check
    updateNetworkInfo();
    
    // Listen for network status changes
    const setupListener = async () => {
      try {
        return await Network.addListener('networkStatusChange', status => {
          setIsConnected(status.connected);
          setConnectionType(status.connectionType as NetworkType);
          determineNetworkQuality();
        });
      } catch (error) {
        console.error('Error setting up network listener:', error);
        return null;
      }
    };
    
    let networkListener: any = null;
    setupListener().then(result => {
      networkListener = result;
    });
    
    // Set up periodic checks for more detailed mobile connection state
    const intervalId = setInterval(updateNetworkInfo, 30000); // Check every 30s
    
    return () => {
      if (networkListener) {
        networkListener.remove().catch((err: any) => console.error('Error removing network listener:', err));
      }
      clearInterval(intervalId);
    };
  }, [updateNetworkInfo, determineNetworkQuality]);

  return {
    isConnected,
    isOnline: isConnected,
    connectionType,
    quality,
    isLowQuality,
    effectiveType,
    downlink,
    bandwidth, // Added this property
    latency,
    isFlaky,
    hasTransitioned,
    checkQuality
  };
}
