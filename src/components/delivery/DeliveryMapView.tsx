
import React, { useState, useEffect, useRef } from 'react';
import { GoogleMapFactory } from '../maps/GoogleMapFactory';
import { LazyGoogleMapsLoader } from '../maps/LazyGoogleMapsLoader';
import { MapComponent } from '../maps/MapComponent';
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
import { useNetworkRetry } from '@/hooks/useNetworkRetry';

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
  const [center, setCenter] = useState({ lat: 37.7749, lng: -122.4194 });
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
  const handleMapLoad = () => {
    setMapLoaded(true);
    setMapLoadError(null);
  };
  
  // Handle map errors
  const handleMapError = (error: Error) => {
    setMapLoadError(error.message || "Failed to load Google Maps");
  };
  
  // Use network retry for loading operations
  const { execute: retryLoadingMap, isLoading: isRetrying } = useNetworkRetry(
    async () => {
      setMapLoadError(null);
      return true;
    }
  );

  // If offline, show offline fallback
  if (!isOnline) {
    return (
      <OfflineMapFallback 
        title="Map Unavailable Offline"
        description="You are currently offline. The delivery map will be available when your connection is restored."
        retry={() => retryLoadingMap()}
        isRetrying={isRetrying}
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
        description={`There was a problem loading the map: ${mapLoadError}`}
        retry={() => retryLoadingMap()}
        isRetrying={isRetrying}
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

  // Prepare markers for the map
  const markers = [];
  
  // Add driver marker
  if (location) {
    markers.push({
      id: 'driver',
      position: { 
        lat: location.coords.latitude, 
        lng: location.coords.longitude 
      },
      title: 'Your Location',
      type: 'driver',
      icon: {
        url: '/assets/driver-marker.png',
        scaledSize: { width: 40, height: 40 }
      }
    });
  }
  
  // Add restaurant and customer markers from active assignment
  if (activeAssignment) {
    // Restaurant marker
    if (activeAssignment.restaurant && activeAssignment.restaurant.latitude) {
      markers.push({
        id: `restaurant-${activeAssignment.id}`,
        position: { 
          lat: activeAssignment.restaurant.latitude, 
          lng: activeAssignment.restaurant.longitude 
        },
        title: activeAssignment.restaurant.name || 'Restaurant',
        type: 'restaurant',
        icon: {
          url: '/assets/restaurant-marker.png',
          scaledSize: { width: 32, height: 32 }
        },
        onClick: () => setSelectedOrder(activeAssignment)
      });
    }
    
    // Customer marker
    if (activeAssignment.latitude && activeAssignment.longitude) {
      markers.push({
        id: `customer-${activeAssignment.id}`,
        position: { 
          lat: activeAssignment.latitude, 
          lng: activeAssignment.longitude 
        },
        title: activeAssignment.customer?.name || 'Customer',
        type: 'customer',
        icon: {
          url: '/assets/customer-marker.png',
          scaledSize: { width: 32, height: 32 }
        },
        onClick: () => setSelectedOrder(activeAssignment)
      });
    }
  }

  return (
    <div className={`relative w-full ${className}`}>
      {showControls && (
        <DeliveryLocationControls />
      )}
      
      <BatteryEfficientTracker />
      
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <MapComponent
            id="delivery-map"
            center={center}
            zoom={12}
            markers={markers}
            showRoute={true}
            isInteractive={true}
            height="400px"
            width="100%"
            onMapReady={handleMapLoad}
            className="rounded-none"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryMapView;
