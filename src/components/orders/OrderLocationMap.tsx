
import React, { useState, useEffect } from 'react';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { Order } from '@/types/order';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import MapContainer from '../maps/MapContainer';
import OfflineMapFallback from '../maps/OfflineMapFallback';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useNetworkQuality } from '@/hooks/useNetworkQuality';

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
    onError: (error) => {
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
  const locations = [];
  
  // Add restaurant location
  if (order.restaurant && order.restaurant.latitude && order.restaurant.longitude) {
    locations.push({
      latitude: order.restaurant.latitude,
      longitude: order.restaurant.longitude,
      title: order.restaurant.name || "Restaurant",
      type: "restaurant"
    });
  }
  
  // Add customer location
  if (order.latitude && order.longitude) {
    locations.push({
      latitude: order.latitude,
      longitude: order.longitude,
      title: "Delivery Location",
      type: "customer"
    });
  }
  
  // Add delivery driver location
  if (deliveryLocation?.latitude && deliveryLocation?.longitude) {
    locations.push({
      latitude: deliveryLocation.latitude,
      longitude: deliveryLocation.longitude,
      title: "Driver Location",
      type: "driver",
      timestamp: deliveryLocation.timestamp
    });
  }
  
  // Handle different situations for map display
  if (!isOnline || !isMapEnabled) {
    // Show fallback for offline or disabled map
    return (
      <OfflineMapFallback 
        title={!isOnline ? "Offline Mode" : "Map Disabled"}
        description={!isOnline 
          ? "Map is unavailable while offline" 
          : "Map has been disabled due to poor connection quality"
        }
        onRetry={handleRetry}
        isRetrying={isRetrying}
        showLocationData={true}
        locationData={{
          latitude: order.latitude,
          longitude: order.longitude,
          address: order.delivery_address,
          lastUpdated: deliveryLocation?.timestamp 
            ? format(new Date(deliveryLocation.timestamp), 'HH:mm:ss')
            : undefined
        }}
      />
    );
  }
  
  if (isLoading && assignmentId) {
    return <OfflineMapFallback isLoading={true} title="Loading Map" />;
  }
  
  if (isLowQuality) {
    // Show simplified map for low-quality connections
    return (
      <MapContainer
        locations={locations}
        zoomLevel={12}
        enableAnimation={false}
        lowPerformanceMode={true}
        enableControls={false}
      />
    );
  }
  
  // Show full-featured map for good connections
  return (
    <MapContainer
      locations={locations}
      zoomLevel={13}
      enableAnimation={true}
    />
  );
};

export default OrderLocationMap;
