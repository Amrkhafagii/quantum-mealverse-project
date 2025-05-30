
import { useState, useEffect } from 'react';
import { useNetworkQuality } from '@/responsive/core/hooks';

interface TrackingConfig {
  forceLowPowerMode?: boolean;
  onLocationUpdate?: (location: any) => void;
}

export const useIntelligentTracking = (config: TrackingConfig = {}) => {
  const { quality } = useNetworkQuality();
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [trackingMode, setTrackingMode] = useState<'normal' | 'battery-saver' | 'high-accuracy'>('normal');
  const [trackingInterval, setTrackingInterval] = useState(5000);

  useEffect(() => {
    // Adjust tracking based on network quality
    if (quality === 'high' || quality === 'medium') {
      setTrackingEnabled(true);
      setTrackingMode('normal');
      setTrackingInterval(5000);
    } else if (quality === 'low') {
      setTrackingEnabled(true);
      setTrackingMode('battery-saver');
      setTrackingInterval(10000);
    } else {
      setTrackingEnabled(false);
      setTrackingMode('battery-saver');
      setTrackingInterval(15000);
    }

    // Apply force low power mode if requested
    if (config.forceLowPowerMode) {
      setTrackingMode('battery-saver');
      setTrackingInterval(15000);
    }
  }, [quality, config.forceLowPowerMode]);

  const stopTracking = () => {
    setTrackingEnabled(false);
  };

  return {
    trackingEnabled,
    networkQuality: quality,
    trackingMode,
    trackingInterval,
    stopTracking,
  };
};
