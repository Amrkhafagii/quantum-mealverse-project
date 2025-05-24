import { IMapService, MapViewOptions, MapMarker, MapCircle, MapPolyline, MapType, MapClickEvent, MapMarkerClickEvent } from './MapService';

export class WebMapService implements IMapService {
  private maps: Map<string, google.maps.Map> = new Map();
  private markers: Map<string, Map<string, google.maps.Marker>> = new Map();
  private circles: Map<string, Map<string, google.maps.Circle>> = new Map();
  private polylines: Map<string, Map<string, google.maps.Polyline>> = new Map();
  private eventListeners: Map<string, google.maps.MapsEventListener> = new Map();
  private apiLoaded: boolean = false;
  private apiLoadPromise: Promise<void> | null = null;
  
  // Add a cache for styled map types to avoid recreating them
  private styledMapCache: Map<string, google.maps.StyledMapType> = new Map();
  
  // Add a marker image cache to avoid recreating marker icons
  private markerIconCache: Map<string, google.maps.Icon> = new Map();
  
  constructor() {
    // Constructor is kept minimal for lazy initialization
  }
  
  /**
   * Ensures the Google Maps API is loaded before operations
   */
  private async ensureApiLoaded(): Promise<void> {
    if (this.apiLoaded) return;
    
    if (!this.apiLoadPromise) {
      this.apiLoadPromise = new Promise<void>((resolve, reject) => {
        // Check if the API is already loaded
        if (window.google && window.google.maps) {
          this.apiLoaded = true;
          resolve();
          return;
        }
        
        try {
          // API will be loaded by the bootstrapping process
          // This just waits for it to be available
          const checkInterval = setInterval(() => {
            if (window.google && window.google.maps) {
              clearInterval(checkInterval);
              this.apiLoaded = true;
              resolve();
            }
          }, 100);
          
          // Timeout after 10 seconds
          setTimeout(() => {
            clearInterval(checkInterval);
            reject(new Error('Google Maps API load timeout'));
          }, 10000);
        } catch (error) {
          reject(error);
        }
      });
    }
    
    return this.apiLoadPromise;
  }
  
