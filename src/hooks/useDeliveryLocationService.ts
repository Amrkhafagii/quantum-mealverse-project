import { useState, useEffect, useCallback } from 'react';
import { Platform } from '@/utils/platform';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useNetworkQuality } from '@/hooks/useNetworkQuality';
import { LocationFreshness, DeliveryLocation } from '@/types/location';
import { useOptimizedLocationTracking } from './useOptimizedLocationTracking';
import { Device } from '@capacitor/device';

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

export interface DeliveryLocationServiceReturn {
  config: DeliveryLocationConfig;
  updateTrackingInterval: (distanceToDestination?: number) => void;
  batteryLevel: number | null;
  isBatteryLow: boolean;
  getAdjustedTrackingInterval: (distanceToDestination?: number) => number;
  // Location tracking properties
  location: DeliveryLocation | null;
  updateLocation: () => Promise<DeliveryLocation | null>;
  isTracking: boolean;
  startTracking: () => Promise<boolean>;
  stopTracking: () => Promise<boolean>;
  permissionStatus: PermissionState;
  isStale: boolean;
  freshness: LocationFreshness;
  lastUpdated: Date | null;
  resetAndRequestLocation: () => Promise<DeliveryLocation | null>;
  isUpdating: boolean;
  error: Error | null;
  // New properties for activity-based tracking
  isMoving: boolean;
}

