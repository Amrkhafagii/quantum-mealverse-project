
import { DeliveryLocation } from '@/types/location';

export interface MapMarker {
  id: string;
  position: { lat: number; lng: number };
  title?: string;
  icon?: string;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface IMapService {
  initializeMap(containerId: string, options?: any): Promise<void>;
  setCenter(position: { lat: number; lng: number }): void;
  setZoom(zoom: number): void;
  fitBounds(bounds: MapBounds): void;
  addMarker(marker: MapMarker): string;
  removeMarker(markerId: string): void;
  clearMarkers(): void;
  destroy(): void;
}
