import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { googleMapsKeyManager } from '@/services/maps/GoogleMapsKeyManager';
import { toast } from '@/hooks/use-toast';
import { useNetworkRetry } from '@/hooks/useNetworkRetry';
import { MapMarker, MapCircle, MapPolyline } from '@/services/maps/MapService';

interface MapLocation {
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  type?: string;
}

type GoogleMapsContextType = {
  googleMapsApiKey: string;
  setGoogleMapsApiKey: (key: string) => Promise<boolean>;
  validateApiKey: (key: string) => Promise<boolean>;
  keySource: 'database' | 'localStorage' | 'environment' | 'default' | 'none';
  isLoaded: boolean;
  isLoading: boolean;
  error: Error | null;
  clearApiKey: () => Promise<void>;
  updateDriverLocation?: (location: MapLocation) => void;
  // Added explicit methods that were accessed but missing in the type
  initializeMap: (elementId: string, options: any) => Promise<string>;
  destroyMap: (mapId: string) => Promise<void>;
  addCircle: (mapId: string, circle: MapCircle) => Promise<string>;
  currentLocation?: MapLocation | null;
};

const GoogleMapsContext = createContext<GoogleMapsContextType>({
  googleMapsApiKey: '',
  setGoogleMapsApiKey: async () => false,
  validateApiKey: async () => false,
  keySource: 'none',
  isLoaded: false,
  isLoading: true,
  error: null,
  clearApiKey: async () => {},
  updateDriverLocation: undefined,
  // Add implementations for the new methods
  initializeMap: async () => '',
  destroyMap: async () => {},
  addCircle: async () => '',
  currentLocation: null,
});

interface GoogleMapsProviderProps {
  children: ReactNode;
}

export const GoogleMapsProvider: React.FC<GoogleMapsProviderProps> = ({ children }) => {
  // State for API key and loading status
  const [googleMapsApiKey, setApiKey] = useState<string>('');
  const [keySource, setKeySource] = useState<'database' | 'localStorage' | 'environment' | 'default' | 'none'>('none');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentLocation, setCurrentLocation] = useState<MapLocation | null>(null);
  const [mapInstances, setMapInstances] = useState<Record<string, any>>({});

  // Use network retry for loading the API key
  const { execute: loadApiKey, isRetrying } = useNetworkRetry(async () => {
    const keyInfo = await googleMapsKeyManager.loadApiKey();
    setApiKey(keyInfo.key);
    setKeySource(keyInfo.source);
    setIsLoaded(!!keyInfo.key);
    return keyInfo;
  });

  // This function will be available globally to update the driver's location
  const updateDriverLocation = (location: MapLocation) => {
    // In the future, this could be expanded to store the driver location in a global state
    console.log('Driver location updated:', location);
    setCurrentLocation(location);
  };

  // Set a new API key
  const setGoogleMapsApiKey = useCallback(async (newKey: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      return true; // Always return true as we're using hardcoded key
    } catch (error) {
      console.error('Error setting Google Maps API key:', error);
      setError(error instanceof Error ? error : new Error('Failed to set API key'));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Validate an API key
  const validateApiKey = useCallback(async (key: string): Promise<boolean> => {
    return true; // Always return true as we're using hardcoded key
  }, []);
  
  // Clear the API key
  const clearApiKey = useCallback(async (): Promise<void> => {
    // This is a no-op as we're using the hardcoded key
  }, []);

  // Initialize a new map
  const initializeMap = useCallback(async (elementId: string, options: any): Promise<string> => {
    try {
      console.log(`Initializing map with ID: ${elementId}`, options);
      
      // For this simplified implementation, we just return the element ID as the map ID
      setMapInstances(prev => ({
        ...prev,
        [elementId]: { 
          id: elementId, 
          options,
          markers: [],
          circles: [],
          polylines: []
        }
      }));
      
      return elementId;
    } catch (error) {
      console.error('Error initializing map:', error);
      throw error;
    }
  }, []);

  // Destroy a map instance
  const destroyMap = useCallback(async (mapId: string): Promise<void> => {
    try {
      console.log(`Destroying map with ID: ${mapId}`);
      
      setMapInstances(prev => {
        const newInstances = { ...prev };
        delete newInstances[mapId];
        return newInstances;
      });
    } catch (error) {
      console.error('Error destroying map:', error);
      throw error;
    }
  }, []);

  // Add a circle to a map
  const addCircle = useCallback(async (mapId: string, circle: MapCircle): Promise<string> => {
    try {
      console.log(`Adding circle to map ${mapId}:`, circle);
      
      const circleId = `circle-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      setMapInstances(prev => {
        if (!prev[mapId]) {
          throw new Error(`Map with ID ${mapId} not found`);
        }
        
        const updatedMap = { 
          ...prev[mapId],
          circles: [
            ...(prev[mapId].circles || []),
            { ...circle, id: circleId }
          ]
        };
        
        return {
          ...prev,
          [mapId]: updatedMap
        };
      });
      
      return circleId;
    } catch (error) {
      console.error('Error adding circle to map:', error);
      throw error;
    }
  }, []);

  // Add polyline to a map
  const addPolyline = useCallback(async (mapId: string, polyline: MapPolyline): Promise<string> => {
    try {
      console.log(`Adding polyline to map ${mapId}:`, polyline);
      
      const polylineId = `polyline-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      setMapInstances(prev => {
        if (!prev[mapId]) {
          throw new Error(`Map with ID ${mapId} not found`);
        }
        
        const updatedMap = { 
          ...prev[mapId],
          polylines: [
            ...(prev[mapId].polylines || []),
            { ...polyline, id: polylineId }
          ]
        };
        
        return {
          ...prev,
          [mapId]: updatedMap
        };
      });
      
      return polylineId;
    } catch (error) {
      console.error('Error adding polyline to map:', error);
      throw error;
    }
  }, []);

  // Load API key on mount
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        await loadApiKey();
      } catch (error) {
        console.error('Error loading Google Maps API key:', error);
        setError(error instanceof Error ? error : new Error('Failed to load API key'));
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [loadApiKey]);

  return (
    <GoogleMapsContext.Provider
      value={{
        googleMapsApiKey,
        setGoogleMapsApiKey,
        validateApiKey,
        keySource,
        isLoaded,
        isLoading,
        error,
        clearApiKey,
        updateDriverLocation,
        initializeMap,
        destroyMap,
        addCircle,
        currentLocation,
      }}
    >
      {children}
    </GoogleMapsContext.Provider>
  );
};

export const useGoogleMaps = () => useContext(GoogleMapsContext);
