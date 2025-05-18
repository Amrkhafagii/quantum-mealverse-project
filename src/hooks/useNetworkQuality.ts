
import { useState, useEffect, useCallback } from 'react';
import { useConnectionStatus } from './useConnectionStatus';

interface NetworkQualityResult {
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'very-poor' | 'unknown';
  isLowQuality: boolean;
  latency?: number;
  bandwidth?: number;
  isLowBandwidth: boolean;
  isFlaky: boolean;
  lastChangeTimestamp: number;
  hasTransitioned: boolean;
}

export function useNetworkQuality(): NetworkQualityResult {
  const { isOnline, connectionType } = useConnectionStatus();
  const [quality, setQuality] = useState<NetworkQualityResult['quality']>('unknown');
  const [latency, setLatency] = useState<number | undefined>(undefined);
  const [bandwidth, setBandwidth] = useState<number | undefined>(undefined);
  const [isLowBandwidth, setIsLowBandwidth] = useState(false);
  const [isFlaky, setIsFlaky] = useState(false);
  const [transitionCount, setTransitionCount] = useState(0);
  const [lastChangeTimestamp, setLastChangeTimestamp] = useState(Date.now());
  
  // Track network transitions to detect flaky connections
  const [previousOnlineState, setPreviousOnlineState] = useState(isOnline);
  
  // Detect network transitions (flaky connections)
  useEffect(() => {
    if (previousOnlineState !== isOnline) {
      setPreviousOnlineState(isOnline);
      setTransitionCount(prev => prev + 1);
      setLastChangeTimestamp(Date.now());
      
      // If we've had multiple transitions in the last 2 minutes, consider connection flaky
      const twoMinutesAgo = Date.now() - 2 * 60 * 1000;
      if (lastChangeTimestamp > twoMinutesAgo) {
        setIsFlaky(true);
      }
    }
  }, [isOnline, previousOnlineState, lastChangeTimestamp]);
  
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
  
  // Enhanced network quality measurement with exponential backoff for failures
  const measureNetworkQuality = useCallback(async () => {
    if (!isOnline) return;
    
    // Track consecutive failures for backoff
    const failureKey = 'network_quality_failures';
    const consecutiveFailures = Number(sessionStorage.getItem(failureKey) || '0');
    
    // Implement exponential backoff if we've had failures
    if (consecutiveFailures > 0) {
      const backoffTime = Math.min(1000 * Math.pow(2, consecutiveFailures), 60000); // Max 1 minute
      const lastAttemptTime = Number(sessionStorage.getItem('last_quality_attempt') || '0');
      
      if (Date.now() - lastAttemptTime < backoffTime) {
        console.log(`Backing off network quality check for ${backoffTime}ms`);
        return;
      }
    }
    
    try {
      sessionStorage.setItem('last_quality_attempt', Date.now().toString());
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
      
      // Reset failures counter on success
      sessionStorage.setItem(failureKey, '0');
      
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
      
      // If we had previously marked the connection as flaky but
      // now have 3 successful pings, consider it stable again
      if (isFlaky && consecutiveFailures === 0) {
        const stableCheckCount = Number(sessionStorage.getItem('stable_checks') || '0');
        if (stableCheckCount >= 2) {
          setIsFlaky(false);
          sessionStorage.setItem('stable_checks', '0');
        } else {
          sessionStorage.setItem('stable_checks', (stableCheckCount + 1).toString());
        }
      }
    } catch (error) {
      console.error('Error measuring network quality:', error);
      // Increment failure counter for backoff
      sessionStorage.setItem(failureKey, (consecutiveFailures + 1).toString());
    }
  }, [isOnline, isFlaky]);
  
  // Determine if quality is considered "low" overall
  const isLowQuality = quality === 'poor' || quality === 'very-poor' || !isOnline || isFlaky;
  
  return {
    quality,
    isLowQuality,
    latency,
    bandwidth,
    isLowBandwidth,
    isFlaky,
    lastChangeTimestamp,
    hasTransitioned: transitionCount > 0
  };
}
