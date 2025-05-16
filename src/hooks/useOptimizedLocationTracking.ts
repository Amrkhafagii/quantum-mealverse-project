
import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { BackgroundGeolocation, getBackgroundWatcherOptions } from '@/utils/backgroundGeolocation';
import { DeliveryLocation } from '@/types/location';
import { toast } from '@/components/ui/use-toast';

interface OptimizedTrackingOptions {
  onLocationUpdate?: (location: DeliveryLocation) => void;
  lowPowerMode?: boolean;
  distanceFilter?: number;
  trackingInterval?: number;
  enableActivityDetection?: boolean;
}

export function useOptimizedLocationTracking({
  onLocationUpdate,
  lowPowerMode = false,
  distanceFilter = 10,
  trackingInterval = 10000,
  enableActivityDetection = true
}: OptimizedTrackingOptions = {}) {
  const [isTracking, setIsTracking] = useState(false);
  const [watcherId, setWatcherId] = useState<string | null>(null);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isLowBattery, setIsLowBattery] = useState(false);
  const [isMoving, setIsMoving] = useState(true);

  // Monitor battery level
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const checkBatteryLevel = async () => {
      try {
        const batteryInfo = await Device.getBatteryInfo();
        const level = batteryInfo.batteryLevel;
        
        setBatteryLevel(level);
        setIsLowBattery(level < 0.2); // 20% threshold for low battery
      } catch (err) {
        console.error('Error checking battery level:', err);
      }
    };

    // Check battery initially and on interval
    checkBatteryLevel();
    const batteryInterval = setInterval(checkBatteryLevel, 60000); // every minute

    return () => clearInterval(batteryInterval);
  }, []);

  // Get optimized watcher options based on current state
  const getOptimizedWatcherOptions = useCallback(() => {
    // Start with base options
    const options = getBackgroundWatcherOptions();

    // Adjust distance filter based on battery, movement and power mode
    let adjustedDistanceFilter = distanceFilter;

    // Increase filter when battery is low or device is stationary
    if (isLowBattery) {
      adjustedDistanceFilter = Math.max(50, distanceFilter * 2);
    } else if (!isMoving) {
      adjustedDistanceFilter = Math.max(30, distanceFilter * 1.5);
    }

    // Always use higher distance filter in low power mode
    if (lowPowerMode) {
      adjustedDistanceFilter = Math.max(100, distanceFilter * 3);
    }

    // Configure iOS-specific options
    if (Capacitor.getPlatform() === 'ios') {
      options.ios = {
        // Use significant changes only when battery is low or in low power mode
        significantChangesOnly: isLowBattery || lowPowerMode,
        activityType: lowPowerMode ? 'other' : 'fitness',
        // Lower accuracy when battery is low
        desiredAccuracy: isLowBattery ? 'nearestTenMeters' : 'best',
        pauseLocationUpdatesAutomatically: true,
        distanceFilter: adjustedDistanceFilter
      };
    } 
    // Configure Android-specific options
    else if (Capacitor.getPlatform() === 'android') {
      options.android = {
        // Lower frequency when battery is low or in low power mode
        locationUpdateInterval: isLowBattery || lowPowerMode 
          ? trackingInterval * 3 
          : trackingInterval,
        distanceFilter: adjustedDistanceFilter,
        // Enable activity detection
        stationaryRadius: 25, // 25 meters considered stationary
        notificationIconColor: '#23cfc9',
        notification: {
          title: 'Location Tracking',
          text: isLowBattery 
            ? 'Running in battery saving mode' 
            : 'Tracking your location'
        }
      };
    }

    return options;
  }, [isLowBattery, isMoving, lowPowerMode, distanceFilter, trackingInterval]);

  // Start tracking with optimized settings
  const startTracking = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      console.warn("Background tracking is only supported on native platforms");
      return false;
    }

    try {
      // Use optimized options for tracking
      const options = getOptimizedWatcherOptions();

      const watcher = await BackgroundGeolocation.addWatcher(
        options,
        (position, err) => {
          if (err) {
            console.error('Location error:', err);
            return;
          }
          
          if (position) {
            // Extract movement information if available
            const isDeviceMoving = typeof position.is_moving !== 'undefined' 
              ? position.is_moving 
              : true;
              
            if (isMoving !== isDeviceMoving) {
              setIsMoving(isDeviceMoving);
            }
            
            const locationData: DeliveryLocation = {
              latitude: position.latitude,
              longitude: position.longitude,
              accuracy: position.accuracy,
              timestamp: Date.now(),
              speed: position.speed || 0,
              isMoving: isDeviceMoving
            };
            
            if (onLocationUpdate) {
              onLocationUpdate(locationData);
            }
          }
        }
      );
      
      if (typeof watcher === 'string') {
        setWatcherId(watcher);
      } else if (watcher && typeof watcher === 'object' && 'id' in watcher) {
        setWatcherId(watcher.id);
      } else {
        console.error('Unexpected return type from addWatcher:', watcher);
        return false;
      }
      
      setIsTracking(true);
      
      // Show toast with current optimization mode
      const statusMessage = isLowBattery 
        ? 'Started location tracking in battery saving mode' 
        : lowPowerMode 
          ? 'Started location tracking in low power mode'
          : 'Started location tracking';
          
      toast({
        title: "Location Tracking Active",
        description: statusMessage,
        variant: "default"
      });
      
      return true;
    } catch (err) {
      console.error('Error starting optimized location tracking', err);
      toast({
        title: "Location tracking failed",
        description: "Could not start tracking your location. Please check your settings.",
        variant: "destructive"
      });
      return false;
    }
  }, [getOptimizedWatcherOptions, isLowBattery, isMoving, lowPowerMode, onLocationUpdate]);

  // Stop tracking
  const stopTracking = useCallback(async () => {
    if (!watcherId) return true;

    try {
      await BackgroundGeolocation.removeWatcher({
        id: watcherId
      });
      setWatcherId(null);
      setIsTracking(false);
      return true;
    } catch (err) {
      console.error('Error stopping location tracking', err);
      return false;
    }
  }, [watcherId]);

  // Update tracking options when battery level or movement changes
  useEffect(() => {
    if (isTracking && watcherId) {
      // Restart tracking with updated options
      stopTracking().then(() => {
        startTracking();
      });
    }
  }, [isLowBattery, isMoving, lowPowerMode, stopTracking, startTracking, isTracking, watcherId]);

  return {
    isTracking,
    startTracking,
    stopTracking,
    batteryLevel,
    isLowBattery,
    isMoving
  };
}
