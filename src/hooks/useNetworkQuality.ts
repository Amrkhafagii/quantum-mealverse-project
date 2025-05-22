import { useState, useEffect, useRef, useCallback } from 'react';
import { Network } from '@capacitor/network';
import { Capacitor } from '@capacitor/core';

export type NetworkQuality = 'excellent' | 'good' | 'moderate' | 'poor' | 'offline' | 'unknown';

interface NetworkMetrics {
  rtt?: number | null;
  downlink?: number | null;
  jitter?: number | null;
  score?: number | null;
}

interface EffectiveConnectionType {
  effectiveType?: string | null;
}

interface NetworkQualityData extends NetworkMetrics, EffectiveConnectionType {
  quality: NetworkQuality;
  isLowQuality: boolean;
  hasTransitioned: boolean;
  isFlaky: boolean;
}

const initialNetworkData: NetworkQualityData = {
  quality: 'unknown',
  isLowQuality: false,
  hasTransitioned: false,
  isFlaky: false,
  rtt: null,
  downlink: null,
  jitter: null,
  score: null,
  effectiveType: null
};

const mapConnectionType = (type: string | null): string => {
  switch (type) {
    case 'wifi': return 'wifi';
    case 'cellular': return 'cellular';
    case 'ethernet': return 'ethernet';
    case 'none': return 'none';
    default: return 'unknown';
  }
};

export function useNetworkQuality() {
  const [quality, setQuality] = useState<NetworkQuality>('unknown');
  const [isLowQuality, setIsLowQuality] = useState<boolean>(false);
  const [hasTransitioned, setHasTransitioned] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [connectionType, setConnectionType] = useState<string>('unknown');
  const [metrics, setMetrics] = useState<NetworkMetrics>({ rtt: null, downlink: null, jitter: null, score: null });
  const [effectiveType, setEffectiveType] = useState<string | null>(null);
  const [isFlaky, setIsFlaky] = useState<boolean>(false);
  const timeoutRef = useRef<number | null>(null);
  const [testCount, setTestCount] = useState(0);
  const [consecutivePoor, setConsecutivePoor] = useState(0);

  // Constants for scoring
  const GOOD_SCORE = 0.8;
  const MODERATE_SCORE = 0.5;
  const POOR_SCORE = 0.2;
  const MAX_TESTS = 3;
  const POOR_THRESHOLD = 2;

  // Helper function to run the network quality test
  const runQualityTest = useCallback(async (): Promise<number | null> => {
    const startTime = Date.now();
    try {
      // Use a small, cache-busted image
      const imageUrl = `https://source.unsplash.com/random?q=${startTime}`;
      const response = await fetch(imageUrl, { mode: 'no-cors' });
      if (!response.ok) {
        console.warn('Network test image failed to load');
        return null;
      }
      const endTime = Date.now();
      const duration = (endTime - startTime);
      const score = Math.max(0, 1 - (duration / 1000)); // Normalize to 0-1 scale
      return score;
    } catch (error) {
      console.error('Network quality test error:', error);
      return null;
    }
  }, []);

  // Function to evaluate network quality
  const evaluateQuality = useCallback((score: number | null) => {
    if (score === null) {
      return 'unknown';
    } else if (score >= GOOD_SCORE) {
      return 'excellent';
    } else if (score >= MODERATE_SCORE) {
      return 'good';
    } else if (score > POOR_SCORE) {
      return 'moderate';
    } else {
      return 'poor';
    }
  }, []);

  // Schedule a quality check
  const scheduleQualityCheck = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(async () => {
      if (!isConnected) {
        console.log('Skipping quality check: not connected');
        return;
      }
      
      const score = await runQualityTest();
      const newQuality = evaluateQuality(score);
      
      setTestCount(prevCount => prevCount + 1);
      
      // Update metrics
      setMetrics(prev => ({ ...prev, score }));
      
      // Handle consecutive poor scores
      if (newQuality === 'poor') {
        setConsecutivePoor(prev => prev + 1);
      } else {
        setConsecutivePoor(0);
      }
      
      // Determine if the connection is flaky
      const flaky = consecutivePoor >= POOR_THRESHOLD;
      setIsFlaky(flaky);
      
      // Set quality state
      setQuality(newQuality);
      setIsLowQuality(newQuality === 'poor' || newQuality === 'moderate');
      
      console.log(`Network quality: ${newQuality} (score: ${score}, test ${testCount}, flaky: ${flaky})`);
      
      // Reschedule if needed
      if (testCount < MAX_TESTS) {
        scheduleQualityCheck();
      } else {
        console.log('Max tests reached, monitoring passively');
      }
    }, 2000) as unknown as number;
  }, [runQualityTest, evaluateQuality, isConnected, testCount, consecutivePoor]);

  // Setup network info monitoring
  useEffect(() => {
    // Initial setup
    let initialCheckDone = false;
    
    const initialCheck = async () => {
      try {
        const status = await Network.getStatus();
        
        // Set initial connection status
        setIsConnected(status.connected);
        setConnectionType(mapConnectionType(status.connectionType));
        
        // Schedule a quality check on initial setup
        if (status.connected) {
          scheduleQualityCheck();
        } else {
          setQuality('offline');
          setIsLowQuality(true);
        }
      } catch (error) {
        console.error('Error checking initial network status:', error);
        setQuality('unknown');
        setIsLowQuality(false);
      } finally {
        initialCheckDone = true;
      }
    };

    // Set up network listener
    let networkListener: any = null;
    
    const setupListener = async () => {
      try {
        const listener = await Network.addListener('networkStatusChange', (status) => {
          // Update connection type and check quality
          setConnectionType(mapConnectionType(status.connectionType));
          setIsConnected(status.connected);
          
          // Schedule a quality check when network changes
          if (status.connected) {
            scheduleQualityCheck();
          } else {
            setQuality('offline');
            setIsLowQuality(true);
          }
          
          // Record the transition
          setHasTransitioned(true);
          setTimeout(() => setHasTransitioned(false), 3000);
        });
        
        networkListener = listener;
      } catch (error) {
        console.error('Error setting up network listener:', error);
      }
    };
    
    setupListener();

    // Browser fallback
    const handleOnline = () => {
      setIsConnected(true);
      setConnectionType('unknown');
      scheduleQualityCheck();
    };

    const handleOffline = () => {
      setIsConnected(false);
      setQuality('offline');
      setIsLowQuality(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Run initial check if not already done
    if (!initialCheckDone) {
      initialCheck();
    }

    return () => {
      // Clean up resources
      clearTimeout(timeoutRef.current);
      
      if (networkListener) {
        try {
          networkListener.remove();
        } catch (err) {
          console.error('Error removing network listener:', err);
        }
      }
      
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [runQualityTest, evaluateQuality, scheduleQualityCheck]);

  return {
    quality,
    isLowQuality,
    hasTransitioned,
    isConnected,
    connectionType,
    metrics,
    effectiveType,
    isFlaky
  };
}
