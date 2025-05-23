
import React from 'react';
import { Card } from '@/components/ui/card';
import UnifiedMapView from '../maps/UnifiedMapView';
import { Order } from '@/types/order';

interface OrderLocationMapProps {
  order?: Order;
  driver?: {
    latitude: number;
    longitude: number;
    title?: string;
    timestamp?: string;
    accuracy?: number;
  };
  showRestaurant?: boolean;
  showCustomer?: boolean;
  showDriver?: boolean;
  height?: string;
  className?: string;
  showAccuracyCircle?: boolean;
  // Remove assignmentId from props (not used)
}

const OrderLocationMap: React.FC<OrderLocationMapProps> = ({
  order,
  driver,
  showRestaurant = true,
  showCustomer = true,
  showDriver = true,
  height = 'h-[300px]',
  className = '',
  showAccuracyCircle = false
}) => {
  // Return empty state if there's no order
  if (!order) {
    return (
      <Card className={`${className} flex items-center justify-center`} style={{ height }}>
        <p className="text-muted-foreground">Order information not available</p>
      </Card>
    );
  }
  
  // Extract restaurant, customer, and delivery locations from the order
  const restaurant = order.restaurant;
  const customer = order.delivery_address;
  
  // Create markers for the map
  const markers = [];
  
  // Add restaurant marker - handle both string and object types for coordinates
  if (showRestaurant && restaurant) {
    // Handle restaurant location regardless of property structure
    let restaurantLat = null;
    let restaurantLng = null;
    
    if (restaurant.latitude !== undefined && typeof restaurant.latitude === 'number') {
      restaurantLat = restaurant.latitude;
    }
    
    if (restaurant.longitude !== undefined && typeof restaurant.longitude === 'number') {
      restaurantLng = restaurant.longitude;
    }
    
    if (restaurantLat !== null && restaurantLng !== null) {
      markers.push({
        latitude: restaurantLat,
        longitude: restaurantLng,
        title: restaurant.name || 'Restaurant',
        type: 'restaurant'
      });
    }
  }
  
  // Add customer marker - handle both string and object types for coordinates
  if (showCustomer && customer && order.latitude && order.longitude) {
    // Use the order's coordinates instead of trying to access customer.latitude
    markers.push({
      latitude: order.latitude,
      longitude: order.longitude,
      title: 'Delivery Address',
      type: 'customer'
    });
  }
  
  // Add driver marker
  if (showDriver && driver && driver.latitude && driver.longitude) {
    markers.push({
      latitude: driver.latitude,
      longitude: driver.longitude,
      title: driver.title || 'Driver',
      type: 'driver'
    });
  }
  
  // If no valid markers, show empty state
  if (markers.length === 0) {
    return (
      <Card className={`${className} flex items-center justify-center`} style={{ height }}>
        <p className="text-muted-foreground">No location data available</p>
      </Card>
    );
  }
  
  // Determine center coordinates and zoom level
  let centerMarker = null;
  
  // If driver is visible, center on driver
  if (showDriver && driver) {
    centerMarker = markers.find(marker => marker.type === 'driver');
  }
  
  // If no driver or driver not visible, center on restaurant
  if (!centerMarker && showRestaurant && restaurant) {
    centerMarker = markers.find(marker => marker.type === 'restaurant');
  }
  
  // If no restaurant or restaurant not visible, center on customer
  if (!centerMarker && showCustomer && customer) {
    centerMarker = markers.find(marker => marker.type === 'customer');
  }
  
  // If still no center marker, use the first marker
  if (!centerMarker && markers.length > 0) {
    centerMarker = markers[0];
  }
  
  return (
    <UnifiedMapView
      mapId={`order-map-${order.id}`}
      height={height}
      className={className}
      additionalMarkers={markers}
      showHeader={false}
      showAccuracyCircle={showAccuracyCircle}
    />
  );
};

export default OrderLocationMap;
