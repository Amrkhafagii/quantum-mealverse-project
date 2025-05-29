
import { useState, useEffect, useCallback } from 'react';
import { realTimeLocationService } from '@/services/location/realTimeLocationService';
import { locationSharingService } from '@/services/location/locationSharingService';
import { DeliveryLocationTracking, LocationUpdate, ETACalculation } from '@/types/location-sharing';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface UseRealTimeLocationSharingOptions {
  deliveryAssignmentId?: string;
  orderId?: string;
  enableAutoTracking?: boolean;
  trackingInterval?: number; // in milliseconds
}

export function useRealTimeLocationSharing({
  deliveryAssignmentId,
  orderId,
  enableAutoTracking = true,
  trackingInterval = 10000 // 10 seconds default
}: UseRealTimeLocationSharingOptions = {}) {
  const { user } = useAuth();
  const [latestLocation, setLatestLocation] = useState<DeliveryLocationTracking | null>(null);
  const [locationHistory, setLocationHistory] = useState<DeliveryLocationTracking[]>([]);
  const [currentETA, setCurrentETA] = useState<ETACalculation | null>(null);
  const [isLocationSharingEnabled, setIsLocationSharingEnabled] = useState<boolean>(false);
  const [privacyLevel, setPrivacyLevel] = useState<'precise' | 'approximate' | 'disabled'>('disabled');
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check location sharing permission status
  const checkLocationSharingStatus = useCallback(async () => {
    if (!deliveryAssignmentId || !user?.id) return;

    try {
      const enabled = await locationSharingService.isLocationSharingEnabled(
        deliveryAssignmentId,
        user.id
      );
      setIsLocationSharingEnabled(enabled);

      const privacy = await locationSharingService.getPrivacyLevel(
        deliveryAssignmentId,
        user.id
      );
      setPrivacyLevel(privacy);
    } catch (err) {
      console.error('Error checking location sharing status:', err);
      setError(err instanceof Error ? err.message : 'Failed to check location sharing status');
    }
  }, [deliveryAssignmentId, user?.id]);

  // Update driver location (for delivery users)
  const updateLocation = useCallback(async (location: LocationUpdate, deliveryUserId: string) => {
    if (!deliveryAssignmentId) return null;

    try {
      setError(null);
      const result = await realTimeLocationService.updateDriverLocation(
        deliveryAssignmentId,
        deliveryUserId,
        location
      );

      if (result?.eta) {
        setCurrentETA(result.eta);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update location';
      setError(errorMessage);
      toast({
        title: "Location Update Failed",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    }
  }, [deliveryAssignmentId]);

  // Get current location from browser/device
  const getCurrentLocation = useCallback((): Promise<LocationUpdate> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this device'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: LocationUpdate = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined
          };

          // Get battery level if available
          if ('getBattery' in navigator) {
            (navigator as any).getBattery().then((battery: any) => {
              location.battery_level = Math.round(battery.level * 100);
            });
          }

          // Get network information if available
          if ('connection' in navigator) {
            location.network_type = (navigator as any).connection?.effectiveType || 'unknown';
          }

          resolve(location);
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 5000
        }
      );
    });
  }, []);

  // Start automatic location tracking for delivery users
  const startLocationTracking = useCallback(async (deliveryUserId: string) => {
    if (!deliveryAssignmentId || isTracking) return;

    setIsTracking(true);
    setError(null);

    const trackLocation = async () => {
      try {
        const location = await getCurrentLocation();
        await updateLocation(location, deliveryUserId);
      } catch (err) {
        console.error('Error in automatic location tracking:', err);
        setError(err instanceof Error ? err.message : 'Location tracking failed');
      }
    };

    // Initial location update
    await trackLocation();

    // Set up interval for continuous tracking
    const intervalId = setInterval(trackLocation, trackingInterval);

    return () => {
      clearInterval(intervalId);
      setIsTracking(false);
    };
  }, [deliveryAssignmentId, isTracking, getCurrentLocation, updateLocation, trackingInterval]);

  // Stop location tracking
  const stopLocationTracking = useCallback(() => {
    setIsTracking(false);
  }, []);

  // Get location history
  const refreshLocationHistory = useCallback(async () => {
    if (!deliveryAssignmentId) return;

    try {
      const history = await realTimeLocationService.getLocationHistory(deliveryAssignmentId);
      setLocationHistory(history);
    } catch (err) {
      console.error('Error refreshing location history:', err);
    }
  }, [deliveryAssignmentId]);

  // Update location sharing settings
  const updateLocationSharingSettings = useCallback(async (settings: {
    is_location_sharing_enabled?: boolean;
    privacy_level?: 'precise' | 'approximate' | 'disabled';
  }) => {
    if (!deliveryAssignmentId || !user?.id) return false;

    try {
      const result = await locationSharingService.updateLocationSharingSettings(
        deliveryAssignmentId,
        user.id,
        settings
      );

      if (result) {
        setIsLocationSharingEnabled(result.is_location_sharing_enabled);
        setPrivacyLevel(result.privacy_level);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating location sharing settings:', err);
      return false;
    }
  }, [deliveryAssignmentId, user?.id]);

  // Subscribe to real-time location updates
  useEffect(() => {
    if (!deliveryAssignmentId || !enableAutoTracking) return;

    const unsubscribe = realTimeLocationService.subscribeToLocationUpdates(
      deliveryAssignmentId,
      (location) => {
        setLatestLocation(location);
        setLocationHistory(prev => [location, ...prev.slice(0, 49)]); // Keep last 50 locations
      },
      (error) => {
        setError(error.message);
      }
    );

    return unsubscribe;
  }, [deliveryAssignmentId, enableAutoTracking]);

  // Check location sharing status on mount
  useEffect(() => {
    checkLocationSharingStatus();
  }, [checkLocationSharingStatus]);

  // Get initial location data
  useEffect(() => {
    if (!deliveryAssignmentId) return;

    const loadInitialData = async () => {
      try {
        const location = await realTimeLocationService.getLatestDriverLocation(deliveryAssignmentId);
        if (location) {
          setLatestLocation(location);
        }

        await refreshLocationHistory();
      } catch (err) {
        console.error('Error loading initial location data:', err);
      }
    };

    loadInitialData();
  }, [deliveryAssignmentId, refreshLocationHistory]);

  return {
    // State
    latestLocation,
    locationHistory,
    currentETA,
    isLocationSharingEnabled,
    privacyLevel,
    isTracking,
    error,

    // Actions
    updateLocation,
    getCurrentLocation,
    startLocationTracking,
    stopLocationTracking,
    refreshLocationHistory,
    updateLocationSharingSettings,
    checkLocationSharingStatus
  };
}
