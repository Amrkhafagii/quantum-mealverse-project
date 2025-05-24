
export interface MapMarker {
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  type?: string;
}

export interface MapViewOptions {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarker[];
  enableControls?: boolean;
  liteMode?: boolean;
  enableAnimation?: boolean;
}

export interface MapCircle {
  center: { lat: number; lng: number } | { latitude: number; longitude: number };
  radius: number;
  strokeColor: string;
  strokeWidth: number;
  fillColor: string;
  fillOpacity?: number;
}

export interface MapPolyline {
  path: Array<{ lat: number; lng: number } | { latitude: number; longitude: number }>;
  color: string;
  width: number;
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
  title?: string;
}

export type MapType = 'standard' | 'satellite' | 'hybrid' | 'terrain';

export interface IMapService {
  initializeMap(elementId: string, options: MapViewOptions): Promise<string>;
  destroyMap(mapId: string): Promise<void>;
  setCenter(mapId: string, center: { lat: number; lng: number } | { latitude: number; longitude: number }): Promise<void>;
  addMarker(mapId: string, marker: MapMarker): Promise<string>;
  removeMarker(mapId: string, markerId: string): Promise<void>;
  addCircle(mapId: string, circle: MapCircle): Promise<string>;
  removeCircle(mapId: string, circleId: string): Promise<void>;
  addPolyline(mapId: string, polyline: MapPolyline): Promise<string>;
  removePolyline(mapId: string, polylineId: string): Promise<void>;
  setZoom(mapId: string, zoom: number): Promise<void>;
  fitBounds(mapId: string, bounds: any): Promise<void>;
  addMapClickListener(mapId: string, listener: (event: MapClickEvent) => void): string;
  removeMapClickListener(mapId: string, listenerId: string): void;
  addMarkerClickListener(mapId: string, listener: (event: MapMarkerClickEvent) => void): string;
  removeMarkerClickListener(mapId: string, listenerId: string): void;
  geocodeReverse(lat: number, lng: number): Promise<string | null>;
}

// Helper function to get accuracy level from location
export function getAccuracyLevelFromLocation(location: any): 'high' | 'medium' | 'low' | 'unknown' {
  if (!location || !location.accuracy) return 'unknown';
  
  if (location.accuracy < 50) return 'high';
  if (location.accuracy < 200) return 'medium';
  return 'low';
}