export function useDeliveryLocationService(): DeliveryLocationServiceReturn {
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

  // State variables for location tracking
  const [location, setLocation] = useState<DeliveryLocation | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [freshness, setFreshness] = useState<LocationFreshness>('moderate');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<PermissionState>('prompt');
  
  // Use our optimized location tracking hook with initial default values
  // FIXED: Breaking the circular dependency by using fixed default values initially
  const { 
    isTracking: optimizedIsTracking,
    startTracking: optimizedStartTracking,
    stopTracking: optimizedStopTracking,
    isLowBattery: optimizedIsLowBattery,
    batteryLevel: optimizedBatteryLevel,
    isMoving
  } = useOptimizedLocationTracking({
    onLocationUpdate: (newLocation) => {
      if (newLocation) {
        console.log('DeliveryLocationService: Got new location from tracking', newLocation);
        setLocation(newLocation);
        setLastUpdated(new Date());
        setFreshness('fresh');
        setIsStale(false);
        setError(null);
      }
    },
    lowPowerMode: isLowQuality || isBatteryLow,
    distanceFilter: isBatteryLow ? 50 : isLowQuality ? 30 : 10,
    trackingInterval: DEFAULT_TRACKING_INTERVAL // Start with the default value
  });
  
  // Sync battery state from the optimized hook
  useEffect(() => {
    if (optimizedBatteryLevel !== null) {
      setBatteryLevel(optimizedBatteryLevel);
      setIsBatteryLow(optimizedIsLowBattery);
    }
  }, [optimizedBatteryLevel, optimizedIsLowBattery]);
  
  // Get battery level on native devices if not provided by the optimized hook
  useEffect(() => {
    const getBatteryLevel = async () => {
      if (Platform.isNative() && batteryLevel === null) {
        try {
          const batteryInfo = await Device.getBatteryInfo();
          setBatteryLevel(batteryInfo.batteryLevel);
          setIsBatteryLow(batteryInfo.batteryLevel < 0.2); // 20% threshold
        } catch (error) {
          console.error('Error getting battery level:', error);
        }
      }
    };
    
    getBatteryLevel();
    
    // Set up interval to check battery periodically if not using optimized tracking
    if (batteryLevel === null) {
      const batteryCheckInterval = setInterval(getBatteryLevel, 60000); // every minute
      return () => clearInterval(batteryCheckInterval);
    }
  }, [batteryLevel]);
  
  // Adjust tracking interval based on battery, connection, and proximity
  function getAdjustedTrackingInterval(distanceToDestination?: number) {
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
    
    // If device is not moving, reduce frequency
    if (!isMoving) {
      return DEFAULT_TRACKING_INTERVAL * 2;
    }
    
    // If close to destination, increase frequency
    if (distanceToDestination !== undefined && distanceToDestination < config.aggressiveTrackingThreshold) {
      return AGGRESSIVE_TRACKING_INTERVAL;
    }
    
    // Default case
    return DEFAULT_TRACKING_INTERVAL;
  }
  
  // Update config based on conditions
  const updateTrackingInterval = useCallback((distanceToDestination?: number) => {
    setConfig(prev => ({
      ...prev,
      trackingInterval: getAdjustedTrackingInterval(distanceToDestination),
      // Reduce accuracy when battery is low, device is stationary, or connection is poor
      accuracyLevel: isBatteryLow || !isMoving || isLowQuality ? 'low' : 'balanced'
    }));
  }, [isBatteryLow, isLowQuality, isMoving]);
  
  // ADDED: Update tracking interval after the hook is fully initialized
  // This breaks the circular dependency by updating the interval in an effect
  useEffect(() => {
    // Only update after we have all the required values
    updateTrackingInterval();
  }, [updateTrackingInterval, isMoving, isBatteryLow, isLowQuality, isOnline]);
  
  // Check if location data is stale
  const checkIsLocationStale = useCallback(() => {
    if (!lastUpdated) return true;
    
    const now = new Date();
    const staleDuration = isBatteryLow ? 5 * 60 * 1000 : 2 * 60 * 1000; // 5 or 2 minutes
    const isDataStale = now.getTime() - lastUpdated.getTime() > staleDuration;
    
    if (isDataStale !== isStale) {
      setIsStale(isDataStale);
      setFreshness(isDataStale ? 'stale' : 'moderate');
    }
    
    return isDataStale;
  }, [lastUpdated, isBatteryLow, isStale]);
  
  // Update location with optimized strategy
  const updateLocation = useCallback(async (): Promise<DeliveryLocation | null> => {
    setIsUpdating(true);
    try {
      console.log('DeliveryLocationService: updateLocation called, isTracking:', optimizedIsTracking);
      
      // If we're already tracking, just return the current location
      if (optimizedIsTracking && location && !checkIsLocationStale()) {
        console.log('DeliveryLocationService: Already tracking, returning current location');
        setIsUpdating(false);
        return location;
      }
      
      // If we're not tracking, start tracking to get a fresh location
      if (!optimizedIsTracking) {
        console.log('DeliveryLocationService: Not tracking, starting tracking');
        await optimizedStartTracking();
      }
      
      // Wait for a new location update (or timeout)
      return new Promise((resolve) => {
        // Set a timeout to avoid waiting forever
        const timeout = setTimeout(() => {
          console.log('DeliveryLocationService: Location update timed out');
          setIsUpdating(false);
          // Even if we timed out, return whatever location we have
          resolve(location); 
        }, 10000);
        
        // Create a temporary listener to resolve when location updates
        const checkInterval = setInterval(() => {
          if (location) {
            console.log('DeliveryLocationService: Location updated during interval check');
            clearInterval(checkInterval);
            clearTimeout(timeout);
            setIsUpdating(false);
            resolve(location);
          }
        }, 1000); // Check every second
        
        // Cleanup function
        return () => {
          clearTimeout(timeout);
          clearInterval(checkInterval);
        };
      });
    } catch (err) {
      console.error('DeliveryLocationService: Error updating location', err);
      setError(err instanceof Error ? err : new Error('Failed to update location'));
      setIsUpdating(false);
      return null;
    }
  }, [optimizedIsTracking, location, checkIsLocationStale, optimizedStartTracking]);

  // Start tracking with optimized settings
  const startTracking = useCallback(async (): Promise<boolean> => {
    try {
      const success = await optimizedStartTracking();
      return success;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to start tracking'));
      return false;
    }
  }, [optimizedStartTracking]);

  // Stop tracking
  const stopTracking = useCallback(async (): Promise<boolean> => {
    try {
      const success = await optimizedStopTracking();
      return success;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to stop tracking'));
      return false;
    }
  }, [optimizedStopTracking]);

  // Reset and request fresh location
  const resetAndRequestLocation = useCallback(async (): Promise<DeliveryLocation | null> => {
    console.log('DeliveryLocationService: Resetting and requesting new location');
    setPermissionStatus('prompt');
    if (optimizedIsTracking) {
      console.log('DeliveryLocationService: Stopping existing tracking before reset');
      await optimizedStopTracking();
    }
    
    console.log('DeliveryLocationService: Starting tracking after reset');
    await optimizedStartTracking();
    
    console.log('DeliveryLocationService: Updating location after reset');
    return updateLocation();
  }, [optimizedIsTracking, optimizedStopTracking, optimizedStartTracking, updateLocation]);
  
  // Check for stale location data regularly
  useEffect(() => {
    if (location && lastUpdated) {
      const staleCheckInterval = setInterval(checkIsLocationStale, 60000); // Check every minute
      return () => clearInterval(staleCheckInterval);
    }
  }, [location, lastUpdated, checkIsLocationStale]);
  
  return {
    config,
    updateTrackingInterval,
    batteryLevel,
    isBatteryLow,
    getAdjustedTrackingInterval,
    location,
    updateLocation,
    isTracking: optimizedIsTracking,
    startTracking,
    stopTracking,
    permissionStatus,
    isStale,
    freshness,
    lastUpdated,
    resetAndRequestLocation,
    isUpdating,
    error,
    isMoving
  };
}
