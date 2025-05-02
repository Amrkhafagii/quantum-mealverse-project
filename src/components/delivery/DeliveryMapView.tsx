
import React, { useEffect, useState } from 'react';
import DeliveryMap from '../maps/DeliveryMap';
import { useDeliveryMap } from '@/contexts/DeliveryMapContext';
import MapboxTokenForm from '../maps/MapboxTokenForm';
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeliveryAssignment } from '@/types/delivery-assignment';
import { useLocationTracker } from '@/hooks/useLocationTracker';
import { toast } from '@/hooks/use-toast';

interface DeliveryMapViewProps {
  activeAssignment?: DeliveryAssignment;
  className?: string;
}

const DeliveryMapView: React.FC<DeliveryMapViewProps> = ({ activeAssignment, className = '' }) => {
  const { mapboxToken, setMapboxToken, updateDriverLocation } = useDeliveryMap();
  const [mapReady, setMapReady] = useState(false);
  const [restaurantLocation, setRestaurantLocation] = useState<any>(null);
  const [customerLocation, setCustomerLocation] = useState<any>(null);
  
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
  
  // Initialize map with saved token
  useEffect(() => {
    const savedToken = localStorage.getItem('mapbox_token');
    if (savedToken) {
      setMapboxToken(savedToken);
      setMapReady(true);
    }
  }, []);
  
  // Update restaurant and customer locations when assignment changes
  useEffect(() => {
    if (activeAssignment) {
      if (activeAssignment.restaurant) {
        setRestaurantLocation({
          latitude: activeAssignment.restaurant.latitude,
          longitude: activeAssignment.restaurant.longitude,
          title: activeAssignment.restaurant.name,
          description: activeAssignment.restaurant.address,
          type: 'restaurant'
        });
      }
      
      if (activeAssignment.customer) {
        setCustomerLocation({
          latitude: activeAssignment.customer.latitude,
          longitude: activeAssignment.customer.longitude,
          title: 'Customer',
          description: activeAssignment.customer.address,
          type: 'customer'
        });
      }
    }
  }, [activeAssignment]);
  
  // Handle token form submission
  const handleTokenSubmit = (token: string) => {
    setMapboxToken(token);
    setMapReady(true);
    toast({
      title: "Mapbox configured",
      description: "Map functionality is now available",
    });
  };
  
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
        
        toast({
          title: "Location updated",
          description: "Your location has been updated on the map",
        });
      }
    } catch (error) {
      console.error('Error updating location:', error);
      toast({
        title: "Location error",
        description: "Failed to update your location",
        variant: "destructive",
      });
    }
  };
  
  if (!mapReady || !mapboxToken) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Delivery Map</CardTitle>
        </CardHeader>
        <CardContent>
          <MapboxTokenForm onTokenSubmit={handleTokenSubmit} />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Delivery Map</CardTitle>
          <Button variant="outline" size="sm" onClick={handleUpdateLocation}>
            <MapPin className="h-4 w-4 mr-2" />
            Update Location
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-2">
        <DeliveryMap
          driverLocation={null} // This will be updated by the location tracker
          restaurantLocation={restaurantLocation}
          customerLocation={customerLocation}
          showRoute={true}
          className="h-[400px] w-full"
          zoom={14}
          autoCenter={true}
        />
        
        {activeAssignment && (
          <div className="mt-2 text-sm space-y-1">
            {activeAssignment.restaurant && (
              <p className="flex items-center">
                <span className="inline-block w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                Restaurant: {activeAssignment.restaurant.name || 'Unknown'}
              </p>
            )}
            
            {activeAssignment.customer && (
              <p className="flex items-center">
                <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                Customer: {activeAssignment.customer.address || 'Unknown'}
              </p>
            )}
            
            {activeAssignment.distance_km && (
              <p className="flex items-center">
                <Navigation className="h-4 w-4 mr-2 text-quantum-cyan" />
                Distance: {activeAssignment.distance_km.toFixed(1)} km
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeliveryMapView;
