
import React, { createContext, useContext, useEffect, useState } from 'react';
import { LocationServiceFactory, ILocationService, LocationTrackingOptions } from '@/services/location/LocationService';
import { DeliveryLocation } from '@/types/location';
import { LocationFreshness } from '@/types/unifiedLocation';
import { AccuracyLevel } from '@/components/location/LocationAccuracyIndicator';
import { getAccuracyLevelFromLocation } from '@/services/maps/MapService';

interface LocationServiceContextType {
  locationService: ILocationService | null;
  currentLocation: DeliveryLocation | null;
  locationPermissionStatus: 'granted' | 'denied' | 'prompt';
  locationFreshness: LocationFreshness;
  locationAccuracy: AccuracyLevel;
  isTrackingLocation: boolean;
  isLoading: boolean;
  error: Error | null;
  startTracking: (options?: LocationTrackingOptions) => Promise<boolean>;
  stopTracking: () => Promise<void>;
  requestPermission: () => Promise<boolean>;
  refreshLocation: () => Promise<DeliveryLocation | null>;
}

const LocationServiceContext = createContext<LocationServiceContextType>({
  locationService: null,
  currentLocation: null,
  locationPermissionStatus: 'prompt',
  locationFreshness: 'invalid',
  locationAccuracy: 'unknown',
  isTrackingLocation: false,
  isLoading: true,
  error: null,
  startTracking: async () => false,
  stopTracking: async () => {},
  requestPermission: async () => false,
  refreshLocation: async () => null,
});

export const LocationServiceProvider: React.FC<{
  children: React.ReactNode;
  enableTracking?: boolean;
  trackingOptions?: LocationTrackingOptions;
}> = ({ children, enableTracking = false, trackingOptions }) => {
  const [locationService, setLocationService] = useState<ILocationService | null>(null);
  const [currentLocation, setCurrentLocation] = useState<DeliveryLocation | null>(null);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [locationFreshness, setLocationFreshness] = useState<LocationFreshness>('invalid');
  const [locationAccuracy, setLocationAccuracy] = useState<AccuracyLevel>('unknown');
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Initialize location service
  useEffect(() => {
    const initLocationService = async () => {
      try {
        const service = await LocationServiceFactory.getLocationService();
        setLocationService(service);
        
        // Get permission status
        const status = await service.getPermissionStatus();
        setLocationPermissionStatus(status);
        
        // Get last known location
        const lastLocation = service.getLastKnownLocation();
        if (lastLocation) {
          setCurrentLocation(lastLocation);
          setLocationFreshness(service.getFreshness());
          setLocationAccuracy(getAccuracyLevelFromLocation(lastLocation));
        }
        
        // Start tracking if enabled and permission granted
        if (enableTracking && status === 'granted') {
          const started = await service.startTracking(trackingOptions);
          setIsTrackingLocation(started);
        }
        
        setIsLoading(false);
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
        console.error('Error initializing location service:', err);
      }
    };
    
    initLocationService();
    
    // Clean up on unmount
    return () => {
      if (locationService && isTrackingLocation) {
        locationService.stopTracking().catch(console.error);
      }
    };
  }, [enableTracking]);
  
  // Set up location listener
  useEffect(() => {
    if (!locationService) return;
    
    const handleLocationUpdate = (location: DeliveryLocation) => {
      setCurrentLocation(location);
      setLocationFreshness(locationService.getFreshness());
      setLocationAccuracy(getAccuracyLevelFromLocation(location));
    };
    
    const listenerId = locationService.addLocationListener(handleLocationUpdate);
    
    return () => {
      locationService.removeLocationListener(listenerId);
    };
  }, [locationService]);
  
  const startTracking = async (options?: LocationTrackingOptions): Promise<boolean> => {
    if (!locationService) return false;
    
    try {
      const started = await locationService.startTracking(options);
      setIsTrackingLocation(started);
      return started;
    } catch (err) {
      console.error('Error starting location tracking:', err);
      return false;
    }
  };
  
  const stopTracking = async (): Promise<void> => {
    if (!locationService) return;
    
    try {
      await locationService.stopTracking();
      setIsTrackingLocation(false);
    } catch (err) {
      console.error('Error stopping location tracking:', err);
    }
  };
  
  const requestPermission = async (): Promise<boolean> => {
    if (!locationService) return false;
    
    try {
      const status = await locationService.requestPermission();
      setLocationPermissionStatus(status);
      return status === 'granted';
    } catch (err) {
      console.error('Error requesting location permission:', err);
      return false;
    }
  };
  
  const refreshLocation = async (): Promise<DeliveryLocation | null> => {
    if (!locationService) return null;
    
    try {
      const location = await locationService.getCurrentLocation();
      if (location) {
        setCurrentLocation(location);
        setLocationFreshness(locationService.getFreshness());
        setLocationAccuracy(getAccuracyLevelFromLocation(location));
      }
      return location;
    } catch (err) {
      console.error('Error refreshing location:', err);
      return null;
    }
  };
  
  return (
    <LocationServiceContext.Provider
      value={{
        locationService,
        currentLocation,
        locationPermissionStatus,
        locationFreshness,
        locationAccuracy,
        isTrackingLocation,
        isLoading,
        error,
        startTracking,
        stopTracking,
        requestPermission,
        refreshLocation,
      }}
    >
      {children}
    </LocationServiceContext.Provider>
  );
};

export const useLocationService = () => useContext(LocationServiceContext);
