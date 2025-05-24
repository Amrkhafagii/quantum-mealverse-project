
/**
 * Interface for map service methods
 */

export interface MapViewOptions {
  center?: {
    latitude: number;
    longitude: number;
  };
  zoom?: number;
  markers?: MapMarker[];
  enableControls?: boolean;
  liteMode?: boolean;
  enableAnimation?: boolean;
}

export interface MapMarker {
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  type?: string;
  icon?: string;
  id?: string;
}

export interface MapCircle {
  center: {
    latitude: number;
    longitude: number;
  };
  radius: number;
  strokeColor?: string;
  strokeWidth?: number;
  fillColor?: string;
  fillOpacity?: number;
  id?: string;
}

export interface MapPolyline {
  path: Array<{
    latitude: number;
    longitude: number;
  }>;
  strokeColor?: string;
  strokeWidth?: number;
  id?: string;
}

export interface IMapService {
  initializeMap(elementId: string, options: MapViewOptions): Promise<string>;
  destroyMap(mapId: string): Promise<void>;
  setCenter(mapId: string, center: { latitude: number; longitude: number }, zoom?: number): Promise<void>;
  addMarker(mapId: string, marker: MapMarker): Promise<string>;
  updateMarker(mapId: string, markerId: string, marker: Partial<MapMarker>): Promise<void>;
  removeMarker(mapId: string, markerId: string): Promise<void>;
  addCircle(mapId: string, circle: MapCircle): Promise<string>;
  addPolyline(mapId: string, polyline: MapPolyline): Promise<string>;
  geocodeReverse(coords: { latitude: number; longitude: number }): Promise<string | null>;
}

export class MapServiceFactory {
  private static instance: IMapService | null = null;

  public static async getMapService(): Promise<IMapService> {
    if (!MapServiceFactory.instance) {
      // Implementation placeholder - would instantiate real service
      MapServiceFactory.instance = {
        initializeMap: async (elementId: string, options: MapViewOptions): Promise<string> => {
          console.log("Initializing map", elementId, options);
          return elementId;
        },
        destroyMap: async (mapId: string): Promise<void> => {
          console.log("Destroying map", mapId);
        },
        setCenter: async (mapId: string, center: { latitude: number; longitude: number }, zoom?: number): Promise<void> => {
          console.log("Setting center for map", mapId, center, zoom);
        },
        addMarker: async (mapId: string, marker: MapMarker): Promise<string> => {
          const id = `marker-${Date.now()}`;
          console.log("Adding marker to map", mapId, marker);
          return id;
        },
        updateMarker: async (mapId: string, markerId: string, marker: Partial<MapMarker>): Promise<void> => {
          console.log("Updating marker", mapId, markerId, marker);
        },
        removeMarker: async (mapId: string, markerId: string): Promise<void> => {
          console.log("Removing marker", mapId, markerId);
        },
        addCircle: async (mapId: string, circle: MapCircle): Promise<string> => {
          const id = `circle-${Date.now()}`;
          console.log("Adding circle to map", mapId, circle);
          return id;
        },
        addPolyline: async (mapId: string, polyline: MapPolyline): Promise<string> => {
          const id = `polyline-${Date.now()}`;
          console.log("Adding polyline to map", mapId, polyline);
          return id;
        },
        geocodeReverse: async (coords: { latitude: number; longitude: number }): Promise<string | null> => {
          console.log("Reverse geocoding", coords);
          return "Sample Address";
        }
      };
    }

    return MapServiceFactory.instance;
  }
}

// Utility function
export function getAccuracyLevelFromLocation(location: any): 'high' | 'medium' | 'low' | 'unknown' {
  if (!location || typeof location.accuracy !== 'number') {
    return 'unknown';
  }
  
  if (location.accuracy < 50) return 'high';
  if (location.accuracy < 200) return 'medium';
  return 'low';
}
