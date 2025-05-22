
import { DeliveryLocation } from '@/types/location';

/**
 * Get location from browser's Geolocation API
 */
export const getBrowserLocation = async (): Promise<DeliveryLocation | null> => {
  // Check if geolocation is supported
  if (!navigator.geolocation) {
    throw new Error('Geolocation not supported by this browser');
  }
  
  try {
    // Get position from browser
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000
      });
    });
    
    // Format as DeliveryLocation
    const location: DeliveryLocation = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      timestamp: position.timestamp,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude || undefined,
      heading: position.coords.heading !== null ? position.coords.heading : undefined,
      speed: position.coords.speed !== null ? position.coords.speed : undefined,
      source: 'gps'
    };
    
    return location;
  } catch (error) {
    if ((error as GeolocationPositionError).code === 1) {
      throw new Error('Location permission denied');
    } else if ((error as GeolocationPositionError).code === 2) {
      throw new Error('Location unavailable');
    } else if ((error as GeolocationPositionError).code === 3) {
      throw new Error('Location request timed out');
    } else {
      throw error;
    }
  }
};
