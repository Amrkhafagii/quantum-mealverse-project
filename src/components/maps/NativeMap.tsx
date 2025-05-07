import React, { useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { CapacitorGoogleMaps } from '@capacitor-community/capacitor-googlemaps-native';
import { Platform } from '@/utils/platform';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation2 } from 'lucide-react';
import TouchEnabledMap from './TouchEnabledMap';

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
            apiKey: googleMapsApiKey,
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
        CapacitorGoogleMaps.remove(mapId.current)
          .catch(err => console.error('Error removing map:', err));
      }
    };
  }, [googleMapsApiKey, zoom, onMapClick, isInteractive]);
  
  // Update markers when locations change
  useEffect(() => {
    if (!mapInitialized) return;
    
    const updateMarkers = async () => {
      try {
        // Clear existing markers
        await CapacitorGoogleMaps.clearMarkers(mapId.current);
        
        // Add driver marker
        if (driverLocation) {
          await CapacitorGoogleMaps.addMarker(mapId.current, {
            latitude: driverLocation.latitude,
            longitude: driverLocation.longitude,
            title: driverLocation.title || 'Driver',
            snippet: driverLocation.description || '',
            iconUrl: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
            animation: 'DROP' // Add animation for driver marker
          });
        }
        
        // Add restaurant marker
        if (restaurantLocation) {
          await CapacitorGoogleMaps.addMarker(mapId.current, {
            latitude: restaurantLocation.latitude,
            longitude: restaurantLocation.longitude,
            title: restaurantLocation.title || 'Restaurant',
            snippet: restaurantLocation.description || '',
            iconUrl: 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png'
          });
        }
        
        // Add customer marker
        if (customerLocation) {
          await CapacitorGoogleMaps.addMarker(mapId.current, {
            latitude: customerLocation.latitude,
            longitude: customerLocation.longitude,
            title: customerLocation.title || 'Customer',
            snippet: customerLocation.description || '',
            iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
          });
        }
        
        // Add additional markers
        for (const marker of additionalMarkers) {
          await CapacitorGoogleMaps.addMarker(mapId.current, {
            latitude: marker.latitude,
            longitude: marker.longitude,
            title: marker.title || 'Location',
            snippet: marker.description || '',
            iconUrl: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
          });
        }
        
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
            if (locations.length > 1) {
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
  }, [mapInitialized, driverLocation, restaurantLocation, customerLocation, additionalMarkers, showRoute, autoCenter, zoom]);
  
  // Close info window on map click
  const handleMapContainerClick = () => {
    if (hasOpenInfoWindow && mapInitialized) {
      CapacitorGoogleMaps.hideInfoWindow(mapId.current)
        .then(() => setHasOpenInfoWindow(false))
        .catch(err => console.error('Error hiding info window:', err));
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
