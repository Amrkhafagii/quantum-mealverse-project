
import { useState, useEffect } from 'react';
import { Platform } from '@/utils/platform';

interface NetworkQuality {
  isLowQuality: boolean;
  quality: 'high' | 'medium' | 'low' | 'none';
  effectiveType?: '4g' | '3g' | '2g' | 'slow-2g';
  downlink?: number;
  rtt?: number;
}

export function useNetworkQuality(): NetworkQuality {
  const [networkQuality, setNetworkQuality] = useState<NetworkQuality>({
    isLowQuality: false,
    quality: 'high',
  });

  useEffect(() => {
    // Function to check network quality
    const checkNetworkQuality = () => {
      if (typeof navigator === 'undefined') {
        return {
          isLowQuality: false,
          quality: 'high',
        };
      }

      // Check if the NetworkInformation API is available
      if ('connection' in navigator) {
        try {
          const connection = (navigator as any).connection;
          const effectiveType = connection?.effectiveType;
          const downlink = connection?.downlink;
          const rtt = connection?.rtt;
          
          let quality: 'high' | 'medium' | 'low' | 'none' = 'high';
          let isLowQuality = false;
          
          if (!navigator.onLine) {
            quality = 'none';
            isLowQuality = true;
          } else if (effectiveType === 'slow-2g' || effectiveType === '2g') {
            quality = 'low';
            isLowQuality = true;
          } else if (effectiveType === '3g') {
            quality = 'medium';
            isLowQuality = downlink ? downlink < 1 : true;
          } else if (downlink && downlink < 1.5) {
            quality = 'medium';
            isLowQuality = downlink < 1;
          } else if (rtt && rtt > 500) {
            quality = 'medium';
            isLowQuality = rtt > 1000;
          }
          
          return {
            isLowQuality,
            quality,
            effectiveType,
            downlink,
            rtt,
          };
        } catch (e) {
          console.error('Error checking network information:', e);
        }
      }
      
      // Fallback if NetworkInformation API is not available
      return {
        isLowQuality: !navigator.onLine,
        quality: navigator.onLine ? 'medium' : 'none',
      };
    };

    // Initial check
    setNetworkQuality(checkNetworkQuality());

    // Set up event listeners for network changes
    const handleConnectionChange = () => {
      setNetworkQuality(checkNetworkQuality());
    };

    // Online/offline events as fallback
    const handleOnline = () => {
      setNetworkQuality(prev => ({
        ...prev,
        isLowQuality: false,
        quality: 'medium',
      }));
    };

    const handleOffline = () => {
      setNetworkQuality({
        isLowQuality: true,
        quality: 'none',
      });
    };

    // Add event listeners
    if (typeof navigator !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      if ('connection' in navigator) {
        try {
          (navigator as any).connection.addEventListener('change', handleConnectionChange);
        } catch (e) {
          console.error('Error setting up network change listener:', e);
        }
      }
    }

    // Cleanup
    return () => {
      if (typeof navigator !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        
        if ('connection' in navigator) {
          try {
            (navigator as any).connection.removeEventListener('change', handleConnectionChange);
          } catch (e) {
            // Ignore
          }
        }
      }
    };
  }, []);

  return networkQuality;
}

export default useNetworkQuality;
