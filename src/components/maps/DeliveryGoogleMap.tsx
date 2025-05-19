
import React, { useState, useEffect, useRef } from 'react';
import { LoadScript, GoogleMap, Marker, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { useMapView } from '@/contexts/MapViewContext';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNetworkQuality } from '@/hooks/useNetworkQuality';

interface DeliveryGoogleMapProps {
  driverLocation?: any;
  customerLocation?: any;
  restaurantLocation?: any;
  locations?: any[];
  showRoute?: boolean;
  lowPerformanceMode?: boolean;
  isInteractive?: boolean;
  className?: string;
  enableControls?: boolean;
  enableAnimation?: boolean;
  zoomLevel?: number;
  mapId?: string;
  onMapLoad?: () => void;
}

const DeliveryGoogleMap: React.FC<DeliveryGoogleMapProps> = ({
  driverLocation,
  customerLocation,
  restaurantLocation,
  locations = [],
  showRoute = true,
  lowPerformanceMode = false,
  isInteractive = true,
  className = '',
  enableControls = true,
  enableAnimation = true,
  zoomLevel = 13,
  mapId = 'google-map',
  onMapLoad
}) => {
  const { googleMapsApiKey } = useGoogleMaps();
  const { getSavedPosition, savePosition, recordMapError } = useMapView();
  const { isLowQuality } = useNetworkQuality();
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  
  // Get saved position from context
  const savedPosition = getSavedPosition(mapId);
  
  // Options for Google Maps
  const mapOptions: google.maps.MapOptions = {
    disableDefaultUI: lowPerformanceMode || !enableControls,
    zoomControl: enableControls,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    gestureHandling: isInteractive ? 'greedy' : 'none',
    clickableIcons: isInteractive && !lowPerformanceMode,
    styles: [
      {
        featureType: 'poi',
        stylers: [{ visibility: lowPerformanceMode ? 'off' : 'on' }]
      },
      {
        featureType: 'transit',
        stylers: [{ visibility: lowPerformanceMode ? 'off' : 'on' }]
      }
    ]
  };
  
  // Handle map load
  const handleMapLoad = (map: google.maps.Map) => {
    setMapInstance(map);
    setIsMapLoaded(true);
    
    if (onMapLoad) {
      onMapLoad();
    }
    
    // Fit bounds to markers after map is loaded
    fitBoundsToMarkers(map);
  };
  
  // Fit map bounds to include all markers
  const fitBoundsToMarkers = (map: google.maps.Map) => {
    const bounds = new google.maps.LatLngBounds();
    let hasMarkers = false;
    
    // Add driver location to bounds
    if (driverLocation && driverLocation.latitude && driverLocation.longitude) {
      bounds.extend(new google.maps.LatLng(driverLocation.latitude, driverLocation.longitude));
      hasMarkers = true;
    }
    
    // Add customer location to bounds
    if (customerLocation && customerLocation.latitude && customerLocation.longitude) {
      bounds.extend(new google.maps.LatLng(customerLocation.latitude, customerLocation.longitude));
      hasMarkers = true;
    }
    
    // Add restaurant location to bounds
    if (restaurantLocation && restaurantLocation.latitude && restaurantLocation.longitude) {
      bounds.extend(new google.maps.LatLng(restaurantLocation.latitude, restaurantLocation.longitude));
      hasMarkers = true;
    }
    
    // Add any additional locations to bounds
    if (locations && locations.length > 0) {
      locations.forEach(loc => {
        if (loc.latitude && loc.longitude) {
          bounds.extend(new google.maps.LatLng(loc.latitude, loc.longitude));
          hasMarkers = true;
        }
      });
    }
    
    // If we have markers, fit bounds
    if (hasMarkers) {
      map.fitBounds(bounds, { top: 30, right: 30, bottom: 30, left: 30 });
      
      // If only one marker, zoom in closer
      if ((driverLocation && !customerLocation && !restaurantLocation && locations.length === 0) ||
          (!driverLocation && customerLocation && !restaurantLocation && locations.length === 0) ||
          (!driverLocation && !customerLocation && restaurantLocation && locations.length === 0) ||
          (!driverLocation && !customerLocation && !restaurantLocation && locations.length === 1)) {
        // Use setTimeout to ensure fitBounds completes first
        setTimeout(() => {
          map.setZoom(zoomLevel);
        }, 100);
      }
    } else {
      // If no markers, use saved position or default
      map.setCenter(savedPosition.center);
      map.setZoom(savedPosition.zoom);
    }
  };

  // Calculate directions between points when needed
  useEffect(() => {
    // Don't calculate routes in low performance mode
    if (lowPerformanceMode || !showRoute || !isMapLoaded || isCalculatingRoute) {
      return;
    }
    
    // Need at least two points to calculate a route
    const hasDriver = driverLocation && driverLocation.latitude && driverLocation.longitude;
    const hasRestaurant = restaurantLocation && restaurantLocation.latitude && restaurantLocation.longitude;
    const hasCustomer = customerLocation && customerLocation.latitude && customerLocation.longitude;
    
    if ((hasDriver && hasCustomer) || (hasDriver && hasRestaurant) || (hasRestaurant && hasCustomer)) {
      setIsCalculatingRoute(true);
    } else {
      // Not enough points to calculate route
      return;
    }
    
    // Determine origin and destination
    let origin, destination;
    
    // Driver to restaurant or customer
    if (hasDriver) {
      origin = { 
        lat: driverLocation.latitude, 
        lng: driverLocation.longitude 
      };
      
      if (hasRestaurant) {
        destination = { 
          lat: restaurantLocation.latitude, 
          lng: restaurantLocation.longitude 
        };
      } else if (hasCustomer) {
        destination = { 
          lat: customerLocation.latitude, 
          lng: customerLocation.longitude 
        };
      }
    }
    // Restaurant to customer
    else if (hasRestaurant && hasCustomer) {
      origin = { 
        lat: restaurantLocation.latitude, 
        lng: restaurantLocation.longitude 
      };
      destination = { 
        lat: customerLocation.latitude, 
        lng: customerLocation.longitude 
      };
    }
    
    // If we have origin and destination, calculate route
    if (origin && destination) {
      const directionsService = new google.maps.DirectionsService();
      
      directionsService.route(
        {
          origin,
          destination,
          travelMode: google.maps.TravelMode.DRIVING,
          optimizeWaypoints: true,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            setDirections(result);
          } else if (status === google.maps.DirectionsStatus.ZERO_RESULTS) {
            console.warn("Could not find directions");
          } else {
            console.error("Directions request failed:", status);
            recordMapError(mapId, `Route calculation failed: ${status}`);
          }
          setIsCalculatingRoute(false);
        }
      );
    }
  }, [
    driverLocation, 
    customerLocation, 
    restaurantLocation, 
    lowPerformanceMode, 
    showRoute, 
    isMapLoaded, 
    isCalculatingRoute,
    mapId,
    recordMapError
  ]);
  
  // Save position when map moves
  const handleCenterChanged = () => {
    if (mapInstance) {
      const center = mapInstance.getCenter();
      const zoom = mapInstance.getZoom();
      
      if (center && zoom) {
        savePosition(mapId, {
          center: { lat: center.lat(), lng: center.lng() },
          zoom
        });
      }
    }
  };
  
  // Handle map error
  const handleMapError = () => {
    recordMapError(mapId, 'Failed to load Google Maps');
    
    toast({
      title: "Map Error",
      description: "Failed to load the map. Please try again later.",
      variant: "destructive"
    });
  };
  
  return (
    <div className={`${className}`}>
      <LoadScript
        googleMapsApiKey={googleMapsApiKey}
        onError={handleMapError}
        loadingElement={
          <div className="h-full w-full flex items-center justify-center bg-slate-800">
            <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan" />
          </div>
        }
      >
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={savedPosition.center}
          zoom={savedPosition.zoom}
          options={mapOptions}
          onLoad={handleMapLoad}
          onCenterChanged={handleCenterChanged}
          onZoomChanged={handleCenterChanged}
        >
          {/* Driver marker */}
          {driverLocation && driverLocation.latitude && driverLocation.longitude && (
            <Marker
              position={{
                lat: driverLocation.latitude,
                lng: driverLocation.longitude
              }}
              icon={{
                url: '/assets/driver-marker.png',
                scaledSize: new google.maps.Size(40, 40)
              }}
              animation={enableAnimation ? google.maps.Animation.DROP : undefined}
            />
          )}
          
          {/* Restaurant marker */}
          {restaurantLocation && restaurantLocation.latitude && restaurantLocation.longitude && (
            <Marker
              position={{
                lat: restaurantLocation.latitude,
                lng: restaurantLocation.longitude
              }}
              icon={{
                url: '/assets/restaurant-marker.png',
                scaledSize: new google.maps.Size(36, 36)
              }}
              animation={enableAnimation ? google.maps.Animation.DROP : undefined}
            />
          )}
          
          {/* Customer marker */}
          {customerLocation && customerLocation.latitude && customerLocation.longitude && (
            <Marker
              position={{
                lat: customerLocation.latitude,
                lng: customerLocation.longitude
              }}
              icon={{
                url: '/assets/customer-marker.png',
                scaledSize: new google.maps.Size(36, 36)
              }}
              animation={enableAnimation ? google.maps.Animation.DROP : undefined}
            />
          )}
          
          {/* Additional location markers */}
          {locations && locations.map((location, index) => (
            <Marker
              key={`location-${index}`}
              position={{
                lat: location.latitude,
                lng: location.longitude
              }}
              icon={{
                url: location.type === 'driver' 
                  ? '/assets/driver-marker.png' 
                  : (location.type === 'restaurant' 
                    ? '/assets/restaurant-marker.png' 
                    : '/assets/customer-marker.png'),
                scaledSize: new google.maps.Size(32, 32)
              }}
              title={location.title}
              animation={enableAnimation ? google.maps.Animation.DROP : undefined}
            />
          ))}
          
          {/* Show directions if calculated */}
          {directions && !lowPerformanceMode && (
            <DirectionsRenderer
              directions={directions}
              options={{
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: "#6366F1",
                  strokeWeight: 5,
                  strokeOpacity: 0.7
                }
              }}
            />
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default DeliveryGoogleMap;
