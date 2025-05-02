
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useLocationPermission = () => {
  const [permissionStatus, setPermissionStatus] = useState<PermissionState>('prompt');
  const [trackingEnabled, setTrackingEnabled] = useState<boolean>(false);

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

    fetchPreferences();
    checkPermission();
  }, []);

  return { permissionStatus, trackingEnabled };
};
