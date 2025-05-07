
import { useState, useEffect, useCallback } from 'react';
import { Platform } from '@/utils/platform';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useNetworkQuality } from '@/hooks/useNetworkQuality';

// Default tracking intervals in milliseconds
const DEFAULT_TRACKING_INTERVAL = 30000; // 30 seconds
const LOW_BATTERY_INTERVAL = 60000; // 1 minute
const AGGRESSIVE_TRACKING_INTERVAL = 10000; // 10 seconds

export interface DeliveryLocationConfig {
  trackingInterval: number;
  accuracyLevel: 'high' | 'balanced' | 'low';
  backgroundTrackingEnabled: boolean;
  aggressiveTrackingThreshold: number; // Distance in meters to trigger more frequent updates
}

export function useDeliveryLocationService() {
  const [config, setConfig] = useState<DeliveryLocationConfig>({
    trackingInterval: DEFAULT_TRACKING_INTERVAL,
    accuracyLevel: 'balanced',
    backgroundTrackingEnabled: true,
    aggressiveTrackingThreshold: 500, // 500 meters
  });
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isBatteryLow, setIsBatteryLow] = useState(false);
  const { isOnline } = useConnectionStatus();
  const { isLowQuality, quality } = useNetworkQuality();
  
  // Get battery level on native devices
  useEffect(() => {
    const getBatteryLevel = async () => {
      if (Platform.isNative()) {
        try {
          // @ts-ignore - Capacitor API
          const { level } = await window.Capacitor.Plugins.Device.getBatteryInfo();
          setBatteryLevel(level);
          setIsBatteryLow(level < 0.2); // 20% threshold
        } catch (error) {
          console.error('Error getting battery level:', error);
        }
      }
    };
    
    getBatteryLevel();
    
    // Set up interval to check battery periodically
    const batteryCheckInterval = setInterval(getBatteryLevel, 60000); // every minute
    
    return () => clearInterval(batteryCheckInterval);
  }, []);
  
  // Adjust tracking interval based on battery, connection, and proximity
  const getAdjustedTrackingInterval = useCallback((distanceToDestination?: number) => {
    // If offline, use less frequent updates
    if (!isOnline) {
      return LOW_BATTERY_INTERVAL * 2; // Even less frequent when offline
    }
    
    // If battery is low, reduce frequency
    if (isBatteryLow) {
      return LOW_BATTERY_INTERVAL;
    }
    
    // If network quality is poor, reduce frequency
    if (isLowQuality) {
      return DEFAULT_TRACKING_INTERVAL * 1.5;
    }
    
    // If close to destination, increase frequency
    if (distanceToDestination !== undefined && distanceToDestination < config.aggressiveTrackingThreshold) {
      return AGGRESSIVE_TRACKING_INTERVAL;
    }
    
    // Default case
    return DEFAULT_TRACKING_INTERVAL;
  }, [isOnline, isBatteryLow, isLowQuality, config.aggressiveTrackingThreshold]);
  
  // Update config based on conditions
  const updateTrackingInterval = useCallback((distanceToDestination?: number) => {
    setConfig(prev => ({
      ...prev,
      trackingInterval: getAdjustedTrackingInterval(distanceToDestination),
      // Reduce accuracy when battery is low or connection is poor
      accuracyLevel: isBatteryLow || isLowQuality ? 'low' : 'balanced'
    }));
  }, [getAdjustedTrackingInterval, isBatteryLow, isLowQuality]);
  
  return {
    config,
    updateTrackingInterval,
    batteryLevel,
    isBatteryLow,
    getAdjustedTrackingInterval
  };
}
