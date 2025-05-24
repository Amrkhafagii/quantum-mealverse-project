
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
    loading: false,
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

  const getCacheKey = useCallback((userLocation: SimpleLocation) => {
    return `${Math.round(userLocation.latitude * 1000)}_${Math.round(userLocation.longitude * 1000)}`;
  }, []);

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
      // First try to fetch nearby restaurants
      const { data: nearbyData, error: nearbyError } = await supabase.rpc('find_nearest_restaurant', {
        order_lat: userLocation.latitude,
        order_lng: userLocation.longitude,
        max_distance_km: 50
      });

      if (abortControllerRef.current?.signal.aborted) return;

      let finalData = nearbyData || [];

      // If no nearby restaurants found, fallback to fetch all restaurants
      if (!nearbyData || nearbyData.length === 0) {
        console.log('No nearby restaurants found, fetching all restaurants as fallback');
        
        const { data: allRestaurants, error: allError } = await supabase
          .from('restaurants')
          .select(`
            restaurant_id,
            restaurant_name,
            restaurant_address,
            restaurant_email
          `)
          .limit(20); // Limit to first 20 restaurants for performance

        if (allError) throw allError;
        
        finalData = allRestaurants || [];
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

      console.log(`Found ${finalData.length} restaurants`);
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

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [user, location, locationChanged, fetchNearbyRestaurants]);

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
