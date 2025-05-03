
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useLocationPermission = () => {
  const [permissionStatus, setPermissionStatus] = useState<PermissionState>('prompt');
  const [trackingEnabled, setTrackingEnabled] = useState<boolean>(false);
  const [isRequesting, setIsRequesting] = useState<boolean>(false);
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [hasShownInitialPrompt, setHasShownInitialPrompt] = useState<boolean>(false);
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);

  // Check browser's stored permission preference on initialization
  useEffect(() => {
    const initialize = async () => {
      try {
        // Try to get cached location data
        const cachedLocationString = localStorage.getItem('userLocation');
        const storedPermission = localStorage.getItem('locationPermission');
        
        if (cachedLocationString) {
          try {
            const cachedLocation = JSON.parse(cachedLocationString);
            if (cachedLocation?.latitude && cachedLocation?.longitude) {
              // If we have cached location, create a position object from it
              const position = {
                coords: {
                  latitude: cachedLocation.latitude,
                  longitude: cachedLocation.longitude,
                  accuracy: 0,
                  altitude: null,
                  altitudeAccuracy: null,
                  heading: null,
                  speed: null
                },
                timestamp: cachedLocation.timestamp || Date.now()
              } as GeolocationPosition;
              
              setLocation(position);
            }
          } catch (e) {
            console.error('Error parsing cached location:', e);
          }
        }
        
        // Check stored permission state
        if (storedPermission === 'granted') {
          setHasShownInitialPrompt(true);
          setPermissionStatus('granted');
        } else if (storedPermission === 'denied') {
          setPermissionStatus('denied');
          setHasShownInitialPrompt(true);
        }
        
        // Check browser permission API
        await checkPermission();
        
        // Also fetch user preferences from database
        await fetchPreferences();
        
        setHasInitialized(true);
      } catch (err) {
        console.error('Error initializing location permissions:', err);
        setHasInitialized(true);
      }
    };
    
    initialize();
  }, []);

  // Check if location tracking is enabled in preferences
  const fetchPreferences = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('location_tracking_enabled')
          .eq('user_id', session.user.id)
          .maybeSingle();
          
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
        
        // Update our state with the current browser permission status
        setPermissionStatus(permissionStatus.state);
        
        // Store permission state in localStorage for future reference
        try {
          localStorage.setItem('locationPermission', permissionStatus.state);
        } catch (e) {
          console.error('Error writing to localStorage', e);
        }
        
        // Set up listener for permission changes
        permissionStatus.onchange = () => {
          setPermissionStatus(permissionStatus.state);
          // Update localStorage when permission changes
          try {
            localStorage.setItem('locationPermission', permissionStatus.state);
            
            // If permission is revoked, clear cached location data
            if (permissionStatus.state === 'denied') {
              localStorage.removeItem('userLocation');
            }
          } catch (e) {
            console.error('Error writing to localStorage', e);
          }
        };
        
        return permissionStatus.state;
      } catch (error) {
        console.error('Error checking geolocation permission:', error);
      }
    }
    return null;
  };

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
                // Clear any cached location data
                localStorage.removeItem('userLocation');
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

  // Reset the location data and permission state
  const resetLocationState = useCallback(() => {
    try {
      localStorage.removeItem('userLocation');
      localStorage.removeItem('locationPermission');
      setPermissionStatus('prompt');
      setLocation(null);
      setHasShownInitialPrompt(false);
    } catch (e) {
      console.error('Error resetting location state:', e);
    }
  }, []);

  // Check if cached location data is too old (more than 30 minutes)
  const isLocationStale = useCallback(() => {
    try {
      const cachedLocationString = localStorage.getItem('userLocation');
      if (cachedLocationString) {
        const cachedLocation = JSON.parse(cachedLocationString);
        if (cachedLocation?.timestamp) {
          const now = new Date().getTime();
          const cacheTime = cachedLocation.timestamp;
          const diffMinutes = (now - cacheTime) / (1000 * 60);
          return diffMinutes > 30; // Consider stale after 30 minutes
        }
      }
      return true; // No timestamp means it's stale
    } catch (e) {
      console.error('Error checking if location is stale:', e);
      return true;
    }
  }, []);

  return { 
    permissionStatus, 
    trackingEnabled, 
    requestPermission,
    isRequesting,
    toggleTracking,
    isTracking,
    location,
    hasShownInitialPrompt,
    hasInitialized,
    resetLocationState,
    isLocationStale
  };
};
