
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface SavedPosition {
  center: { lat: number; lng: number };
  zoom: number;
  timestamp: number;
}

type SavedPositions = Record<string, SavedPosition>;

interface MapViewContextType {
  center?: { lat: number; lng: number };
  zoom?: number;
  lowPerformanceMode: boolean;
  setCenter?: (center: { lat: number; lng: number }) => void;
  setZoom?: (zoom: number) => void;
  setLowPerformanceMode: (mode: boolean) => void;
  getSavedPosition: (key: string) => SavedPosition | undefined;
  savePosition: (key: string, position: SavedPosition) => void;
}

const MapViewContext = createContext<MapViewContextType>({
  lowPerformanceMode: false,
  setLowPerformanceMode: () => {},
  getSavedPosition: () => undefined,
  savePosition: () => {}
});

interface MapViewProviderProps {
  children: ReactNode;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  forceLowPerformanceMode?: boolean;
}

export const MapViewProvider: React.FC<MapViewProviderProps> = ({
  children,
  initialCenter,
  initialZoom = 14,
  forceLowPerformanceMode
}) => {
  const [center, setCenter] = useState<{ lat: number; lng: number } | undefined>(initialCenter);
  const [zoom, setZoom] = useState<number>(initialZoom);
  const [lowPerformanceMode, setLowPerformanceMode] = useState<boolean>(!!forceLowPerformanceMode);
  const [savedPositions, setSavedPositions] = useState<SavedPositions>({});

  // Get a saved map position by key
  const getSavedPosition = useCallback((key: string): SavedPosition | undefined => {
    // Try to get from state
    if (savedPositions[key]) {
      return savedPositions[key];
    }
    
    // Try to get from localStorage
    try {
      const saved = localStorage.getItem(`map_position_${key}`);
      if (saved) {
        const position = JSON.parse(saved);
        // Update state with localStorage value
        setSavedPositions(prev => ({ ...prev, [key]: position }));
        return position;
      }
    } catch (error) {
      console.error('Error retrieving saved map position:', error);
    }
    
    return undefined;
  }, [savedPositions]);

  // Save a map position by key
  const savePosition = useCallback((key: string, position: SavedPosition) => {
    // Save to state
    setSavedPositions(prev => ({ ...prev, [key]: position }));
    
    // Save to localStorage
    try {
      localStorage.setItem(`map_position_${key}`, JSON.stringify(position));
    } catch (error) {
      console.error('Error saving map position:', error);
    }
  }, []);

  return (
    <MapViewContext.Provider
      value={{
        center,
        zoom,
        lowPerformanceMode,
        setCenter,
        setZoom,
        setLowPerformanceMode,
        getSavedPosition,
        savePosition
      }}
    >
      {children}
    </MapViewContext.Provider>
  );
};

export const useMapView = () => useContext(MapViewContext);
