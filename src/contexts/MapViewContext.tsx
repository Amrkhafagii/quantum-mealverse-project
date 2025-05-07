
import React, { createContext, useState, useContext, useEffect } from 'react';

interface MapPosition {
  center: { lat: number; lng: number };
  zoom: number;
  bearing?: number;
  pitch?: number;
}

interface MapViewState {
  // Store last positions by map id/name
  positions: Record<string, MapPosition>;
  // Store when position was last saved
  lastUpdated: Record<string, number>;
}

interface MapViewContextType {
  // Get saved position for a specific map
  getSavedPosition: (mapId: string) => MapPosition | null;
  // Save position for a specific map
  savePosition: (mapId: string, position: MapPosition) => void;
  // Clear saved position
  clearPosition: (mapId: string) => void;
}

const defaultPosition = {
  center: { lat: 30.0444, lng: 31.2357 }, // Egypt's coordinates as default
  zoom: 13
};

const MapViewContext = createContext<MapViewContextType | null>(null);

export const MapViewProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [viewState, setViewState] = useState<MapViewState>({
    positions: {},
    lastUpdated: {}
  });

  // Load saved positions from localStorage on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('mapViewState');
      if (savedState) {
        setViewState(JSON.parse(savedState));
      }
    } catch (error) {
      console.error('Error loading map view state from storage:', error);
    }
  }, []);

  // Save to localStorage when view state changes
  useEffect(() => {
    try {
      localStorage.setItem('mapViewState', JSON.stringify(viewState));
    } catch (error) {
      console.error('Error saving map view state to storage:', error);
    }
  }, [viewState]);

  const getSavedPosition = (mapId: string): MapPosition | null => {
    return viewState.positions[mapId] || null;
  };

  const savePosition = (mapId: string, position: MapPosition) => {
    setViewState(prev => ({
      positions: {
        ...prev.positions,
        [mapId]: position
      },
      lastUpdated: {
        ...prev.lastUpdated,
        [mapId]: Date.now()
      }
    }));
  };

  const clearPosition = (mapId: string) => {
    setViewState(prev => {
      const newPositions = { ...prev.positions };
      const newLastUpdated = { ...prev.lastUpdated };
      delete newPositions[mapId];
      delete newLastUpdated[mapId];
      return {
        positions: newPositions,
        lastUpdated: newLastUpdated
      };
    });
  };

  return (
    <MapViewContext.Provider value={{ getSavedPosition, savePosition, clearPosition }}>
      {children}
    </MapViewContext.Provider>
  );
};

export const useMapView = () => {
  const context = useContext(MapViewContext);
  if (!context) {
    throw new Error('useMapView must be used within a MapViewProvider');
  }
  return context;
};

export { defaultPosition };
