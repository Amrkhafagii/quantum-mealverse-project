
import mapboxgl from 'mapbox-gl';
import { IMapService, MapMarker, MapBounds } from './IMapService';

export class WebMapService implements IMapService {
  private map: mapboxgl.Map | null = null;
  private markers: Map<string, mapboxgl.Marker> = new Map();

  async initializeMap(containerId: string, options: any = {}): Promise<void> {
    try {
      mapboxgl.accessToken = options.accessToken || 'your-mapbox-token';
      
      this.map = new mapboxgl.Map({
        container: containerId,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [options.center?.lng || -117.9, options.center?.lat || 33.6],
        zoom: options.zoom || 8,
      });

      this.map.addControl(new mapboxgl.NavigationControl());
    } catch (error) {
      console.error('Error initializing web map:', error);
    }
  }

  setCenter(position: { lat: number; lng: number }): void {
    if (this.map) {
      this.map.setCenter([position.lng, position.lat]);
    }
  }

  setZoom(zoom: number): void {
    if (this.map) {
      this.map.setZoom(zoom);
    }
  }

  fitBounds(bounds: MapBounds): void {
    if (this.map) {
      this.map.fitBounds([
        [bounds.west, bounds.south],
        [bounds.east, bounds.north]
      ]);
    }
  }

  addMarker(marker: MapMarker): string {
    if (this.map) {
      const mapboxMarker = new mapboxgl.Marker()
        .setLngLat([marker.position.lng, marker.position.lat])
        .addTo(this.map);

      if (marker.title) {
        const popup = new mapboxgl.Popup().setText(marker.title);
        mapboxMarker.setPopup(popup);
      }

      this.markers.set(marker.id, mapboxMarker);
    }
    return marker.id;
  }

  removeMarker(markerId: string): void {
    const marker = this.markers.get(markerId);
    if (marker) {
      marker.remove();
      this.markers.delete(markerId);
    }
  }

  clearMarkers(): void {
    this.markers.forEach((marker) => marker.remove());
    this.markers.clear();
  }

  destroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.markers.clear();
  }
}
