import { useState, useEffect, useCallback } from 'react';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import { useLocationTracker } from '@/hooks/useLocationTracker';
import { useDeliveryLocationCache } from '@/hooks/useDeliveryLocationCache';
import { toast } from 'sonner';
import { LocationWithAccuracy, DeliveryLocation, LocationServiceState } from '@/types/location';
import { cacheDeliveryLocation } from '@/utils/locationUtils';

/**
 * A specialized hook for delivery personnel location tracking
 * that combines useLocationPermission and useLocationTracker
 * to provide a unified interface for location services.
 */
export function useDeliveryLocationService() {
  // Use both hooks to ensure we have access to all functionality
  const {
    permissionStatus,
    isTracking,
    requestPermission,
    resetLocationState
  } = useLocationPermission();
  
  const {
    getCurrentLocation,
    location: trackerLocation,
    locationIsValid,
    isLocationStale,
    error: trackerError,
    lastUpdated: trackerLastUpdated,
    startTracking,
    stopTracking
  } = useLocationTracker({
    watchPosition: true,
    trackingInterval: 30000, // 30 seconds for delivery personnel
    showToasts: false // We'll handle our own toasts
  });
  
  const { 
    cachedLocation, 
    cachedLocationFreshness, 
    isStale: cachedIsStale, 
    lastUpdated: cachedLastUpdated 
  } = useDeliveryLocationCache();
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [recoveryAttempted, setRecoveryAttempted] = useState(false);
  
  const [locationState, setLocationState] = useState<LocationServiceState>({
    permissionStatus: 'prompt',
    location: null,
    isStale: true,
    isTracking: false,
    lastUpdated: null,
    error: null,
    freshness: 'invalid'
  });

  // Initialize with cached location if available
  useEffect(() => {
    if (cachedLocation) {
      setLocationState(prev => ({
        ...prev,
        location: cachedLocation,
        lastUpdated: cachedLastUpdated,
        isStale: cachedIsStale,
        freshness: cachedLocationFreshness
      }));
    }
  }, [cachedLocation, cachedLastUpdated, cachedIsStale, cachedLocationFreshness]);

  // Sync from location tracker when it updates
  useEffect(() => {
    if (trackerLocation && locationIsValid()) {
      // Create delivery location object with timestamp
      const deliveryLocation: DeliveryLocation = {
        latitude: trackerLocation.latitude,
        longitude: trackerLocation.longitude,
        timestamp: trackerLastUpdated?.getTime() || Date.now(),
      };
      
      // Safely add accuracy if available (fixes TypeScript error)
      if ((trackerLocation as LocationWithAccuracy).accuracy !== undefined) {
        deliveryLocation.accuracy = (trackerLocation as LocationWithAccuracy).accuracy;
      }
      
      // Update local state
      setLocationState(prev => ({
        ...prev,
        location: deliveryLocation,
        lastUpdated: trackerLastUpdated || new Date(),
        isStale: false,
        freshness: 'fresh',
        error: null
      }));
      
      // Cache for future use
      cacheDeliveryLocation(deliveryLocation);
    }
  }, [trackerLocation, trackerLastUpdated, locationIsValid]);

  // Sync permission status
  useEffect(() => {
    setLocationState(prev => ({
      ...prev,
      permissionStatus,
      isTracking: permissionStatus === 'granted' && isTracking
    }));
  }, [permissionStatus, isTracking]);

  // Check for errors
  useEffect(() => {
    if (trackerError) {
      setLocationState(prev => ({
        ...prev,
        error: trackerError instanceof Error ? trackerError : new Error(String(trackerError))
      }));
    }
  }, [trackerError]);

  // Attempt auto-recovery when needed
  useEffect(() => {
    if (permissionStatus === 'granted' && isLocationStale() && !isUpdating && !recoveryAttempted) {
      console.log('Attempting automatic location recovery');
      setRecoveryAttempted(true);
      updateLocation().catch(error => {
        console.error('Auto-recovery failed:', error);
      });
    }
  }, [permissionStatus, isLocationStale, isUpdating, recoveryAttempted]);

  // Function to update location with improved error handling
  const updateLocation = useCallback(async (): Promise<DeliveryLocation | null> => {
    if (isUpdating) {
      return null;
    }
    
    setIsUpdating(true);
    setRecoveryAttempted(true);
    
    try {
      // First check if we need to request permission
      if (permissionStatus !== 'granted') {
        const permissionResult = await requestPermission();
        if (!permissionResult) {
          throw new Error('Location permission denied');
        }
      }
      
      // Get current location with timeout
      const locationPromise = getCurrentLocation();
      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error('Location request timed out')), 10000);
      });
      
      const location = await Promise.race([locationPromise, timeoutPromise]) as LocationWithAccuracy | null;
      
      if (!location) {
        throw new Error('Could not get location');
      }
      
      // Create delivery location object with timestamp
      const deliveryLocation: DeliveryLocation = {
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: Date.now(),
      };
      
      // Safely add accuracy if available (fixes TypeScript error)
      if (location.accuracy !== undefined) {
        deliveryLocation.accuracy = location.accuracy;
      }
      
      // Update state
      setLocationState(prev => ({
        ...prev,
        location: deliveryLocation,
        lastUpdated: new Date(),
        isStale: false,
        freshness: 'fresh',
        error: null
      }));
      
      // Cache location
      cacheDeliveryLocation(deliveryLocation);
      
      toast.success('Location updated', {
        description: 'Your current location has been updated successfully',
      });
      
      return deliveryLocation;
    } catch (error) {
      console.error('Error updating location:', error);
      
      // Handle specific error cases
      if (error instanceof Error) {
        setLocationState(prev => ({
          ...prev,
          error: error
        }));
        
        if (error.message.includes('denied') || error.name === 'NotAllowedError') {
          toast.error('Location access denied', {
            description: 'Please enable location in your browser settings',
          });
        } else if (error.message.includes('timeout')) {
          toast.error('Location request timed out', {
            description: 'Please try again or check your connection',
          });
        } else {
          toast.error('Location error', {
            description: 'Could not update your location. Please try again.',
          });
        }
      }
      
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, [getCurrentLocation, permissionStatus, requestPermission, isUpdating]);

  // Function to completely reset location state and start fresh
  const resetAndRequestLocation = useCallback(async () => {
    // Clear both local storage entries
    try {
      localStorage.removeItem('userLocation');
      localStorage.removeItem('deliveryLocation');
      localStorage.removeItem('locationPermission');
    } catch (e) {
      console.error('Error clearing location data:', e);
    }
    
    // Reset state in both hooks
    resetLocationState();
    
    // Wait a bit for state to reset
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Start tracking and request permissions again
    setRecoveryAttempted(false);
    startTracking();
    return updateLocation();
  }, [resetLocationState, startTracking, updateLocation]);

  return {
    ...locationState,
    updateLocation,
    resetAndRequestLocation,
    isUpdating,
    startTracking,
    stopTracking
  };
}
