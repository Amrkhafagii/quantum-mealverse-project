
import { useState, useEffect, useCallback } from 'react';
import { BatteryOptimization } from '@/utils/batteryOptimization';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';

export type AccuracyLevel = 'high' | 'medium' | 'low' | 'unknown';

export type PermissionState = 'prompt' | 'prompt-with-rationale' | 'granted' | 'denied';

interface LocationPermissionStatus {
  location: PermissionState;
  backgroundLocation: PermissionState;
}

export function useLocationPermissions() {
  const [permissionStatus, setPermissionStatus] = useState<PermissionState>('prompt');
  const [backgroundPermissionStatus, setBackgroundPermissionStatus] = useState<PermissionState>('prompt');
  const [isRequesting, setIsRequesting] = useState(false);
  const [lastChecked, setLastChecked] = useState<number | null>(null);
  const [locationAvailable, setLocationAvailable] = useState<boolean | null>(null);
  const [highAccuracyAvailable, setHighAccuracyAvailable] = useState<boolean | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [fallbackMode, setFallbackMode] = useState(false);
  const [recoveryAttempts, setRecoveryAttempts] = useState(0);

  // Initialize permission status - only run once
  useEffect(() => {
    if (hasInitialized) return; // Prevent multiple initializations
    
    const checkInitialStatus = async () => {
      try {
        console.log('=== useLocationPermissions initialization ===');
        const status = await LocationPermissions.checkPermissionStatus();
        setPermissionStatus(status.location);
        setBackgroundPermissionStatus(status.backgroundLocation);
        setLastChecked(Date.now());
        
        // After checking permissions, also check if location services are available
        await checkLocationAvailability();
        
        setHasInitialized(true);
        console.log('=== useLocationPermissions initialized ===');
      } catch (error) {
        console.error('Error checking initial permission status:', error);
        // Enter fallback mode if plugin fails
        setFallbackMode(true);
        setHasInitialized(true);
        
        // Use browser APIs as fallback
        checkBrowserLocation();
      }
    };
    
    checkInitialStatus();
  }, []); // Empty dependency array - only run once
  
  // Check if location services are enabled and high accuracy is available
  const checkLocationAvailability = useCallback(async () => {
    try {
      // In a real implementation, we would use a native plugin to check this
      // Here we'll simulate with geolocation API
      
      // Check if location is available at all
      if ('geolocation' in navigator) {
        setLocationAvailable(true);
        
        // Try to get a high accuracy position with short timeout
        try {
          await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              resolve,
              reject,
              { 
                timeout: 5000,
                enableHighAccuracy: true
              }
            );
          });
          
          setHighAccuracyAvailable(true);
        } catch (e) {
          console.warn('High accuracy location not available:', e);
          setHighAccuracyAvailable(false);
        }
      } else {
        setLocationAvailable(false);
        setHighAccuracyAvailable(false);
      }
    } catch (e) {
      console.error('Error checking location availability:', e);
      setLocationAvailable(false);
    }
  }, []);
  
  // Use browser geolocation API as fallback
  const checkBrowserLocation = useCallback(async () => {
    if ('geolocation' in navigator && 'permissions' in navigator) {
      try {
        const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        
        if (status.state === 'granted') {
          setPermissionStatus('granted');
        } else if (status.state === 'denied') {
          setPermissionStatus('denied');
        } else {
          setPermissionStatus('prompt');
        }
        
        setLastChecked(Date.now());
      } catch (e) {
        console.error('Error checking browser location permission:', e);
      }
    }
  }, []);
  
  // Request permissions with graceful degradation strategy
  const requestPermission = useCallback(async () => {
    if (isRequesting) return { location: permissionStatus, backgroundLocation: backgroundPermissionStatus };
    
    setIsRequesting(true);
    
    try {
      // Try with the plugin first
      if (!fallbackMode) {
        // Start with high accuracy request
        const highAccuracyOptions = { includeBackground: true };
        try {
          const status = await LocationPermissions.requestPermission(highAccuracyOptions);
          setPermissionStatus(status.location);
          setBackgroundPermissionStatus(status.backgroundLocation);
          setLastChecked(Date.now());
          
          // If granted, check if high accuracy is actually available
          if (status.location === 'granted') {
            await checkLocationAvailability();
          }
          
          setIsRequesting(false);
          return status;
        } catch (error) {
          console.warn('High accuracy permission request failed, trying with lower accuracy:', error);
          
          // If high accuracy failed, try with lower accuracy
          try {
            const lowAccuracyOptions = { includeBackground: false };
            const status = await LocationPermissions.requestPermission(lowAccuracyOptions);
            
            setPermissionStatus(status.location);
            setBackgroundPermissionStatus(status.backgroundLocation);
            setLastChecked(Date.now());
            setHighAccuracyAvailable(false);
            
            setIsRequesting(false);
            return status;
          } catch (lowAccError) {
            console.error('Both high and low accuracy requests failed:', lowAccError);
            throw lowAccError;
          }
        }
      } else {
        // Use browser APIs as fallback
        return new Promise<LocationPermissionStatus>((resolve) => {
          if (!('geolocation' in navigator)) {
            setPermissionStatus('denied');
            setIsRequesting(false);
            resolve({ location: 'denied', backgroundLocation: 'denied' });
            return;
          }
          
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setPermissionStatus('granted');
              setLastChecked(Date.now());
              setIsRequesting(false);
              resolve({ location: 'granted', backgroundLocation: 'prompt' });
            },
            (error) => {
              if (error.code === 1) { // PERMISSION_DENIED
                setPermissionStatus('denied');
              } else {
                setPermissionStatus('prompt');
              }
              setLastChecked(Date.now());
              setIsRequesting(false);
              resolve({ 
                location: error.code === 1 ? 'denied' : 'prompt', 
                backgroundLocation: 'prompt' 
              });
            },
            { timeout: 10000 }
          );
        });
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setIsRequesting(false);
      
      // Fall back to browser API if plugin fails
      setFallbackMode(true);
      return requestPermission(); // Retry with fallback mode
    }
  }, [isRequesting, permissionStatus, backgroundPermissionStatus, fallbackMode, checkLocationAvailability]);
  
  // Attempt to recover high accuracy if it's not available
  const attemptHighAccuracyRecovery = useCallback(async () => {
    if (highAccuracyAvailable || recoveryAttempts >= 3) return highAccuracyAvailable;
    
    setRecoveryAttempts(prev => prev + 1);
    
    try {
      // In a real implementation, we would use platform-specific APIs to prompt
      // for high-accuracy location. Here we'll simulate it.
      
      // Request with high accuracy option
      await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          { 
            timeout: 10000,
            enableHighAccuracy: true,
            maximumAge: 0
          }
        );
      });
      
      setHighAccuracyAvailable(true);
      return true;
    } catch (e) {
      console.warn('High accuracy recovery attempt failed:', e);
      setHighAccuracyAvailable(false);
      return false;
    }
  }, [highAccuracyAvailable, recoveryAttempts]);

  return {
    permissionStatus,
    backgroundPermissionStatus,
    requestPermission,
    isRequesting,
    lastChecked,
    hasInitialized,
    locationAvailable,
    highAccuracyAvailable,
    attemptHighAccuracyRecovery,
    recoveryAttempts,
    fallbackMode,
    checkLocationAvailability
  };
}

// Add missing LocationPermissions global variable
const LocationPermissions = {
  checkPermissionStatus: async (): Promise<LocationPermissionStatus> => {
    console.log('Getting permission status');
    // Fallback implementation
    return { 
      location: 'prompt' as PermissionState,
      backgroundLocation: 'prompt' as PermissionState
    };
  },
  requestPermission: async (options: { includeBackground?: boolean }): Promise<LocationPermissionStatus> => {
    console.log('Requesting permission with options:', options);
    // Fallback implementation
    return {
      location: 'prompt' as PermissionState,
      backgroundLocation: 'prompt' as PermissionState
    };
  }
};
