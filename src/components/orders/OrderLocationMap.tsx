
import React, { useState, useEffect } from 'react';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { Order } from '@/types/order';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { useNetworkQuality } from '@/hooks/useNetworkQuality';
import UnifiedMapView from '../maps/UnifiedMapView';
import { LocationAccuracyIndicator, AccuracyLevel } from '../location/LocationAccuracyIndicator';
import { useAdaptiveAccuracy } from '@/hooks/useAdaptiveAccuracy';

interface OrderLocationMapProps {
  order: Order;
  assignmentId?: string | null;
}

// Extend the delivery location type to include accuracy
interface DeliveryLocation {
  id: string;
  assignment_id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  accuracy?: number;
}

const OrderLocationMap: React.FC<OrderLocationMapProps> = ({ order, assignmentId }) => {
  const { isOnline } = useConnectionStatus();
  const { quality, isLowQuality } = useNetworkQuality();
  const [isMapEnabled, setIsMapEnabled] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [locationAccuracy, setLocationAccuracy] = useState<AccuracyLevel>('unknown');
  
  // Use our adaptive accuracy hook
  const { 
    accuracyLevel, 
    accuracyValue, 
    attemptAccuracyRecovery 
  } = useAdaptiveAccuracy({
    activityContext: 'driving', // Assuming delivery context
    networkRequired: true
  });
  
  // Update local accuracy state from the hook
  useEffect(() => {
    setLocationAccuracy(accuracyLevel);
  }, [accuracyLevel]);
  
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
      
      // Cast the data to our interface that includes accuracy
      const location = data as DeliveryLocation;
      
      // If we got a location, analyze its accuracy
      if (location && location.accuracy) {
        // Set accuracy level based on the location accuracy value
        let newAccuracy: AccuracyLevel = 'unknown';
        if (location.accuracy <= 20) {
          newAccuracy = 'high';
        } else if (location.accuracy <= 100) {
          newAccuracy = 'medium';
        } else {
          newAccuracy = 'low';
        }
        
        setLocationAccuracy(newAccuracy);
      }
      
      return location;
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

  // Handle accuracy recovery attempt
  const handleAccuracyImprovement = async () => {
    toast({
      title: "Attempting to improve accuracy",
      description: "Please wait...",
    });
    
    const improved = await attemptAccuracyRecovery();
    
    if (improved) {
      toast({
        title: "Accuracy Improved",
        description: "Location accuracy has been improved",
        variant: "default",
      });
    } else {
      toast({
        title: "Could not improve accuracy",
        description: "Try moving to an area with better GPS signal",
        variant: "destructive",
      });
    }
  };

  // Prepare locations for the map
  const driverLocation = deliveryLocation?.latitude && deliveryLocation?.longitude ? {
    latitude: deliveryLocation.latitude,
    longitude: deliveryLocation.longitude,
    title: "Driver Location",
    type: "driver",
    timestamp: deliveryLocation.timestamp,
    accuracy: deliveryLocation.accuracy // Pass through the accuracy
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
  
  // Set map zoom level based on accuracy
  const getMapZoomLevel = () => {
    switch (locationAccuracy) {
      case 'high':
        return 16; // Closest zoom
      case 'medium':
        return 15; // Medium zoom
      case 'low':
        return 13; // Furthest zoom
      default:
        return 14; // Default zoom level
    }
  };
  
  // Use our new UnifiedMapView component that handles platform differences
  return (
    <div className="space-y-2">
      {/* Add accuracy indicator above the map */}
      {driverLocation && (
        <div className="flex justify-between items-center px-1">
          <LocationAccuracyIndicator
            accuracy={locationAccuracy}
            accuracyValue={accuracyValue || deliveryLocation?.accuracy}
            size="small"
            variant="badge"
          />
          
          {locationAccuracy !== 'high' && (
            <button 
              onClick={handleAccuracyImprovement}
              className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400"
            >
              Improve accuracy
            </button>
          )}
        </div>
      )}
      
      <UnifiedMapView
        driverLocation={driverLocation}
        restaurantLocation={restaurantLocation}
        customerLocation={customerLocation}
        showRoute={isOnline && !isLowQuality}
        title="Order Location"
        isInteractive={isOnline && isMapEnabled && !isLoading}
        height="h-[300px]"
        zoomLevel={getMapZoomLevel()}
        locationAccuracy={locationAccuracy}
        showAccuracyCircle={locationAccuracy !== 'high'}
      />
      
      {/* Low accuracy message */}
      {locationAccuracy === 'low' && (
        <div className="text-xs text-muted-foreground px-1">
          Location accuracy is low. Map view may not be precise.
        </div>
      )}
    </div>
  );
};

export default OrderLocationMap;
