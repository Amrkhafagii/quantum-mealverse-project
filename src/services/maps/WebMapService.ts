
import { IMapService, MapViewOptions, MapMarker, MapCircle, MapPolyline, MapType, MapClickEvent, MapMarkerClickEvent } from './MapService';

// Type definitions for Google Maps
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export class WebMapService implements IMapService {
  private maps: Map<string, google.maps.Map> = new Map();
  private markers: Map<string, google.maps.Marker> = new Map();
  private circles: Map<string, google.maps.Circle> = new Map();
  private polylines: Map<string, google.maps.Polyline> = new Map();
  private eventListeners: Map<string, { target: any, eventName: string, listener: any }> = new Map();
  
  async createMap(elementId: string, options: MapViewOptions): Promise<string> {
    try {
      // Make sure Google Maps is loaded
      await this.ensureGoogleMapsLoaded();
      
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with id ${elementId} not found`);
      }
      
      // Create the map
      const mapOptions = {
        center: { lat: options.center.latitude, lng: options.center.longitude },
        zoom: options.zoom,
        mapTypeId: this.getGoogleMapType(options.mapType || 'standard'),
        disableDefaultUI: !options.enableControls,
        zoomControl: options.enableControls,
        mapTypeControl: options.enableControls,
        scaleControl: options.enableControls,
        streetViewControl: options.enableControls,
        rotateControl: options.enableControls,
        fullscreenControl: options.enableControls,
        gestureHandling: options.enableControls ? 'auto' : 'none',
        styles: this.getMapStyles(options.liteMode)
      };
      
      const map = new google.maps.Map(element, mapOptions);
      
      // Generate a unique map ID
      const mapId = `web-map-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
      
      // Add polylines if provided
      if (options.polylines) {
        for (const polyline of options.polylines) {
          await this.addPolyline(mapId, polyline);
        }
      }
      
      // Show traffic if requested
      if (options.showTraffic) {
        const trafficLayer = new google.maps.TrafficLayer();
        trafficLayer.setMap(map);
      }
      
      return mapId;
    } catch (error) {
      console.error('Error creating map:', error);
      throw error;
    }
  }
  
  async destroyMap(mapId: string): Promise<void> {
    // Remove all markers, circles, and polylines
    const markersToRemove = Array.from(this.markers.entries())
      .filter(([id, marker]) => id.startsWith(`${mapId}-`))
      .map(([id]) => id);
      
    for (const id of markersToRemove) {
      await this.removeMarker(mapId, id);
    }
    
    const circlesToRemove = Array.from(this.circles.entries())
      .filter(([id, circle]) => id.startsWith(`${mapId}-`))
      .map(([id]) => id);
      
    for (const id of circlesToRemove) {
      await this.removeCircle(mapId, id);
    }
    
    const polylinesToRemove = Array.from(this.polylines.entries())
      .filter(([id, polyline]) => id.startsWith(`${mapId}-`))
      .map(([id]) => id);
      
    for (const id of polylinesToRemove) {
      await this.removePolyline(mapId, id);
    }
    
    // Remove event listeners
    const listenersToRemove = Array.from(this.eventListeners.entries())
      .filter(([id, listener]) => id.startsWith(`${mapId}-`))
      .map(([id]) => id);
      
    for (const id of listenersToRemove) {
      this.removeEventListener(id);
    }
    
    // No explicit cleanup for Google Maps instances
    this.maps.delete(mapId);
  }
  
  async setCamera(mapId: string, center: { latitude: number; longitude: number }, zoom?: number, animate?: boolean): Promise<void> {
    const map = this.getMap(mapId);
    
    const options: google.maps.CameraOptions = {
      center: { lat: center.latitude, lng: center.longitude },
    };
    
    if (zoom !== undefined) {
      options.zoom = zoom;
    }
    
    if (animate) {
      map.panTo(options.center);
      if (zoom !== undefined) {
        map.setZoom(zoom);
      }
    } else {
      map.setCenter(options.center);
      if (zoom !== undefined) {
        map.setZoom(zoom);
      }
    }
  }
  
  async setMapType(mapId: string, type: MapType): Promise<void> {
    const map = this.getMap(mapId);
    map.setMapTypeId(this.getGoogleMapType(type));
  }
  
  async addMarker(mapId: string, marker: MapMarker): Promise<string> {
    const map = this.getMap(mapId);
    
    const markerOptions: google.maps.MarkerOptions = {
      position: { lat: marker.latitude, lng: marker.longitude },
      map,
      title: marker.title,
      zIndex: marker.zIndex,
      icon: marker.icon || this.getMarkerIcon(marker.type)
    };
    
    const googleMarker = new google.maps.Marker(markerOptions);
    
    // If description is provided, add an info window
    if (marker.description) {
      const infoWindow = new google.maps.InfoWindow({
        content: marker.description
      });
      
      googleMarker.addListener('click', () => {
        infoWindow.open(map, googleMarker);
      });
    }
    
    // Generate a marker ID
    const markerId = marker.id || `${mapId}-marker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.markers.set(markerId, googleMarker);
    
    return markerId;
  }
  
  async updateMarker(mapId: string, markerId: string, marker: Partial<MapMarker>): Promise<void> {
    const googleMarker = this.getMarker(markerId);
    
    if (marker.latitude !== undefined || marker.longitude !== undefined) {
      const position = googleMarker.getPosition() || { lat: 0, lng: 0 };
      googleMarker.setPosition({
        lat: marker.latitude !== undefined ? marker.latitude : position.lat(),
        lng: marker.longitude !== undefined ? marker.longitude : position.lng()
      });
    }
    
    if (marker.title !== undefined) {
      googleMarker.setTitle(marker.title);
    }
    
    if (marker.zIndex !== undefined) {
      googleMarker.setZIndex(marker.zIndex);
    }
    
    if (marker.icon !== undefined || marker.type !== undefined) {
      googleMarker.setIcon(marker.icon || this.getMarkerIcon(marker.type));
    }
  }
  
  async removeMarker(mapId: string, markerId: string): Promise<void> {
    const marker = this.markers.get(markerId);
    if (marker) {
      marker.setMap(null);
      this.markers.delete(markerId);
    }
  }
  
  async addCircle(mapId: string, circle: MapCircle): Promise<string> {
    const map = this.getMap(mapId);
    
    const circleOptions: google.maps.CircleOptions = {
      map,
      center: { lat: circle.center.latitude, lng: circle.center.longitude },
      radius: circle.radius,
      strokeColor: circle.strokeColor,
      strokeWeight: circle.strokeWidth,
      fillColor: circle.fillColor,
      fillOpacity: circle.fillOpacity
    };
    
    const googleCircle = new google.maps.Circle(circleOptions);
    
    // Generate a circle ID
    const circleId = `${mapId}-circle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.circles.set(circleId, googleCircle);
    
    return circleId;
  }
  
  async removeCircle(mapId: string, circleId: string): Promise<void> {
    const circle = this.circles.get(circleId);
    if (circle) {
      circle.setMap(null);
      this.circles.delete(circleId);
    }
  }
  
  async addPolyline(mapId: string, polyline: MapPolyline): Promise<string> {
    const map = this.getMap(mapId);
    
    const path = polyline.points.map(point => ({
      lat: point.latitude,
      lng: point.longitude
    }));
    
    const polylineOptions: google.maps.PolylineOptions = {
      map,
      path,
      strokeColor: polyline.strokeColor,
      strokeWeight: polyline.strokeWidth,
      geodesic: polyline.geodesic !== false
    };
    
    const googlePolyline = new google.maps.Polyline(polylineOptions);
    
    // Generate a polyline ID
    const polylineId = `${mapId}-polyline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.polylines.set(polylineId, googlePolyline);
    
    return polylineId;
  }
  
  async removePolyline(mapId: string, polylineId: string): Promise<void> {
    const polyline = this.polylines.get(polylineId);
    if (polyline) {
      polyline.setMap(null);
      this.polylines.delete(polylineId);
    }
  }
  
  addMapClickListener(mapId: string, listener: (event: MapClickEvent) => void): string {
    const map = this.getMap(mapId);
    
    const googleListener = map.addListener('click', (event: google.maps.MapMouseEvent) => {
      const mapEvent: MapClickEvent = {
        latitude: event.latLng.lat(),
        longitude: event.latLng.lng(),
        timestamp: Date.now()
      };
      
      listener(mapEvent);
    });
    
    const listenerId = `${mapId}-listener-click-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.eventListeners.set(listenerId, { target: map, eventName: 'click', listener: googleListener });
    
    return listenerId;
  }
  
  addMarkerClickListener(mapId: string, listener: (event: MapMarkerClickEvent) => void): string {
    // Add click listeners to all markers for this map
    const markersForMap = Array.from(this.markers.entries())
      .filter(([id]) => id.startsWith(`${mapId}-`));
    
    const listenerId = `${mapId}-listener-marker-click-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    markersForMap.forEach(([markerId, googleMarker]) => {
      const googleListener = googleMarker.addListener('click', () => {
        const position = googleMarker.getPosition();
        const mapEvent: MapMarkerClickEvent = {
          markerId,
          latitude: position.lat(),
          longitude: position.lng()
        };
        
        listener(mapEvent);
      });
      
      this.eventListeners.set(`${listenerId}-${markerId}`, { target: googleMarker, eventName: 'click', listener: googleListener });
    });
    
    return listenerId;
  }
  
  removeEventListener(listenerId: string): void {
    const listener = this.eventListeners.get(listenerId);
    if (listener) {
      google.maps.event.removeListener(listener.listener);
      this.eventListeners.delete(listenerId);
    }
    
    // Also remove any child listeners
    const childListeners = Array.from(this.eventListeners.entries())
      .filter(([id]) => id.startsWith(`${listenerId}-`))
      .map(([id]) => id);
      
    for (const id of childListeners) {
      const childListener = this.eventListeners.get(id);
      if (childListener) {
        google.maps.event.removeListener(childListener.listener);
        this.eventListeners.delete(id);
      }
    }
  }
  
  private getMap(mapId: string): google.maps.Map {
    const map = this.maps.get(mapId);
    if (!map) {
      throw new Error(`Map with id ${mapId} not found`);
    }
    return map;
  }
  
  private getMarker(markerId: string): google.maps.Marker {
    const marker = this.markers.get(markerId);
    if (!marker) {
      throw new Error(`Marker with id ${markerId} not found`);
    }
    return marker;
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
  
  private getGoogleMapType(type: MapType): google.maps.MapTypeId {
    switch (type) {
      case 'satellite':
        return google.maps.MapTypeId.SATELLITE;
      case 'hybrid':
        return google.maps.MapTypeId.HYBRID;
      case 'terrain':
        return google.maps.MapTypeId.TERRAIN;
      case 'standard':
      default:
        return google.maps.MapTypeId.ROADMAP;
    }
  }
  
  private getMapStyles(liteMode: boolean = false): google.maps.MapTypeStyle[] {
    if (liteMode) {
      return [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
        { featureType: 'administrative', elementType: 'labels', stylers: [{ visibility: 'simplified' }] }
      ];
    } else {
      return [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] }
      ];
    }
  }
  
  private async ensureGoogleMapsLoaded(): Promise<void> {
    if (window.google && window.google.maps) {
      return;
    }
    
    return new Promise((resolve, reject) => {
      const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.defer = true;
      script.async = true;
      
      script.onload = () => {
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Google Maps API'));
      };
      
      document.head.appendChild(script);
    });
  }
}
