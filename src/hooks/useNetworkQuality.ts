
import { useState, useEffect, useCallback, useRef } from 'react';
import { useConnectionStatus } from './useConnectionStatus';

// Updated network quality type to match what's used in components
export type NetworkQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'very-poor' | 'unknown';

interface NetworkQualityResult {
  quality: NetworkQuality;
  isLowQuality: boolean;
  isFlaky: boolean;
  hasTransitioned: boolean;
  latency: number | null;
  bandwidth: number | null;
  checkQuality: () => Promise<void>;
  packetLoss?: number | null; // Added explicit packetLoss property
}

export function useNetworkQuality(): NetworkQualityResult {
  const { isOnline, connectionType, wasOffline } = useConnectionStatus();
  const [quality, setQuality] = useState<NetworkQuality>('unknown');
  const [latency, setLatency] = useState<number | null>(null);
  const [bandwidth, setBandwidth] = useState<number | null>(null);
  const [packetLoss, setPacketLoss] = useState<number | null>(null); // Added state for packet loss
  const [isLowQuality, setIsLowQuality] = useState(false);
  const [isFlaky, setIsFlaky] = useState(false);
  const [hasTransitioned, setHasTransitioned] = useState(false);
  const prevQualityRef = useRef<NetworkQuality>('unknown');
  const flakyDetectionCount = useRef(0);
  const qualityChangeHistory = useRef<Array<{time: number, quality: NetworkQuality}>>([]);
  
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

  // Added simulated function to estimate packet loss
  const estimatePacketLoss = useCallback(async (): Promise<number> => {
    if (!isOnline) return 100; // 100% loss when offline
    
    // Simulated packet loss based on connection quality indicators
    if (latency && bandwidth) {
      // Higher latency or lower bandwidth indicates potentially higher packet loss
      const latencyFactor = latency > 500 ? 0.7 : latency > 250 ? 0.3 : 0.1;
      const bandwidthFactor = bandwidth < 1000 ? 0.5 : bandwidth < 5000 ? 0.2 : 0.05;
      
      // Calculate a packet loss percentage (0-100)
      const calculatedPacketLoss = (latencyFactor + bandwidthFactor) * 50;
      
      // Add some randomness to simulate fluctuations
      return Math.min(100, Math.max(0, calculatedPacketLoss + (Math.random() * 5 - 2.5)));
    }
    
    return connectionType === 'wifi' ? 2 : 5; // Default values
  }, [isOnline, latency, bandwidth, connectionType]);

  // Updated to use the new quality types
  const determineQuality = useCallback((latency: number, bandwidth: number): NetworkQuality => {
    if (latency < 100 && bandwidth > 5000) return 'excellent';
    if (latency < 200 && bandwidth > 2000) return 'good';
    if (latency < 300 && bandwidth > 1000) return 'fair';
    if (latency < 500 && bandwidth > 500) return 'poor';
    return 'very-poor';
  }, []);

  // Detect flaky connections based on rapid quality changes
  const detectFlakyConnection = useCallback((newQuality: NetworkQuality) => {
    const now = Date.now();
    
    // Add this quality change to history
    qualityChangeHistory.current.push({ time: now, quality: newQuality });
    
    // Only keep last 10 minutes of history
    const tenMinutesAgo = now - 10 * 60 * 1000;
    qualityChangeHistory.current = qualityChangeHistory.current.filter(item => item.time > tenMinutesAgo);
    
    // If quality is degrading from the previous check
    if (prevQualityRef.current !== 'unknown' && 
        isQualityWorse(newQuality, prevQualityRef.current)) {
      flakyDetectionCount.current += 1;
    } else {
      // Slowly reduce the flaky count if connection is stable
      flakyDetectionCount.current = Math.max(0, flakyDetectionCount.current - 0.5);
    }
    
    // Count rapid changes in the last 2 minutes
    const twoMinutesAgo = now - 2 * 60 * 1000;
    const recentChanges = qualityChangeHistory.current.filter(item => item.time > twoMinutesAgo);
    
    // Connection is considered flaky if we've had many quality changes or degradations
    const isFlaky = recentChanges.length >= 3 || flakyDetectionCount.current >= 2;
    
    setIsFlaky(isFlaky);
    prevQualityRef.current = newQuality;
    
    // Set hasTransitioned if quality changed
    if (prevQualityRef.current !== newQuality) {
      setHasTransitioned(true);
      
      // Reset transition flag after 10 seconds
      setTimeout(() => {
        setHasTransitioned(false);
      }, 10000);
    }
  }, []);
  
  // Helper to determine if new quality is worse than previous
  const isQualityWorse = (newQuality: NetworkQuality, oldQuality: NetworkQuality): boolean => {
    const qualityRank: Record<NetworkQuality, number> = {
      'excellent': 5,
      'good': 4,
      'fair': 3,
      'poor': 2,
      'very-poor': 1,
      'unknown': 0
    };
    
    return qualityRank[newQuality] < qualityRank[oldQuality];
  };

  const checkQuality = useCallback(async () => {
    if (!isOnline) {
      setQuality('unknown');
      setIsLowQuality(false);
      setIsFlaky(false);
      setLatency(null);
      setBandwidth(null);
      setPacketLoss(null);
      return;
    }

    try {
      const measuredLatency = await measureLatency();
      setLatency(measuredLatency);
      
      const estimatedBandwidth = await estimateBandwidth();
      setBandwidth(estimatedBandwidth);
      
      const estimatedPacketLoss = await estimatePacketLoss();
      setPacketLoss(estimatedPacketLoss);
      
      const newQuality = determineQuality(measuredLatency, estimatedBandwidth);
      setQuality(newQuality);
      
      // Set low quality flag based on the quality level
      const isLow = newQuality === 'poor' || newQuality === 'very-poor';
      setIsLowQuality(isLow);
      
      // Detect if connection is flaky
      detectFlakyConnection(newQuality);
    } catch (err) {
      console.error('Error checking network quality:', err);
      setQuality('unknown');
      setIsLowQuality(false);
    }
  }, [isOnline, measureLatency, estimateBandwidth, estimatePacketLoss, determineQuality, detectFlakyConnection]);

  // Check quality when online status or connection type changes
  useEffect(() => {
    checkQuality();
    
    // Set up periodic checks every 30 seconds
    const intervalId = setInterval(checkQuality, 30000);
    
    return () => clearInterval(intervalId);
  }, [isOnline, connectionType, checkQuality]);

  // Also check quality when we transition from offline to online
  useEffect(() => {
    if (isOnline && wasOffline) {
      checkQuality();
    }
  }, [isOnline, wasOffline, checkQuality]);

  return { 
    quality, 
    isLowQuality, 
    isFlaky, 
    hasTransitioned,
    latency, 
    bandwidth,
    packetLoss, // Include packetLoss in the return value
    checkQuality 
  };
}
