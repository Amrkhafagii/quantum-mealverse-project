
import { useState, useEffect, useCallback } from 'react';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import { useLocationTracker } from '@/hooks/useLocationTracker';
import { toast } from 'sonner';

// Define a more comprehensive location type that includes accuracy
interface LocationWithAccuracy {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

interface DeliveryLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
}

export interface LocationServiceState {
  permissionStatus: PermissionState;
  location: DeliveryLocation | null;
  isStale: boolean;
  isTracking: boolean;
  lastUpdated: Date | null;
  error: Error | null;
  freshness: 'fresh' | 'moderate' | 'stale' | 'invalid';
}

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
    lastUpdated,
    startTracking,
    stopTracking
  } = useLocationTracker({
    watchPosition: true,
    trackingInterval: 30000, // 30 seconds for delivery personnel
    showToasts: false // We'll handle our own toasts
  });
  
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
    try {
      const cachedLocationString = localStorage.getItem('deliveryLocation');
      if (cachedLocationString) {
        const cachedLocation = JSON.parse(cachedLocationString);
        if (cachedLocation?.latitude && cachedLocation?.longitude) {
          const now = Date.now();
          const ageInMinutes = (now - (cachedLocation.timestamp || 0)) / (1000 * 60);
          
          // Set freshness based on age
          let freshness: 'fresh' | 'moderate' | 'stale' | 'invalid' = 'invalid';
          if (ageInMinutes < 2) freshness = 'fresh';
          else if (ageInMinutes < 5) freshness = 'moderate';
          else if (ageInMinutes < 15) freshness = 'stale';
          
          setLocationState(prev => ({
            ...prev,
            location: cachedLocation,
            lastUpdated: cachedLocation.timestamp ? new Date(cachedLocation.timestamp) : null,
            isStale: ageInMinutes > 2, // Stale after 2 minutes for delivery
            freshness
          }));
        }
      }
    } catch (error) {
      console.error('Error reading cached delivery location:', error);
    }
  }, []);

  // Sync from location tracker when it updates
  useEffect(() => {
    if (trackerLocation && locationIsValid()) {
      const deliveryLocation: DeliveryLocation = {
        latitude: trackerLocation.latitude,
        longitude: trackerLocation.longitude,
        timestamp: lastUpdated?.getTime() || Date.now(),
        // Safely access accuracy - might be undefined for some browsers
        ...(trackerLocation.accuracy !== undefined && { accuracy: trackerLocation.accuracy })
      };
      
      // Update local state
      setLocationState(prev => ({
        ...prev,
        location: deliveryLocation,
        lastUpdated: lastUpdated || new Date(),
        isStale: false,
        freshness: 'fresh',
        error: null
      }));
      
      // Cache for future use
      try {
        localStorage.setItem('deliveryLocation', JSON.stringify(deliveryLocation));
      } catch (error) {
        console.error('Error caching delivery location:', error);
      }
    }
  }, [trackerLocation, lastUpdated, locationIsValid]);

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

  // Calculate freshness based on age whenever checking state
  useEffect(() => {
    const checkFreshness = () => {
      if (!locationState.location?.timestamp) return;
      
      const now = Date.now();
      const ageInMinutes = (now - locationState.location.timestamp) / (1000 * 60);
      
      let freshness: 'fresh' | 'moderate' | 'stale' | 'invalid' = 'invalid';
      if (ageInMinutes < 2) freshness = 'fresh';
      else if (ageInMinutes < 5) freshness = 'moderate';
      else if (ageInMinutes < 15) freshness = 'stale';
      
      setLocationState(prev => ({
        ...prev,
        isStale: ageInMinutes > 2,
        freshness
      }));
    };
    
    // Check immediately and then every minute
    checkFreshness();
    const interval = setInterval(checkFreshness, 60000);
    return () => clearInterval(interval);
  }, [locationState.location?.timestamp]);

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
        // Safely access accuracy - might be undefined for some browsers
        ...(location.accuracy !== undefined && { accuracy: location.accuracy })
      };
      
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
      try {
        localStorage.setItem('deliveryLocation', JSON.stringify(deliveryLocation));
      } catch (error) {
        console.error('Error caching delivery location:', error);
      }
      
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
