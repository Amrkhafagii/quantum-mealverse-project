import React, { useState, useEffect, useRef } from 'react';
import { LoadScript, GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { useDeliveryAssignments } from '@/hooks/useDeliveryAssignments';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import { useMapView } from '@/contexts/MapViewContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OfflineMapFallback } from '@/components/maps/OfflineMapFallback';
import { DeliveryLocationControls } from './DeliveryLocationControls';
import { useNetworkQuality } from '@/hooks/useNetworkQuality';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import BatteryEfficientTracker from './BatteryEfficientTracker';
import { Order } from '@/types/order';
import { Loader2 } from 'lucide-react';
import { useDeliveryMap } from '@/contexts/DeliveryMapContext';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194
};

interface DeliveryMapViewProps {
  showControls?: boolean;
  activeAssignment?: any;
  className?: string;
}

export const DeliveryMapView: React.FC<DeliveryMapViewProps> = ({ 
  showControls = true,
  activeAssignment,
  className = ''
}) => {
  const { googleMapsApiKey, isLoaded: isGoogleMapsLoaded } = useGoogleMaps();
  const locationPermission = useLocationPermission();
  const deliveryAssignments = useDeliveryAssignments();
  const { getSavedPosition, savePosition, lowPerformanceMode } = useMapView();
  const { isLowQuality } = useNetworkQuality();
  const { isOnline } = useConnectionStatus();
  const mapRef = useRef<google.maps.Map | null>(null);
  
  // Map state
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [center, setCenter] = useState(defaultCenter);
  const [retryCount, setRetryCount] = useState(0);
  const [mapLoadError, setMapLoadError] = useState<string | null>(null);

  // Extract hasPermission and location from locationPermission
  const hasPermission = locationPermission.permissionStatus === 'granted';
  const location = locationPermission.location;
  
  // Use saved position or current location
  const savedPosition = getSavedPosition('delivery-map');
  
  // Set initial center from saved position or current location
  useEffect(() => {
    if (savedPosition && savedPosition.center) {
      setCenter({
        lat: savedPosition.center.lat,
        lng: savedPosition.center.lng
      });
    } else if (location) {
      setCenter({
        lat: location.coords.latitude,
        lng: location.coords.longitude
      });
    }
  }, [savedPosition, location]);
  
  // When map is loaded successfully
  const handleMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    setMapLoaded(true);
    setMapLoadError(null);
    
    // Set initial bounds to fit all markers
    if (activeAssignment && mapRef.current) {
      const bounds = new google.maps.LatLngBounds();
      
      // Add driver location to bounds
      if (location) {
        bounds.extend(new google.maps.LatLng(
          location.coords.latitude,
          location.coords.longitude
        ));
      }
      
      // Add restaurant location to bounds
      if (activeAssignment.restaurant) {
        bounds.extend(new google.maps.LatLng(
          activeAssignment.restaurant.latitude,
          activeAssignment.restaurant.longitude
        ));
      }
      
      // Add delivery location to bounds
      if (activeAssignment.latitude && activeAssignment.longitude) {
        bounds.extend(new google.maps.LatLng(
          activeAssignment.latitude,
          activeAssignment.longitude
        ));
      }
      
      // Fix the padding error
      mapRef.current.fitBounds(bounds);
    }
  };
  
  // Handle map errors
  const handleMapError = () => {
    setMapLoadError("Failed to load Google Maps");
    setRetryCount(prevCount => prevCount + 1);
  };

  // Save map position when it changes
  const handleCenterChanged = () => {
    if (mapRef.current) {
      const newCenter = mapRef.current.getCenter();
      const zoom = mapRef.current.getZoom();
      
      if (newCenter && zoom) {
        savePosition('delivery-map', {
          center: {
            lat: newCenter.lat(),
            lng: newCenter.lng()
          },
          zoom
        });
      }
    }
  };
  
  // Handle retry attempts
  const retryLoadingMap = () => {
    setMapLoadError(null);
    setRetryCount(prevCount => prevCount + 1);
  };
  
  // If offline, show offline fallback
  if (!isOnline) {
    return (
      <OfflineMapFallback 
        title="Map Unavailable Offline"
        description="You are currently offline. The delivery map will be available when your connection is restored."
        retry={retryLoadingMap}
        isRetrying={false}
        showLocationData={true}
        locationData={location ? {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: "Your Current Location"
        } : undefined}
      />
    );
  }
  
  // If map failed to load, show error
  if (mapLoadError) {
    return (
      <OfflineMapFallback 
        title="Map Loading Error"
        description="There was a problem loading the map. This might be due to network issues or an invalid API key."
        retry={retryLoadingMap}
        isRetrying={false}
      />
    );
  }
  
  // If no API key, show fallback
  if (!googleMapsApiKey) {
    return (
      <OfflineMapFallback 
        title="Map Configuration Required"
        description="A Google Maps API key is required to use maps in this application."
      />
    );
  }
  
  // If no permission, show fallback with prompt
  if (!hasPermission) {
    return (
      <OfflineMapFallback 
        title="Location Permission Required"
        description="Please enable location services to use the delivery map features."
      />
    );
  }

  // Convert delivery assignment to a format suitable for the map
  const mapMarkers = activeAssignment ? [activeAssignment] : [];
  
  return (
    <div className={`relative w-full ${className}`}>
      {showControls && (
        <DeliveryLocationControls />
      )}
      
      <BatteryEfficientTracker />
      
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {!isGoogleMapsLoaded ? (
            <div className="h-[400px] flex items-center justify-center bg-slate-800">
              <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan" />
            </div>
          ) : (
            <LoadScript
              googleMapsApiKey={googleMapsApiKey}
              onError={handleMapError}
              loadingElement={
                <div className="h-[400px] flex items-center justify-center bg-slate-800">
                  <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan" />
                </div>
              }
            >
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={12}
                onLoad={handleMapLoad}
                onCenterChanged={handleCenterChanged}
                options={{
                  fullscreenControl: false,
                  mapTypeControl: false,
                  streetViewControl: false,
                  // Use less demanding map rendering for low quality connections
                  disableDefaultUI: lowPerformanceMode || isLowQuality,
                  gestureHandling: 'greedy',
                }}
              >
                {/* Driver marker */}
                {location && (
                  <Marker
                    position={{ 
                      lat: location.coords.latitude, 
                      lng: location.coords.longitude 
                    }}
                    icon={{
                      url: '/assets/driver-marker.png',
                      scaledSize: new google.maps.Size(40, 40)
                    }}
                  />
                )}
                
                {/* Customer and restaurant markers */}
                {mapMarkers.map((order) => (
                  <React.Fragment key={order.id}>
                    {/* Restaurant marker */}
                    {order.restaurant && order.restaurant.latitude && (
                      <Marker
                        position={{ 
                          lat: order.restaurant.latitude, 
                          lng: order.restaurant.longitude 
                        }}
                        icon={{
                          url: '/assets/restaurant-marker.png',
                          scaledSize: new google.maps.Size(32, 32)
                        }}
                        onClick={() => setSelectedOrder(order)}
                      />
                    )}
                    
                    {/* Delivery location marker */}
                    {order.latitude && order.longitude && (
                      <Marker
                        position={{ lat: order.latitude, lng: order.longitude }}
                        icon={{
                          url: '/assets/customer-marker.png',
                          scaledSize: new google.maps.Size(32, 32)
                        }}
                        onClick={() => setSelectedOrder(order)}
                      />
                    )}
                  </React.Fragment>
                ))}
                
                {/* Info window for selected location */}
                {selectedOrder && (
                  <InfoWindow
                    position={{ 
                      lat: selectedOrder.latitude || 0, 
                      lng: selectedOrder.longitude || 0 
                    }}
                    onCloseClick={() => setSelectedOrder(null)}
                  >
                    <div className="p-2">
                      <h3 className="font-semibold">Order #{selectedOrder.id.slice(-6)}</h3>
                      <p className="text-sm">Status: {selectedOrder.status}</p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-2 text-xs"
                        onClick={() => {
                          // Navigate to order details
                          window.location.href = `/orders/${selectedOrder.id}`;
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            </LoadScript>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryMapView;
