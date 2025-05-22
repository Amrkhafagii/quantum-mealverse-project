
import { toast } from 'sonner';
import { DeliveryLocation } from '@/types/location';
import { LocationSource } from '@/types/unifiedLocation';
import { securelyStoreLocation } from './locationUtils';

interface GeolocationOptions {
  enableHighAccuracy: boolean;
  timeout: number;
  maximumAge: number;
}

/**
 * Get location using browser's geolocation API
 */
export const getBrowserLocation = (options: GeolocationOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0
}): Promise<DeliveryLocation | null> => {
  return new Promise<DeliveryLocation | null>((resolve) => {
    if (!navigator.geolocation) {
      const errorMsg = 'Geolocation is not supported by this browser';
      console.error(errorMsg);
      toast.error('Geolocation not supported');
      resolve(null);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        console.log('Browser geolocation successful');
        
        // Determine source based on accuracy
        let source: LocationSource = 'gps';
        if (position.coords.accuracy > 100) {
          source = 'wifi';
        } else if (position.coords.accuracy > 1000) {
          source = 'cell_tower';
        }
        
        const locationData: DeliveryLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: position.timestamp || Date.now(),
          accuracy: position.coords.accuracy,
          speed: position.coords.speed || 0,
          isMoving: (position.coords.speed || 0) > 0.5,
          source: source
        };
        
        console.log('Browser location data:', locationData);
        
        // Store location data securely when available
        try {
          await securelyStoreLocation(locationData);
        } catch (e) {
          console.warn('Could not store location securely, falling back to standard storage', e);
        }
        
        resolve(locationData);
      },
      (err) => {
        console.error('Browser geolocation error:', err);
        
        let errorMessage = 'An unknown error occurred.';
        if (err.code === 1) {
          errorMessage = 'Permission denied. Please enable location in your browser settings.';
        } else if (err.code === 2) {
          errorMessage = 'Location information is unavailable.';
        } else if (err.code === 3) {
          errorMessage = 'The request to get user location timed out.';
        }
        
        toast.error('Location error', { description: errorMessage });
        resolve(null);
      },
      options
    );
  });
};
