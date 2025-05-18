
import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { BackgroundGeolocation, getBackgroundWatcherOptions } from '@/utils/backgroundGeolocation';
import { BatteryOptimization } from '@/utils/batteryOptimization';
import { AndroidLocationOptimizer } from '@/utils/androidLocationOptimizer';
import { DeliveryLocation } from '@/types/location';
import { toast } from '@/components/ui/use-toast';

interface AdaptiveTrackingOptions {
  onLocationUpdate?: (location: DeliveryLocation) => void;
  distanceToDestination?: number;
  initialInterval?: number;
  enableMotionDetection?: boolean;
  enableAdaptiveSampling?: boolean;
  batteryAware?: boolean;
}

export function useAdaptiveLocationTracking({
  onLocationUpdate,
  distanceToDestination,
  initialInterval = 30000,
  enableMotionDetection = true,
  enableAdaptiveSampling = true,
  batteryAware = true,
}: AdaptiveTrackingOptions = {}) {
  const [isTracking, setIsTracking] = useState(false);
  const [watcherId, setWatcherId] = useState<string | null>(null);
  const [currentInterval, setCurrentInterval] = useState(initialInterval);
  const [isMoving, setIsMoving] = useState(true);
  const [speed, setSpeed] = useState(0);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isLowPowerMode, setIsLowPowerMode] = useState(false);
  const [lastLocationTimestamp, setLastLocationTimestamp] = useState<number | null>(null);

  // Monitor battery status
  useEffect(() => {
    if (!batteryAware) return;
    
    const checkBattery = async () => {
      const level = await BatteryOptimization.getBatteryLevel();
      const lowPower = await BatteryOptimization.isLowPowerModeEnabled();
      
      setBatteryLevel(level);
      setIsLowPowerMode(lowPower);
    };
    
    // Check immediately and then periodically
    checkBattery();
    const interval = setInterval(checkBattery, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [batteryAware]);

  // Update tracking parameters when relevant factors change
  useEffect(() => {
    if (!isTracking || !enableAdaptiveSampling) return;
    
    const updateTrackingParameters = async () => {
      // Only update if we have a watcher ID
      if (watcherId) {
        await stopTracking();
        await startTracking();
      }
    };
    
    // Don't call too frequently - only when important factors change
    updateTrackingParameters();
  }, [distanceToDestination, isMoving, isLowPowerMode, enableAdaptiveSampling]);

  // Start tracking with adaptive parameters
  const startTracking = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      console.warn("Adaptive tracking is only supported on native platforms");
      return false;
    }

    try {
      // Get base options
      const baseOptions = getBackgroundWatcherOptions();
      
      // Apply battery optimizations
      let optimizedOptions = { ...baseOptions };
      
      if (enableAdaptiveSampling) {
        // Calculate optimal interval and settings based on battery, motion, etc.
        const interval = await BatteryOptimization.getOptimalUpdateInterval(
          initialInterval,
          isMoving,
          distanceToDestination
        );
        
        setCurrentInterval(interval);
        
        // If on Android, apply platform-specific optimizations
        if (Capacitor.getPlatform().toLowerCase().includes('android')) {
          const androidOptions = await AndroidLocationOptimizer.getLocationRequestOptions({
            isMoving,
            distanceToDestination,
            speedKmh: speed,
            baseInterval: initialInterval
          });
          
          if (androidOptions) {
            optimizedOptions = { 
              ...optimizedOptions,
              ...androidOptions
            };
          }
        }
      }
      
      // Start location tracking with optimized options
      const watcher = await BackgroundGeolocation.addWatcher(
        optimizedOptions,
        (position, err) => {
          if (err) {
            console.error('Location error:', err);
            return;
          }
          
          if (position) {
            // Extract movement data if available
            if (enableMotionDetection) {
              const newIsMoving = typeof position.is_moving !== 'undefined' 
                ? position.is_moving 
                : position.speed > 0;
                
              setIsMoving(newIsMoving);
              setSpeed(position.speed || 0);
            }
            
            const locationData: DeliveryLocation = {
              latitude: position.latitude,
              longitude: position.longitude,
              accuracy: position.accuracy,
              timestamp: Date.now(),
              speed: position.speed || 0,
              isMoving: isMoving
            };
            
            setLastLocationTimestamp(Date.now());
            
            if (onLocationUpdate) {
              onLocationUpdate(locationData);
            }
          }
        }
      );
      
      // Handle the different possible return types from the plugin
      if (typeof watcher === 'string') {
        setWatcherId(watcher);
      } else if (watcher && typeof watcher === 'object' && 'id' in watcher) {
        setWatcherId(watcher.id);
      } else {
        console.error('Unexpected return type from addWatcher:', watcher);
        return false;
      }
      
      setIsTracking(true);
      
      // Show toast about tracking mode
      const isLowBattery = await BatteryOptimization.isLowBatteryState();
      const statusMessage = isLowBattery 
        ? 'Started location tracking in battery saving mode' 
        : isLowPowerMode 
          ? 'Started location tracking in power-efficient mode'
          : 'Started location tracking';
          
      toast({
        title: "Location Tracking Active",
        description: statusMessage,
      });
      
      return true;
    } catch (err) {
      console.error('Error starting adaptive location tracking', err);
      toast({
        title: "Location tracking failed",
        description: "Could not start tracking your location. Please check your settings.",
        variant: "destructive"
      });
      return false;
    }
  }, [
    initialInterval,
    onLocationUpdate,
    isMoving,
    speed,
    distanceToDestination,
    enableMotionDetection,
    enableAdaptiveSampling,
    isLowPowerMode
  ]);

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

  // Force an immediate location update
  const forceLocationUpdate = useCallback(async () => {
    // If already tracking, just restart to get a fresh position
    if (isTracking) {
      await stopTracking();
    }
    return await startTracking();
  }, [isTracking, stopTracking, startTracking]);

  return {
    isTracking,
    startTracking,
    stopTracking,
    forceLocationUpdate,
    currentInterval,
    isMoving,
    speed,
    batteryLevel,
    isLowPowerMode,
    lastLocationTimestamp
  };
}
