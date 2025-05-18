
import { useState, useEffect, useCallback } from 'react';
import { Platform } from '@/utils/platform';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useNetworkQuality } from '@/hooks/useNetworkQuality';
import { useBatteryStatus } from '@/hooks/useBatteryStatus';
import { DeliveryLocation } from '@/types/location';
import { useBackgroundLocationTracking } from '@/hooks/useBackgroundLocationTracking';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';

interface OptimizedLocationTrackingProps {
  onLocationUpdate?: (location: DeliveryLocation) => void;
  lowPowerMode?: boolean;
  distanceFilter?: number;
  trackingInterval?: number;
}

export function useOptimizedLocationTracking({
  onLocationUpdate,
  lowPowerMode: forceLowPowerMode,
  distanceFilter = 10, // meters
  trackingInterval = 30000, // 30 seconds
}: OptimizedLocationTrackingProps = {}) {
  // Get current location from Capacitor plugin
  const { getCurrentLocation, isLoadingLocation } = useCurrentLocation();
  
  // Use the background tracking hook on native
  const {
    isBackgroundTracking,
    startBackgroundTracking,
    stopBackgroundTracking
  } = useBackgroundLocationTracking({
    onLocationUpdate
  });
  
  // Track motion state to optimize tracking
  const [isMoving, setIsMoving] = useState(false);
  const [lastLocation, setLastLocation] = useState<DeliveryLocation | null>(null);
  const [locationUpdateCount, setLocationUpdateCount] = useState(0);
  
  // State for tracking state
  const [isTracking, setIsTracking] = useState(false);
  const [trackingIntervalId, setTrackingIntervalId] = useState<number | null>(null);
  const [isLowBattery, setIsLowBattery] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  
  // Get network and battery status
  const { isOnline } = useConnectionStatus();
  const { isLowQuality } = useNetworkQuality();
  const { level, isLowBattery: deviceIsLowBattery } = useBatteryStatus();
  
  // Determine if we should use low power mode
  const lowPowerMode = forceLowPowerMode || 
    deviceIsLowBattery || 
    !isMoving || 
    isLowQuality;
  
  // Update battery status
  useEffect(() => {
    if (level !== null) {
      setBatteryLevel(level);
      setIsLowBattery(deviceIsLowBattery);
    }
  }, [level, deviceIsLowBattery]);
  
  // Function to determine if the user is moving
  const detectMotion = useCallback((newLocation: DeliveryLocation) => {
    if (!lastLocation) {
      setLastLocation(newLocation);
      return;
    }
    
    // Calculate distance between last location and new location
    const distance = calculateDistance(
      lastLocation.latitude,
      lastLocation.longitude,
      newLocation.latitude,
      newLocation.longitude
    );
    
    // If the distance is greater than the threshold, the user is moving
    const wasMoving = isMoving;
    const nowMoving = distance > distanceFilter;
    
    if (wasMoving !== nowMoving) {
      setIsMoving(nowMoving);
      
      // If the user has started moving, increase update frequency
      if (nowMoving && isTracking) {
        restartTracking();
      }
      // If the user has stopped moving, decrease update frequency
      else if (!nowMoving && isTracking) {
        restartTracking();
      }
    }
    
    setLastLocation(newLocation);
  }, [lastLocation, isMoving, distanceFilter, isTracking]);
  
  // Helper function to calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c; // Distance in meters
  };
  
  // Get current location and update state
  const updateLocation = useCallback(async () => {
    try {
      const location = await getCurrentLocation();
      
      if (location) {
        setLocationUpdateCount(prev => prev + 1);
        
        // Check if the user is moving
        detectMotion(location);
        
        // Call the onLocationUpdate callback
        if (onLocationUpdate) {
          onLocationUpdate({
            ...location,
            isMoving
          });
        }
      }
    } catch (error) {
      console.error('Error updating location:', error);
    }
  }, [getCurrentLocation, detectMotion, onLocationUpdate, isMoving]);
  
  // Start tracking location
  const startTracking = useCallback(async (): Promise<boolean> => {
    try {
      // If we're already tracking, no need to start again
      if (isTracking) return true;
      
      // Use background tracking on native platforms
      if (Platform.isNative()) {
        const success = await startBackgroundTracking();
        setIsTracking(success);
        return success;
      }
      
      // On web, use a simple interval
      await updateLocation();
      
      // Base interval on battery status and if the user is moving
      const interval = lowPowerMode ? trackingInterval * 2 : trackingInterval;
      
      const id = window.setInterval(() => {
        updateLocation();
      }, interval);
      
      setTrackingIntervalId(id as unknown as number);
      setIsTracking(true);
      
      return true;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      return false;
    }
  }, [
    isTracking, 
    updateLocation, 
    lowPowerMode, 
    trackingInterval, 
    startBackgroundTracking
  ]);
  
  // Stop tracking location
  const stopTracking = useCallback(async (): Promise<boolean> => {
    try {
      // If we're already not tracking, no need to stop
      if (!isTracking) return true;
      
      // Stop background tracking on native platforms
      if (Platform.isNative()) {
        const success = await stopBackgroundTracking();
        setIsTracking(!success);
        return success;
      }
      
      // Clear the interval on web
      if (trackingIntervalId) {
        clearInterval(trackingIntervalId);
        setTrackingIntervalId(null);
      }
      
      setIsTracking(false);
      return true;
    } catch (error) {
      console.error('Error stopping location tracking:', error);
      return false;
    }
  }, [isTracking, trackingIntervalId, stopBackgroundTracking]);
  
  // Restart tracking with new interval
  const restartTracking = useCallback(async (): Promise<boolean> => {
    await stopTracking();
    return await startTracking();
  }, [stopTracking, startTracking]);
  
  // Stop tracking when component unmounts
  useEffect(() => {
    return () => {
      if (trackingIntervalId) {
        clearInterval(trackingIntervalId);
      }
      
      if (Platform.isNative() && isBackgroundTracking) {
        stopBackgroundTracking();
      }
    };
  }, [trackingIntervalId, isBackgroundTracking, stopBackgroundTracking]);
  
  return {
    isTracking: isTracking || isBackgroundTracking,
    startTracking,
    stopTracking,
    restartTracking,
    lastLocation,
    isMoving,
    updateLocation,
    isLoading: isLoadingLocation,
    locationUpdateCount,
    isLowBattery,
    batteryLevel
  };
}

export default useOptimizedLocationTracking;
