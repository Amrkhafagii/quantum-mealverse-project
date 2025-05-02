
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, DirectionsRenderer, DirectionsService } from '@react-google-maps/api';
import { Loader2 } from 'lucide-react';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';

// Define types for our component props
interface MapLocation {
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  type?: 'driver' | 'restaurant' | 'customer' | 'generic';
}

interface DeliveryGoogleMapProps {
  driverLocation?: MapLocation;
  restaurantLocation?: MapLocation;
  customerLocation?: MapLocation;
  additionalMarkers?: MapLocation[];
  showRoute?: boolean;
  className?: string;
  zoom?: number;
  autoCenter?: boolean;
  onMapClick?: (location: { longitude: number, latitude: number }) => void;
  isInteractive?: boolean;
  googleMapsApiKey?: string;
}

// Default map container styles
const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.375rem' // equivalent to rounded-md in Tailwind
};

const DeliveryGoogleMap: React.FC<DeliveryGoogleMapProps> = ({
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
  googleMapsApiKey: propGoogleMapsApiKey
}) => {
  const { googleMapsApiKey: contextGoogleMapsApiKey } = useGoogleMaps();
  
  // Use API key from props or context
  const googleMapsApiKey = propGoogleMapsApiKey || contextGoogleMapsApiKey;
  
  // For tracking open info windows
  const [selectedMarker, setSelectedMarker] = useState<MapLocation | null>(null);
  
  // For directions (routes)
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [directionsError, setDirectionsError] = useState<string | null>(null);
  
  // Initialize Google Maps JS API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: googleMapsApiKey || '',
    libraries: ['places'],
  });
  
  // Map reference
  const mapRef = useRef<google.maps.Map | null>(null);
  
  // Calculate map center and bounds
  const getMapCenter = useCallback(() => {
    const locations = [
      driverLocation,
      restaurantLocation,
      customerLocation,
      ...additionalMarkers
    ].filter(Boolean) as MapLocation[];
    
    if (locations.length === 0) {
      return { lat: 0, lng: 0 }; // Default center if no locations
    }
    
    if (locations.length === 1) {
      return { lat: locations[0].latitude, lng: locations[0].longitude };
    }
    
    return locations.reduce(
      (center, loc) => ({
        lat: center.lat + loc.latitude / locations.length,
        lng: center.lng + loc.longitude / locations.length
      }),
      { lat: 0, lng: 0 }
    );
  }, [driverLocation, restaurantLocation, customerLocation, additionalMarkers]);
  
  // Function to fit map to bounds of all markers
  const fitBounds = useCallback(() => {
    if (!mapRef.current) return;
    
    const locations = [
      driverLocation,
      restaurantLocation,
      customerLocation,
      ...additionalMarkers
    ].filter(Boolean) as MapLocation[];
    
    if (locations.length <= 1) return;
    
    const bounds = new google.maps.LatLngBounds();
    locations.forEach(loc => {
      bounds.extend({ lat: loc.latitude, lng: loc.longitude });
    });
    
    mapRef.current.fitBounds(bounds);
    
    // Adjust zoom if too zoomed in
    const listener = google.maps.event.addListener(mapRef.current, 'idle', () => {
      if (mapRef.current && mapRef.current.getZoom() !== undefined && mapRef.current.getZoom() > 16) {
        mapRef.current.setZoom(16);
      }
      google.maps.event.removeListener(listener);
    });
  }, [driverLocation, restaurantLocation, customerLocation, additionalMarkers]);
  
  // Set up directions when route should be displayed
  useEffect(() => {
    if (!isLoaded || !showRoute || !driverLocation || !(restaurantLocation || customerLocation)) return;
    
    // Determine route points
    const start = driverLocation;
    const end = customerLocation || restaurantLocation;
    if (!end) return;
    
    const directionsService = new google.maps.DirectionsService();
    
    directionsService.route(
      {
        origin: { lat: start.latitude, lng: start.longitude },
        destination: { lat: end.latitude, lng: end.longitude },
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          setDirections(result);
          setDirectionsError(null);
        } else {
          console.error(`Error fetching directions: ${status}`);
          setDirectionsError(`Couldn't fetch route: ${status}`);
          setDirections(null);
        }
      }
    );
  }, [isLoaded, showRoute, driverLocation, restaurantLocation, customerLocation]);
  
  // Update bounds when locations change and autoCenter is true
  useEffect(() => {
    if (isLoaded && mapRef.current && autoCenter) {
      fitBounds();
    }
  }, [isLoaded, fitBounds, autoCenter]);
  
  // Handle map load
  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    if (autoCenter) {
      fitBounds();
    }
  }, [fitBounds, autoCenter]);
  
  // Clean up on unmount
  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);
  
  // Handle map clicks if callback provided
  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (onMapClick && e.latLng) {
      onMapClick({
        latitude: e.latLng.lat(),
        longitude: e.latLng.lng()
      });
    }
    // Close any open info windows when map is clicked
    setSelectedMarker(null);
  }, [onMapClick]);
  
  // Get marker icon based on location type
  const getMarkerIcon = (locationType?: string) => {
    switch (locationType) {
      case 'driver':
        return {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          fillColor: '#00FF00',
          fillOpacity: 1,
          strokeWeight: 1,
          scale: 6
        };
      case 'restaurant':
        return {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#FF8C00',
          fillOpacity: 1,
          strokeWeight: 1,
          scale: 8
        };
      case 'customer':
        return {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#FF0000',
          fillOpacity: 1,
          strokeWeight: 1,
          scale: 8
        };
      default:
        return {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#3887be',
          fillOpacity: 1,
          strokeWeight: 1,
          scale: 7
        };
    }
  };
  
  if (loadError) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-md border`}>
        <div className="text-center p-4">
          <p className="text-red-500 font-medium mb-2">Error loading Google Maps</p>
          <p className="text-sm text-gray-600">{loadError.message}</p>
        </div>
      </div>
    );
  }
  
  if (!isLoaded || !googleMapsApiKey) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-md border`}>
        <div className="text-center p-4">
          {!googleMapsApiKey ? (
            <>
              <p className="text-red-500 font-medium mb-2">Google Maps API key not found!</p>
              <p className="text-sm text-gray-600">Please set VITE_GOOGLE_MAPS_API_KEY in your environment or provide a key through the form.</p>
            </>
          ) : (
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className={`${className} relative`}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={getMapCenter()}
        zoom={zoom}
        options={{
          disableDefaultUI: !isInteractive,
          zoomControl: isInteractive,
          scrollwheel: isInteractive,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: isInteractive,
        }}
        onClick={handleMapClick}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {/* Driver Marker */}
        {driverLocation && (
          <Marker
            position={{ lat: driverLocation.latitude, lng: driverLocation.longitude }}
            icon={getMarkerIcon('driver')}
            onClick={() => setSelectedMarker(driverLocation)}
          >
            {selectedMarker === driverLocation && (
              <InfoWindow onCloseClick={() => setSelectedMarker(null)}>
                <div>
                  {driverLocation.title && <h3>{driverLocation.title}</h3>}
                  {driverLocation.description && <p>{driverLocation.description}</p>}
                </div>
              </InfoWindow>
            )}
          </Marker>
        )}
        
        {/* Restaurant Marker */}
        {restaurantLocation && (
          <Marker
            position={{ lat: restaurantLocation.latitude, lng: restaurantLocation.longitude }}
            icon={getMarkerIcon('restaurant')}
            onClick={() => setSelectedMarker(restaurantLocation)}
          >
            {selectedMarker === restaurantLocation && (
              <InfoWindow onCloseClick={() => setSelectedMarker(null)}>
                <div>
                  {restaurantLocation.title && <h3>{restaurantLocation.title}</h3>}
                  {restaurantLocation.description && <p>{restaurantLocation.description}</p>}
                </div>
              </InfoWindow>
            )}
          </Marker>
        )}
        
        {/* Customer Marker */}
        {customerLocation && (
          <Marker
            position={{ lat: customerLocation.latitude, lng: customerLocation.longitude }}
            icon={getMarkerIcon('customer')}
            onClick={() => setSelectedMarker(customerLocation)}
          >
            {selectedMarker === customerLocation && (
              <InfoWindow onCloseClick={() => setSelectedMarker(null)}>
                <div>
                  {customerLocation.title && <h3>{customerLocation.title}</h3>}
                  {customerLocation.description && <p>{customerLocation.description}</p>}
                </div>
              </InfoWindow>
            )}
          </Marker>
        )}
        
        {/* Additional Markers */}
        {additionalMarkers.map((marker, index) => (
          <Marker
            key={`additional-${index}`}
            position={{ lat: marker.latitude, lng: marker.longitude }}
            icon={getMarkerIcon(marker.type)}
            onClick={() => setSelectedMarker(marker)}
          >
            {selectedMarker === marker && (
              <InfoWindow onCloseClick={() => setSelectedMarker(null)}>
                <div>
                  {marker.title && <h3>{marker.title}</h3>}
                  {marker.description && <p>{marker.description}</p>}
                </div>
              </InfoWindow>
            )}
          </Marker>
        ))}
        
        {/* Route Display */}
        {showRoute && directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              polylineOptions: {
                strokeColor: '#3887be',
                strokeWeight: 5,
                strokeOpacity: 0.75
              }
            }}
          />
        )}
      </GoogleMap>
      
      {/* Route Error Display */}
      {directionsError && (
        <div className="absolute bottom-2 left-2 right-2 bg-red-100 text-red-700 text-sm p-2 rounded">
          {directionsError}
        </div>
      )}
    </div>
  );
};

export default DeliveryGoogleMap;
