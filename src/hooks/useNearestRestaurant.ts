
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocationTracker } from './useLocationTracker';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

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
  const [error, setError] = useState<string | null>(null);
  const { location, locationIsValid } = useLocationTracker();
  const { user } = useAuth();

  const findNearestRestaurants = useCallback(async (maxDistance = 50) => {
    if (!user) {
      console.log('User not authenticated, skipping restaurant fetch');
      setLoading(false);
      return;
    }

    // Use default location if no location available (for testing)
    const lat = location?.latitude || 37.7749; // San Francisco default
    const lng = location?.longitude || -122.4194;

    console.log('Finding nearest restaurants with location:', { lat, lng, maxDistance });
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.rpc('find_nearest_restaurant', {
        order_lat: lat,
        order_lng: lng,
        max_distance_km: maxDistance
      });

      if (error) {
        console.error('Error in find_nearest_restaurant RPC:', error);
        setError(error.message);
        throw error;
      }
      
      console.log('Nearest restaurants data received:', data);
      
      if (data && data.length > 0) {
        setNearbyRestaurants(data);
        console.log(`Found ${data.length} restaurants near location`);
      } else {
        console.log('No restaurants found in the area');
        setNearbyRestaurants([]);
      }
    } catch (error) {
      console.error('Error finding nearest restaurants:', error);
      setError('Could not find nearest restaurants');
      setNearbyRestaurants([]);
    } finally {
      setLoading(false);
    }
  }, [location, user]);

  useEffect(() => {
    if (user) {
      console.log('User authenticated, finding nearest restaurants');
      findNearestRestaurants();
    }
  }, [user, findNearestRestaurants]);

  return {
    nearbyRestaurants,
    loading,
    error,
    findNearestRestaurants
  };
};
