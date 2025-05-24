
import React, { createContext, useContext, useEffect, useState } from 'react';
import { MapServiceFactory, IMapService, MapViewOptions, MapMarker, MapCircle, MapPolyline } from '@/services/maps/MapService';
import performanceOptimizer from '@/utils/performanceOptimizer';

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
  addMapClickListener: (mapId: string, listener: (event: any) => void) => string;
  performanceLevel: 'high' | 'medium' | 'low';
  setPerformanceLevel: (level: 'high' | 'medium' | 'low') => void;
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
  addMapClickListener: () => '',
  performanceLevel: 'high',
  setPerformanceLevel: () => {},
});

export const MapServiceProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [mapService, setMapService] = useState<IMapService | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [performanceLevel, setPerformanceLevel] = useState<'high' | 'medium' | 'low'>(
    performanceOptimizer.getPerformanceLevel()
  );
  
  // Initialize map service
  useEffect(() => {
    const initMapService = async () => {
      try {
        // Initialize performance optimizer
        performanceOptimizer.initialize();
        
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
  
  // Update performance optimizer when level changes
  useEffect(() => {
    performanceOptimizer.setPerformanceLevel(performanceLevel);
  }, [performanceLevel]);
  
  const createMap = async (elementId: string, options: MapViewOptions): Promise<string> => {
    if (!mapService) throw new Error('Map service not initialized');
    
    // Apply performance optimizations
    const optimizedOptions = {
      ...options,
      liteMode: options.liteMode || performanceOptimizer.shouldUseLowPerformanceMode()
    };
    
    return mapService.createMap(elementId, optimizedOptions);
  };
  
  const destroyMap = async (mapId: string): Promise<void> => {
    if (!mapService) return;
    return mapService.destroyMap(mapId);
  };
  
  const setCamera = async (mapId: string, center: { latitude: number; longitude: number }, zoom?: number, animate?: boolean): Promise<void> => {
    if (!mapService) return;
    
    // Disable animation in low performance mode
    const shouldAnimate = animate && !performanceOptimizer.shouldUseLowPerformanceMode();
    
    return mapService.setCamera(mapId, center, zoom, shouldAnimate);
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
  
  const addMapClickListener = (mapId: string, listener: (event: any) => void): string => {
    if (!mapService) throw new Error('Map service not initialized');
    return mapService.addMapClickListener(mapId, listener);
  };
  
  const handlePerformanceLevelChange = (level: 'high' | 'medium' | 'low') => {
    setPerformanceLevel(level);
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
        addMapClickListener,
        performanceLevel,
        setPerformanceLevel: handlePerformanceLevelChange,
      }}
    >
      {children}
    </MapServiceContext.Provider>
  );
};

export const useMapService = () => useContext(MapServiceContext);
