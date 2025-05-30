import { useState, useEffect } from 'react';
import { useNetworkQuality } from '@/responsive/core/hooks';

export const useIntelligentTracking = () => {
  const { quality } = useNetworkQuality();
  const [trackingEnabled, setTrackingEnabled] = useState(true);

  useEffect(() => {
    // Adjust tracking based on network quality
    if (quality === '4G' || quality === '5G' || quality === 'WiFi') {
      setTrackingEnabled(true);
    } else {
      setTrackingEnabled(false);
    }
  }, [quality]);

  return {
    trackingEnabled,
    networkQuality: quality,
  };
};
