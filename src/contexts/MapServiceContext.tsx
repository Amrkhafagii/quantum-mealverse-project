
import React, { createContext, useContext, useEffect, useState } from 'react';
import { MapServiceFactory, IMapService, MapViewOptions, MapMarker, MapCircle, MapPolyline } from '@/services/maps/MapService';

interface MapServiceContextType {
  mapService: IMapService | null;
  isLoading: boolean;
  error: Error | null;
  createMap: (elementId: string, options: MapViewOptions) => Promise<string>;
  destroyMap: (mapId: string) => Promise<void>;
  setCamera: (mapId: string, center: { latitude: number; longitude: number }, zoom?: number, animate?: boolean) => Promise<void>;
  addMarker: (mapId: string, marker: MapMarker) => Promise<string>;
  updateMarker: (mapId: string, markerId: string, marker: Partial<MapMarker>) => Promise<void>;
  removeMarker: (mapId: string, markerId: string) => Promise<void>;
  addCircle: (mapId: string, circle: MapCircle) => Promise<string>;
  removeCircle: (mapId: string, circleId: string) => Promise<void>;
  addPolyline: (mapId: string, polyline: MapPolyline) => Promise<string>;
  removePolyline: (mapId: string, polylineId: string) => Promise<void>;
}

const MapServiceContext = createContext<MapServiceContextType>({
  mapService: null,
  isLoading: true,
  error: null,
  createMap: async () => '',
  destroyMap: async () => {},
  setCamera: async () => {},
  addMarker: async () => '',
  updateMarker: async () => {},
  removeMarker: async () => {},
  addCircle: async () => '',
  removeCircle: async () => {},
  addPolyline: async () => '',
  removePolyline: async () => {},
});

export const MapServiceProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [mapService, setMapService] = useState<IMapService | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Initialize map service
  useEffect(() => {
    const initMapService = async () => {
      try {
        const service = await MapServiceFactory.getMapService();
        setMapService(service);
        setIsLoading(false);
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
        console.error('Error initializing map service:', err);
      }
    };
    
    initMapService();
  }, []);
  
  const createMap = async (elementId: string, options: MapViewOptions): Promise<string> => {
    if (!mapService) throw new Error('Map service not initialized');
    return mapService.createMap(elementId, options);
  };
  
  const destroyMap = async (mapId: string): Promise<void> => {
    if (!mapService) return;
    return mapService.destroyMap(mapId);
  };
  
  const setCamera = async (mapId: string, center: { latitude: number; longitude: number }, zoom?: number, animate?: boolean): Promise<void> => {
    if (!mapService) return;
    return mapService.setCamera(mapId, center, zoom, animate);
  };
  
  const addMarker = async (mapId: string, marker: MapMarker): Promise<string> => {
    if (!mapService) throw new Error('Map service not initialized');
    return mapService.addMarker(mapId, marker);
  };
  
  const updateMarker = async (mapId: string, markerId: string, marker: Partial<MapMarker>): Promise<void> => {
    if (!mapService) return;
    return mapService.updateMarker(mapId, markerId, marker);
  };
  
  const removeMarker = async (mapId: string, markerId: string): Promise<void> => {
    if (!mapService) return;
    return mapService.removeMarker(mapId, markerId);
  };
  
  const addCircle = async (mapId: string, circle: MapCircle): Promise<string> => {
    if (!mapService) throw new Error('Map service not initialized');
    return mapService.addCircle(mapId, circle);
  };
  
  const removeCircle = async (mapId: string, circleId: string): Promise<void> => {
    if (!mapService) return;
    return mapService.removeCircle(mapId, circleId);
  };
  
  const addPolyline = async (mapId: string, polyline: MapPolyline): Promise<string> => {
    if (!mapService) throw new Error('Map service not initialized');
    return mapService.addPolyline(mapId, polyline);
  };
  
  const removePolyline = async (mapId: string, polylineId: string): Promise<void> => {
    if (!mapService) return;
    return mapService.removePolyline(mapId, polylineId);
  };
  
  return (
    <MapServiceContext.Provider
      value={{
        mapService,
        isLoading,
        error,
        createMap,
        destroyMap,
        setCamera,
        addMarker,
        updateMarker,
        removeMarker,
        addCircle,
        removeCircle,
        addPolyline,
        removePolyline,
      }}
    >
      {children}
    </MapServiceContext.Provider>
  );
};

export const useMapService = () => useContext(MapServiceContext);
