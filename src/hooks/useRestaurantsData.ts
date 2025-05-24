
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { SimpleLocation } from './useSimpleLocation';

export interface Restaurant {
  restaurant_id: string;
  restaurant_name: string;
  restaurant_address: string;
  restaurant_email: string | null;
  distance_km?: number;
}

export const useRestaurantsData = (location: SimpleLocation | null) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchNearbyRestaurants = useCallback(async (userLocation: SimpleLocation) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('find_nearest_restaurant', {
        order_lat: userLocation.latitude,
        order_lng: userLocation.longitude,
        max_distance_km: 50
      });

      if (error) throw error;

      if (data && data.length > 0) {
        setRestaurants(data);
      } else {
        setRestaurants([]);
        setError('No restaurants found in your area');
      }
    } catch (err: any) {
      console.error('Error fetching restaurants:', err);
      setError('Failed to load restaurants');
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && location?.latitude && location?.longitude) {
      fetchNearbyRestaurants(location);
    } else {
      // Clear restaurants if no location is available
      setRestaurants([]);
      setLoading(false);
      if (user && !location) {
        setError('Location access is required to find nearby restaurants');
      }
    }
  }, [user, location, fetchNearbyRestaurants]);

  return {
    restaurants,
    loading,
    error,
    refetch: location ? () => fetchNearbyRestaurants(location) : undefined
  };
};
