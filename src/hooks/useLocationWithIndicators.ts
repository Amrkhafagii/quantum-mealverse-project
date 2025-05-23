
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { getHighAccuracyLocation, isHighAccuracyLocation } from '@/utils/locationAccuracyManager';
import { AccuracyLevel } from '@/components/location/LocationAccuracyIndicator';

export function useLocationWithIndicators() {
  const { lastLocation, getCurrentLocation, isLoadingLocation } = useCurrentLocation();
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [mapCenter, setMapCenter] = useState<{latitude: number, longitude: number} | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<AccuracyLevel>('unknown');
  const [showAccuracyCircle, setShowAccuracyCircle] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  // Initialize location tracking
  useEffect(() => {
    // Try to get initial location
    checkAndGetLocation();
  }, []);

  // Update user location when lastLocation changes
  useEffect(() => {
    if (lastLocation && lastLocation.latitude && lastLocation.longitude) {
      setUserLocation({
        latitude: lastLocation.latitude,
        longitude: lastLocation.longitude
      });
      
      // If we don't have a map center yet, center on user
      if (!mapCenter) {
        setMapCenter({
          latitude: lastLocation.latitude,
          longitude: lastLocation.longitude
        });
      }
      
      // Set location accuracy level based on accuracy value
      updateAccuracyLevel(lastLocation.accuracy);
      
      // Permission must be granted if we got a location
      setPermissionGranted(true);
    }
  }, [lastLocation, mapCenter]);

  // Update accuracy level based on accuracy in meters
  const updateAccuracyLevel = (accuracyInMeters?: number) => {
    if (!accuracyInMeters) {
      setLocationAccuracy('unknown');
      return;
    }
    
    if (accuracyInMeters < 50) {
      setLocationAccuracy('high');
    } else if (accuracyInMeters < 200) {
      setLocationAccuracy('medium');
    } else {
      setLocationAccuracy('low');
    }
  };

  // Check permissions and get location
  const checkAndGetLocation = async () => {
    try {
      const location = await getCurrentLocation();
      if (location) {
        setPermissionGranted(true);
        updateAccuracyLevel(location.accuracy);
      } else {
        setPermissionGranted(false);
      }
    } catch (error) {
      console.error('Error checking location:', error);
      setPermissionGranted(false);
    }
  };

  // Handle centering on user location
  const handleCenterOnMe = async () => {
    setShowAccuracyCircle(true);
    
    if (userLocation) {
      // If we already have a location, center on it immediately
      setMapCenter({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      });
      
      // Then try to get a fresh location
      toast.loading('Updating your location...');
      try {
        const freshLocation = await getHighAccuracyLocation();
        if (freshLocation && isHighAccuracyLocation(freshLocation)) {
          setUserLocation({
            latitude: freshLocation.latitude,
            longitude: freshLocation.longitude
          });
          setMapCenter({
            latitude: freshLocation.latitude,
            longitude: freshLocation.longitude
          });
          
          // Update accuracy level
          updateAccuracyLevel(freshLocation.accuracy);
          toast.success('Location updated');
        } else {
          toast.warning('Could not get a high accuracy location');
        }
      } catch (error) {
        console.error('Error updating location:', error);
        toast.error('Failed to update location');
      }
    } else {
      // If we don't have a location yet, try to get one
      toast.loading('Getting your location...');
      try {
        const location = await getCurrentLocation();
        if (location) {
          setUserLocation({
            latitude: location.latitude,
            longitude: location.longitude
          });
          setMapCenter({
            latitude: location.latitude,
            longitude: location.longitude
          });
          updateAccuracyLevel(location.accuracy);
          toast.success('Location found');
        } else {
          toast.error('Could not get your location');
        }
      } catch (error) {
        console.error('Error getting location:', error);
        toast.error('Failed to get location');
      }
    }
  };

  // Request location permissions
  const requestLocationPermission = async () => {
    try {
      const location = await getCurrentLocation();
      if (location) {
        setPermissionGranted(true);
        setUserLocation({
          latitude: location.latitude,
          longitude: location.longitude
        });
        setMapCenter({
          latitude: location.latitude,
          longitude: location.longitude
        });
        updateAccuracyLevel(location.accuracy);
        return true;
      } else {
        setPermissionGranted(false);
        return false;
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setPermissionGranted(false);
      return false;
    }
  };

  return {
    userLocation,
    mapCenter, 
    setMapCenter,
    isLoadingLocation,
    locationAccuracy,
    showAccuracyCircle, 
    setShowAccuracyCircle,
    permissionGranted,
    handleCenterOnMe,
    requestLocationPermission
  };
}
