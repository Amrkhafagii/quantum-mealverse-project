import { DeliveryLocation, LocationSource } from '@/types/location';
import { capacitorGeolocation } from './capacitorGeolocation';
import { UnifiedLocation } from '@/types/unifiedLocation';
import { logLocationDebug } from '@/utils/locationDebug';

// Warm-up state tracking for web
let isInWebWarmupPeriod = true;
let webWarmupStartTime = 0;
let webWarmupFixCount = 0;
const WEB_WARMUP_THRESHOLD_COUNT = 3;
const WEB_WARMUP_TIMEOUT_MS = 15000; // 15 seconds max for warmup

/**
 * Attempts to get the most accurate location using multiple high-accuracy sources
 * Only uses GPS and WiFi positioning, avoiding IP-based geolocation
 * Implements a warm-up period for more reliable results
 */
export const getHighAccuracyLocation = async (): Promise<DeliveryLocation | null> => {
  logLocationDebug('high-accuracy-location-request', { 
    context: { 
      method: 'getHighAccuracyLocation',
      isInWarmup: isInWebWarmupPeriod 
    } 
  });
  
  // Initialize warm-up period if this is the first request
  if (!webWarmupStartTime) {
    webWarmupStartTime = Date.now();
    isInWebWarmupPeriod = true;
    webWarmupFixCount = 0;
  }
  
  // Check if we've exceeded the warm-up timeout
  if (isInWebWarmupPeriod && (Date.now() - webWarmupStartTime > WEB_WARMUP_TIMEOUT_MS)) {
    isInWebWarmupPeriod = false;
    console.log('Location warm-up period timed out after', WEB_WARMUP_TIMEOUT_MS, 'ms');
  }
  
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
        
        // Increment warm-up count if we're still in warm-up period
        if (isInWebWarmupPeriod) {
          webWarmupFixCount++;
          
          // Exit warm-up if we got enough fixes
          if (webWarmupFixCount >= WEB_WARMUP_THRESHOLD_COUNT) {
            isInWebWarmupPeriod = false;
            console.log('Exiting location warm-up period after', webWarmupFixCount, 'fixes');
          }
        }
        
        return capacitorLocation;
      }
    }
    
    // Otherwise use browser geolocation API with adaptive accuracy options
    const options: PositionOptions = {
      // During warm-up, prioritize speed over accuracy to get initial fixes
      enableHighAccuracy: !isInWebWarmupPeriod, 
      timeout: isInWebWarmupPeriod ? 5000 : 15000,
      maximumAge: isInWebWarmupPeriod ? 60000 : 30000 // Allow cached positions during warm-up
    };
    
    console.log('Getting browser location with options:', {
      enableHighAccuracy: options.enableHighAccuracy,
      timeout: options.timeout,
      maximumAge: options.maximumAge,
      isInWarmup: isInWebWarmupPeriod
    });
    
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
        options
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
        accuracy: position.coords.accuracy,
        isInWarmup: isInWebWarmupPeriod,
        warmupFixCount: webWarmupFixCount,
        location
      } 
    });
    
    // Increment warm-up count if we're still in warm-up period
    if (isInWebWarmupPeriod) {
      webWarmupFixCount++;
      
      // If we get a high accuracy fix during warm-up, we can exit warm-up early
      if (position.coords.accuracy < 100 || webWarmupFixCount >= WEB_WARMUP_THRESHOLD_COUNT) {
        isInWebWarmupPeriod = false;
        console.log('Exiting location warm-up early due to good fix or threshold reached');
      }
      
      // If we're still in warm-up but accuracy is poor, immediately try again with high accuracy
      if (isInWebWarmupPeriod && position.coords.accuracy > 1000) {
        console.log('Poor accuracy during warm-up, immediately trying with high accuracy');
        
        try {
          const highAccuracyPosition = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              resolve,
              reject,
              { 
                enableHighAccuracy: true, 
                timeout: 10000,
                maximumAge: 0
              }
            );
          });
          
          // Update location with high accuracy fix
          location.latitude = highAccuracyPosition.coords.latitude;
          location.longitude = highAccuracyPosition.coords.longitude;
          location.accuracy = highAccuracyPosition.coords.accuracy;
          location.timestamp = highAccuracyPosition.timestamp;
          
          console.log('Got better location with accuracy:', highAccuracyPosition.coords.accuracy);
        } catch (highAccErr) {
          console.log('High accuracy fallback failed, using original location');
        }
      }
    }
    
    return location;
  } catch (error) {
    console.error('High accuracy location error:', error);
    logLocationDebug('high-accuracy-location-error', { 
      context: { 
        error,
        isInWarmup: isInWebWarmupPeriod,
        warmupFixCount: webWarmupFixCount
      } 
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

/**
 * Reset the warm-up period - useful when location accuracy is consistently poor
 */
export const resetLocationWarmupPeriod = (): void => {
  webWarmupStartTime = Date.now();
  isInWebWarmupPeriod = true;
  webWarmupFixCount = 0;
  logLocationDebug('reset-location-warmup', {
    context: { timestamp: webWarmupStartTime }
  });
};

/**
 * Check if we're currently in a location warm-up period
 */
export const isInLocationWarmupPeriod = (): boolean => {
  return isInWebWarmupPeriod;
};
