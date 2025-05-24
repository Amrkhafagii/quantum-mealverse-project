
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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

  const fetchAllRestaurants = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name, address, email')
        .eq('is_active', true)
        .limit(20);

      if (error) throw error;

      const formattedData = data?.map(restaurant => ({
        restaurant_id: restaurant.id,
        restaurant_name: restaurant.name,
        restaurant_address: restaurant.address,
        restaurant_email: restaurant.email
      })) || [];

      setRestaurants(formattedData);
    } catch (err: any) {
      console.error('Error fetching all restaurants:', err);
      setError('Failed to load restaurants');
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      if (location?.latitude && location?.longitude) {
        fetchNearbyRestaurants(location);
      } else {
        fetchAllRestaurants();
      }
    }
  }, [user, location, fetchNearbyRestaurants, fetchAllRestaurants]);

  return {
    restaurants,
    loading,
    error,
    refetch: location ? () => fetchNearbyRestaurants(location) : fetchAllRestaurants
  };
};
