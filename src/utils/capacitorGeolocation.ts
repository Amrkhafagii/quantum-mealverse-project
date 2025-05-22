
import { DeliveryLocation } from '@/types/location';

/**
 * Get location using Capacitor Geolocation API
 * Optimized for high accuracy with GPS and WiFi positioning
 */
export const capacitorGeolocation = {
  getCapacitorLocation: async (): Promise<DeliveryLocation | null> => {
    // Check if Capacitor is available
    if (!(window as any).Capacitor) {
      console.log('Capacitor is not available, skipping native geolocation');
      return null;
    }
    
    try {
      // Try to import Capacitor Geolocation
      const { Geolocation } = (window as any).Capacitor.Plugins;
      
      // First try with highest accuracy
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000 // Accept slightly cached positions to improve performance
      });
      
      if (!position || !position.coords) {
        console.error('Capacitor returned invalid position data');
        return null;
      }
      
      // Check if the accuracy meets our standards (typically GPS or WiFi)
      if (position.coords.accuracy > 100) {
        console.warn('Capacitor location not accurate enough:', position.coords.accuracy);
        
        // Try one more time with a stricter timeout
        try {
          const retryPosition = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0 // Force fresh position
          });
          
          if (retryPosition?.coords && retryPosition.coords.accuracy <= 100) {
            // Use this more accurate position
            position.coords = retryPosition.coords;
            position.timestamp = retryPosition.timestamp;
          }
        } catch (retryError) {
          console.error('Retry for higher accuracy failed:', retryError);
          // Continue with the original position if retry fails
        }
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
  },
  
  watchPosition: (callback: (location: DeliveryLocation) => void, errorCallback?: (error: any) => void): (() => void) => {
    // Check if Capacitor is available
    if (!(window as any).Capacitor) {
      if (errorCallback) {
        errorCallback(new Error('Capacitor is not available'));
      }
      return () => {}; // Return empty cleanup function
    }
    
    try {
      const { Geolocation } = (window as any).Capacitor.Plugins;
      
      // Start watching position with high accuracy settings
      const watchId = Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000
        },
        (position: any) => {
          if (position && position.coords) {
            const location: DeliveryLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              timestamp: position.timestamp,
              accuracy: position.coords.accuracy,
              altitude: position.coords.altitude,
              heading: position.coords.heading !== null ? position.coords.heading : undefined,
              speed: position.coords.speed,
              source: 'gps',
              isMoving: position.coords.speed && position.coords.speed > 0.5
            };
            
            callback(location);
          }
        },
        (error: any) => {
          console.error('Capacitor watch position error:', error);
          if (errorCallback) {
            errorCallback(error);
          }
        }
      );
      
      // Return cleanup function that clears the watch
      return () => {
        Geolocation.clearWatch({ id: watchId });
      };
    } catch (error) {
      console.error('Error setting up Capacitor location watcher:', error);
      if (errorCallback) {
        errorCallback(error);
      }
      return () => {}; // Return empty cleanup function
    }
  }
};

export default capacitorGeolocation;
