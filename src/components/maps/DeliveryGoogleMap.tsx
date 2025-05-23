import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { useTheme } from '@/hooks/use-theme';
import { useNetworkQuality } from '@/hooks/useNetworkQuality';
import { AccuracyLevel } from '../location/LocationAccuracyIndicator';

export interface DeliveryGoogleMapProps {
  mapId: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    latitude: number;
    longitude: number;
    title?: string;
    description?: string;
    type?: string;
  }>;
  showRoute?: boolean;
  routeOrigin?: { lat: number; lng: number };
  routeDestination?: { lat: number; lng: number };
  height?: string;
  width?: string;
  className?: string;
  lowPerformanceMode?: boolean;
  enableAnimation?: boolean;
  enableControls?: boolean;
  onLoad?: () => void;
  locationAccuracy?: AccuracyLevel; // Added the missing property
  showAccuracyCircle?: boolean; // Added the missing property
}

// Default map styles
const mapStyles = {
  light: [],
  dark: [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }]
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }]
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#263c3f" }]
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#6b9a76" }]
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#38414e" }]
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#212a37" }]
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9ca5b3" }]
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#746855" }]
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1f2835" }]
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#f3d19c" }]
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#2f3948" }]
    },
    {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }]
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }]
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#515c6d" }]
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#17263c" }]
    }
  ]
};

const DeliveryGoogleMap = ({
  mapId,
  center = { lat: 40.7128, lng: -74.006 },
  zoom = 12,
  markers = [],
  showRoute = false,
  routeOrigin,
  routeDestination,
  height = '300px',
  width = '100%',
  className = '',
  lowPerformanceMode = false,
  enableAnimation = true,
  enableControls = true,
  onLoad,
  locationAccuracy, // Add the new prop
  showAccuracyCircle // Add the new prop
}: DeliveryGoogleMapProps) => {
  const { theme } = useTheme();
  const { isLowQuality } = useNetworkQuality();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [isDirectionsLoading, setIsDirectionsLoading] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  
  // Force low performance mode if network quality is low
  const useLowPerformanceMode = lowPerformanceMode || isLowQuality;

  // Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "AIzaSyD2Z9Y8F0nTnj0oFjC_tCPpZliosBbKyYc",
  });

  // Update directions when route props change
  useEffect(() => {
    if (!isLoaded || !map || !showRoute || !routeOrigin || !routeDestination) return;

    setIsDirectionsLoading(true);
    
    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: routeOrigin,
        destination: routeDestination,
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: !useLowPerformanceMode
      },
      (result, status) => {
        setIsDirectionsLoading(false);
        if (status === google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          console.error(`Error fetching directions: ${status}`);
        }
      }
    );
  }, [isLoaded, map, showRoute, routeOrigin, routeDestination, useLowPerformanceMode]);

  // Map options based on performance and theme settings
  const getMapOptions = useCallback(() => {
    return {
      disableDefaultUI: !enableControls,
      styles: theme === 'dark' ? mapStyles.dark : mapStyles.light,
      gestureHandling: 'cooperative',
      zoomControl: enableControls,
      mapTypeControl: enableControls && !useLowPerformanceMode,
      streetViewControl: enableControls && !useLowPerformanceMode,
      fullscreenControl: enableControls && !useLowPerformanceMode,
      // Reduce animation and visual complexity in low performance mode
      animatedZoom: enableAnimation && !useLowPerformanceMode,
      disableDoubleClickZoom: useLowPerformanceMode,
      clickableIcons: !useLowPerformanceMode,
      // Reduce map features for better performance
      ...(!useLowPerformanceMode ? {} : {
        maxZoom: 16,
        minZoom: 8,
        restriction: {
          latLngBounds: {
            north: center.lat + 0.3,
            south: center.lat - 0.3,
            east: center.lng + 0.3,
            west: center.lng - 0.3
          },
          strictBounds: false
        }
      })
    };
  }, [theme, enableControls, enableAnimation, useLowPerformanceMode, center]);

  const handleLoad = (mapInstance: google.maps.Map) => {
    setMap(mapInstance);
    if (onLoad) onLoad();
  };

  const handleUnmount = () => {
    setMap(null);
  };

  if (!isLoaded) {
    return (
      <div 
        id={mapId}
        ref={mapRef}
        style={{ height, width: width || '100%' }}
        className={`bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${className}`}
      >
        <div className="animate-pulse">Loading map...</div>
      </div>
    );
  }

  const getMarkerIcon = (type?: string) => {
    switch (type) {
      case 'restaurant':
        return { url: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png', scaledSize: new google.maps.Size(30, 30) };
      case 'customer':
        return { url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png', scaledSize: new google.maps.Size(30, 30) };
      case 'driver':
        return { url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png', scaledSize: new google.maps.Size(30, 30) };
      default:
        return { url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png', scaledSize: new google.maps.Size(30, 30) };
    }
  };

  // Render accuracy circle if requested
  const renderAccuracyCircle = () => {
    if (!map || !showAccuracyCircle || !markers.length) return null;
    
    // Find driver marker or use first marker
    const driverMarker = markers.find(marker => marker.type === 'driver') || markers[0];
    
    // Only add accuracy circle if we have a driver location and accuracy level
    if (driverMarker && locationAccuracy) {
      // Determine radius based on accuracy level
      let radius = 100; // Default radius in meters
      if (locationAccuracy === 'high') radius = 50;
      else if (locationAccuracy === 'medium') radius = 100;
      else if (locationAccuracy === 'low') radius = 500;
      
      // Create the accuracy circle
      new google.maps.Circle({
        strokeColor: '#3388FF',
        strokeOpacity: 0.6,
        strokeWeight: 1,
        fillColor: '#3388FF',
        fillOpacity: 0.2,
        map,
        center: { lat: driverMarker.latitude, lng: driverMarker.longitude },
        radius: radius,
      });
    }
  };

  // Call renderAccuracyCircle when map and markers are ready
  useEffect(() => {
    if (map && markers.length > 0 && showAccuracyCircle) {
      renderAccuracyCircle();
    }
  }, [map, markers, showAccuracyCircle, locationAccuracy]);

  return (
    <div 
      id={mapId} 
      ref={mapRef}
      className={`relative ${className}`}
      style={{ height, width: width || '100%' }}
    >
      <GoogleMap
        mapContainerStyle={{ height: '100%', width: '100%' }}
        center={center}
        zoom={zoom}
        options={getMapOptions()}
        onLoad={handleLoad}
        onUnmount={handleUnmount}
      >
        {/* Render markers */}
        {markers.map((marker, index) => (
          <Marker
            key={`${marker.latitude}-${marker.longitude}-${index}`}
            position={{ lat: marker.latitude, lng: marker.longitude }}
            title={marker.title || ''}
            icon={getMarkerIcon(marker.type)}
            animation={enableAnimation && !useLowPerformanceMode ? google.maps.Animation.DROP : undefined}
          />
        ))}
        
        {/* Render directions if available */}
        {directions && !isDirectionsLoading && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: '#4F46E5',
                strokeOpacity: 0.8,
                strokeWeight: 4
              }
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
};

export default React.memo(DeliveryGoogleMap);
