
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

export interface LocationState {
  location: LocationData | null;
  isLoading: boolean;
  error: string | null;
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'unknown';
  hasRequestedPermission: boolean;
}

export const useLocationHandler = () => {
  const [state, setState] = useState<LocationState>({
    location: null,
    isLoading: false,
    error: null,
    permissionStatus: 'unknown',
    hasRequestedPermission: false
  });
  
  const { toast } = useToast();

  const resetPermissionState = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
      permissionStatus: 'prompt',
      hasRequestedPermission: false
    }));
  }, []);

  const requestLocation = useCallback(async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      const error = 'Location services are not supported by this browser';
      setState(prev => ({ 
        ...prev, 
        error,
        permissionStatus: 'denied'
      }));
      toast({
        title: "Location Not Supported",
        description: error,
        variant: "destructive"
      });
      return false;
    }

    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null,
      hasRequestedPermission: true
    }));

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 300000 // 5 minutes
          }
        );
      });

      const location: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: Date.now()
      };

      setState(prev => ({
        ...prev,
        location,
        isLoading: false,
        error: null,
        permissionStatus: 'granted'
      }));

      // Cache location
      localStorage.setItem('lastKnownLocation', JSON.stringify(location));

      toast({
        title: "Location Found",
        description: "Your location has been successfully detected.",
      });

      return true;
    } catch (error: any) {
      let errorMessage = 'Unable to access your location';
      let permissionStatus: 'denied' | 'prompt' = 'denied';

      switch (error.code) {
        case 1: // PERMISSION_DENIED
          errorMessage = 'Location access was denied. Please enable location services and refresh the page.';
          permissionStatus = 'denied';
          break;
        case 2: // POSITION_UNAVAILABLE
          errorMessage = 'Your location is currently unavailable. Please try again.';
          permissionStatus = 'prompt';
          break;
        case 3: // TIMEOUT
          errorMessage = 'Location request timed out. Please try again.';
          permissionStatus = 'prompt';
          break;
        default:
          errorMessage = 'An error occurred while getting your location. Please try again.';
          permissionStatus = 'prompt';
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        permissionStatus
      }));

      toast({
        title: "Location Error",
        description: errorMessage,
        variant: "destructive"
      });

      return false;
    }
  }, [toast]);

  const setManualLocation = useCallback((lat: number, lng: number) => {
    const location: LocationData = {
      latitude: lat,
      longitude: lng,
      timestamp: Date.now()
    };

    setState(prev => ({
      ...prev,
      location,
      error: null,
      permissionStatus: 'granted'
    }));

    localStorage.setItem('lastKnownLocation', JSON.stringify(location));
    
    toast({
      title: "Location Set",
      description: "Manual location has been saved.",
    });
  }, [toast]);

  return {
    ...state,
    requestLocation,
    resetPermissionState,
    setManualLocation
  };
};
