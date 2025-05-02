
import React, { useEffect, useState } from 'react';
import DeliveryGoogleMap from '../maps/DeliveryGoogleMap';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order } from '@/types/order';
import { useRealtimeLocation } from '@/hooks/useRealtimeLocation';
import { getLatestDeliveryLocation } from '@/services/delivery/deliveryLocationService';
import { formatDistanceToNow } from 'date-fns';

interface OrderLocationMapProps {
  order: Order;
  className?: string;
}

const OrderLocationMap: React.FC<OrderLocationMapProps> = ({ order, className = '' }) => {
  const { googleMapsApiKey } = useGoogleMaps();
  const [mapReady, setMapReady] = useState(false);
  const [driverLocation, setDriverLocation] = useState<any>(null);
  const [restaurantLocation, setRestaurantLocation] = useState<any>(null);
  const [customerLocation, setCustomerLocation] = useState<any>(null);
  const [assignmentId, setAssignmentId] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  
  // Fetch the assignment ID for this order (simulated)
  useEffect(() => {
    // In a real app, we would fetch this from the API
    // For now, we'll simulate it based on the order ID
    if (order?.id) {
      // Create a deterministic assignment ID based on the order ID
      setAssignmentId(`sim-assignment-${order.id.substring(0, 8)}`);
    }
  }, [order?.id]);
  
  // Subscribe to real-time location updates for this delivery
  const { isSubscribed, latestLocation } = useRealtimeLocation({
    assignmentId: assignmentId || undefined,
    onLocationUpdate: (location) => {
      console.log('Real-time driver location update received:', location);
      setDriverLocation({
        latitude: location.latitude,
        longitude: location.longitude,
        title: 'Delivery Driver',
        type: 'driver'
      });
      setLastUpdateTime(new Date(location.timestamp));
    }
  });
  
  // Initialize map when API key is available
  useEffect(() => {
    if (googleMapsApiKey) {
      setMapReady(true);
    }
  }, [googleMapsApiKey]);
  
  // Set customer location based on order
  useEffect(() => {
    if (order && order.latitude && order.longitude) {
      setCustomerLocation({
        latitude: order.latitude,
        longitude: order.longitude,
        title: 'Delivery Address',
        description: order.delivery_address,
        type: 'customer'
      });
    }
  }, [order]);
  
  // Set restaurant location if available
  useEffect(() => {
    if (order && order.restaurant_id) {
      // For now, use a simulated restaurant location
      // In a real app, you'd fetch this from your database
      setRestaurantLocation({
        latitude: (order.latitude || 0) + 0.01, // Offset for demonstration
        longitude: (order.longitude || 0) + 0.01,
        title: order.restaurant?.name || 'Restaurant',
        type: 'restaurant'
      });
    }
  }, [order]);
  
  // Fetch initial driver location when assignment ID is available
  useEffect(() => {
    if (assignmentId) {
      const fetchInitialLocation = async () => {
        try {
          const latestLocation = await getLatestDeliveryLocation(assignmentId);
          if (latestLocation) {
            setDriverLocation({
              latitude: latestLocation.latitude,
              longitude: latestLocation.longitude,
              title: 'Delivery Driver',
              type: 'driver'
            });
            setLastUpdateTime(new Date(latestLocation.timestamp));
          }
        } catch (error) {
          console.error('Error fetching initial location:', error);
        }
      };
      
      fetchInitialLocation();
    }
  }, [assignmentId]);
  
  // If order isn't being delivered, just show the customer and restaurant locations
  const showDeliveryDriver = ['on_the_way', 'picked_up'].includes(order?.status || '');
  
  // For demo purposes, if we don't have a real driver location yet, create a simulated one
  useEffect(() => {
    if (showDeliveryDriver && !driverLocation && restaurantLocation && customerLocation) {
      // Create a simulated driver location between restaurant and customer
      const factor = Math.random() * 0.7; // Random position between restaurant and customer
      setDriverLocation({
        latitude: restaurantLocation.latitude - ((restaurantLocation.latitude - customerLocation.latitude) * factor),
        longitude: restaurantLocation.longitude - ((restaurantLocation.longitude - customerLocation.longitude) * factor),
        title: 'Delivery Driver',
        type: 'driver'
      });
      setLastUpdateTime(new Date());
    }
  }, [showDeliveryDriver, driverLocation, restaurantLocation, customerLocation]);
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Order Location</CardTitle>
          {isSubscribed && (
            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
              <span className="mr-1 h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
              Live Tracking
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-2">
        <DeliveryGoogleMap
          driverLocation={showDeliveryDriver ? driverLocation : undefined}
          restaurantLocation={restaurantLocation}
          customerLocation={customerLocation}
          showRoute={showDeliveryDriver}
          className="h-[300px] w-full"
          zoom={14}
          autoCenter={true}
          isInteractive={true}
        />
        
        <div className="mt-2 text-sm space-y-1">
          <p className="flex items-center">
            <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
            Delivery Address
          </p>
          
          {restaurantLocation && (
            <p className="flex items-center">
              <span className="inline-block w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
              Restaurant
            </p>
          )}
          
          {showDeliveryDriver && driverLocation && (
            <p className="flex items-center">
              <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              Delivery Driver
            </p>
          )}

          {lastUpdateTime && showDeliveryDriver && driverLocation && (
            <p className="text-xs text-gray-400 mt-1">
              Location updated {formatDistanceToNow(lastUpdateTime, { addSuffix: true })}
              {isSubscribed && (
                <span className="text-green-400 ml-1">• live updates enabled</span>
              )}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderLocationMap;
