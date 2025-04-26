
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocationTracker } from './useLocationTracker';
import { useToast } from '@/components/ui/use-toast';

export const useNearestRestaurant = () => {
  const [nearestRestaurantId, setNearestRestaurantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { location, locationIsValid } = useLocationTracker();
  const { toast } = useToast();

  const findNearestRestaurant = async () => {
    if (!location) return null;
    
    try {
      setLoading(true);
      
      // Using .data directly without .maybeSingle() since this is an RPC call
      const { data, error } = await supabase.rpc('find_nearest_restaurant', {
        order_lat: location.latitude,
        order_lng: location.longitude,
        max_distance_km: 50
      });

      // Handle RPC errors
      if (error) {
        console.error('RPC error finding nearest restaurant:', error);
        throw error;
      }
      
      // Handle empty results - data will be an empty array if no restaurants found
      if (data && data.length > 0) {
        setNearestRestaurantId(data[0].restaurant_id);
        console.log('Found nearest restaurant:', data[0].restaurant_id);
      } else {
        console.log('No restaurants found within range');
        setNearestRestaurantId(null);
        toast({
          title: "No restaurants found",
          description: "No restaurants found within 50km of your location",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error finding nearest restaurant:', error);
      toast({
        title: "Error",
        description: "Could not find nearest restaurant",
        variant: "destructive"
      });
      setNearestRestaurantId(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (locationIsValid()) {
      findNearestRestaurant();
    } else {
      setLoading(false); // Make sure to set loading to false if location is not valid
    }
  }, [location]);

  return {
    nearestRestaurantId,
    loading,
    findNearestRestaurant
  };
};
