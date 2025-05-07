import React, { useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Platform } from '@/utils/platform';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation2 } from 'lucide-react';
import TouchEnabledMap from './TouchEnabledMap';

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
}) => {
  const { googleMapsApiKey } = useGoogleMaps();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapId = useRef(`map-${Math.random().toString(36).substring(2, 9)}`);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasOpenInfoWindow, setHasOpenInfoWindow] = useState(false);
  const [markers, setMarkers] = useState<string[]>([]);
  
  // Initialize the map
  useEffect(() => {
    if (!mapRef.current || !googleMapsApiKey || !Capacitor.isNativePlatform()) return;
    
    const createMap = async () => {
      try {
        if (mapRef.current) {
          const boundingRect = mapRef.current.getBoundingClientRect();
          
          // Create the map element
          await CapacitorGoogleMaps.create({
            width: Math.round(boundingRect.width),
            height: Math.round(boundingRect.height),
            x: Math.round(boundingRect.x),
            y: Math.round(boundingRect.y),
            zoom: zoom,
            // apiKey is not in the type but we'll keep it in our implementation
            // and handle it in the actual plugin
            element: mapRef.current,
            forceCreate: true,
            id: mapId.current
          });
          
          // Add click listener
          if (isInteractive && onMapClick) {
            await CapacitorGoogleMaps.setOnMapClickListener(mapId.current, (event) => {
              if (onMapClick) {
                onMapClick({
                  latitude: event.latitude,
                  longitude: event.longitude
                });
              }
            });
          }
          
          // Add marker click listener
          await CapacitorGoogleMaps.setOnMarkerClickListener(mapId.current, (event) => {
            console.log('Marker clicked:', event);
            setHasOpenInfoWindow(true);
          });
          
          setMapInitialized(true);
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
          CapacitorGoogleMaps.destroy(mapId.current)
            .catch(err => console.error('Error removing map:', err));
        } else {
          console.log('Map would be destroyed here:', mapId.current);
        }
      }
    };
  }, [googleMapsApiKey, zoom, onMapClick, isInteractive]);
  
  // Update markers when locations change
  useEffect(() => {
    if (!mapInitialized) return;
    
    const updateMarkers = async () => {
      try {
        // Clear existing markers
        if (CapacitorGoogleMaps.removeMarkers) {
          await CapacitorGoogleMaps.removeMarkers(mapId.current);
        } else {
          // Fallback: remove individual markers if supported
          if (CapacitorGoogleMaps.removeMarker) {
            for (const markerId of markers) {
              await CapacitorGoogleMaps.removeMarker(mapId.current, markerId);
            }
          }
        }
        
        const newMarkers: string[] = [];
        
        // Add driver marker
        if (driverLocation) {
          const markerId = await CapacitorGoogleMaps.addMarker(mapId.current, {
            latitude: driverLocation.latitude,
            longitude: driverLocation.longitude,
            title: driverLocation.title || 'Driver',
            snippet: driverLocation.description || '',
            iconUrl: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
            animation: 'DROP' // Add animation for driver marker
          });
          newMarkers.push(markerId);
        }
        
        // Add restaurant marker
        if (restaurantLocation) {
          const markerId = await CapacitorGoogleMaps.addMarker(mapId.current, {
            latitude: restaurantLocation.latitude,
            longitude: restaurantLocation.longitude,
            title: restaurantLocation.title || 'Restaurant',
            snippet: restaurantLocation.description || '',
            iconUrl: 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png'
          });
          newMarkers.push(markerId);
        }
        
        // Add customer marker
        if (customerLocation) {
          const markerId = await CapacitorGoogleMaps.addMarker(mapId.current, {
            latitude: customerLocation.latitude,
            longitude: customerLocation.longitude,
            title: customerLocation.title || 'Customer',
            snippet: customerLocation.description || '',
            iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
          });
          newMarkers.push(markerId);
        }
        
        // Add additional markers
        for (const marker of additionalMarkers) {
          const markerId = await CapacitorGoogleMaps.addMarker(mapId.current, {
            latitude: marker.latitude,
            longitude: marker.longitude,
            title: marker.title || 'Location',
            snippet: marker.description || '',
            iconUrl: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
          });
          newMarkers.push(markerId);
        }
        
        setMarkers(newMarkers);
        
        // If we should show route and have both driver and customer locations
        if (showRoute && driverLocation && (customerLocation || restaurantLocation)) {
          const destination = customerLocation || restaurantLocation;
          if (destination) {
            await CapacitorGoogleMaps.addPolyline(mapId.current, {
              points: [
                { latitude: driverLocation.latitude, longitude: driverLocation.longitude },
                { latitude: destination.latitude, longitude: destination.longitude }
              ],
              color: '#4285F4',
              width: 5
            });
          }
        }
        
        // Auto center the map if needed
        if (autoCenter) {
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
              
              await CapacitorGoogleMaps.fitBounds(mapId.current, { 
                points,
                padding: { top: 50, bottom: 50, left: 50, right: 50 } 
              });
            } 
            // Otherwise center on the single location
            else {
              await CapacitorGoogleMaps.setCamera(mapId.current, {
                latitude: locations[0].latitude,
                longitude: locations[0].longitude,
                zoom: zoom,
                animate: true,
                animationDuration: 500
              });
            }
          }
        }
      } catch (err) {
        console.error('Error updating map markers:', err);
      }
    };
    
    updateMarkers();
  }, [mapInitialized, driverLocation, restaurantLocation, customerLocation, additionalMarkers, showRoute, autoCenter, zoom, markers]);
  
  // Close info window on map click
  const handleMapContainerClick = () => {
    if (hasOpenInfoWindow && mapInitialized) {
      if (CapacitorGoogleMaps.hideInfoWindow) {
        CapacitorGoogleMaps.hideInfoWindow(mapId.current)
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
        id={mapId.current} 
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
