
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useLocationPermission = () => {
  const [permissionStatus, setPermissionStatus] = useState<PermissionState>('prompt');
  const [isRequesting, setIsRequesting] = useState(false);
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkPermission = async () => {
      if ('permissions' in navigator) {
        try {
          const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
          setPermissionStatus(status.state);
          
          // Listen for changes to permission status
          status.onchange = () => setPermissionStatus(status.state);
        } catch (error) {
          console.error('Error checking geolocation permission:', error);
        }
      }

      // Check if tracking is enabled in user preferences
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
            
          // Check if location_tracking_enabled exists in data
          // It might not exist yet in the database schema, so handle that case
          if (data) {
            // Create a type guard to check if location_tracking_enabled exists on the object
            const hasLocationTracking = (obj: any): obj is { location_tracking_enabled: boolean } => {
              return 'location_tracking_enabled' in obj && obj.location_tracking_enabled !== undefined;
            };
            
            // Use the type guard to safely access location_tracking_enabled
            if (hasLocationTracking(data)) {
              setTrackingEnabled(!!data.location_tracking_enabled);
            }
          }
        }
      } catch (error) {
        console.error('Error checking user preferences:', error);
      }
    };
    
    checkPermission();
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser doesn't support location services.",
        variant: "destructive"
      });
      return false;
    }

    setIsRequesting(true);
    
    try {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setPermissionStatus('granted');
            setLocation(position);
            resolve(true);
          },
          (error) => {
            console.error('Geolocation permission denied:', error);
            setPermissionStatus('denied');
            toast({
              title: "Location Access Denied",
              description: "You've denied access to your location. You can change this in your browser settings.",
              variant: "destructive"
            });
            resolve(false);
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      });
    } finally {
      setIsRequesting(false);
    }
  };

  const toggleTracking = async (enabled: boolean): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "You need to be logged in to change tracking settings.",
          variant: "destructive"
        });
        return false;
      }
      
      // Update user preferences
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          location_tracking_enabled: enabled
        }, {
          onConflict: 'user_id'
        });
      
      if (error) {
        console.error('Error updating tracking preferences:', error);
        toast({
          title: "Settings Update Failed",
          description: "Failed to update location tracking settings.",
          variant: "destructive"
        });
        return false;
      }
      
      setTrackingEnabled(enabled);
      setIsTracking(enabled && permissionStatus === 'granted');
      
      toast({
        title: enabled ? "Location Tracking Enabled" : "Location Tracking Disabled",
        description: enabled 
          ? "You will now receive location-based recommendations." 
          : "You have turned off location tracking."
      });
      
      return true;
    } catch (error) {
      console.error('Error toggling tracking:', error);
      return false;
    }
  };

  return {
    permissionStatus,
    isRequesting,
    trackingEnabled,
    isTracking,
    location,
    requestPermission,
    toggleTracking
  };
};
