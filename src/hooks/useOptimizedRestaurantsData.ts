
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { SimpleLocation } from './useSimpleLocation';
import { addDistanceToRestaurants } from '@/utils/distanceCalculation';

export interface Restaurant {
  restaurant_id: string;
  restaurant_name: string;
  restaurant_address: string;
  restaurant_email: string | null;
  distance_km?: number;
  latitude?: number;
  longitude?: number;
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
    loading: true,
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
      // Fetch all active restaurants with their coordinates
      const { data: allRestaurants, error: allError } = await supabase
        .from('restaurants')
        .select(`
          id,
          name,
          address,
          email,
          latitude,
          longitude
        `)
        .eq('is_active', true)
        .order('name');

      if (allError) throw allError;
      
      if (abortControllerRef.current?.signal.aborted) return;

      // Map the restaurant data to match the expected interface
      let finalData = (allRestaurants || []).map(restaurant => ({
        restaurant_id: restaurant.id,
        restaurant_name: restaurant.name,
        restaurant_address: restaurant.address,
        restaurant_email: restaurant.email,
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
        distance_km: undefined // Will be calculated if location is available
      }));

      // If location is available, calculate distances client-side
      if (location?.latitude && location?.longitude) {
        finalData = addDistanceToRestaurants(finalData, location.latitude, location.longitude);
        // Sort by distance when location is available
        finalData.sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
      }

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

      console.log(`Found ${finalData.length} restaurants (all available)${location ? ' with distances calculated' : ''}`);
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
  }, [user, getCacheKey, location]);

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
      // Try to fetch nearby restaurants using the SQL function
      const { data: nearbyData, error: nearbyError } = await supabase.rpc('find_nearest_restaurant', {
        order_lat: userLocation.latitude,
        order_lng: userLocation.longitude,
        max_distance_km: 50
      });

      if (abortControllerRef.current?.signal.aborted) return;

      let finalData: Restaurant[] = [];

      // If the SQL function returns data, use it directly
      if (nearbyData && nearbyData.length > 0) {
        finalData = nearbyData.map((item: any) => ({
          restaurant_id: item.restaurant_id,
          restaurant_name: item.restaurant_name,
          restaurant_address: item.restaurant_address,
          restaurant_email: item.restaurant_email,
          distance_km: item.distance_km
        }));
      } else {
        // Fallback: fetch all restaurants and calculate distances client-side
        console.log('SQL function returned no results, falling back to client-side calculation');
        
        const { data: allRestaurants, error: allError } = await supabase
          .from('restaurants')
          .select(`
            id,
            name,
            address,
            email,
            latitude,
            longitude
          `)
          .eq('is_active', true)
          .order('name');

        if (allError) throw allError;
        
        // Map and calculate distances
        const mappedRestaurants = (allRestaurants || []).map(restaurant => ({
          restaurant_id: restaurant.id,
          restaurant_name: restaurant.name,
          restaurant_address: restaurant.address,
          restaurant_email: restaurant.email,
          latitude: restaurant.latitude,
          longitude: restaurant.longitude
        }));

        // Calculate distances and filter by distance
        const restaurantsWithDistance = addDistanceToRestaurants(
          mappedRestaurants, 
          userLocation.latitude, 
          userLocation.longitude
        );

        // Filter restaurants within 50km and sort by distance
        finalData = restaurantsWithDistance
          .filter(restaurant => restaurant.distance_km <= 50)
          .sort((a, b) => a.distance_km - b.distance_km);
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
        error: finalData.length === 0 ? 'No restaurants found in your area' : null,
        lastFetchLocation: userLocation
      }));

      console.log(`Found ${finalData.length} restaurants near location with distances calculated`);
    } catch (err: any) {
      if (abortControllerRef.current?.signal.aborted) return;
      
      console.error('Error fetching nearby restaurants:', err);
      // Final fallback to all restaurants with distance calculation
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
        // User has location, fetch nearby restaurants with distance calculation
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
