import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Platform } from '@/utils/platform';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation2 } from 'lucide-react';
import TouchEnabledMap from './TouchEnabledMap';
import { useMapView, defaultPosition } from '@/contexts/MapViewContext';
import debounce from 'lodash/debounce';

// Define a simple interface for the Google Maps plugin
interface CapacitorGoogleMapsPlugin {
  create: (options: MapOptions) => Promise<void>;
  addMarker: (mapId: string, options: MarkerOptions) => Promise<string>;
  addPolyline: (mapId: string, options: PolylineOptions) => Promise<void>;
  setCamera: (mapId: string, options: CameraOptions) => Promise<void>;
  setOnMapClickListener: (mapId: string, callback: (event: any) => void) => Promise<void>;
  setOnMarkerClickListener: (mapId: string, callback: (event: any) => void) => Promise<void>;
  destroy?: (mapId: string) => Promise<void>;
  removeMarker?: (mapId: string, markerId: string) => Promise<void>;
  removeMarkers?: (mapId: string) => Promise<void>;
  hideInfoWindow?: (mapId: string) => Promise<void>;
  fitBounds?: (mapId: string, bounds: BoundsOptions) => Promise<void>;
}

// Define interfaces for the parameters
interface MapOptions {
  width: number;
  height: number;
  x: number;
  y: number;
  zoom?: number;
  element?: HTMLElement;
  forceCreate?: boolean;
  id?: string;
  // Added for our implementation but not in the original type
  center?: { lat: number, lng: number };
}

interface MarkerOptions {
  latitude: number;
  longitude: number;
  title?: string;
  snippet?: string;
  iconUrl?: string;
  animation?: string;
}

interface CameraOptions {
  latitude: number;
  longitude: number;
  zoom?: number;
  animate?: boolean;
  animationDuration?: number;
}

interface PolylineOptions {
  points: Array<{latitude: number, longitude: number}>;
  color?: string;
  width?: number;
}

interface BoundsOptions {
  points: Array<{latitude: number, longitude: number}>;
  padding?: {top: number, bottom: number, left: number, right: number};
}

// Mock the Google Maps plugin for now
const CapacitorGoogleMaps: CapacitorGoogleMapsPlugin = {
  create: async (options) => {
    console.log('Creating map with options:', options);
    // Implementation would be provided by the actual plugin
  },
  addMarker: async (mapId, options) => {
    console.log('Adding marker to map:', mapId, options);
    return 'marker-id';
  },
  addPolyline: async (mapId, options) => {
    console.log('Adding polyline to map:', mapId, options);
  },
  setCamera: async (mapId, options) => {
    console.log('Setting camera for map:', mapId, options);
  },
  setOnMapClickListener: async (mapId, callback) => {
    console.log('Setting map click listener for map:', mapId);
  },
  setOnMarkerClickListener: async (mapId, callback) => {
    console.log('Setting marker click listener for map:', mapId);
  }
};

interface MapLocation {
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  type?: 'driver' | 'restaurant' | 'customer' | 'generic';
}

interface NativeMapProps {
  driverLocation?: MapLocation | null;
  restaurantLocation?: MapLocation | null;
  customerLocation?: MapLocation | null;
  additionalMarkers?: MapLocation[];
  showRoute?: boolean;
  className?: string;
  zoom?: number;
  autoCenter?: boolean;
  onMapClick?: (location: { longitude: number, latitude: number }) => void;
  isInteractive?: boolean;
  mapId?: string;
  onMapLoad?: () => void;
}

// Batch update manager for native map
class MapBatchManager {
  private batchTimeout: NodeJS.Timeout | null = null;
  private interval: number = 200;
  private pendingMarkers: Record<string, MapLocation> = {};
  private pendingRemovals: string[] = [];
  private updateCallback: ((markers: Record<string, MapLocation>, removals: string[]) => void) | null = null;
  
  constructor(interval?: number) {
    if (interval) this.interval = interval;
  }
  
  setUpdateCallback(callback: (markers: Record<string, MapLocation>, removals: string[]) => void) {
    this.updateCallback = callback;
  }
  
  clearUpdateCallback() {
    this.updateCallback = null;
  }
  
  addMarker(id: string, location: MapLocation) {
    this.pendingMarkers[id] = location;
    this.scheduleBatch();
  }
  
  removeMarker(id: string) {
    // Remove from pending markers if present
    if (this.pendingMarkers[id]) {
      delete this.pendingMarkers[id];
    }
    // Add to pending removals
    this.pendingRemovals.push(id);
    this.scheduleBatch();
  }
  
  private scheduleBatch() {
    if (this.batchTimeout !== null) {
      return;
    }
    
    this.batchTimeout = setTimeout(() => {
      this.processBatch();
    }, this.interval);
  }
  
  private processBatch() {
    if (this.updateCallback) {
      this.updateCallback(this.pendingMarkers, this.pendingRemovals);
    }
    
    // Clear pending data
    this.pendingMarkers = {};
    this.pendingRemovals = [];
    this.batchTimeout = null;
  }
}

