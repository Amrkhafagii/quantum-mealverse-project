
import React, { useEffect, useState } from 'react';
import DeliveryGoogleMap from '../maps/DeliveryGoogleMap';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order } from '@/types/order';
import { getDeliveryLocationHistory } from '@/services/delivery/deliveryLocationService';

interface OrderLocationMapProps {
  order: Order;
  className?: string;
}

const OrderLocationMap: React.FC<OrderLocationMapProps> = ({ order, className = '' }) => {
  const { googleMapsApiKey, setGoogleMapsApiKey } = useGoogleMaps();
  const [mapReady, setMapReady] = useState(false);
  const [driverLocation, setDriverLocation] = useState<any>(null);
  const [restaurantLocation, setRestaurantLocation] = useState<any>(null);
  const [customerLocation, setCustomerLocation] = useState<any>(null);
  
  // Initialize map with saved API key
  useEffect(() => {
    const savedApiKey = localStorage.getItem('google_maps_api_key');
    if (savedApiKey) {
      setGoogleMapsApiKey(savedApiKey);
      setMapReady(true);
    }
  }, []);
  
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
  
  // Fetch current delivery location if order is being delivered
  useEffect(() => {
    if (!order || order.status !== 'on_the_way') return;
    
    // Simulate driver location updates
    // In a real app, you'd fetch this from your database using getDeliveryLocationHistory
    const interval = setInterval(() => {
      // Simulate movement between restaurant and customer
      const randomFactor = Math.random() * 0.005;
      if (restaurantLocation && customerLocation) {
        setDriverLocation({
          latitude: restaurantLocation.latitude - (randomFactor * 0.5),
          longitude: restaurantLocation.longitude - (randomFactor * 0.5),
          title: 'Delivery Driver',
          type: 'driver'
        });
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [order, restaurantLocation, customerLocation]);
  
  // If order isn't being delivered, just show the customer and restaurant locations
  const showDeliveryDriver = ['on_the_way', 'picked_up'].includes(order?.status || '');
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle>Order Location</CardTitle>
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
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderLocationMap;
