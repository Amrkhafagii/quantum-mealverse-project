
import { useState, useEffect } from 'react';
import { useConnectionStatus } from './useConnectionStatus';

type NetworkQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'very-poor' | 'unknown';

export const useNetworkQuality = () => {
  const { isOnline, connectionType } = useConnectionStatus();
  const [quality, setQuality] = useState<NetworkQuality>('unknown');
  const [latency, setLatency] = useState<number | null>(null);
  const [latencyHistory, setLatencyHistory] = useState<number[]>([]);
  const [isLowQuality, setIsLowQuality] = useState(false);

  // Function to measure connection latency
  const measureLatency = async () => {
    if (!isOnline) {
      setLatency(null);
      setQuality('very-poor');
      setIsLowQuality(true);
      return;
    }

    // Don't run the test if the tab is not visible to save resources
    if (document.hidden) return;

    const start = Date.now();
    try {
      // Use a small request to measure latency
      const res = await fetch('/api/ping', { 
        method: 'HEAD',
        cache: 'no-store',
        // Set a timeout to detect very slow connections
        signal: AbortSignal.timeout(5000)
      });
      
      if (res.ok) {
        const end = Date.now();
        const newLatency = end - start;
        
        // Add to history for a rolling average
        setLatencyHistory(prev => {
          const updated = [...prev, newLatency].slice(-5); // Keep last 5 measurements
          return updated;
        });
        
        setLatency(newLatency);
      }
    } catch (error) {
      console.warn('Error measuring latency:', error);
      // If we can't even complete the request, connection is poor
      setLatency(5000); // Use max latency as fallback
      setLatencyHistory(prev => [...prev, 5000].slice(-5));
    }
  };
  
  // Calculate rolling average of latency
  const getAverageLatency = () => {
    if (latencyHistory.length === 0) return null;
    return latencyHistory.reduce((sum, lat) => sum + lat, 0) / latencyHistory.length;
  };

  // Update quality based on latency and connection type
  useEffect(() => {
    const avgLatency = getAverageLatency();
    
    if (!isOnline) {
      setQuality('very-poor');
      setIsLowQuality(true);
      return;
    }
    
    if (avgLatency === null) {
      setQuality('unknown');
      setIsLowQuality(false);
      return;
    }
    
    // Adjust thresholds based on connection type
    if (connectionType === 'wifi' || connectionType === 'ethernet') {
      if (avgLatency < 100) {
        setQuality('excellent');
        setIsLowQuality(false);
      } else if (avgLatency < 300) {
        setQuality('good');
        setIsLowQuality(false);
      } else if (avgLatency < 800) {
        setQuality('fair');
        setIsLowQuality(false);
      } else if (avgLatency < 2000) {
        setQuality('poor');
        setIsLowQuality(true);
      } else {
        setQuality('very-poor');
        setIsLowQuality(true);
      }
    } else {
      // Mobile or other connections - more lenient thresholds
      if (avgLatency < 150) {
        setQuality('excellent');
        setIsLowQuality(false);
      } else if (avgLatency < 500) {
        setQuality('good');
        setIsLowQuality(false);
      } else if (avgLatency < 1200) {
        setQuality('fair');
        setIsLowQuality(false);
      } else if (avgLatency < 3000) {
        setQuality('poor');
        setIsLowQuality(true);
      } else {
        setQuality('very-poor');
        setIsLowQuality(true);
      }
    }
  }, [latencyHistory, isOnline, connectionType]);

  // Periodically measure latency when online
  useEffect(() => {
    if (!isOnline) return;
    
    measureLatency();
    const interval = setInterval(measureLatency, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [isOnline]);

  // Also measure latency when online status changes
  useEffect(() => {
    if (isOnline) {
      measureLatency();
    }
  }, [isOnline]);

  // When switching back to tab, measure again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isOnline) {
        measureLatency();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isOnline]);

  return {
    quality,
    latency,
    isLowQuality,
    connectionType,
  };
};

export default useNetworkQuality;
