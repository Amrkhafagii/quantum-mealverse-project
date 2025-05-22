
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocationTracker } from './useLocationTracker';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { logLocationDebug } from '@/utils/locationDebug';
import { isHighAccuracyLocation } from '@/utils/locationAccuracyManager';

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
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [refreshStatus, setRefreshStatus] = useState<'idle' | 'refreshing' | 'error'>('idle');
  const { location, locationIsValid } = useLocationTracker();
  const { user } = useAuth();

  const findNearestRestaurants = useCallback(async (maxDistance = 50) => {
    // Enhanced debugging for authentication state
    logLocationDebug('find-nearest-restaurants-called', {
      context: { 
        userExists: !!user, 
        userId: user?.id,
        maxDistance,
        location
      }
    });
    
    console.log('findNearestRestaurants called with user state:', { 
      userExists: !!user, 
      userId: user?.id,
      maxDistance
    });

    // If not authenticated, don't fetch restaurants
    if (!user) {
      console.error('User is not authenticated, skipping restaurant fetch');
      logLocationDebug('restaurant-search-aborted', { 
        error: 'User not authenticated',
        context: { via: 'findNearestRestaurants' } 
      });
      
      setRefreshStatus('idle');
      setLoading(false);
      toast.error("Authentication required", { 
        description: "Please log in to find nearby restaurants" 
      });
      return null;
    }

    // Check for valid high-accuracy location
    if (!locationIsValid() || !isHighAccuracyLocation(location)) {
      console.error('Location is not valid or not high-accuracy for restaurant search', location);
      logLocationDebug('invalid-location', { 
        error: 'Location is not valid or not high-accuracy for restaurant search',
        context: { 
          location,
          isValid: locationIsValid(),
          isHighAccuracy: location ? isHighAccuracyLocation(location) : false
        }
      });
      
      setRefreshStatus('error');
      toast.error("Precise location required", { 
        description: "We need your precise location from GPS or WiFi to find nearby restaurants" 
      });
      return null;
    }
    
    setRefreshStatus('refreshing');
    setLoading(true);
    
    try {
      console.log('Finding nearest restaurants with location:', location);
      logLocationDebug('restaurant-search-start', { 
        context: { 
          location,
          maxDistance
        }
      });
      
      const { data, error } = await supabase.rpc('find_nearest_restaurant', {
        order_lat: location.latitude,
        order_lng: location.longitude,
        max_distance_km: maxDistance
      });

      if (error) {
        console.error('Error in find_nearest_restaurant RPC:', error);
        logLocationDebug('restaurant-search-error', { 
          error,
          context: { 
            location,
            maxDistance
          }
        });
        
        setRefreshStatus('error');
        toast.error("Database error", {
          description: "Could not search for restaurants. Please try again."
        });
        throw error;
      }
      
      console.log('Nearest restaurants data received:', data);
      logLocationDebug('restaurant-search-result', { 
        context: { 
          count: data?.length || 0,
          results: data
        }
      });
      
      if (data && data.length > 0) {
        console.log(`Found ${data.length} restaurants near location`);
        setNearbyRestaurants(data);
        setLastRefreshTime(new Date());
        setRefreshStatus('idle');
        
        // Only show success toast if it's not the initial load
        if (lastRefreshTime !== null) {
          toast.success("Restaurants updated", {
            description: `Found ${data.length} restaurants near your location`
          });
        }
        return data;
      } else {
        console.log('No restaurants found in the area');
        logLocationDebug('no-restaurants-found', { 
          context: { 
            location,
            maxDistance
          }
        });
        
        setNearbyRestaurants([]);
        setRefreshStatus('idle');
        toast.error("No restaurants found", {
          description: `No restaurants found within ${maxDistance}km of your location`
        });
        return [];
      }
    } catch (error) {
      console.error('Error finding nearest restaurants:', error);
      logLocationDebug('restaurant-search-exception', { 
        error,
        context: { 
          location,
          maxDistance
        }
      });
      
      setRefreshStatus('error');
      toast.error("Error", {
        description: "Could not find nearest restaurants"
      });
      setNearbyRestaurants([]);
      return null;
    } finally {
      setLoading(false);
    }
  }, [location, locationIsValid, lastRefreshTime, user]);

  useEffect(() => {
    // Only find restaurants if user is authenticated and location is valid and high-accuracy
    if (user && locationIsValid() && isHighAccuracyLocation(location)) {
      console.log('Location is valid high-accuracy and user is authenticated, finding nearest restaurants');
      logLocationDebug('auto-find-restaurants', { 
        context: { 
          userExists: !!user,
          location,
          isHighAccuracy: true
        }
      });
      
      findNearestRestaurants();
    } else {
      console.log('Location is not valid/high-accuracy or user is not authenticated yet', {
        userExists: !!user,
        locationValid: locationIsValid(),
        isHighAccuracy: location ? isHighAccuracyLocation(location) : false,
        location
      });
      
      logLocationDebug('auto-find-restaurants-skipped', { 
        context: { 
          userExists: !!user,
          locationValid: locationIsValid(),
          isHighAccuracy: location ? isHighAccuracyLocation(location) : false,
          location
        }
      });
    }
  }, [location, locationIsValid, findNearestRestaurants, user]);

  const refreshRestaurants = useCallback((maxDistance = 50) => {
    console.log('Manually refreshing restaurants with max distance:', maxDistance);
    logLocationDebug('manual-refresh-restaurants', { 
      context: { 
        maxDistance,
        location
      }
    });
    
    return findNearestRestaurants(maxDistance);
  }, [findNearestRestaurants, location]);

  return {
    nearbyRestaurants,
    loading,
    lastRefreshTime,
    refreshStatus,
    findNearestRestaurants,
    refreshRestaurants
  };
};
