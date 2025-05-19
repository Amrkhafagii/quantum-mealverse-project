import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { useNetworkQuality } from '@/hooks/useNetworkQuality';
import { MapView } from '@capacitor/google-maps';
import { useMapView } from '@/contexts/MapViewContext';
import { toast } from '@/hooks/use-toast';

interface NativeMapProps {
  driverLocation?: any;
  customerLocation?: any;
  restaurantLocation?: any;
  locations?: any[];
  showRoute?: boolean;
  lowPerformanceMode?: boolean;
  className?: string;
  enableControls?: boolean;
  enableAnimation?: boolean;
  zoomLevel?: number;
  mapId?: string;
  onMapLoad?: () => void;
}

const NativeMap: React.FC<NativeMapProps> = ({
  driverLocation,
  customerLocation,
  restaurantLocation,
  locations = [],
  showRoute = true,
  lowPerformanceMode = false,
  className = '',
  enableControls = true,
  enableAnimation = true,
  zoomLevel = 13,
  mapId = 'native-map',
  onMapLoad
}) => {
  const { isLowQuality } = useNetworkQuality();
  const { getSavedPosition, savePosition } = useMapView();
  const [mapRef, setMapRef] = useState<HTMLElement | null>(null);
  const [mapObject, setMapObject] = useState<any>(null);
  const [markersAdded, setMarkersAdded] = useState(false);
  
  // Get saved position from context
  const savedPosition = getSavedPosition(mapId);
  
  // Create the map when the component mounts
  useEffect(() => {
    const createMap = async () => {
      if (!mapRef) return;
      
      try {
        // Create the map
        const newMap = await MapView.create({
          id: mapId,
          element: mapRef,
          apiKey: process.env.GOOGLE_MAPS_API_KEY || '',
          config: {
            center: {
              lat: savedPosition.center.lat,
              lng: savedPosition.center.lng
            },
            zoom: savedPosition.zoom,
            disableDefaultUI: !enableControls || lowPerformanceMode,
            styles: lowPerformanceMode ? [
              {
                featureType: 'poi',
                stylers: [{ visibility: 'off' }]
              },
              {
                featureType: 'transit',
                stylers: [{ visibility: 'off' }]
              }
            ] : []
          }
        });
        
        setMapObject(newMap);
        
        // Set up event listeners
        await newMap.setOnCameraIdleListener(() => {
          newMap.getMapBounds().then((bounds: any) => {
            const center = {
              lat: (bounds.southwest.lat + bounds.northeast.lat) / 2,
              lng: (bounds.southwest.lng + bounds.northeast.lng) / 2
            };
            
            newMap.getZoom().then((zoom: number) => {
              savePosition(mapId, { center, zoom });
            });
          });
        });
        
        // Call onMapLoad callback
        if (onMapLoad) {
          onMapLoad();
        }
      } catch (error) {
        console.error('Error creating native map:', error);
        toast({
          title: "Map Error",
          description: "Failed to load native map. Please try again later.",
          variant: "destructive"
        });
      }
    };
    
    createMap();
    
    // Clean up the map when component unmounts
    return () => {
      if (mapObject) {
        mapObject.destroy();
      }
    };
  }, [mapRef, enableControls, lowPerformanceMode, mapId, onMapLoad, savedPosition, savePosition]);
  
  // Add markers when map is created and locations change
  useEffect(() => {
    const addMarkers = async () => {
      if (!mapObject) return;
      
      try {
        // Clear existing markers
        await mapObject.removeMarkers();
        
        const markers = [];
        
        // Add driver marker
        if (driverLocation && driverLocation.latitude && driverLocation.longitude) {
          markers.push({
            coordinate: {
              lat: driverLocation.latitude,
              lng: driverLocation.longitude
            },
            title: driverLocation.title || "Driver",
            iconUrl: '/assets/driver-marker.png',
            iconSize: { width: 40, height: 40 }
          });
        }
        
        // Add restaurant marker
        if (restaurantLocation && restaurantLocation.latitude && restaurantLocation.longitude) {
          markers.push({
            coordinate: {
              lat: restaurantLocation.latitude,
              lng: restaurantLocation.longitude
            },
            title: restaurantLocation.title || "Restaurant",
            iconUrl: '/assets/restaurant-marker.png',
            iconSize: { width: 36, height: 36 }
          });
        }
        
        // Add customer marker
        if (customerLocation && customerLocation.latitude && customerLocation.longitude) {
          markers.push({
            coordinate: {
              lat: customerLocation.latitude,
              lng: customerLocation.longitude
            },
            title: customerLocation.title || "Customer",
            iconUrl: '/assets/customer-marker.png',
            iconSize: { width: 36, height: 36 }
          });
        }
        
        // Add additional location markers
        if (locations && locations.length > 0) {
          locations.forEach(location => {
            if (location.latitude && location.longitude) {
              let iconUrl = '/assets/location-marker.png';
              
              if (location.type === 'driver') {
                iconUrl = '/assets/driver-marker.png';
              } else if (location.type === 'restaurant') {
                iconUrl = '/assets/restaurant-marker.png';
              } else if (location.type === 'customer') {
                iconUrl = '/assets/customer-marker.png';
              }
              
              markers.push({
                coordinate: {
                  lat: location.latitude,
                  lng: location.longitude
                },
                title: location.title || "Location",
                iconUrl,
                iconSize: { width: 32, height: 32 }
              });
            }
          });
        }
        
        // Add all markers to the map
        if (markers.length > 0) {
          await mapObject.addMarkers(markers);
          
          // Fit bounds to include all markers
          if (!markersAdded) {
            const bounds = {
              southwest: {
                lat: Math.min(...markers.map(m => m.coordinate.lat)),
                lng: Math.min(...markers.map(m => m.coordinate.lng))
              },
              northeast: {
                lat: Math.max(...markers.map(m => m.coordinate.lat)),
                lng: Math.max(...markers.map(m => m.coordinate.lng))
              }
            };
            
            // Add some padding
            bounds.southwest.lat -= 0.01;
            bounds.southwest.lng -= 0.01;
            bounds.northeast.lat += 0.01;
            bounds.northeast.lng += 0.01;
            
            await mapObject.setCamera({
              bounds,
              padding: 50
            });
            
            setMarkersAdded(true);
          }
        }
        
        // Add route if needed
        if (showRoute && !lowPerformanceMode) {
          // For native maps, we would use a different approach to show routes
          // This would typically involve using the native platform's routing capabilities
          // For now, we'll just log that we would show a route
          console.log('Would show route on native map');
        }
      } catch (error) {
        console.error('Error adding markers to native map:', error);
      }
    };
    
    if (mapObject) {
      addMarkers();
    }
  }, [
    mapObject, 
    driverLocation, 
    restaurantLocation, 
    customerLocation, 
    locations, 
    showRoute, 
    lowPerformanceMode,
    markersAdded
  ]);
  
  return (
    <div className={`${className} relative`}>
      <div 
        ref={setMapRef} 
        id={`native-map-${mapId}`} 
        className="h-full w-full"
      />
    </div>
  );
};

export default NativeMap;
