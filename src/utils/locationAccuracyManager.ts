import { DeliveryLocation, LocationSource } from '@/types/location';
import { capacitorGeolocation } from './capacitorGeolocation';
import { UnifiedLocation } from '@/types/unifiedLocation';
import { logLocationDebug } from '@/utils/locationDebug';

/**
 * Attempts to get the most accurate location using multiple high-accuracy sources
 * Only uses GPS and WiFi positioning, avoiding IP-based geolocation
 */
export const getHighAccuracyLocation = async (): Promise<DeliveryLocation | null> => {
  logLocationDebug('high-accuracy-location-request', { 
    context: { method: 'getHighAccuracyLocation' } 
  });
  
  try {
    // Try Capacitor Geolocation first (for native apps)
    if ((window as any).Capacitor) {
      const capacitorLocation = await capacitorGeolocation.getCapacitorLocation();
      
      if (capacitorLocation) {
        logLocationDebug('high-accuracy-location-result', { 
          context: { 
            source: 'capacitor',
            location: capacitorLocation
          } 
        });
        return capacitorLocation;
      }
    }
    
    // Otherwise use browser geolocation API with high accuracy options
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        position => resolve(position),
        error => {
          console.error('Browser geolocation error:', error);
          
          // Provide descriptive error messages
          let errorMessage = 'Location access failed.';
          if (error.code === 1) { // PERMISSION_DENIED
            errorMessage = 'Location permission denied. Please enable location in your browser settings.';
          } else if (error.code === 2) { // POSITION_UNAVAILABLE
            errorMessage = 'Your location is currently unavailable. Please try again in a few moments.';
          } else if (error.code === 3) { // TIMEOUT
            errorMessage = 'Location request timed out. Please check your connection and try again.';
          }
          
          reject(new Error(errorMessage));
        },
        { 
          enableHighAccuracy: true, 
          timeout: 15000,
          maximumAge: 30000  // Accept cached positions up to 30 seconds old
        }
      );
    });
    
    const location: DeliveryLocation = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp,
      speed: position.coords.speed || undefined,
      altitude: position.coords.altitude || undefined,
      heading: position.coords.heading !== null ? position.coords.heading : undefined,
      source: 'gps'
    };
    
    logLocationDebug('high-accuracy-location-result', { 
      context: { 
        source: 'browser-geolocation',
        location
      } 
    });
    
    return location;
  } catch (error) {
    console.error('High accuracy location error:', error);
    logLocationDebug('high-accuracy-location-error', { 
      context: { error } 
    });
    throw error; // Propagate error to caller
  }
};

/**
 * Converts a DeliveryLocation to UnifiedLocation format
 */
export const convertToUnifiedLocation = (location: DeliveryLocation): UnifiedLocation => {
  return {
    latitude: location.latitude,
    longitude: location.longitude,
    accuracy: location.accuracy,
    timestamp: new Date(location.timestamp).toISOString(),
    source: mapLocationSource(location.source),
    speed: location.speed,
    altitude: location.altitude || undefined,
    heading: location.heading || undefined,
    isMoving: location.isMoving,
  };
};

/**
 * Maps location source types between formats
 */
const mapLocationSource = (source: LocationSource): 'gps' | 'wifi' | 'network' | 'manual' | 'unknown' => {
  switch (source) {
    case 'gps':
      return 'gps';
    case 'wifi':
      return 'wifi';
    case 'cell':
      return 'network';
    case 'manual':
      return 'manual';
    default:
      return 'unknown';
  }
};

/**
 * Checks if the location accuracy meets high-accuracy standards
 */
export const isHighAccuracyLocation = (location: DeliveryLocation | UnifiedLocation | null): boolean => {
  if (!location) return false;
  
  // Consider only GPS or WiFi sources as high accuracy
  const isHighAccuracySource = 
    location.source === 'gps' || 
    location.source === 'wifi';
  
  // Check if the accuracy is reasonable (under 100 meters)
  const hasGoodAccuracy = 
    typeof location.accuracy === 'number' && 
    location.accuracy < 100;
    
  return isHighAccuracySource && hasGoodAccuracy;
};

/**
 * Provides guidance message based on location errors
 */
export const getLocationErrorGuidance = (error: Error): string => {
  const errorMessage = error.message.toLowerCase();
  
  if (errorMessage.includes('permission') || errorMessage.includes('denied')) {
    return 'Please enable location services in your device settings and refresh the page.';
  }
  
  if (errorMessage.includes('timeout')) {
    return 'Location request timed out. Please check your GPS signal and try again in an area with better reception.';
  }
  
  if (errorMessage.includes('unavailable')) {
    return 'Your location could not be determined. Try moving to an area with better GPS signal.';
  }
  
  return 'Could not get your location. Make sure your device has location services enabled and try again.';
};
