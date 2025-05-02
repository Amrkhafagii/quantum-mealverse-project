
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useLocationPermission = () => {
  const [permissionStatus, setPermissionStatus] = useState<PermissionState>('prompt');
  const [trackingEnabled, setTrackingEnabled] = useState<boolean>(false);
  const [isRequesting, setIsRequesting] = useState<boolean>(false);
  const [location, setLocation] = useState<GeolocationPosition | null>(null);

  useEffect(() => {
    // Check if location tracking is enabled in preferences
    const fetchPreferences = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data, error } = await supabase
            .from('user_preferences')
            .select('location_tracking_enabled')
            .eq('user_id', session.user.id)
            .single();
            
          if (!error && data) {
            setTrackingEnabled(data.location_tracking_enabled === true);
          }
        }
      } catch (error) {
        console.error('Error fetching location preferences:', error);
      }
    };

    // Check browser permission status
    const checkPermission = async () => {
      if ('permissions' in navigator) {
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
          setPermissionStatus(permissionStatus.state);
          
          permissionStatus.onchange = () => {
            setPermissionStatus(permissionStatus.state);
          };
        } catch (error) {
          console.error('Error checking geolocation permission:', error);
        }
      }
    };

    // If we have permission and tracking enabled, get current position
    const getCurrentPosition = () => {
      if (permissionStatus === 'granted' && trackingEnabled) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation(position);
          },
          (error) => {
            console.error('Error getting current position:', error);
          }
        );
      }
    };

    fetchPreferences();
    checkPermission();
    getCurrentPosition();
  }, [permissionStatus, trackingEnabled]);

  // Fixed requestPermission function
  const requestPermission = async (): Promise<boolean> => {
    setIsRequesting(true);
    
    try {
      if ('geolocation' in navigator) {
        return new Promise<boolean>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              // Permission granted
              setPermissionStatus('granted');
              setLocation(position);
              
              // Update user preferences
              await toggleTracking(true);
              
              setIsRequesting(false);
              resolve(true);
            },
            (error) => {
              // Permission denied
              console.error('Error requesting location permission:', error);
              setPermissionStatus('denied');
              setIsRequesting(false);
              resolve(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
          );
        });
      }
      setIsRequesting(false);
      return false;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setIsRequesting(false);
      return false;
    }
  };
  
  // Fixed toggleTracking function to properly handle the constraint issue
  const toggleTracking = async (enabled: boolean): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) return false;
      
      // First check if a preference entry already exists
      const { data: existingPref } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', session.user.id)
        .single();
      
      let result;
      
      if (existingPref) {
        // If entry exists, use update instead of upsert
        result = await supabase
          .from('user_preferences')
          .update({
            location_tracking_enabled: enabled,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', session.user.id);
      } else {
        // If no entry exists, insert a new one
        result = await supabase
          .from('user_preferences')
          .insert({
            user_id: session.user.id,
            location_tracking_enabled: enabled,
            currency: 'USD' // Default currency
          });
      }
      
      if (result.error) {
        console.error('Error updating location tracking preferences:', result.error);
        return false;
      }
      
      // Since the update was successful, update the local state
      setTrackingEnabled(enabled);
      
      // If tracking was enabled, try to get the current position
      if (enabled && permissionStatus === 'granted') {
        navigator.geolocation.getCurrentPosition(
          (position) => setLocation(position),
          (error) => console.error('Error getting position:', error)
        );
      }
      
      return true;
    } catch (error) {
      console.error('Error updating location tracking preferences:', error);
      return false;
    }
  };

  // Compute if tracking is currently active (both permission granted and enabled in preferences)
  const isTracking = permissionStatus === 'granted' && trackingEnabled;

  return { 
    permissionStatus, 
    trackingEnabled, 
    requestPermission,
    isRequesting,
    toggleTracking,
    isTracking,
    location
  };
};
