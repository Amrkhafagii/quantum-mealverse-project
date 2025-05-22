
import { DeliveryLocation } from '@/types/location';

/**
 * Get location using Capacitor Geolocation API
 */
export const getCapacitorLocation = async (): Promise<DeliveryLocation | null> => {
  // Check if Capacitor is available
  if (!(window as any).Capacitor) {
    return null;
  }
  
  try {
    // Try to import Capacitor Geolocation
    const { Geolocation } = (window as any).Capacitor.Plugins;
    
    // Get current position
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000
    });
    
    if (!position || !position.coords) {
      return null;
    }
    
    // Format as DeliveryLocation
    const location: DeliveryLocation = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      timestamp: position.timestamp,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude,
      heading: position.coords.heading !== null ? position.coords.heading : undefined,
      speed: position.coords.speed,
      source: 'gps'
    };
    
    return location;
  } catch (error) {
    console.error('Error getting Capacitor location:', error);
    return null;
  }
};
