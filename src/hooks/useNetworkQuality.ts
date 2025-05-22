
import { useState, useEffect, useCallback } from 'react';
import { Network } from '@capacitor/network';
import { Capacitor } from '@capacitor/core';

export type NetworkQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'offline';
export type NetworkType = 'wifi' | 'cellular' | 'none' | 'unknown';

export function useNetworkQuality() {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [connectionType, setConnectionType] = useState<NetworkType>('unknown');
  const [quality, setQuality] = useState<NetworkQuality>('good');
  const [isLowQuality, setIsLowQuality] = useState<boolean>(false);
  const [effectiveType, setEffectiveType] = useState<string>('4g');
  const [downlink, setDownlink] = useState<number | null>(null);

  const determineNetworkQuality = useCallback(() => {
    if (!isConnected) {
      setQuality('offline');
      setIsLowQuality(true);
      return;
    }

    if (connectionType === 'wifi') {
      // On WiFi, check if the effective type is slow
      if (effectiveType === '2g') {
        setQuality('poor');
        setIsLowQuality(true);
      } else if (effectiveType === '3g') {
        setQuality('fair');
        setIsLowQuality(false);
      } else {
        setQuality('excellent');
        setIsLowQuality(false);
      }
    } else if (connectionType === 'cellular') {
      // On cellular, classify by effective connection
      if (effectiveType === '2g') {
        setQuality('poor');
        setIsLowQuality(true);
      } else if (effectiveType === '3g') {
        setQuality('fair');
        setIsLowQuality(true);
      } else if (effectiveType === '4g') {
        setQuality('good');
        setIsLowQuality(false);
      } else if (effectiveType === '5g') {
        setQuality('excellent');
        setIsLowQuality(false);
      }
    } else {
      // Unknown or none
      setQuality('offline');
      setIsLowQuality(true);
    }

    // Also check if we have downlink speed info
    if (downlink !== null) {
      // Downlink is in Mbps
      if (downlink < 0.5) {
        setQuality('poor');
        setIsLowQuality(true);
      } else if (downlink < 2) {
        setQuality('fair');
        setIsLowQuality(true);
      } else if (downlink < 10) {
        setQuality('good');
        setIsLowQuality(false);
      } else {
        setQuality('excellent');
        setIsLowQuality(false);
      }
    }
  }, [isConnected, connectionType, effectiveType, downlink]);

  // Update network information
  const updateNetworkInfo = useCallback(async () => {
    try {
      const status = await Network.getStatus();
      setIsConnected(status.connected);
      setConnectionType(status.connectionType as NetworkType);
      
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
    const listener = Network.addListener('networkStatusChange', status => {
      setIsConnected(status.connected);
      setConnectionType(status.connectionType as NetworkType);
      determineNetworkQuality();
    });
    
    // Set up periodic checks for more detailed mobile connection state
    const intervalId = setInterval(updateNetworkInfo, 30000); // Check every 30s
    
    return () => {
      listener.remove();
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
    downlink
  };
}
