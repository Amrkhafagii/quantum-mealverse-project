
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocationTracker } from './useLocationTracker';
import { useToast } from '@/components/ui/use-toast';

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
  const { location, locationIsValid } = useLocationTracker();
  const { toast } = useToast();

  const findNearestRestaurants = async () => {
    if (!location) return null;
    
    try {
      const { data, error } = await supabase.rpc('find_nearest_restaurant', {
        order_lat: location.latitude,
        order_lng: location.longitude,
        max_distance_km: 50
      });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setNearbyRestaurants(data);
      } else {
        setNearbyRestaurants([]);
        toast({
          title: "No restaurants found",
          description: "No restaurants found within 50km of your location",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error finding nearest restaurants:', error);
      toast({
        title: "Error",
        description: "Could not find nearest restaurants",
        variant: "destructive"
      });
      setNearbyRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (locationIsValid()) {
      findNearestRestaurants();
    }
  }, [location]);

  return {
    nearbyRestaurants,
    loading,
    findNearestRestaurants
  };
};