const NativeMap: React.FC<NativeMapProps> = ({
  driverLocation,
  restaurantLocation,
  customerLocation,
  additionalMarkers = [],
  showRoute = false,
  className = 'h-[400px]',
  zoom = 13,
  autoCenter = true,
  onMapClick,
  isInteractive = true,
  mapId = 'default-map',
  onMapLoad
}) => {
  const { googleMapsApiKey } = useGoogleMaps();
  const { getSavedPosition, savePosition } = useMapView();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceId = useRef(`map-${mapId}-${Math.random().toString(36).substring(2, 9)}`);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasOpenInfoWindow, setHasOpenInfoWindow] = useState(false);
  const [markers, setMarkers] = useState<string[]>([]);
  
  // Create a batch manager instance
  const batchManagerRef = useRef<MapBatchManager>(new MapBatchManager());
  
  // Save map position with debounce
  const debouncedSavePosition = useCallback(
    debounce((center: {lat: number, lng: number}, zoom: number) => {
      savePosition(mapId, { center, zoom });
    }, 500),
    [savePosition, mapId]
  );
  
  // Initialize the map
  useEffect(() => {
    if (!mapRef.current || !googleMapsApiKey || !Capacitor.isNativePlatform()) return;
    
    const createMap = async () => {
      try {
        if (mapRef.current) {
          const boundingRect = mapRef.current.getBoundingClientRect();
          
          // Get initial position from saved state if available
          const savedPosition = getSavedPosition(mapId);
          const initialZoom = savedPosition ? savedPosition.zoom : zoom;
          const initialCenter = savedPosition ? savedPosition.center : defaultPosition.center;
          
          // Create the map element
          await CapacitorGoogleMaps.create({
            width: Math.round(boundingRect.width),
            height: Math.round(boundingRect.height),
            x: Math.round(boundingRect.x),
            y: Math.round(boundingRect.y),
            zoom: initialZoom,
            center: initialCenter, // Use saved position
            // apiKey is not in the type but we'll keep it in our implementation
            // and handle it in the actual plugin
            element: mapRef.current,
            forceCreate: true,
            id: mapInstanceId.current
          });
          
          // Set up position change listener to save map position
          // Note: This would need to be implemented in the actual plugin
          // For now we'll just simulate it with a placeholder
          
          // Add click listener
          if (isInteractive && onMapClick) {
            await CapacitorGoogleMaps.setOnMapClickListener(mapInstanceId.current, (event) => {
              if (onMapClick) {
                onMapClick({
                  latitude: event.latitude,
                  longitude: event.longitude
                });
              }
              
              // Also capture position for saving
              debouncedSavePosition(
                { lat: event.latitude, lng: event.longitude },
                initialZoom
              );
            });
          }
          
          // Add marker click listener
          await CapacitorGoogleMaps.setOnMarkerClickListener(mapInstanceId.current, (event) => {
            console.log('Marker clicked:', event);
            setHasOpenInfoWindow(true);
          });
          
          setMapInitialized(true);
          if (onMapLoad) onMapLoad();
        }
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Failed to initialize native map');
      }
    };
    
    createMap();
    
    // Clean up the map on unmount
    return () => {
      if (mapInitialized) {
        // Use destroy if available, otherwise just log
        if (CapacitorGoogleMaps.destroy) {
          CapacitorGoogleMaps.destroy(mapInstanceId.current)
            .catch(err => console.error('Error removing map:', err));
        } else {
          console.log('Map would be destroyed here:', mapInstanceId.current);
        }
      }
    };
  }, [googleMapsApiKey, zoom, onMapClick, isInteractive, getSavedPosition, mapId, debouncedSavePosition, onMapLoad]);
  
  // Set up batch manager
  useEffect(() => {
    const batchManager = batchManagerRef.current;
    
    // Set up batch update handler
    batchManager.setUpdateCallback(async (pendingMarkers, pendingRemovals) => {
      if (!mapInitialized) return;
      
      try {
        // First handle removals
        for (const markerId of pendingRemovals) {
          if (CapacitorGoogleMaps.removeMarker) {
            await CapacitorGoogleMaps.removeMarker(mapInstanceId.current, markerId);
          }
        }
        
        // Then handle additions/updates
        const newMarkers = [...markers];
        
        for (const [key, location] of Object.entries(pendingMarkers)) {
          if (!location) continue;
          
          const markerId = await CapacitorGoogleMaps.addMarker(mapInstanceId.current, {
            latitude: location.latitude,
            longitude: location.longitude,
            title: location.title || 'Location',
            snippet: location.description || '',
            iconUrl: getIconUrlForType(location.type || 'generic')
          });
          
          newMarkers.push(markerId);
        }
        
        setMarkers(newMarkers);
        
        // If we should show route and have updated positions, update the route
        if (showRoute && pendingMarkers['driver'] && 
           (pendingMarkers['customer'] || pendingMarkers['restaurant'])) {
          updateRoute();
        }
      } catch (err) {
        console.error('Error in batch update:', err);
      }
    });
    
    // Cleanup
    return () => {
      batchManager.clearUpdateCallback();
    };
  }, [mapInitialized, markers, showRoute]);
  
  // Helper function to get icon URL based on type
  const getIconUrlForType = (type: string): string => {
    switch(type) {
      case 'driver':
        return 'https://maps.google.com/mapfiles/ms/icons/green-dot.png';
      case 'restaurant':
        return 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png';
      case 'customer':
        return 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
      default:
        return 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png';
    }
  };
  
  // Update route between points
  const updateRoute = async () => {
    if (!mapInitialized) return;
    
    if (showRoute && driverLocation && (customerLocation || restaurantLocation)) {
      const destination = customerLocation || restaurantLocation;
      if (!destination) return;
      
      try {
        await CapacitorGoogleMaps.addPolyline(mapInstanceId.current, {
          points: [
            { latitude: driverLocation.latitude, longitude: driverLocation.longitude },
            { latitude: destination.latitude, longitude: destination.longitude }
          ],
          color: '#4285F4',
          width: 5
        });
      } catch (err) {
        console.error('Error updating route:', err);
      }
    }
  };
  
  // Update markers when locations change
  useEffect(() => {
    if (!mapInitialized) return;
    
    const batchManager = batchManagerRef.current;
    
    // Queue driver marker update
    if (driverLocation) {
      batchManager.addMarker('driver', driverLocation);
    }
    
    // Queue restaurant marker update
    if (restaurantLocation) {
      batchManager.addMarker('restaurant', restaurantLocation);
    }
    
    // Queue customer marker update
    if (customerLocation) {
      batchManager.addMarker('customer', customerLocation);
    }
    
    // Queue additional markers
    additionalMarkers.forEach((marker, index) => {
      if (marker) {
        batchManager.addMarker(`additional-${index}`, marker);
      }
    });
    
  }, [driverLocation, restaurantLocation, customerLocation, additionalMarkers, mapInitialized]);
  
  // Handle auto centering the map
  useEffect(() => {
    const centerMap = async () => {
      if (!mapInitialized || !autoCenter) return;
      
      try {
        const locations = [
          driverLocation, 
          restaurantLocation, 
          customerLocation,
          ...additionalMarkers
        ].filter(Boolean) as MapLocation[];
        
        if (locations.length > 0) {
          // If we have multiple locations, fit bounds
          if (locations.length > 1 && CapacitorGoogleMaps.fitBounds) {
            const points = locations.map(loc => ({
              latitude: loc.latitude,
              longitude: loc.longitude
            }));
            
            await CapacitorGoogleMaps.fitBounds(mapInstanceId.current, { 
              points,
              padding: { top: 50, bottom: 50, left: 50, right: 50 } 
            });
          } 
          // Otherwise center on the single location
          else {
            await CapacitorGoogleMaps.setCamera(mapInstanceId.current, {
              latitude: locations[0].latitude,
              longitude: locations[0].longitude,
              zoom: zoom,
              animate: true,
              animationDuration: 500
            });
          }
          
          // Save position
          if (locations.length === 1) {
            debouncedSavePosition(
              { lat: locations[0].latitude, lng: locations[0].longitude },
              zoom
            );
          }
        }
      } catch (err) {
        console.error('Error centering map:', err);
      }
    };
    
    centerMap();
  }, [autoCenter, mapInitialized, driverLocation, restaurantLocation, customerLocation, additionalMarkers, zoom, debouncedSavePosition]);
  
  // Close info window on map click
  const handleMapContainerClick = () => {
    if (hasOpenInfoWindow && mapInitialized) {
      if (CapacitorGoogleMaps.hideInfoWindow) {
        CapacitorGoogleMaps.hideInfoWindow(mapInstanceId.current)
          .then(() => setHasOpenInfoWindow(false))
          .catch(err => console.error('Error hiding info window:', err));
      } else {
        // Fallback to just updating the state
        setHasOpenInfoWindow(false);
      }
    }
  };
  
  // If not on a native platform, fall back to the web-based TouchEnabledMap
  if (!Capacitor.isNativePlatform()) {
    return (
      <TouchEnabledMap className={className}>
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-md border">
          <div className="text-center p-4">
            <Navigation2 className="h-8 w-8 text-gray-400 mx-auto" />
            <p className="mt-2">Native maps only available on mobile devices</p>
            <p className="text-sm text-gray-600">Try running this app on a physical device</p>
          </div>
        </div>
      </TouchEnabledMap>
    );
  }
  
  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-md border`}>
        <div className="text-center p-4">
          <p className="text-red-500 font-medium mb-2">Error loading native map</p>
          <p className="text-sm text-gray-600">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={`${className} rounded-md overflow-hidden`}
      onClick={handleMapContainerClick}
    >
      <div 
        ref={mapRef} 
        id={mapInstanceId.current} 
        className="h-full w-full"
      />
      
      {/* Map not initialized yet */}
      {!mapInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center p-4">
            <div className="animate-pulse h-8 w-8 bg-gray-300 rounded-full mx-auto"></div>
            <p className="mt-2">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NativeMap;
