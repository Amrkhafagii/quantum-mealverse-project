
import { IMapService, MapViewOptions, MapMarker, MapCircle, MapPolyline, MapType, MapClickEvent, MapMarkerClickEvent } from './MapService';
import { CapacitorGoogleMaps } from '@capacitor-community/capacitor-googlemaps-native';

export class NativeMapService implements IMapService {
  private maps: Map<string, any> = new Map();
  private eventListeners: Map<string, { type: string, callback: any }> = new Map();
  
  async createMap(elementId: string, options: MapViewOptions): Promise<string> {
    try {
      // Get element bounds
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with id ${elementId} not found`);
      }
      
      const boundingRect = element.getBoundingClientRect();
      
      // Create native map
      const map = await CapacitorGoogleMaps.create({
        width: boundingRect.width,
        height: boundingRect.height,
        x: boundingRect.x,
        y: boundingRect.y,
        latitude: options.center.latitude,
        longitude: options.center.longitude,
        zoom: options.zoom,
        liteMode: options.liteMode || false
      });
      
      const mapId = elementId;
      this.maps.set(mapId, map);
      
      // Add markers if provided
      if (options.markers) {
        for (const marker of options.markers) {
          await this.addMarker(mapId, marker);
        }
      }
      
      // Add circles if provided
      if (options.circles) {
        for (const circle of options.circles) {
          await this.addCircle(mapId, circle);
        }
      }
      
      // Set map type if provided
      if (options.mapType) {
        await this.setMapType(mapId, options.mapType);
      }
      
      // Return the map ID
      return mapId;
    } catch (error) {
      console.error('Error creating native map:', error);
      throw error;
    }
  }
  
  async destroyMap(mapId: string): Promise<void> {
    const map = this.getMap(mapId);
    
    try {
      // Destroy the map
      await map.destroy();
      
      // Clean up event listeners
      const listenersToRemove = Array.from(this.eventListeners.keys())
        .filter(id => id.startsWith(`${mapId}-`));
        
      for (const id of listenersToRemove) {
        this.removeEventListener(id);
      }
      
      // Remove from maps collection
      this.maps.delete(mapId);
    } catch (error) {
      console.error('Error destroying native map:', error);
      throw error;
    }
  }
  
  async setCamera(mapId: string, center: { latitude: number; longitude: number }, zoom?: number, animate?: boolean): Promise<void> {
    try {
      const options: any = {
        latitude: center.latitude,
        longitude: center.longitude
      };
      
      if (zoom !== undefined) {
        options.zoom = zoom;
      }
      
      if (animate !== undefined) {
        options.animate = animate;
        options.animationDuration = 500;
      }
      
      await CapacitorGoogleMaps.setCamera(options);
    } catch (error) {
      console.error('Error setting camera:', error);
      throw error;
    }
  }
  
  async setMapType(mapId: string, type: MapType): Promise<void> {
    try {
      await CapacitorGoogleMaps.setMapType({
        type: this.getNativeMapType(type)
      });
    } catch (error) {
      console.error('Error setting map type:', error);
      throw error;
    }
  }
  
  async addMarker(mapId: string, marker: MapMarker): Promise<string> {
    const map = this.getMap(mapId);
    
    try {
      const markerId = marker.id || `${mapId}-marker-${Date.now()}`;
      
      await map.addMarker({
        id: markerId,
        coordinate: {
          lat: marker.latitude,
          lng: marker.longitude
        },
        title: marker.title || '',
        snippet: marker.description || '',
        iconUrl: marker.icon || this.getMarkerIcon(marker.type),
        zIndex: marker.zIndex || 0
      });
      
      return markerId;
    } catch (error) {
      console.error('Error adding native marker:', error);
      throw error;
    }
  }
  
  async updateMarker(mapId: string, markerId: string, marker: Partial<MapMarker>): Promise<void> {
    try {
      const map = this.getMap(mapId);
      const options: any = { id: markerId };
      
      if (marker.latitude !== undefined && marker.longitude !== undefined) {
        options.coordinate = {
          lat: marker.latitude,
          lng: marker.longitude
        };
      }
      
      if (marker.title !== undefined) {
        options.title = marker.title;
      }
      
      if (marker.description !== undefined) {
        options.snippet = marker.description;
      }
      
      if (marker.icon !== undefined || marker.type !== undefined) {
        options.iconUrl = marker.icon || this.getMarkerIcon(marker.type);
      }
      
      if (marker.zIndex !== undefined) {
        options.zIndex = marker.zIndex;
      }
      
      // Use the map instance to update the marker
      await map.updateMarker(options);
    } catch (error) {
      console.error('Error updating native marker:', error);
      throw error;
    }
  }
  
  async removeMarker(mapId: string, markerId: string): Promise<void> {
    try {
      const map = this.getMap(mapId);
      await map.removeMarker({ id: markerId });
    } catch (error) {
      console.error('Error removing native marker:', error);
      throw error;
    }
  }
  
  async addCircle(mapId: string, circle: MapCircle): Promise<string> {
    const map = this.getMap(mapId);
    
    try {
      const circleId = `${mapId}-circle-${Date.now()}`;
      
      await map.addCircle({
        id: circleId,
        center: {
          lat: circle.center.latitude,
          lng: circle.center.longitude
        },
        radius: circle.radius,
        strokeColor: circle.strokeColor,
        strokeWidth: circle.strokeWidth,
        fillColor: circle.fillColor,
        fillOpacity: circle.fillOpacity
      });
      
      return circleId;
    } catch (error) {
      console.error('Error adding native circle:', error);
      throw error;
    }
  }
  
  async removeCircle(mapId: string, circleId: string): Promise<void> {
    try {
      const map = this.getMap(mapId);
      await map.removeCircle({ id: circleId });
    } catch (error) {
      console.error('Error removing native circle:', error);
      throw error;
    }
  }
  
  async addPolyline(mapId: string, polyline: MapPolyline): Promise<string> {
    const map = this.getMap(mapId);
    
    try {
      const polylineId = `${mapId}-polyline-${Date.now()}`;
      
      const points = polyline.points.map(point => ({
        lat: point.latitude,
        lng: point.longitude
      }));
      
      await map.addPolyline({
        id: polylineId,
        points,
        strokeColor: polyline.strokeColor,
        strokeWidth: polyline.strokeWidth,
        geodesic: polyline.geodesic !== false
      });
      
      return polylineId;
    } catch (error) {
      console.error('Error adding native polyline:', error);
      throw error;
    }
  }
  
  async removePolyline(mapId: string, polylineId: string): Promise<void> {
    try {
      const map = this.getMap(mapId);
      await map.removePolyline({ id: polylineId });
    } catch (error) {
      console.error('Error removing native polyline:', error);
      throw error;
    }
  }
  
  addMapClickListener(mapId: string, listener: (event: MapClickEvent) => void): string {
    const map = this.getMap(mapId);
    const listenerId = `${mapId}-listener-click-${Date.now()}`;
    
    try {
      // Add click listener
      const subscription = map.setOnMapClickListener((event: any) => {
        const mapEvent: MapClickEvent = {
          latitude: event.latitude,
          longitude: event.longitude,
          timestamp: Date.now()
        };
        
        listener(mapEvent);
      });
      
      this.eventListeners.set(listenerId, { type: 'click', callback: subscription });
      
      return listenerId;
    } catch (error) {
      console.error('Error adding map click listener:', error);
      throw error;
    }
  }
  
  addMarkerClickListener(mapId: string, listener: (event: MapMarkerClickEvent) => void): string {
    const map = this.getMap(mapId);
    const listenerId = `${mapId}-listener-marker-click-${Date.now()}`;
    
    try {
      // Add marker click listener
      const subscription = map.setOnMarkerClickListener((event: any) => {
        const mapEvent: MapMarkerClickEvent = {
          markerId: event.markerId,
          latitude: event.latitude,
          longitude: event.longitude
        };
        
        listener(mapEvent);
      });
      
      this.eventListeners.set(listenerId, { type: 'marker-click', callback: subscription });
      
      return listenerId;
    } catch (error) {
      console.error('Error adding marker click listener:', error);
      throw error;
    }
  }
  
  removeEventListener(listenerId: string): void {
    const listener = this.eventListeners.get(listenerId);
    if (listener) {
      if (typeof listener.callback === 'function') {
        listener.callback();
      }
      this.eventListeners.delete(listenerId);
    }
  }
  
  private getMap(mapId: string): any {
    const map = this.maps.get(mapId);
    if (!map) {
      throw new Error(`Map with id ${mapId} not found`);
    }
    return map;
  }
  
  private getMarkerIcon(type?: string): string {
    switch (type) {
      case 'restaurant':
        return 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
      case 'customer':
        return 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png';
      case 'driver':
        return 'https://maps.google.com/mapfiles/ms/icons/green-dot.png';
      default:
        return 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
    }
  }
  
  private getNativeMapType(type: MapType): string {
    switch (type) {
      case 'satellite':
        return 'satellite';
      case 'hybrid':
        return 'hybrid';
      case 'terrain':
        return 'terrain';
      case 'standard':
      default:
        return 'normal';
    }
  }
}
