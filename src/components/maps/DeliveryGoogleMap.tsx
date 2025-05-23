
import React, { useRef, useEffect, useState } from 'react';
import { GoogleMap, Marker, Circle, useLoadScript } from '@react-google-maps/api';
import { Card } from '@/components/ui/card';
import { AccuracyLevel } from '../location/LocationAccuracyIndicator';

interface DeliveryGoogleMapProps {
  mapId: string;
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    latitude: number;
    longitude: number;
    title?: string;
    description?: string;
    type?: string;
  }>;
  polyline?: Array<{ lat: number; lng: number }>;
  height?: string;
  width?: string;
  className?: string;
  enableControls?: boolean;
  lowPerformanceMode?: boolean;
  locationAccuracy?: AccuracyLevel;
  showAccuracyCircle?: boolean;
  onMapReady?: () => void;
}

// Map styling for a cleaner look
const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'transit',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
};

const DeliveryGoogleMap: React.FC<DeliveryGoogleMapProps> = ({
  mapId,
  center,
  zoom = 14,
  markers = [],
  polyline,
  height = '300px',
  width,
  className = '',
  enableControls = true,
  lowPerformanceMode = false,
  locationAccuracy,
  showAccuracyCircle = false,
  onMapReady
}) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Load the Google Maps script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    // Adding libraries would go here if needed
  });

  // Helper function to get marker icon based on type
  const getMarkerIcon = (type?: string) => {
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
  };
  
  // Get accuracy circle radius based on accuracy level
  const getAccuracyRadius = (): number => {
    if (!locationAccuracy) return 100;
    
    switch (locationAccuracy) {
      case 'high': return 50;
      case 'medium': return 100;
      case 'low': return 500;
      case 'unknown':
      default: 
        return 100;
    }
  };

  // Handler for when the map is loaded
  const handleMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    setMapLoaded(true);
    
    if (onMapReady) {
      onMapReady();
    }
  };

  // Update map center when props change
  useEffect(() => {
    if (mapLoaded && mapRef.current) {
      mapRef.current.panTo(center);
    }
  }, [center, mapLoaded]);

  // Handle load error
  if (loadError) {
    return (
      <Card className={`${className} flex items-center justify-center`} style={{ height, width: width || '100%' }}>
        <div className="text-center p-4">
          <p className="text-red-500">Error loading maps</p>
          <p className="text-sm text-muted-foreground">Please check your internet connection</p>
        </div>
      </Card>
    );
  }

  // Show loading state
  if (!isLoaded) {
    return (
      <Card className={`${className} flex items-center justify-center`} style={{ height, width: width || '100%' }}>
        <div className="text-center">
          <p>Loading map...</p>
        </div>
      </Card>
    );
  }

  // Find user location marker for accuracy circle
  const userLocationMarker = markers.find(marker => marker.type === 'driver');
  
  // Create map options
  const options = {
    ...mapOptions,
    zoomControl: enableControls,
    scrollwheel: enableControls,
    draggable: enableControls,
    disableDoubleClickZoom: lowPerformanceMode,
    clickableIcons: !lowPerformanceMode,
  };

  return (
    <Card className={`${className} overflow-hidden`} style={{ height, width: width || '100%' }}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={zoom}
        options={options}
        onLoad={handleMapLoad}
        id={`google-map-${mapId}`}
      >
        {/* Render the accuracy circle if needed */}
        {showAccuracyCircle && userLocationMarker && (
          <Circle
            center={{ lat: userLocationMarker.latitude, lng: userLocationMarker.longitude }}
            radius={getAccuracyRadius()}
            options={{
              strokeColor: '#3388FF',
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: '#3388FF',
              fillOpacity: 0.1,
            }}
          />
        )}
        
        {/* Render all markers */}
        {markers.map((marker, index) => (
          <Marker
            key={`marker-${index}`}
            position={{ lat: marker.latitude, lng: marker.longitude }}
            title={marker.title}
            icon={getMarkerIcon(marker.type)}
            optimized={lowPerformanceMode}
            animation={google.maps.Animation.DROP}
          />
        ))}
      </GoogleMap>
    </Card>
  );
};

export default DeliveryGoogleMap;
