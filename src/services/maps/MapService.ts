
import { DeliveryLocation } from '@/types/location';
import { LocationFreshness } from '@/types/unifiedLocation';
import { Platform } from '@/utils/platform';
import { AccuracyLevel } from '@/components/location/LocationAccuracyIndicator';

export type MapType = 'standard' | 'satellite' | 'hybrid' | 'terrain';
export type MarkerType = 'restaurant' | 'customer' | 'driver' | 'default';

export interface MapMarker {
  id?: string;
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  type?: MarkerType;
  icon?: string;
  zIndex?: number;
}

export interface MapCircle {
  center: {
    latitude: number;
    longitude: number;
  };
  radius: number;
  strokeColor: string;
  strokeWidth: number;
  fillColor: string;
  fillOpacity: number;
}

export interface MapPolyline {
  points: Array<{
    latitude: number;
    longitude: number;
  }>;
  strokeColor: string;
  strokeWidth: number;
  geodesic?: boolean;
}

export interface MapViewOptions {
  center: {
    latitude: number;
    longitude: number;
  };
  zoom: number;
  markers?: MapMarker[];
  circles?: MapCircle[];
  polylines?: MapPolyline[];
  mapType?: MapType;
  showTraffic?: boolean;
  enableControls?: boolean;
  enableAnimation?: boolean;
  liteMode?: boolean;
}

export interface MapClickEvent {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface MapMarkerClickEvent {
  markerId: string;
  latitude: number;
  longitude: number;
}

export type MapEventListener = (event: any) => void;

/**
 * Map Service interface - defines the contract for map services
 */
export interface IMapService {
  // Map creation and destruction
  createMap(elementId: string, options: MapViewOptions): Promise<string>;
  destroyMap(mapId: string): Promise<void>;
  
  // Map manipulation
  setCamera(mapId: string, center: { latitude: number; longitude: number }, zoom?: number, animate?: boolean): Promise<void>;
  setMapType(mapId: string, type: MapType): Promise<void>;
  
  // Markers
  addMarker(mapId: string, marker: MapMarker): Promise<string>;
  updateMarker(mapId: string, markerId: string, marker: Partial<MapMarker>): Promise<void>;
  removeMarker(mapId: string, markerId: string): Promise<void>;
  
  // Shapes
  addCircle(mapId: string, circle: MapCircle): Promise<string>;
  removeCircle(mapId: string, circleId: string): Promise<void>;
  addPolyline(mapId: string, polyline: MapPolyline): Promise<string>;
  removePolyline(mapId: string, polylineId: string): Promise<void>;
  
  // Events
  addMapClickListener(mapId: string, listener: (event: MapClickEvent) => void): string;
  addMarkerClickListener(mapId: string, listener: (event: MapMarkerClickEvent) => void): string;
  removeEventListener(listenerId: string): void;
}

/**
 * Factory for creating the appropriate map service based on platform
 */
export class MapServiceFactory {
  static getMapService(): IMapService {
    if (Platform.isNative()) {
      // Lazy load the native map service
      return import('./NativeMapService').then(
        module => new module.NativeMapService()
      ) as unknown as IMapService;
    } else {
      // Lazy load the web map service
      return import('./WebMapService').then(
        module => new module.WebMapService()
      ) as unknown as IMapService;
    }
  }
}

/**
 * Helper function to determine map accuracy level based on location accuracy
 */
export function getAccuracyLevelFromLocation(location: DeliveryLocation | null): AccuracyLevel {
  if (!location) return 'unknown';
  
  const accuracy = location.accuracy;
  
  if (accuracy < 50) return 'high';
  if (accuracy < 200) return 'medium';
  return 'low';
}

export default MapServiceFactory;