  /**
   * Create a map instance
   */
  async createMap(elementId: string, options: MapViewOptions): Promise<string> {
    try {
      await this.ensureApiLoaded();
      
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with id ${elementId} not found`);
      }
      
      // Create map with performance optimizations
      const mapOptions: google.maps.MapOptions = {
        center: { lat: options.center.latitude, lng: options.center.longitude },
        zoom: options.zoom,
        mapTypeId: this.getGoogleMapType(options.mapType || 'standard'),
        disableDefaultUI: !options.enableControls,
        zoomControl: options.enableControls,
        mapTypeControl: options.enableControls,
        streetViewControl: false, // Disable street view for performance
        rotateControl: false,     // Disable 3D controls for performance
        fullscreenControl: options.enableControls,
        gestureHandling: options.enableControls ? 'auto' : 'none',
        // Performance optimizations
        maxZoom: 18, // Limit maximum zoom for performance
        clickableIcons: false, // Disable clickable POIs for performance
      };
      
      // Add lite mode for low performance mode
      if (options.liteMode) {
        // @ts-ignore - This is a valid option but not in the types
        mapOptions.mapTypeControl = false;
        mapOptions.zoomControl = false;
        mapOptions.draggable = false;
        mapOptions.disableDoubleClickZoom = true;
        mapOptions.scrollwheel = false;
      }
      
      // Create the map
      const map = new google.maps.Map(element, mapOptions);
      
      // Store map in collection
      const mapId = elementId;
      this.maps.set(mapId, map);
      this.markers.set(mapId, new Map());
      this.circles.set(mapId, new Map());
      this.polylines.set(mapId, new Map());
      
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
      
      // Return the map ID
      return mapId;
    } catch (error) {
      console.error('Error creating web map:', error);
      throw error;
    }
  }
  
  /**
   * Destroy a map instance and clean up resources
   */
  async destroyMap(mapId: string): Promise<void> {
    try {
      // Remove all markers
      const mapMarkers = this.markers.get(mapId);
      if (mapMarkers) {
        mapMarkers.forEach((marker) => marker.setMap(null));
        this.markers.delete(mapId);
      }
      
      // Remove all circles
      const mapCircles = this.circles.get(mapId);
      if (mapCircles) {
        mapCircles.forEach((circle) => circle.setMap(null));
        this.circles.delete(mapId);
      }
      
      // Remove all polylines
      const mapPolylines = this.polylines.get(mapId);
      if (mapPolylines) {
        mapPolylines.forEach((polyline) => polyline.setMap(null));
        this.polylines.delete(mapId);
      }
      
      // Remove all event listeners for this map
      const listenersToRemove = Array.from(this.eventListeners.entries())
        .filter(([id]) => id.startsWith(`${mapId}-`));
      
      for (const [id, listener] of listenersToRemove) {
        google.maps.event.removeListener(listener);
        this.eventListeners.delete(id);
      }
      
      // Remove map from collection
      this.maps.delete(mapId);
    } catch (error) {
      console.error('Error destroying web map:', error);
      throw error;
    }
  }
  
  /**
   * Set the camera position and zoom level
   */
  async setCamera(mapId: string, center: { latitude: number; longitude: number }, zoom?: number, animate?: boolean): Promise<void> {
    try {
      const map = this.getMap(mapId);
      
      const options: google.maps.CameraOptions = {
        center: { lat: center.latitude, lng: center.longitude }
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
    } catch (error) {
      console.error('Error setting camera:', error);
      throw error;
    }
  }
  
  /**
   * Set the map type
   */
  async setMapType(mapId: string, type: MapType): Promise<void> {
    try {
      const map = this.getMap(mapId);
      map.setMapTypeId(this.getGoogleMapType(type));
    } catch (error) {
      console.error('Error setting map type:', error);
      throw error;
    }
  }
  
  /**
   * Add a marker to the map
   */
  async addMarker(mapId: string, marker: MapMarker): Promise<string> {
    try {
      const map = this.getMap(mapId);
      const markersMap = this.markers.get(mapId);
      
      if (!markersMap) {
        throw new Error(`Markers collection not found for map ${mapId}`);
      }
      
      const markerId = marker.id || `${mapId}-marker-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Get or create marker icon
      const icon = this.getMarkerIcon(marker.type, marker.icon);
      
      // Create marker with options
      const googleMarker = new google.maps.Marker({
        position: { lat: marker.latitude, lng: marker.longitude },
        map,
        title: marker.title,
        icon,
        zIndex: marker.zIndex,
        // Add optimization to avoid reflows
        optimized: true,
        // Add animation only if not in low performance mode
        animation: undefined
      });
      
      // Store marker
      markersMap.set(markerId, googleMarker);
      
      return markerId;
    } catch (error) {
      console.error('Error adding web marker:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing marker
   */
  async updateMarker(mapId: string, markerId: string, marker: Partial<MapMarker>): Promise<void> {
    try {
      const markersMap = this.markers.get(mapId);
      
      if (!markersMap) {
        throw new Error(`Markers collection not found for map ${mapId}`);
      }
      
      const googleMarker = markersMap.get(markerId);
      
      if (!googleMarker) {
        throw new Error(`Marker with id ${markerId} not found on map ${mapId}`);
      }
      
      // Update position if provided
      if (marker.latitude !== undefined && marker.longitude !== undefined) {
        googleMarker.setPosition({ lat: marker.latitude, lng: marker.longitude });
      }
      
      // Update title if provided
      if (marker.title !== undefined) {
        googleMarker.setTitle(marker.title);
      }
      
      // Update icon if provided
      if (marker.icon !== undefined || marker.type !== undefined) {
        const icon = this.getMarkerIcon(marker.type, marker.icon);
        googleMarker.setIcon(icon);
      }
      
      // Update zIndex if provided
      if (marker.zIndex !== undefined) {
        googleMarker.setZIndex(marker.zIndex);
      }
    } catch (error) {
      console.error('Error updating web marker:', error);
      throw error;
    }
  }
  
  /**
   * Remove a marker from the map
   */
  async removeMarker(mapId: string, markerId: string): Promise<void> {
    try {
      const markersMap = this.markers.get(mapId);
      
      if (!markersMap) {
        throw new Error(`Markers collection not found for map ${mapId}`);
      }
      
      const googleMarker = markersMap.get(markerId);
      
      if (!googleMarker) {
        throw new Error(`Marker with id ${markerId} not found on map ${mapId}`);
      }
      
      // Remove marker from map
      googleMarker.setMap(null);
      
      // Remove marker from collection
      markersMap.delete(markerId);
    } catch (error) {
      console.error('Error removing web marker:', error);
      throw error;
    }
  }
  
  /**
   * Add a circle to the map
   */
  async addCircle(mapId: string, circle: MapCircle): Promise<string> {
    try {
      const map = this.getMap(mapId);
      const circlesMap = this.circles.get(mapId);
      
      if (!circlesMap) {
        throw new Error(`Circles collection not found for map ${mapId}`);
      }
      
      const circleId = `${mapId}-circle-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Create circle with options
      const googleCircle = new google.maps.Circle({
        map,
        center: { lat: circle.center.latitude, lng: circle.center.longitude },
        radius: circle.radius,
        strokeColor: circle.strokeColor,
        strokeWeight: circle.strokeWidth,
        fillColor: circle.fillColor,
        fillOpacity: circle.fillOpacity,
        // Add optimization to avoid reflows
        clickable: false
      });
      
      // Store circle
      circlesMap.set(circleId, googleCircle);
      
      return circleId;
    } catch (error) {
      console.error('Error adding web circle:', error);
      throw error;
    }
  }
  
  /**
   * Remove a circle from the map
   */
  async removeCircle(mapId: string, circleId: string): Promise<void> {
    try {
      const circlesMap = this.circles.get(mapId);
      
      if (!circlesMap) {
        throw new Error(`Circles collection not found for map ${mapId}`);
      }
      
      const googleCircle = circlesMap.get(circleId);
      
      if (!googleCircle) {
        throw new Error(`Circle with id ${circleId} not found on map ${mapId}`);
      }
      
      // Remove circle from map
      googleCircle.setMap(null);
      
      // Remove circle from collection
      circlesMap.delete(circleId);
    } catch (error) {
      console.error('Error removing web circle:', error);
      throw error;
    }
  }
  
  /**
   * Add a polyline to the map
   */
  async addPolyline(mapId: string, polyline: MapPolyline): Promise<string> {
    try {
      const map = this.getMap(mapId);
      const polylinesMap = this.polylines.get(mapId);
      
      if (!polylinesMap) {
        throw new Error(`Polylines collection not found for map ${mapId}`);
      }
      
      const polylineId = `${mapId}-polyline-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Create path from points
      const path = polyline.points.map(point => ({
        lat: point.latitude,
        lng: point.longitude
      }));
      
      // Create polyline with options
      const googlePolyline = new google.maps.Polyline({
        map,
        path,
        strokeColor: polyline.strokeColor,
        strokeWeight: polyline.strokeWidth,
        geodesic: polyline.geodesic !== false,
        // Add optimization to avoid reflows
        clickable: false
      });
      
      // Store polyline
      polylinesMap.set(polylineId, googlePolyline);
      
      return polylineId;
    } catch (error) {
      console.error('Error adding web polyline:', error);
      throw error;
    }
  }
  
  /**
   * Remove a polyline from the map
   */
  async removePolyline(mapId: string, polylineId: string): Promise<void> {
    try {
      const polylinesMap = this.polylines.get(mapId);
      
      if (!polylinesMap) {
        throw new Error(`Polylines collection not found for map ${mapId}`);
      }
      
      const googlePolyline = polylinesMap.get(polylineId);
      
      if (!googlePolyline) {
        throw new Error(`Polyline with id ${polylineId} not found on map ${mapId}`);
      }
      
      // Remove polyline from map
      googlePolyline.setMap(null);
      
      // Remove polyline from collection
      polylinesMap.delete(polylineId);
    } catch (error) {
      console.error('Error removing web polyline:', error);
      throw error;
    }
  }
  
  /**
   * Add a click listener to the map
   */
  addMapClickListener(mapId: string, listener: (event: MapClickEvent) => void): string {
    try {
      const map = this.getMap(mapId);
      const listenerId = `${mapId}-click-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Add click listener
      const googleListener = map.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          const mapEvent: MapClickEvent = {
            latitude: event.latLng.lat(),
            longitude: event.latLng.lng(),
            timestamp: Date.now()
          };
          
          listener(mapEvent);
        }
      });
      
      // Store listener
      this.eventListeners.set(listenerId, googleListener);
      
      return listenerId;
    } catch (error) {
      console.error('Error adding map click listener:', error);
      throw error;
    }
  }
  
  /**
   * Add a marker click listener
   */
  addMarkerClickListener(mapId: string, listener: (event: MapMarkerClickEvent) => void): string {
    try {
      const markersMap = this.markers.get(mapId);
      
      if (!markersMap) {
        throw new Error(`Markers collection not found for map ${mapId}`);
      }
      
      const listenerId = `${mapId}-marker-click-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const googleListeners: google.maps.MapsEventListener[] = [];
      
      // Add click listener to each marker
      markersMap.forEach((marker, id) => {
        const googleListener = marker.addListener('click', () => {
          const position = marker.getPosition();
          
          if (position) {
            const mapEvent: MapMarkerClickEvent = {
              markerId: id,
              latitude: position.lat(),
              longitude: position.lng()
            };
            
            listener(mapEvent);
          }
        });
        
        googleListeners.push(googleListener);
      });
      
      // Store composite listener
      this.eventListeners.set(listenerId, {
        remove: () => {
          googleListeners.forEach(l => google.maps.event.removeListener(l));
        }
      } as google.maps.MapsEventListener);
      
      return listenerId;
    } catch (error) {
      console.error('Error adding marker click listener:', error);
      throw error;
    }
  }
  
  /**
   * Remove an event listener
   */
  removeEventListener(listenerId: string): void {
    try {
      const listener = this.eventListeners.get(listenerId);
      
      if (listener) {
        google.maps.event.removeListener(listener);
        this.eventListeners.delete(listenerId);
      }
    } catch (error) {
      console.error('Error removing event listener:', error);
    }
  }
  
  /**
   * Get Google Maps map type from our map type
   */
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
  
  /**
   * Get marker icon based on type
   */
  private getMarkerIcon(type?: string, customIcon?: string): google.maps.Icon | string | undefined {
    // Use custom icon if provided
    if (customIcon) {
      return customIcon;
    }
    
    // Return cached icon if available
    const cacheKey = `marker-${type || 'default'}`;
    if (this.markerIconCache.has(cacheKey)) {
      return this.markerIconCache.get(cacheKey);
    }
    
    // Create icon based on marker type
    let icon: google.maps.Icon | string;
    
    switch (type) {
      case 'restaurant':
        icon = {
          url: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
        };
        break;
      case 'customer':
        icon = {
          url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        };
        break;
      case 'driver':
        icon = {
          url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
        };
        break;
      default:
        icon = {
          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
        };
    }
    
    // Cache the icon
    this.markerIconCache.set(cacheKey, icon);
    
    return icon;
  }
  
  /**
   * Get map instance by ID
   */
  private getMap(mapId: string): google.maps.Map {
    const map = this.maps.get(mapId);
    
    if (!map) {
      throw new Error(`Map with id ${mapId} not found`);
    }
    
    return map;
  }
}
