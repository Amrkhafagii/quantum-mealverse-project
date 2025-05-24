
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import StandardMap from '../maps/StandardMap';
import { Order } from '@/types/order';
import { MapMarker } from '@/services/maps/MapService';
import { useMapService } from '@/contexts/MapServiceContext';
import { Platform } from '@/utils/platform';

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
  refreshInterval?: number;
  onMapReady?: () => void;
}

const OrderLocationMap: React.FC<OrderLocationMapProps> = ({
  order,
  driver,
  showRestaurant = true,
  showCustomer = true,
  showDriver = true,
  height = 'h-[300px]',
  className = '',
  showAccuracyCircle = false,
  refreshInterval = 0,
  onMapReady
}) => {
  const { performanceLevel } = useMapService();
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  
  // Enable low performance mode based on platform and performance level
  const shouldUseLowPerformanceMode = () => {
    if (performanceLevel === 'low') return true;
    if (Platform.isLowEndDevice()) return true;
    return false;
  };
  
  // Generate markers based on props
  useEffect(() => {
    if (!order) return;
    
    const newMarkers: MapMarker[] = [];
    
    // Add restaurant marker - handle both string and object types for coordinates
    if (showRestaurant && order.restaurant) {
      // Handle restaurant location regardless of property structure
      let restaurantLat = null;
      let restaurantLng = null;
      
      if (order.restaurant.latitude !== undefined && typeof order.restaurant.latitude === 'number') {
        restaurantLat = order.restaurant.latitude;
      }
      
      if (order.restaurant.longitude !== undefined && typeof order.restaurant.longitude === 'number') {
        restaurantLng = order.restaurant.longitude;
      }
      
      if (restaurantLat !== null && restaurantLng !== null) {
        newMarkers.push({
          latitude: restaurantLat,
          longitude: restaurantLng,
          title: order.restaurant.name || 'Restaurant',
          type: 'restaurant'
        });
      }
    }
    
    // Add customer marker
    if (showCustomer && order.latitude && order.longitude) {
      newMarkers.push({
        latitude: order.latitude,
        longitude: order.longitude,
        title: 'Delivery Address',
        type: 'customer'
      });
    }
    
    // Add driver marker
    if (showDriver && driver && driver.latitude && driver.longitude) {
      newMarkers.push({
        latitude: driver.latitude,
        longitude: driver.longitude,
        title: driver.title || 'Driver',
        type: 'driver'
      });
    }
    
    setMarkers(newMarkers);
  }, [order, driver, showRestaurant, showCustomer, showDriver]);
  
  // Return empty state if there's no order
  if (!order) {
    return (
      <Card className={`${className} flex items-center justify-center`} style={{ height }}>
        <p className="text-muted-foreground">Order information not available</p>
      </Card>
    );
  }
  
  // If no valid markers, show empty state
  if (markers.length === 0) {
    return (
      <Card className={`${className} flex items-center justify-center`} style={{ height }}>
        <p className="text-muted-foreground">No location data available</p>
      </Card>
    );
  }
  
  // Determine center coordinates
  let centerMarker = null;
  
  // If driver is visible, center on driver
  if (showDriver && driver) {
    centerMarker = markers.find(marker => marker.type === 'driver');
  }
  
  // If no driver or driver not visible, center on restaurant
  if (!centerMarker && showRestaurant && order.restaurant) {
    centerMarker = markers.find(marker => marker.type === 'restaurant');
  }
  
  // If no restaurant or restaurant not visible, center on customer
  if (!centerMarker && showCustomer) {
    centerMarker = markers.find(marker => marker.type === 'customer');
  }
  
  // If still no center marker, use the first marker
  if (!centerMarker && markers.length > 0) {
    centerMarker = markers[0];
  }
  
  return (
    <StandardMap
      mapId={`order-map-${order.id}`}
      height={height}
      className={className}
      markers={markers}
      center={centerMarker ? { latitude: centerMarker.latitude, longitude: centerMarker.longitude } : undefined}
      showUserLocation={false}
      showAccuracyCircle={showAccuracyCircle}
      lowPerformanceMode={shouldUseLowPerformanceMode()}
      refreshInterval={refreshInterval}
      onMapReady={onMapReady}
    />
  );
};

export default OrderLocationMap;
