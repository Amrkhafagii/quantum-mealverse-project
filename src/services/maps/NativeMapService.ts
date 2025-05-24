
import { CapacitorGoogleMaps } from '@capacitor-community/capacitor-googlemaps-native';
import { IMapService, MapMarker, MapBounds } from './IMapService';
import { DeliveryLocation } from '@/types/location';

export class NativeMapService implements IMapService {
  private map: any = null;
  private markers: Map<string, any> = new Map();

  async initializeMap(containerId: string, options: any = {}): Promise<void> {
    try {
      this.map = await CapacitorGoogleMaps.create({
        id: 'map',
        element: document.getElementById(containerId),
        apiKey: 'your-google-maps-api-key',
        config: {
          center: {
            lat: options.center?.lat || 33.6,
            lng: options.center?.lng || -117.9,
          },
          zoom: options.zoom || 8,
        },
      });
    } catch (error) {
      console.error('Error initializing native map:', error);
    }
  }

  setCenter(position: { lat: number; lng: number }): void {
    if (this.map) {
      this.map.setCamera({
        coordinate: {
          lat: position.lat,
          lng: position.lng,
        },
      });
    }
  }

  setZoom(zoom: number): void {
    if (this.map) {
      this.map.setCamera({ zoom });
    }
  }

  fitBounds(bounds: MapBounds): void {
    // Implementation for fitting bounds
    console.log('Fitting bounds:', bounds);
  }

  addMarker(marker: MapMarker): string {
    if (this.map) {
      const nativeMarker = this.map.addMarker({
        coordinate: {
          lat: marker.position.lat,
          lng: marker.position.lng,
        },
        title: marker.title,
      });
      this.markers.set(marker.id, nativeMarker);
    }
    return marker.id;
  }

  removeMarker(markerId: string): void {
    const marker = this.markers.get(markerId);
    if (marker && this.map) {
      this.map.removeMarker(marker);
      this.markers.delete(markerId);
    }
  }

  clearMarkers(): void {
    this.markers.forEach((marker) => {
      if (this.map) {
        this.map.removeMarker(marker);
      }
    });
    this.markers.clear();
  }

  destroy(): void {
    if (this.map) {
      this.map.destroy();
      this.map = null;
    }
    this.markers.clear();
  }
}
