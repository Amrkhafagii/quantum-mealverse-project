
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
}

const MapViewContext = createContext<MapViewContextType>({
  getSavedPosition: () => defaultPosition,
  savePosition: () => {},
  clearSavedPosition: () => {},
  lowPerformanceMode: false,
  setLowPerformanceMode: () => {}
});

export const useMapView = () => useContext(MapViewContext);

export const MapViewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedPositions, setSavedPositions] = useState<Record<string, MapPosition>>({});
  const [lowPerformanceMode, setLowPerformanceMode] = useState(false);
  const { isOnline } = useConnectionStatus();
  const { isLowQuality } = useNetworkQuality(); // Now correctly using the hook with isLowQuality property
  const isNative = Platform.isNative();
  
  // Initialize with saved positions from localStorage if available
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('map-positions');
      if (savedData) {
        setSavedPositions(JSON.parse(savedData));
      }
    } catch (error) {
      console.error('Error loading saved map positions:', error);
    }
    
    // Enable low performance mode on native devices with low network quality
    if (isNative && isLowQuality) {
      setLowPerformanceMode(true);
    }
  }, [isNative, isLowQuality]);
  
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
  
  return (
    <MapViewContext.Provider 
      value={{ 
        getSavedPosition, 
        savePosition, 
        clearSavedPosition,
        lowPerformanceMode,
        setLowPerformanceMode
      }}
    >
      {children}
    </MapViewContext.Provider>
  );
};
