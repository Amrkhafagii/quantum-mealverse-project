
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
    loading: true, // Start with loading true to fetch all restaurants initially
    error: null,
    lastFetchLocation: null
  });
  
  const { user } = useAuth();
  const abortControllerRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<Map<string, { data: Restaurant[]; timestamp: number }>>(new Map());
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Memoize location comparison to prevent unnecessary re-fetches
  const locationChanged = useMemo(() => {
    if (!location || !state.lastFetchLocation) return true;
    
    const latDiff = Math.abs(location.latitude - state.lastFetchLocation.latitude);
    const lngDiff = Math.abs(location.longitude - state.lastFetchLocation.longitude);
    
    // Only refetch if location changed by more than ~100 meters
    return latDiff > 0.001 || lngDiff > 0.001;
  }, [location, state.lastFetchLocation]);

  const getCacheKey = useCallback((userLocation: SimpleLocation | null) => {
    if (!userLocation) return 'all_restaurants';
    return `${Math.round(userLocation.latitude * 1000)}_${Math.round(userLocation.longitude * 1000)}`;
  }, []);

  const fetchAllRestaurants = useCallback(async () => {
    if (!user) {
      setState(prev => ({ 
        ...prev, 
        loading: false,
        error: 'Authentication required'
      }));
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    // Check cache first for all restaurants
    const cacheKey = getCacheKey(null);
    const cached = cacheRef.current.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setState(prev => ({
        ...prev,
        restaurants: cached.data,
        loading: false,
        error: cached.data.length === 0 ? 'No restaurants available' : null,
        lastFetchLocation: null
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Fetch all active restaurants with their basic info
      const { data: allRestaurants, error: allError } = await supabase
        .from('restaurants')
        .select(`
          id,
          name,
          address,
          email
        `)
        .eq('is_active', true)
        .order('name');

      if (allError) throw allError;
      
      if (abortControllerRef.current?.signal.aborted) return;

      // Map the restaurant data to match the expected interface
      const finalData = (allRestaurants || []).map(restaurant => ({
        restaurant_id: restaurant.id,
        restaurant_name: restaurant.name,
        restaurant_address: restaurant.address,
        restaurant_email: restaurant.email,
        distance_km: undefined // No distance when location isn't available
      }));

      // Cache the result
      cacheRef.current.set(cacheKey, {
        data: finalData,
        timestamp: Date.now()
      });

      setState(prev => ({
        ...prev,
        restaurants: finalData,
        loading: false,
        error: finalData.length === 0 ? 'No restaurants available' : null,
        lastFetchLocation: null
      }));

      console.log(`Found ${finalData.length} restaurants (all available)`);
    } catch (err: any) {
      if (abortControllerRef.current?.signal.aborted) return;
      
      console.error('Error fetching restaurants:', err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load restaurants',
        restaurants: []
      }));
    }
  }, [user, getCacheKey]);

  const fetchNearbyRestaurants = useCallback(async (userLocation: SimpleLocation) => {
    if (!user) {
      setState(prev => ({ 
        ...prev, 
        loading: false,
        error: 'Authentication required'
      }));
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    // Check cache first
    const cacheKey = getCacheKey(userLocation);
    const cached = cacheRef.current.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setState(prev => ({
        ...prev,
        restaurants: cached.data,
        loading: false,
        error: cached.data.length === 0 ? 'No restaurants found in your area' : null,
        lastFetchLocation: userLocation
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Try to fetch nearby restaurants first
      const { data: nearbyData, error: nearbyError } = await supabase.rpc('find_nearest_restaurant', {
        order_lat: userLocation.latitude,
        order_lng: userLocation.longitude,
        max_distance_km: 50
      });

      if (abortControllerRef.current?.signal.aborted) return;

      let finalData = nearbyData || [];

      // If no nearby restaurants found, fallback to all restaurants
      if (!nearbyData || nearbyData.length === 0) {
        console.log('No nearby restaurants found, fetching all restaurants as fallback');
        
        const { data: allRestaurants, error: allError } = await supabase
          .from('restaurants')
          .select(`
            id,
            name,
            address,
            email
          `)
          .eq('is_active', true)
          .order('name')
          .limit(20);

        if (allError) throw allError;
        
        // Map the restaurant data to match the expected interface
        finalData = (allRestaurants || []).map(restaurant => ({
          restaurant_id: restaurant.id,
          restaurant_name: restaurant.name,
          restaurant_address: restaurant.address,
          restaurant_email: restaurant.email,
          distance_km: 0 // Set to 0 for fallback restaurants since we don't have location data
        }));
      }

      if (abortControllerRef.current?.signal.aborted) return;

      // Cache the result
      cacheRef.current.set(cacheKey, {
        data: finalData,
        timestamp: Date.now()
      });

      setState(prev => ({
        ...prev,
        restaurants: finalData,
        loading: false,
        error: finalData.length === 0 ? 'No restaurants found' : null,
        lastFetchLocation: userLocation
      }));

      console.log(`Found ${finalData.length} restaurants near location`);
    } catch (err: any) {
      if (abortControllerRef.current?.signal.aborted) return;
      
      console.error('Error fetching restaurants:', err);
      // Fallback to all restaurants on error
      await fetchAllRestaurants();
    }
  }, [user, getCacheKey, fetchAllRestaurants]);

  const refetch = useCallback(() => {
    if (location) {
      fetchNearbyRestaurants(location);
    } else {
      fetchAllRestaurants();
    }
  }, [location, fetchNearbyRestaurants, fetchAllRestaurants]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    if (user) {
      if (location?.latitude && location?.longitude && locationChanged) {
        // User has location, fetch nearby restaurants
        fetchNearbyRestaurants(location);
      } else if (!location) {
        // No location available, fetch all restaurants
        fetchAllRestaurants();
      }
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [user, location, locationChanged, fetchNearbyRestaurants, fetchAllRestaurants]);

  // Cleanup cache on unmount
  useEffect(() => {
    return () => {
      cacheRef.current.clear();
    };
  }, []);

  return {
    restaurants: state.restaurants,
    loading: state.loading,
    error: state.error,
    refetch,
    clearError
  };
};
