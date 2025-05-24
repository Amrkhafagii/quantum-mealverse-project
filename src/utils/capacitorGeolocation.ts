
import { DeliveryLocation } from '@/types/location';

// Simple stub implementation for Capacitor Geolocation
export const capacitorGeolocation = {
  // Basic methods that match Capacitor Geolocation Plugin
  getCurrentPosition: async () => {
    throw new Error('Not implemented in web environment');
  },
  
  watchPosition: () => {
    console.warn('watchPosition not implemented in web environment');
    return 0;
  },
  
  clearWatch: () => {
    console.warn('clearWatch not implemented in web environment');
  },
  
  checkPermissions: async () => {
    return { location: 'prompt' };
  },
  
  requestPermissions: async () => {
    return { location: 'prompt' };
  },
  
  // Custom method to get location in our delivery format
  getCapacitorLocation: async (): Promise<DeliveryLocation | null> => {
    try {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        return null;
      }
      
      // Fallback to browser geolocation
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });
      
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        altitudeAccuracy: position.coords.altitudeAccuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: position.timestamp,
        source: 'gps',
        isMoving: false
      };
    } catch (error) {
      console.error('Error getting capacitor location:', error);
      return null;
    }
  }
};
