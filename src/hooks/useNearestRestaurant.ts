import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocationTracker } from './useLocationTracker';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

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

    if (!location?.latitude || !location?.longitude) {
      console.log('No location available, cannot find restaurants');
      setError('Location is required to find nearby restaurants');
      setLoading(false);
      return;
    }

    console.log('Finding nearest restaurants with location:', { 
      lat: location.latitude, 
      lng: location.longitude, 
      maxDistance 
    });
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.rpc('find_nearest_restaurant', {
        order_lat: location.latitude,
        order_lng: location.longitude,
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
        setError('No restaurants found in your area');
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
    if (user && location?.latitude && location?.longitude) {
      console.log('User authenticated and location available, finding nearest restaurants');
      findNearestRestaurants();
    } else if (user && !location?.latitude) {
      console.log('User authenticated but no location available');
      setError('Please enable location access to find nearby restaurants');
      setLoading(false);
    }
  }, [user, findNearestRestaurants]);

  return {
    nearbyRestaurants,
    loading,
    error,
    findNearestRestaurants
  };
};
