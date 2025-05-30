import React, { useEffect, useState } from 'react';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useNetworkQuality } from '@/responsive/core/hooks';

interface NetworkPredictiveMonitorProps {
  children: React.ReactNode;
  enablePredictions?: boolean;
  notifyUser?: boolean;
}

export const NetworkPredictiveMonitor: React.FC<NetworkPredictiveMonitorProps> = ({
  children,
  enablePredictions = true,
  notifyUser = true
}) => {
  const { quality, isLowQuality } = useNetworkQuality();
  const { isOnline } = useConnectionStatus();
  const [lastQualityCheck, setLastQualityCheck] = useState<string>('');

  useEffect(() => {
    if (!enablePredictions || !isOnline) return;

    const monitorNetworkTrends = () => {
      if (isLowQuality && quality !== lastQualityCheck) {
        console.log(`Network quality degraded to: ${quality}`);
        
        if (notifyUser) {
          // Could trigger a toast notification here
          console.warn('Network quality is low, some features may be limited');
        }
        
        setLastQualityCheck(quality);
      }
    };

    const interval = setInterval(monitorNetworkTrends, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [isLowQuality, quality, lastQualityCheck, enablePredictions, notifyUser, isOnline]);

  return <>{children}</>;
};
