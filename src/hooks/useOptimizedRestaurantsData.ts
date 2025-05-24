
import { useState, useEffect, useCallback, useMemo } from 'react';
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

interface RestaurantsState {
  restaurants: Restaurant[];
  loading: boolean;
  error: string | null;
  lastFetchLocation: SimpleLocation | null;
}

export const useOptimizedRestaurantsData = (location: SimpleLocation | null) => {
  const [state, setState] = useState<RestaurantsState>({
    restaurants: [],
    loading: false,
    error: null,
    lastFetchLocation: null
  });
  
  const { user } = useAuth();

  // Memoize location comparison to prevent unnecessary re-fetches
  const locationChanged = useMemo(() => {
    if (!location || !state.lastFetchLocation) return true;
    
    const latDiff = Math.abs(location.latitude - state.lastFetchLocation.latitude);
    const lngDiff = Math.abs(location.longitude - state.lastFetchLocation.longitude);
    
    // Only refetch if location changed by more than ~100 meters
    return latDiff > 0.001 || lngDiff > 0.001;
  }, [location, state.lastFetchLocation]);

  const fetchNearbyRestaurants = useCallback(async (userLocation: SimpleLocation) => {
    if (!user) {
      setState(prev => ({ 
        ...prev, 
        loading: false,
        error: 'Authentication required'
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { data, error } = await supabase.rpc('find_nearest_restaurant', {
        order_lat: userLocation.latitude,
        order_lng: userLocation.longitude,
        max_distance_km: 50
      });

      if (error) throw error;

      setState(prev => ({
        ...prev,
        restaurants: data || [],
        loading: false,
        error: data?.length === 0 ? 'No restaurants found in your area' : null,
        lastFetchLocation: userLocation
      }));

      console.log(`Found ${data?.length || 0} restaurants near location`);
    } catch (err: any) {
      console.error('Error fetching restaurants:', err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load restaurants',
        restaurants: []
      }));
    }
  }, [user]);

  const refetch = useCallback(() => {
    if (location) {
      fetchNearbyRestaurants(location);
    }
  }, [location, fetchNearbyRestaurants]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    if (user && location?.latitude && location?.longitude && locationChanged) {
      fetchNearbyRestaurants(location);
    } else if (user && !location) {
      setState(prev => ({
        ...prev,
        restaurants: [],
        loading: false,
        error: 'Location access is required to find nearby restaurants'
      }));
    }
  }, [user, location, locationChanged, fetchNearbyRestaurants]);

  return {
    restaurants: state.restaurants,
    loading: state.loading,
    error: state.error,
    refetch,
    clearError
  };
};
