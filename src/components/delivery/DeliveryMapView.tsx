
import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation2 } from 'lucide-react';
import { DeliveryAssignment } from '@/types/delivery-assignment';
import { useLocationTracker } from '@/hooks/useLocationTracker';
import { useRealtimeLocation } from '@/hooks/useRealtimeLocation';
import { useDeliveryMap } from '@/contexts/DeliveryMapContext';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import TouchFriendlyButton from '../mobile/TouchFriendlyButton';
import { Capacitor } from '@capacitor/core';
import DeliveryGoogleMap from '../maps/DeliveryGoogleMap';
import NativeMap from '../maps/NativeMap';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import TouchEnabledMap from '../maps/TouchEnabledMap';
import BackgroundTrackingPermissions from '../maps/BackgroundTrackingPermissions';

interface DeliveryMapViewProps {
  activeAssignment?: DeliveryAssignment;
  className?: string;
}

const DeliveryMapView: React.FC<DeliveryMapViewProps> = ({ activeAssignment, className = '' }) => {
  const { googleMapsApiKey } = useGoogleMaps();
  const { updateDriverLocation, setSelectedDeliveryId, mapZoom, setMapZoom } = useDeliveryMap();
  const [mapReady, setMapReady] = useState(false);
  const [restaurantLocation, setRestaurantLocation] = useState<any>(null);
  const [customerLocation, setCustomerLocation] = useState<any>(null);
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [showBackgroundControls, setShowBackgroundControls] = useState(false);
  const isMobile = useIsMobile();
  const isNative = Capacitor.isNativePlatform();
  
  // Location tracking for the driver
  const { getCurrentLocation } = useLocationTracker({
    watchPosition: true,
    trackingInterval: 5000,
    onLocationUpdate: (pos) => {
      if (mapReady) {
        updateDriverLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          title: 'Your location',
          type: 'driver'
        });
      }
    }
  });
  
  // Real-time location updates for active delivery
  const { isSubscribed, latestLocation } = useRealtimeLocation({
    assignmentId: activeAssignment?.id,
    onLocationUpdate: (location) => {
      // This will be called whenever a new location update is received
      console.log('Realtime location update received:', location);
      
      // Update the map with the latest position
      if (location && mapReady) {
        updateDriverLocation({
          latitude: location.latitude,
          longitude: location.longitude,
          title: 'Driver location',
          type: 'driver'
        });
        setIsLiveTracking(true);
      }
    }
  });
  
  // Initialize map when API key is available
  useEffect(() => {
    if (googleMapsApiKey) {
      setMapReady(true);
    }
  }, [googleMapsApiKey]);
  
  // Update restaurant and customer locations when assignment changes
  useEffect(() => {
    if (activeAssignment) {
      setSelectedDeliveryId(activeAssignment.id);
      
      console.log('Active assignment restaurant data:', activeAssignment.restaurant);
      console.log('Active assignment customer data:', activeAssignment.customer);
      
      if (activeAssignment.restaurant) {
        // Make sure we have valid coordinates
        if (activeAssignment.restaurant.latitude && activeAssignment.restaurant.longitude) {
          setRestaurantLocation({
            latitude: activeAssignment.restaurant.latitude,
            longitude: activeAssignment.restaurant.longitude,
            title: activeAssignment.restaurant.name || 'Restaurant',
            description: activeAssignment.restaurant.address || '',
            type: 'restaurant'
          });
          console.log('Set restaurant location:', activeAssignment.restaurant);
        } else {
          console.warn('Missing restaurant coordinates in assignment:', activeAssignment.id);
          setRestaurantLocation(null);
        }
      } else {
        setRestaurantLocation(null);
      }
      
      if (activeAssignment.customer) {
        // Make sure we have valid coordinates
        if (activeAssignment.customer.latitude && activeAssignment.customer.longitude) {
          setCustomerLocation({
            latitude: activeAssignment.customer.latitude,
            longitude: activeAssignment.customer.longitude,
            title: activeAssignment.customer.name || 'Customer',
            description: activeAssignment.customer.address || '',
            type: 'customer'
          });
          console.log('Set customer location:', activeAssignment.customer);
        } else {
          console.warn('Missing customer coordinates in assignment:', activeAssignment.id);
          setCustomerLocation(null);
        }
      } else {
        setCustomerLocation(null);
      }
    } else {
      setSelectedDeliveryId(null);
      setRestaurantLocation(null);
      setCustomerLocation(null);
    }
    
    return () => {
      setSelectedDeliveryId(null);
    };
  }, [activeAssignment, setSelectedDeliveryId]);
  
  // Handle manual location update
  const handleUpdateLocation = async () => {
    try {
      const location = await getCurrentLocation();
      if (location) {
        updateDriverLocation({
          latitude: location.latitude,
          longitude: location.longitude,
          title: 'Your location',
          type: 'driver'
        });
        
        toast.success("Location updated on map");
      }
    } catch (error) {
      console.error('Error updating location:', error);
      toast.error("Failed to update your location");
    }
  };

  // Handle map zoom
  const handleZoomIn = () => {
    setMapZoom((prevZoom) => Math.min(prevZoom + 1, 20));
  };

  const handleZoomOut = () => {
    setMapZoom((prevZoom) => Math.max(prevZoom - 1, 1));
  };
  
  // Toggle background tracking controls
  const toggleBackgroundControls = () => {
    setShowBackgroundControls(prev => !prev);
  };
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            Delivery Map
            {isLiveTracking && (
              <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                <span className="mr-1 h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Live
              </span>
            )}
          </CardTitle>
          <div className="flex space-x-2">
            {isNative && (
              <TouchFriendlyButton 
                variant="outline" 
                size="sm" 
                onClick={toggleBackgroundControls}
                touchClassName={isMobile ? "h-10 px-4" : ""}
              >
                <MapPin className="h-4 w-4 mr-2" />
                {showBackgroundControls ? "Hide Tracking" : "Background Tracking"}
              </TouchFriendlyButton>
            )}
            
            <TouchFriendlyButton 
              variant="outline" 
              size="sm" 
              onClick={handleUpdateLocation}
              touchClassName={isMobile ? "h-10 px-4" : ""}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Update Location
            </TouchFriendlyButton>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2">
        {showBackgroundControls && isNative && (
          <div className="mb-4">
            <BackgroundTrackingPermissions 
              onTrackingStarted={() => setIsLiveTracking(true)}
              onTrackingStopped={() => setIsLiveTracking(false)}
            />
          </div>
        )}

        {googleMapsApiKey ? (
          isNative ? (
            <NativeMap
              driverLocation={null} // This will be updated by the location tracker
              restaurantLocation={restaurantLocation}
              customerLocation={customerLocation}
              showRoute={true}
              className="h-[400px] w-full"
              zoom={mapZoom || 14}
              autoCenter={true}
            />
          ) : (
            <TouchEnabledMap 
              className="h-[400px] w-full relative"
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
            >
              <DeliveryGoogleMap
                driverLocation={null} // This will be updated by the location tracker
                restaurantLocation={restaurantLocation}
                customerLocation={customerLocation}
                showRoute={true}
                className="h-[400px] w-full"
                zoom={mapZoom || 14}
                autoCenter={true}
              />
            </TouchEnabledMap>
          )
        ) : (
          <div className="flex items-center justify-center h-[400px] bg-gray-100 rounded-md">
            <p className="text-gray-500">Google Maps API key is required to display the map</p>
          </div>
        )}
        
        {activeAssignment && (
          <div className="mt-2 text-sm space-y-1">
            {restaurantLocation && (
              <p className="flex items-center">
                <span className="inline-block w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                Restaurant: {activeAssignment.restaurant?.name || 'Unknown'}
              </p>
            )}
            
            {customerLocation && (
              <p className="flex items-center">
                <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                Customer: {activeAssignment.customer?.address || 'Unknown'}
              </p>
            )}
            
            {activeAssignment.distance_km && (
              <p className="flex items-center">
                <Navigation2 className="h-4 w-4 mr-2 text-quantum-cyan" />
                Distance: {activeAssignment.distance_km.toFixed(1)} km
              </p>
            )}
            
            {isSubscribed && (
              <p className="text-xs text-green-500 flex items-center mt-2">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse mr-1.5"></span>
                Real-time tracking enabled
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeliveryMapView;
