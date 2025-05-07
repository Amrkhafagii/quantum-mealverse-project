
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from '@/utils/platform';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useNetworkQuality } from '@/hooks/useNetworkQuality';

// Default map position (San Francisco)
export const defaultPosition = {
  center: { lat: 37.7749, lng: -122.4194 },
  zoom: 12
};

interface MapPosition {
  center: { lat: number; lng: number };
  zoom: number;
}

interface MapViewContextType {
  getSavedPosition: (mapId: string) => MapPosition | null;
  savePosition: (mapId: string, position: MapPosition) => void;
  clearSavedPosition: (mapId: string) => void;
  lowPerformanceMode: boolean;
  setLowPerformanceMode: (mode: boolean) => void;
  useNativeMapIfAvailable: boolean;
  mapLoadErrors: Record<string, string>;
  recordMapError: (mapId: string, error: string) => void;
  clearMapError: (mapId: string) => void;
}

const MapViewContext = createContext<MapViewContextType>({
  getSavedPosition: () => defaultPosition,
  savePosition: () => {},
  clearSavedPosition: () => {},
  lowPerformanceMode: false,
  setLowPerformanceMode: () => {},
  useNativeMapIfAvailable: false,
  mapLoadErrors: {},
  recordMapError: () => {},
  clearMapError: () => {}
});

export const useMapView = () => useContext(MapViewContext);

export const MapViewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedPositions, setSavedPositions] = useState<Record<string, MapPosition>>({});
  const [lowPerformanceMode, setLowPerformanceMode] = useState(false);
  const [useNativeMapIfAvailable, setUseNativeMapIfAvailable] = useState(false);
  const [mapLoadErrors, setMapLoadErrors] = useState<Record<string, string>>({});
  const { isOnline } = useConnectionStatus();
  const { isLowQuality, isFlaky } = useNetworkQuality();
  const isNative = Platform.isNative();
  
  // Initialize with saved positions from localStorage if available
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('map-positions');
      if (savedData) {
        setSavedPositions(JSON.parse(savedData));
      }
      
      // Check for previously saved preference for native maps
      const preferNativeMaps = localStorage.getItem('prefer-native-maps') === 'true';
      setUseNativeMapIfAvailable(isNative && preferNativeMaps);
    } catch (error) {
      console.error('Error loading saved map positions:', error);
    }
    
    // Enable low performance mode on native devices with low network quality
    if (isNative && isLowQuality) {
      setLowPerformanceMode(true);
      
      // On native devices, prefer native maps when experiencing network issues
      if (isFlaky) {
        setUseNativeMapIfAvailable(true);
        localStorage.setItem('prefer-native-maps', 'true');
      }
    }
  }, [isNative, isLowQuality, isFlaky]);
  
  // Save positions to localStorage when updated
  useEffect(() => {
    try {
      localStorage.setItem('map-positions', JSON.stringify(savedPositions));
    } catch (error) {
      console.error('Error saving map positions:', error);
    }
  }, [savedPositions]);
  
  const getSavedPosition = (mapId: string): MapPosition => {
    return savedPositions[mapId] || defaultPosition;
  };
  
  const savePosition = (mapId: string, position: MapPosition) => {
    setSavedPositions(prev => ({
      ...prev,
      [mapId]: position
    }));
  };
  
  const clearSavedPosition = (mapId: string) => {
    setSavedPositions(prev => {
      const newPositions = { ...prev };
      delete newPositions[mapId];
      return newPositions;
    });
  };
  
  const recordMapError = (mapId: string, error: string) => {
    setMapLoadErrors(prev => ({
      ...prev,
      [mapId]: error
    }));
    
    // If we're getting errors on web maps and we're on a native device,
    // automatically switch to native maps
    if (isNative && !useNativeMapIfAvailable) {
      console.log("Web map error detected, switching to native maps");
      setUseNativeMapIfAvailable(true);
      localStorage.setItem('prefer-native-maps', 'true');
    }
  };
  
  const clearMapError = (mapId: string) => {
    setMapLoadErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[mapId];
      return newErrors;
    });
  };
  
  return (
    <MapViewContext.Provider 
      value={{ 
        getSavedPosition, 
        savePosition, 
        clearSavedPosition,
        lowPerformanceMode,
        setLowPerformanceMode,
        useNativeMapIfAvailable,
        mapLoadErrors,
        recordMapError,
        clearMapError
      }}
    >
      {children}
    </MapViewContext.Provider>
  );
};
