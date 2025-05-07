import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Order } from '@/types/order';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { useRealtimeLocation } from '@/hooks/useRealtimeLocation';
import { supabase } from '@/integrations/supabase/client';
import { GoogleMap, MarkerF, DirectionsRenderer } from '@react-google-maps/api';
import { Platform } from '@/utils/platform';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';

interface OrderLocationMapProps {
  order: Order;
  assignmentId?: string | null;
}

// Define a more comprehensive restaurant type
interface RestaurantWithLocation {
  id: string;
  name: string;
  latitude?: number | null;
  longitude?: number | null;
}

const OrderLocationMap: React.FC<OrderLocationMapProps> = ({ order, assignmentId }) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [deliveryAssignment, setDeliveryAssignment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [center, setCenter] = useState<{lat: number, lng: number}>({
    lat: 30.0444, // Default to Egypt's coordinates
    lng: 31.2357
  });
  const { isOnline } = useConnectionStatus();
  const isMobile = Platform.isNative();
  
  // Use the directly provided assignmentId if available, otherwise fetch it
  const { latestLocation, isSubscribed } = useRealtimeLocation({
    assignmentId: assignmentId || deliveryAssignment?.id
  });

  // Only fetch delivery assignment if assignmentId is not provided
  useEffect(() => {
    const fetchDeliveryAssignment = async () => {
      if (!order?.id || assignmentId || !isOnline) {
        setIsLoading(false);
        return; // Don't fetch if we already have assignmentId or no order
      }
      
      try {
        const { data, error } = await supabase
          .from('delivery_assignments')
          .select('*')
          .eq('order_id', order.id)
          .in('status', ['assigned', 'picked_up', 'on_the_way'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (!error && data) {
          console.log('Found delivery assignment for map:', data.id);
          setDeliveryAssignment(data);
        }
      } catch (error) {
        console.error('Error fetching delivery assignment:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDeliveryAssignment();
  }, [order?.id, assignmentId, isOnline]);
  
  // Calculate directions when we have the delivery location
  useEffect(() => {
    if (!map || !latestLocation || !order || !isOnline) return;
    
    const directionsService = new google.maps.DirectionsService();
    
    if (order.latitude && order.longitude) {
      const origin = new google.maps.LatLng(latestLocation.latitude, latestLocation.longitude);
      const destination = new google.maps.LatLng(order.latitude, order.longitude);
      
      directionsService.route({
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
      }, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          console.error(`Error fetching directions: ${status}`);
        }
      });
    }
  }, [map, latestLocation, order, isOnline]);
  
  // Update center based on the latest available location
  useEffect(() => {
    if (latestLocation) {
      setCenter({
        lat: latestLocation.latitude,
        lng: latestLocation.longitude
      });
    } else if (order?.latitude && order?.longitude) {
      setCenter({
        lat: order.latitude,
        lng: order.longitude
      });
    }
  }, [latestLocation, order]);

  if (isLoading) {
    return (
      <Card className={isMobile ? 'mx-0 rounded-lg shadow-lg' : ''}>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2">Loading map...</span>
        </CardContent>
      </Card>
    );
  }

  if (!isOnline) {
    return (
      <Card className={isMobile ? 'mx-0 rounded-lg shadow-lg' : ''}>
        <CardContent className="p-6 text-center">
          <MapPin className="h-6 w-6 mx-auto mb-2 text-amber-500" />
          <p className="text-sm text-amber-500">Map unavailable while offline.</p>
        </CardContent>
      </Card>
    );
  }

  if (!order.latitude || !order.longitude) {
    return (
      <Card className={isMobile ? 'mx-0 rounded-lg shadow-lg' : ''}>
        <CardContent className="p-6 text-center">
          <MapPin className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No location information available for this order.</p>
        </CardContent>
      </Card>
    );
  }

  // Check if restaurant has location data before rendering its marker
  const hasRestaurantLocation = 
    order.restaurant && 
    'latitude' in order.restaurant && 
    order.restaurant.latitude !== null && 
    'longitude' in order.restaurant &&
    order.restaurant.longitude !== null;

  return (
    <Card className={isMobile ? 'mx-0 rounded-lg shadow-lg' : ''}>
      <CardContent className="p-2 h-[300px]">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={center}
          zoom={14}
          onLoad={(map) => setMap(map)}
          options={{
            fullscreenControl: false,
            zoomControl: !isMobile,
            mapTypeControl: false,
            streetViewControl: false,
            gestureHandling: isMobile ? 'cooperative' : 'auto'
          }}
        >
          {/* Restaurant marker - Only show if restaurant has location data */}
          {hasRestaurantLocation && (
            <MarkerF
              position={{ 
                lat: (order.restaurant as RestaurantWithLocation).latitude!, 
                lng: (order.restaurant as RestaurantWithLocation).longitude! 
              }}
              icon={{
                url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                scaledSize: new google.maps.Size(40, 40)
              }}
              title={(order.restaurant as RestaurantWithLocation).name}
            />
          )}
          
          {/* Delivery address marker */}
          <MarkerF
            position={{ lat: order.latitude!, lng: order.longitude! }}
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
              scaledSize: new google.maps.Size(40, 40)
            }}
            title="Delivery Address"
          />
          
          {/* Delivery driver marker */}
          {latestLocation && (
            <MarkerF
              position={{ lat: latestLocation.latitude, lng: latestLocation.longitude }}
              icon={{
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 6,
                fillColor: "#3f88c5",
                fillOpacity: 1,
                strokeWeight: 2,
                rotation: 0
              }}
              title="Delivery Driver"
            />
          )}
          
          {/* Show directions if available */}
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: "#3f88c5",
                  strokeWeight: 5
                }
              }}
            />
          )}
        </GoogleMap>
        
        {/* Connection status indicator */}
        <div className="absolute bottom-2 right-2 bg-black/70 rounded-full px-2 py-1 text-xs flex items-center">
          <span className={`w-2 h-2 rounded-full mr-1 ${isSubscribed ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span>{isSubscribed ? 'Live tracking' : 'Tracking offline'}</span>
        </div>
        
        {isMobile && (
          <div className="absolute bottom-2 left-2 bg-black/70 rounded-full px-2 py-1 text-xs text-white">
            Tap map to interact
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderLocationMap;
