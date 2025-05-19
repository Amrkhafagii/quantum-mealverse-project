import React, { createContext, useContext, useState, useEffect } from 'react';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { RequestQueueManager } from '../network/RequestQueue';

type NetworkContextType = {
  isOnline: boolean;
  connectionType: string | null;
  isLowBandwidth: boolean;
  offlineMode: 'auto' | 'on' | 'off';
  setOfflineMode: (mode: 'auto' | 'on' | 'off') => void;
};

const NetworkContext = createContext<NetworkContextType>({
  isOnline: true,
  connectionType: null,
  isLowBandwidth: false,
  offlineMode: 'auto',
  setOfflineMode: () => {},
});

export const useNetwork = () => useContext(NetworkContext);

export const NetworkStatusProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const { isOnline, connectionType, wasOffline } = useConnectionStatus();
  const [offlineMode, setOfflineMode] = useState<'auto' | 'on' | 'off'>('auto');
  const [isLowBandwidth, setIsLowBandwidth] = useState(false);
  
  // Detect low bandwidth connections
  useEffect(() => {
    if ('connection' in navigator) {
      // Use the Network Information API if available
      const connection = (navigator as any).connection;
      
      if (connection) {
        const updateConnectionStatus = () => {
          // Get effective connection type if available
          const effectiveType = connection.effectiveType;
          
          // Consider 2G and slow 3G as low bandwidth
          const slowConnection = 
            effectiveType === '2g' || 
            effectiveType === 'slow-2g' || 
            (connection.downlink && connection.downlink < 1);
            
          setIsLowBandwidth(slowConnection);
        };
        
        // Initial check
        updateConnectionStatus();
        
        // Listen for connection changes
        connection.addEventListener('change', updateConnectionStatus);
        
        return () => {
          connection.removeEventListener('change', updateConnectionStatus);
        };
      }
    }
    
    // Default to assuming not low bandwidth if we can't detect
    return () => {};
  }, []);
  
  // Track connection quality over time
  useEffect(() => {
    if (!isOnline) return;
    
    const latencyChecks: number[] = [];
    let checkCount = 0;
    
    // Perform simple periodic ping test to estimate latency
    const checkLatency = async () => {
      const start = Date.now();
      
      try {
        // Use a tiny request to check latency
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        await fetch('/favicon.ico', { 
          method: 'HEAD',
          cache: 'no-store',
          signal: controller.signal
        });
        
        const latency = Date.now() - start;
        clearTimeout(timeoutId);
        
        // Only keep the last 5 measurements
        latencyChecks.push(latency);
        if (latencyChecks.length > 5) {
          latencyChecks.shift();
        }
        
        // Calculate average latency
        const avgLatency = latencyChecks.reduce((sum, val) => sum + val, 0) / latencyChecks.length;
        
        // Consider high latency as low bandwidth
        setIsLowBandwidth(avgLatency > 500);
      } catch (err) {
        // If request timed out or failed, consider it a connectivity issue
        setIsLowBandwidth(true);
      }
      
      // Limit the number of checks to avoid excessive requests
      checkCount++;
      if (checkCount < 10) {
        setTimeout(checkLatency, 60000); // Check once per minute
      }
    };
    
    // Start checking after a delay
    const initialDelay = setTimeout(checkLatency, 5000);
    
    return () => {
      clearTimeout(initialDelay);
    };
  }, [isOnline]);
  
  return (
    <NetworkContext.Provider 
      value={{ 
        isOnline, 
        connectionType, 
        isLowBandwidth, 
        offlineMode,
        setOfflineMode
      }}
    >
      {children}
      <RequestQueueManager />
    </NetworkContext.Provider>
  );
};

export default NetworkStatusProvider;
