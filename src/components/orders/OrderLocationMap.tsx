
import React, { useState, useEffect } from 'react';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { Order } from '@/types/order';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import MapContainer from '../maps/MapContainer';
import { OfflineMapFallback } from '../maps/OfflineMapFallback';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useNetworkQuality } from '@/hooks/useNetworkQuality';
import UnifiedMapView from '../maps/UnifiedMapView';

interface OrderLocationMapProps {
  order: Order;
  assignmentId?: string | null;
}

const OrderLocationMap: React.FC<OrderLocationMapProps> = ({ order, assignmentId }) => {
  const { isOnline } = useConnectionStatus();
  const { quality, isLowQuality } = useNetworkQuality();
  const [isMapEnabled, setIsMapEnabled] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  
  const { data: deliveryLocation, isLoading } = useQuery({
    queryKey: ['delivery-location', assignmentId, retryCount],
    queryFn: async () => {
      if (!isOnline || !assignmentId) {
        throw new Error('Offline or no assignment ID');
      }
      
      if (isLowQuality) {
        console.warn('Network quality is low, using simplified map data');
      }
      
      const { data, error } = await supabase
        .from('delivery_locations')
        .select('*')
        .eq('assignment_id', assignmentId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .maybeSingle();
        
      if (error) throw error;
      return data;
    },
    enabled: !!assignmentId && isOnline && isMapEnabled,
    refetchInterval: (isOnline && !isLowQuality) ? 10000 : false,
    retry: isLowQuality ? 1 : 3, // Limit retries on low-quality connections
    staleTime: isLowQuality ? 30000 : 10000, // Cache longer on poor connections
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching delivery location:', error);
        if (retryCount > 3) {
          setIsMapEnabled(false);
          toast({
            title: "Map Disabled",
            description: "Map has been disabled due to connection issues",
            variant: "destructive",
          });
        }
      }
    }
  });

  // Disable map on very poor connections
  useEffect(() => {
    if (quality === 'very-poor' && isMapEnabled) {
      setIsMapEnabled(false);
      toast({
        title: "Map Disabled",
        description: "Map features have been disabled due to poor connection",
        variant: "destructive",
      });
    }
  }, [quality, isMapEnabled]);

  const handleRetry = () => {
    if (!isOnline) {
      toast({
        title: "Still Offline",
        description: "Please check your connection and try again",
        variant: "destructive",
      });
      return;
    }
    
    setIsRetrying(true);
    setIsMapEnabled(true);
    setRetryCount(prev => prev + 1);
    
    setTimeout(() => {
      setIsRetrying(false);
    }, 2000);
  };

  // Prepare locations for the map
  const driverLocation = deliveryLocation?.latitude && deliveryLocation?.longitude ? {
    latitude: deliveryLocation.latitude,
    longitude: deliveryLocation.longitude,
    title: "Driver Location",
    type: "driver",
    timestamp: deliveryLocation.timestamp
  } : undefined;
  
  const restaurantLocation = order.restaurant && order.restaurant.latitude && order.restaurant.longitude ? {
    latitude: order.restaurant.latitude,
    longitude: order.restaurant.longitude,
    title: order.restaurant.name || "Restaurant",
    type: "restaurant"
  } : undefined;
  
  const customerLocation = order.latitude && order.longitude ? {
    latitude: order.latitude,
    longitude: order.longitude,
    title: "Delivery Location",
    type: "customer"
  } : undefined;
  
  // Use our new UnifiedMapView component that handles platform differences
  return (
    <UnifiedMapView
      driverLocation={driverLocation}
      restaurantLocation={restaurantLocation}
      customerLocation={customerLocation}
      showRoute={isOnline && !isLowQuality}
      title="Order Location"
      isInteractive={isOnline && isMapEnabled && !isLoading}
      height="h-[300px]"
    />
  );
};

export default OrderLocationMap;
