
import { useState, useEffect, useCallback } from 'react';
import { useLocationService } from '@/contexts/LocationServiceContext';
import { DeliveryLocation } from '@/types/location';
import { calculateTrackingMode, TrackingMode, TrackingModeResult } from '@/utils/trackingModeCalculator';

// The return type of this hook
interface DeliveryLocationServiceResult {
  isTracking: boolean;
  trackingMode: TrackingMode;
  trackingInterval: number;
  lastLocation: DeliveryLocation | null;
  locationHistory: DeliveryLocation[];
  startTracking: () => Promise<boolean>;
  stopTracking: () => Promise<void>;
  refreshLocation: () => Promise<DeliveryLocation | null>;
  hasLocationPermission: boolean;
  locationPermissionStatus?: 'granted' | 'denied' | 'prompt';
  requestLocationPermission: () => Promise<boolean>;
  lastRefreshTime: number;
  // Add missing fields that were causing errors
  permissionStatus: 'granted' | 'denied' | 'prompt';
  updateLocation: () => Promise<DeliveryLocation | null>;
}

export function useDeliveryLocationService(options: {
  autoStart?: boolean;
  trackingInterval?: number;
} = {}): DeliveryLocationServiceResult {
  const { 
    autoStart = false, 
    trackingInterval: userTrackingInterval 
  } = options;
  
  const locationService = useLocationService();
  
  // State management
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  const [locationHistory, setLocationHistory] = useState<DeliveryLocation[]>([]);
  const [trackingMode, setTrackingMode] = useState<TrackingMode>('medium');
  const [trackingInterval, setTrackingInterval] = useState(userTrackingInterval || 30000);
  
  // References to the location service values for convenience
  const isTracking = locationService.isTrackingLocation;
  const lastLocation = locationService.currentLocation;
  const permissionStatus = locationService.locationPermissionStatus || 'prompt';
  
  // Function to update tracking mode based on current conditions
  const updateTrackingMode = useCallback(() => {
    const result: TrackingModeResult = calculateTrackingMode({
      batteryLevel: 100, // Default values
      networkQuality: 'high',
      locationAccuracy: 100,
      isMoving: false
    });
    
    setTrackingMode(result.trackingMode);
    
    // If we have an interval from the result, use it
    if (result.interval) {
      setTrackingInterval(result.interval);
    }
    
    // If the location service supports updating tracking options, do that
    if (locationService.startTracking) {
      // This is handled in startTracking method
    }
  }, [locationService]);
  
  // Request permission for location
  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    return await locationService.requestPermission();
  }, [locationService]);
  
  // Start tracking
  const startTracking = useCallback(async (): Promise<boolean> => {
    try {
      updateTrackingMode();
      return await locationService.startTracking();
    } catch (error) {
      console.error('Error starting location tracking:', error);
      return false;
    }
  }, [locationService, updateTrackingMode]);
  
  // Stop tracking
  const stopTracking = useCallback(async (): Promise<void> => {
    try {
      await locationService.stopTracking();
    } catch (error) {
      console.error('Error stopping location tracking:', error);
    }
  }, [locationService]);
  
  // Get current location
  const refreshLocation = useCallback(async (): Promise<DeliveryLocation | null> => {
    try {
      // Use refreshLocation method if available
      const location = await locationService.refreshLocation();
      if (location) {
        setLastRefreshTime(Date.now());
        // Add the location to history
        setLocationHistory(prev => {
          // Only add if it's different from the last one
          const lastOne = prev[prev.length - 1];
          if (!lastOne || 
              lastOne.latitude !== location.latitude || 
              lastOne.longitude !== location.longitude) {
            return [...prev.slice(-9), location]; // Keep last 10 locations
          }
          return prev;
        });
      }
      return location;
    } catch (error) {
      console.error('Error refreshing location:', error);
      return null;
    }
  }, [locationService]);

  // Alias for refreshLocation to match expected API
  const updateLocation = refreshLocation;

  // Auto-start tracking if configured
  useEffect(() => {
    if (autoStart && permissionStatus === 'granted' && !isTracking) {
      startTracking().catch(console.error);
    }

    // Clean up on unmount
    return () => {
      // Clear location cache if available
      if (locationService.clearCache) {
        locationService.clearCache();
      }
    };
  }, [autoStart, permissionStatus, isTracking, startTracking, locationService]);
  
  return {
    isTracking,
    trackingMode,
    trackingInterval,
    lastLocation,
    locationHistory,
    startTracking,
    stopTracking,
    refreshLocation,
    hasLocationPermission: permissionStatus === 'granted',
    locationPermissionStatus: permissionStatus,
    requestLocationPermission,
    lastRefreshTime,
    // Add the required properties
    permissionStatus, 
    updateLocation
  };
}
