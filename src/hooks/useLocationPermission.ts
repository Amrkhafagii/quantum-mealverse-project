
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useLocationPermission = () => {
  const [permissionStatus, setPermissionStatus] = useState<PermissionState>('prompt');
  const [trackingEnabled, setTrackingEnabled] = useState<boolean>(false);
  const [isRequesting, setIsRequesting] = useState<boolean>(false);
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [hasShownInitialPrompt, setHasShownInitialPrompt] = useState<boolean>(false);

  useEffect(() => {
    // Check browser's stored permission preference
    const checkPermissionStorage = () => {
      try {
        const storedPermission = localStorage.getItem('locationPermission');
        if (storedPermission === 'granted') {
          setHasShownInitialPrompt(true);
          setPermissionStatus('granted');
        } else if (storedPermission === 'denied') {
          setPermissionStatus('denied');
          setHasShownInitialPrompt(true);
        }
      } catch (e) {
        console.error('Error reading from localStorage', e);
      }
    };
    
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
          
          // Store permission state in localStorage
          try {
            localStorage.setItem('locationPermission', permissionStatus.state);
          } catch (e) {
            console.error('Error writing to localStorage', e);
          }
          
          permissionStatus.onchange = () => {
            setPermissionStatus(permissionStatus.state);
            // Update localStorage when permission changes
            try {
              localStorage.setItem('locationPermission', permissionStatus.state);
            } catch (e) {
              console.error('Error writing to localStorage', e);
            }
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
            // Store simplified location in localStorage
            try {
              localStorage.setItem('userLocation', JSON.stringify({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                timestamp: new Date().getTime()
              }));
            } catch (e) {
              console.error('Error writing to localStorage', e);
            }
          },
          (error) => {
            console.error('Error getting current position:', error);
          }
        );
      }
    };

    checkPermissionStorage();
    fetchPreferences();
    checkPermission();
    getCurrentPosition();
  }, [permissionStatus, trackingEnabled]);

  // Updated requestPermission function with better UX
  const requestPermission = useCallback(async (): Promise<boolean> => {
    setIsRequesting(true);
    setHasShownInitialPrompt(true);
    
    try {
      if ('geolocation' in navigator) {
        return new Promise<boolean>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              // Permission granted
              setPermissionStatus('granted');
              setLocation(position);
              
              // Cache location in localStorage
              try {
                localStorage.setItem('userLocation', JSON.stringify({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  timestamp: new Date().getTime()
                }));
                localStorage.setItem('locationPermission', 'granted');
              } catch (e) {
                console.error('Error writing to localStorage', e);
              }
              
              // Update user preferences
              await toggleTracking(true);
              
              setIsRequesting(false);
              
              // Show success notification
              toast.success("Location enabled", { 
                description: "We can now find nearby restaurants for you"
              });
              
              resolve(true);
            },
            (error) => {
              // Permission denied
              console.error('Error requesting location permission:', error);
              setPermissionStatus('denied');
              
              try {
                localStorage.setItem('locationPermission', 'denied');
              } catch (e) {
                console.error('Error writing to localStorage', e);
              }
              
              setIsRequesting(false);
              
              // Show error notification based on error code
              if (error.code === 1) { // PERMISSION_DENIED
                toast.error("Location access denied", {
                  description: "Please enable location access in your browser settings"
                });
              } else {
                toast.error("Location error", {
                  description: "Could not access your location. Please try again."
                });
              }
              
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
  }, []);
  
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
    location,
    hasShownInitialPrompt
  };
};
