
import { useState, useEffect, useCallback, useRef } from 'react';
import { IMapService, MapServiceFactory, MapViewOptions, MapMarker, MapCircle, MapPolyline } from '@/services/maps/MapService';
import { ILocationService, LocationServiceFactory, LocationTrackingOptions } from '@/services/location/LocationService';
import { DeliveryLocation } from '@/types/location';
import { LocationFreshness } from '@/types/unifiedLocation';
import { AccuracyLevel } from '@/components/location/LocationAccuracyIndicator';

// Options for the useGoogleMaps hook
export interface GoogleMapsOptions {
  enableTracking?: boolean;
  trackingOptions?: LocationTrackingOptions;
  autoCenter?: boolean;
  onLocationUpdate?: (location: DeliveryLocation) => void;
  onPermissionChange?: (status: 'granted' | 'denied' | 'prompt') => void;
  locationUpdateInterval?: number;
}

// Return type for the useGoogleMaps hook
export interface GoogleMapsHook {
  // Map related
  initializeMap: (elementId: string, options: MapViewOptions) => Promise<string>;
  destroyMap: (mapId: string) => Promise<void>;
  setCenter: (mapId: string, center: { latitude: number; longitude: number }, zoom?: number) => Promise<void>;
  addMarker: (mapId: string, marker: MapMarker) => Promise<string>;
  updateMarker: (mapId: string, markerId: string, marker: Partial<MapMarker>) => Promise<void>;
  removeMarker: (mapId: string, markerId: string) => Promise<void>;
  addCircle: (mapId: string, circle: MapCircle) => Promise<string>;
  addPolyline: (mapId: string, polyline: MapPolyline) => Promise<string>;
  
  // Location related
  currentLocation: DeliveryLocation | null;
  startTracking: () => Promise<boolean>;
  stopTracking: () => Promise<void>;
  requestLocationPermission: () => Promise<boolean>;
  isTrackingLocation: boolean;
  locationPermissionStatus: 'granted' | 'denied' | 'prompt';
  locationFreshness: LocationFreshness;
  locationAccuracyLevel: AccuracyLevel;
  getLastKnownLocation: () => DeliveryLocation | null;
  refreshLocation: () => Promise<DeliveryLocation | null>;
  
  // Utility
  isInitialized: boolean;
  isLoading: boolean;
  error: Error | null;
}

