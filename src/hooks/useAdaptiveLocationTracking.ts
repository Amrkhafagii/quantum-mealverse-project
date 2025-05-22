
import { useState, useEffect, useCallback } from 'react';
import { BatteryOptimization } from '@/utils/batteryOptimization';
import { DeliveryLocation } from '@/types/location';
import { Platform } from '@/utils/platform';

export type LocationPermissionState = 'granted' | 'denied' | 'prompt';

export interface AdaptiveLocationOptions {
  onLocationUpdate?: (location: DeliveryLocation) => void;
  enableMotionDetection?: boolean;
  enableAdaptiveSampling?: boolean;
  batteryAware?: boolean;
  initialInterval?: number;
  distanceToDestination?: number;
}

interface LocationSettings {
  interval: number;
  distanceFilter: number;
  priority: 'high' | 'balanced' | 'low' | 'passive';
}

export const useAdaptiveLocationTracking = (options: AdaptiveLocationOptions = {}) => {
  const {
    onLocationUpdate,
    enableMotionDetection = true,
    enableAdaptiveSampling = true,
    batteryAware = true,
    initialInterval = 30000,
    distanceToDestination
  } = options;

  const [isTracking, setIsTracking] = useState(false);
  const [isBackgroundTracking, setIsBackgroundTracking] = useState(false);
  const [currentInterval, setCurrentInterval] = useState(initialInterval);
  const [isMoving, setIsMoving] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isLowPowerMode, setIsLowPowerMode] = useState(false);
  const [lastLocationTimestamp, setLastLocationTimestamp] = useState<number | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<LocationPermissionState>('prompt');
  const [backgroundPermissionStatus, setBackgroundPermissionStatus] = useState<LocationPermissionState>('prompt');

  // Check battery status
  useEffect(() => {
    const checkBatteryStatus = async () => {
      if (batteryAware) {
        try {
          const level = await BatteryOptimization.getBatteryLevel();
          const lowPowerMode = await BatteryOptimization.isLowPowerModeEnabled();
          
          setBatteryLevel(level);
          setIsLowPowerMode(lowPowerMode);
        } catch (error) {
          console.error('Error checking battery status:', error);
        }
      }
    };
    
    checkBatteryStatus();
    
    // Set up periodic battery checks
    if (batteryAware) {
      const batteryCheckInterval = setInterval(checkBatteryStatus, 60000); // Every minute
      return () => clearInterval(batteryCheckInterval);
    }
  }, [batteryAware]);

  // Calculate optimal update interval based on conditions
  useEffect(() => {
    if (!enableAdaptiveSampling) return;
    
    const calculateInterval = async () => {
      try {
        // Base the interval on battery, movement, and distance to destination
        let baseInterval = initialInterval;
        
        if (batteryLevel !== null && batteryLevel < 20) {
          baseInterval *= 2; // Double interval on low battery
        }
        
        if (isLowPowerMode) {
          baseInterval *= 1.5; // 50% longer interval in low power mode
        }
        
        if (!isMoving) {
          baseInterval *= 3; // Much less frequent updates when stationary
        }
        
        // If close to destination, increase frequency
        if (distanceToDestination !== undefined && distanceToDestination < 500) {
          baseInterval = Math.min(baseInterval, 10000); // Max 10 seconds when close
        }
        
        setCurrentInterval(baseInterval);
      } catch (error) {
        console.error('Error calculating update interval:', error);
      }
    };
    
    calculateInterval();
  }, [batteryLevel, isLowPowerMode, isMoving, distanceToDestination, initialInterval, enableAdaptiveSampling]);

  // Start tracking location
  const startTracking = useCallback(async () => {
    if (isTracking) return;
    
    try {
      // Check permissions before starting
      // In a real implementation, this would use geolocation APIs
      setPermissionStatus('granted');
      setBackgroundPermissionStatus('granted');
      
      setIsTracking(true);
      
      // Simulate location updates
      const mockUpdate = () => {
        const now = Date.now();
        setLastLocationTimestamp(now);
        
        // Generate mock movement data
        const randomMovement = Math.random() > 0.3;
        setIsMoving(randomMovement);
        setSpeed(randomMovement ? Math.random() * 30 : 0);
        
        // Generate mock location data
        if (onLocationUpdate) {
          const location: DeliveryLocation = {
            latitude: 30.266666 + (Math.random() - 0.5) * 0.01,
            longitude: -97.733330 + (Math.random() - 0.5) * 0.01,
            accuracy: Math.random() * 10 + 5,
            speed: speed,
            isMoving: isMoving,
            timestamp: now,
            source: 'gps'
          };
          
          onLocationUpdate(location);
        }
      };
      
      // Initial update
      mockUpdate();
      
      // Set up interval for updates
      const intervalId = setInterval(mockUpdate, currentInterval);
      
      return () => {
        clearInterval(intervalId);
        setIsTracking(false);
      };
    } catch (error) {
      console.error('Error starting location tracking:', error);
      setIsTracking(false);
    }
  }, [isTracking, onLocationUpdate, currentInterval, speed, isMoving]);

  // Stop tracking location
  const stopTracking = useCallback(() => {
    setIsTracking(false);
  }, []);

  // Force an immediate location update
  const forceLocationUpdate = useCallback(async () => {
    if (!isTracking) return false;
    
    try {
      const now = Date.now();
      setLastLocationTimestamp(now);
      
      // Generate mock location data for force update
      if (onLocationUpdate) {
        const location: DeliveryLocation = {
          latitude: 30.266666 + (Math.random() - 0.5) * 0.01,
          longitude: -97.733330 + (Math.random() - 0.5) * 0.01,
          accuracy: Math.random() * 5 + 3, // More accurate when manually requested
          speed: speed,
          isMoving: isMoving,
          timestamp: now,
          source: 'gps'
        };
        
        onLocationUpdate(location);
      }
      
      return true;
    } catch (error) {
      console.error('Error forcing location update:', error);
      return false;
    }
  }, [isTracking, onLocationUpdate, speed, isMoving]);

  return {
    isTracking,
    isBackgroundTracking,
    startTracking,
    stopTracking,
    forceLocationUpdate,
    currentInterval,
    isMoving,
    speed,
    batteryLevel,
    isLowPowerMode,
    lastLocationTimestamp,
    permissionStatus,
    backgroundPermissionStatus
  };
};
