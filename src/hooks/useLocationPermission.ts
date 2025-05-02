
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLocationTracker } from './useLocationTracker';

export const useLocationPermission = () => {
  const [permissionStatus, setPermissionStatus] = useState<PermissionState | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const { toast } = useToast();
  const { 
    startTracking, 
    stopTracking, 
    isTracking, 
    location, 
    getCurrentLocation, 
    checkPermissionStatus 
  } = useLocationTracker();

  // Check stored preferences and permission status on mount
  useEffect(() => {
    const checkStoredPreference = async () => {
      // Check if user has stored preferences
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('user_preferences')
          .select('location_tracking_enabled')
          .eq('user_id', user.id)
          .single();
          
        if (data?.location_tracking_enabled) {
          setTrackingEnabled(true);
          // If tracking is enabled in preferences, start it automatically
          const status = await checkPermissionStatus();
          if (status === 'granted') {
            startTracking();
          }
        }
      }
    };
    
    checkPermissionStatus().then(setPermissionStatus);
    checkStoredPreference();
  }, []);

  // Store location when we get a new position
  useEffect(() => {
    const storeLocation = async () => {
      if (location && trackingEnabled) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('user_locations').insert({
            user_id: user.id,
            latitude: location.latitude,
            longitude: location.longitude,
            timestamp: new Date().toISOString(),
          });
        }
      }
    };
    
    storeLocation();
  }, [location, trackingEnabled]);

  // Request permission and get initial location
  const requestPermission = useCallback(async () => {
    setIsRequesting(true);
    
    try {
      const permStatus = await checkPermissionStatus();
      
      if (permStatus === 'denied') {
        toast({
          title: 'Location Permission Required',
          description: 'Please enable location access in your browser settings.',
          variant: 'destructive',
        });
        setPermissionStatus('denied');
        setIsRequesting(false);
        return false;
      }
      
      const newLocation = await getCurrentLocation();
      
      if (newLocation) {
        // Store the user's preference
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Store both the preference and the location
          await Promise.all([
            // Store user preference
            supabase.from('user_preferences').upsert({
              user_id: user.id,
              location_tracking_enabled: true
            }),
            // Store location
            supabase.from('user_locations').insert({
              user_id: user.id,
              latitude: newLocation.latitude,
              longitude: newLocation.longitude,
              timestamp: new Date().toISOString()
            })
          ]);
        }
        
        setTrackingEnabled(true);
        startTracking();
        
        toast({
          title: 'Location Access Granted',
          description: 'We can now show you nearby restaurants',
        });
        
        setIsRequesting(false);
        return true;
      }
    } catch (error) {
      console.error('Failed to get location permission:', error);
      toast({
        title: 'Location Error',
        description: 'Failed to access your location.',
        variant: 'destructive',
      });
    }
    
    setIsRequesting(false);
    return false;
  }, [getCurrentLocation, toast, startTracking, checkPermissionStatus]);

  // Toggle tracking on/off
  const toggleTracking = useCallback(async (enabled: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      if (enabled) {
        const success = await requestPermission();
        if (!success) return false;
      } else {
        stopTracking();
        // Update user preference
        await supabase.from('user_preferences').upsert({
          user_id: user.id,
          location_tracking_enabled: false
        });
      }
      
      setTrackingEnabled(enabled);
      return true;
    }
    
    return false;
  }, [requestPermission, stopTracking]);

  return {
    permissionStatus,
    isRequesting,
    trackingEnabled,
    isTracking,
    location,
    requestPermission,
    toggleTracking,
  };
};