export function useGoogleMaps(options: GoogleMapsOptions = {}): GoogleMapsHook {
  const mapService = useRef<IMapService | null>(null);
  const locationService = useRef<ILocationService | null>(null);
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const [currentLocation, setCurrentLocation] = useState<DeliveryLocation | null>(null);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [locationFreshness, setLocationFreshness] = useState<LocationFreshness>('invalid');
  const [locationAccuracyLevel, setLocationAccuracyLevel] = useState<AccuracyLevel>('unknown');
  
  // Initialize services
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        
        // Initialize map service
        const ms = await MapServiceFactory.getMapService();
        mapService.current = ms;
        
        // Initialize location service
        const ls = await LocationServiceFactory.getLocationService();
        locationService.current = ls;
        
        // Check location permission
        const status = await ls.getPermissionStatus();
        setLocationPermissionStatus(status);
        
        // Get last known location
        const lastLocation = ls.getLastKnownLocation();
        if (lastLocation) {
          setCurrentLocation(lastLocation);
          setLocationFreshness(ls.getFreshness());
          updateAccuracyLevel(lastLocation);
        }
        
        // Start tracking if enabled
        if (options.enableTracking && status === 'granted') {
          await ls.startTracking(options.trackingOptions);
          setIsTrackingLocation(true);
        }
        
        setIsInitialized(true);
        setIsLoading(false);
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
        console.error('Error initializing Google Maps services:', err);
      }
    };
    
    initialize();
    
    return () => {
      // Clean up location tracking
      if (locationService.current && isTrackingLocation) {
        locationService.current.stopTracking().catch(console.error);
      }
    };
  }, [options.enableTracking, options.trackingOptions]);
  
  // Set up location listener
  useEffect(() => {
    if (!locationService.current || !isInitialized) {
      return;
    }
    
    const locationCallback = (location: DeliveryLocation) => {
      setCurrentLocation(location);
      setLocationFreshness(locationService.current!.getFreshness());
      updateAccuracyLevel(location);
      
      if (options.onLocationUpdate) {
        options.onLocationUpdate(location);
      }
    };
    
    const listenerId = locationService.current.addLocationListener(locationCallback);
    
    return () => {
      if (locationService.current) {
        locationService.current.removeLocationListener(listenerId);
      }
    };
  }, [isInitialized, options.onLocationUpdate]);
  
  // Auto center on location update if enabled
  useEffect(() => {
    if (!options.autoCenter || !currentLocation || !mapService.current) {
      return;
    }
    
    // This would need to be updated to work with multiple maps
    // For simplicity, we're not implementing this in the hook
  }, [currentLocation, options.autoCenter]);
  
  // Poll for location updates at specified interval
  useEffect(() => {
    if (!options.locationUpdateInterval || !isTrackingLocation || !locationService.current) {
      return;
    }
    
    const intervalId = setInterval(() => {
      refreshLocation().catch(console.error);
    }, options.locationUpdateInterval);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [isTrackingLocation, options.locationUpdateInterval]);
  
  // Update accuracy level
  const updateAccuracyLevel = (location: DeliveryLocation | null) => {
    if (!location) {
      setLocationAccuracyLevel('unknown');
      return;
    }
    
    const accuracy = location.accuracy;
    
    if (accuracy && accuracy < 50) {
      setLocationAccuracyLevel('high');
    } else if (accuracy && accuracy < 200) {
      setLocationAccuracyLevel('medium');
    } else {
      setLocationAccuracyLevel('low');
    }
  };
  
  // Map methods
  const initializeMap = useCallback(async (elementId: string, mapOptions: MapViewOptions): Promise<string> => {
    if (!mapService.current) {
      throw new Error('Map service not initialized');
    }
    
    try {
      return await mapService.current.createMap(elementId, mapOptions);
    } catch (err) {
      console.error('Error initializing map:', err);
      throw err;
    }
  }, []);
  
  const destroyMap = useCallback(async (mapId: string): Promise<void> => {
    if (!mapService.current) {
      throw new Error('Map service not initialized');
    }
    
    try {
      await mapService.current.destroyMap(mapId);
    } catch (err) {
      console.error('Error destroying map:', err);
      throw err;
    }
  }, []);
  
  const setCenter = useCallback(async (mapId: string, center: { latitude: number; longitude: number }, zoom?: number): Promise<void> => {
    if (!mapService.current) {
      throw new Error('Map service not initialized');
    }
    
    try {
      await mapService.current.setCamera(mapId, center, zoom, true);
    } catch (err) {
      console.error('Error setting map center:', err);
      throw err;
    }
  }, []);
  
  const addMarker = useCallback(async (mapId: string, marker: MapMarker): Promise<string> => {
    if (!mapService.current) {
      throw new Error('Map service not initialized');
    }
    
    try {
      return await mapService.current.addMarker(mapId, marker);
    } catch (err) {
      console.error('Error adding marker:', err);
      throw err;
    }
  }, []);
  
  const updateMarker = useCallback(async (mapId: string, markerId: string, marker: Partial<MapMarker>): Promise<void> => {
    if (!mapService.current) {
      throw new Error('Map service not initialized');
    }
    
    try {
      await mapService.current.updateMarker(mapId, markerId, marker);
    } catch (err) {
      console.error('Error updating marker:', err);
      throw err;
    }
  }, []);
  
  const removeMarker = useCallback(async (mapId: string, markerId: string): Promise<void> => {
    if (!mapService.current) {
      throw new Error('Map service not initialized');
    }
    
    try {
      await mapService.current.removeMarker(mapId, markerId);
    } catch (err) {
      console.error('Error removing marker:', err);
      throw err;
    }
  }, []);
  
  const addCircle = useCallback(async (mapId: string, circle: MapCircle): Promise<string> => {
    if (!mapService.current) {
      throw new Error('Map service not initialized');
    }
    
    try {
      return await mapService.current.addCircle(mapId, circle);
    } catch (err) {
      console.error('Error adding circle:', err);
      throw err;
    }
  }, []);
  
  const addPolyline = useCallback(async (mapId: string, polyline: MapPolyline): Promise<string> => {
    if (!mapService.current) {
      throw new Error('Map service not initialized');
    }
    
    try {
      return await mapService.current.addPolyline(mapId, polyline);
    } catch (err) {
      console.error('Error adding polyline:', err);
      throw err;
    }
  }, []);
  
  // Location methods
  const startTracking = useCallback(async (): Promise<boolean> => {
    if (!locationService.current) {
      throw new Error('Location service not initialized');
    }
    
    try {
      const result = await locationService.current.startTracking(options.trackingOptions);
      setIsTrackingLocation(result);
      return result;
    } catch (err) {
      console.error('Error starting location tracking:', err);
      setIsTrackingLocation(false);
      return false;
    }
  }, [options.trackingOptions]);
  
  const stopTracking = useCallback(async (): Promise<void> => {
    if (!locationService.current) {
      throw new Error('Location service not initialized');
    }
    
    try {
      await locationService.current.stopTracking();
      setIsTrackingLocation(false);
    } catch (err) {
      console.error('Error stopping location tracking:', err);
    }
  }, []);
  
  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    if (!locationService.current) {
      throw new Error('Location service not initialized');
    }
    
    try {
      const status = await locationService.current.requestPermission();
      setLocationPermissionStatus(status);
      
      if (options.onPermissionChange) {
        options.onPermissionChange(status);
      }
      
      return status === 'granted';
    } catch (err) {
      console.error('Error requesting location permission:', err);
      return false;
    }
  }, [options.onPermissionChange]);
  
  const refreshLocation = useCallback(async (): Promise<DeliveryLocation | null> => {
    if (!locationService.current) {
      throw new Error('Location service not initialized');
    }
    
    try {
      const location = await locationService.current.getCurrentLocation();
      if (location) {
        setCurrentLocation(location);
        setLocationFreshness(locationService.current.getFreshness());
        updateAccuracyLevel(location);
        
        if (options.onLocationUpdate) {
          options.onLocationUpdate(location);
        }
      }
      
      return location;
    } catch (err) {
      console.error('Error refreshing location:', err);
      return null;
    }
  }, [options.onLocationUpdate]);
  
  const getLastKnownLocation = useCallback((): DeliveryLocation | null => {
    if (!locationService.current) {
      return null;
    }
    
    return locationService.current.getLastKnownLocation();
  }, []);
  
  return {
    // Map methods
    initializeMap,
    destroyMap,
    setCenter,
    addMarker,
    updateMarker,
    removeMarker,
    addCircle,
    addPolyline,
    
    // Location methods
    currentLocation,
    startTracking,
    stopTracking,
    requestLocationPermission,
    isTrackingLocation,
    locationPermissionStatus,
    locationFreshness,
    locationAccuracyLevel,
    getLastKnownLocation,
    refreshLocation,
    
    // Status
    isInitialized,
    isLoading,
    error
  };
}

export default useGoogleMaps;
