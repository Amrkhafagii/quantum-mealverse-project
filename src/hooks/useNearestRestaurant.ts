
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocationTracker } from './useLocationTracker';
import { toast } from 'sonner';

export interface NearbyRestaurant {
  restaurant_id: string;
  restaurant_name: string;
  restaurant_address: string;
  restaurant_email: string | null;
  distance_km: number;
}

export const useNearestRestaurant = () => {
  const [nearbyRestaurants, setNearbyRestaurants] = useState<NearbyRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [refreshStatus, setRefreshStatus] = useState<'idle' | 'refreshing' | 'error'>('idle');
  const { location, locationIsValid } = useLocationTracker();

  const findNearestRestaurants = useCallback(async (maxDistance = 50) => {
    if (!locationIsValid()) {
      setRefreshStatus('error');
      toast.error("Location required", { 
        description: "We need your location to find nearby restaurants" 
      });
      return null;
    }
    
    setRefreshStatus('refreshing');
    setLoading(true);
    
    try {
      console.log('Finding nearest restaurants with location:', location);
      
      const { data, error } = await supabase.rpc('find_nearest_restaurant', {
        order_lat: location.latitude,
        order_lng: location.longitude,
        max_distance_km: maxDistance
      });

      if (error) {
        console.error('Error in find_nearest_restaurant RPC:', error);
        setRefreshStatus('error');
        throw error;
      }
      
      console.log('Nearest restaurants data:', data);
      
      if (data && data.length > 0) {
        setNearbyRestaurants(data);
        setLastRefreshTime(new Date());
        setRefreshStatus('idle');
        
        // Only show success toast if it's not the initial load
        if (lastRefreshTime !== null) {
          toast.success("Restaurants updated", {
            description: `Found ${data.length} restaurants near your location`
          });
        }
      } else {
        setNearbyRestaurants([]);
        setRefreshStatus('idle');
        toast.error("No restaurants found", {
          description: `No restaurants found within ${maxDistance}km of your location`
        });
      }
    } catch (error) {
      console.error('Error finding nearest restaurants:', error);
      setRefreshStatus('error');
      toast.error("Error", {
        description: "Could not find nearest restaurants"
      });
      setNearbyRestaurants([]);
    } finally {
      setLoading(false);
    }
  }, [location, locationIsValid, lastRefreshTime]);

  useEffect(() => {
    if (locationIsValid()) {
      console.log('Location is valid, finding nearest restaurants');
      findNearestRestaurants();
    } else {
      console.log('Location is not valid yet');
    }
  }, [location, locationIsValid, findNearestRestaurants]);

  const refreshRestaurants = useCallback((maxDistance = 50) => {
    findNearestRestaurants(maxDistance);
  }, [findNearestRestaurants]);

  return {
    nearbyRestaurants,
    loading,
    lastRefreshTime,
    refreshStatus,
    findNearestRestaurants,
    refreshRestaurants
  };
};
