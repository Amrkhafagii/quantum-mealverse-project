
export type TrackingMode = 'high' | 'medium' | 'low';

export interface TrackingModeOptions {
  batteryLevel?: number;
  networkQuality?: string;
  locationAccuracy?: number;
  isMoving?: boolean;
  userPreference?: TrackingMode;
  isLowBattery?: boolean;
  isLowQuality?: boolean;
  orderStatus?: string;
  location?: any; 
  customerLocation?: { latitude: number; longitude: number };
  restaurantLocation?: { latitude: number; longitude: number };
  forceLowPowerMode?: boolean;
}

export interface TrackingModeResult {
  trackingMode: TrackingMode;
  interval: number;
  distanceFilter: number;
  enableHighAccuracy: boolean;
  distanceToDestination?: number;
}

export function calculateTrackingMode(options: TrackingModeOptions = {}): TrackingModeResult {
  const {
    batteryLevel = 100,
    networkQuality = 'high',
    locationAccuracy = 100,
    isMoving = false,
    userPreference,
    isLowBattery = false,
    isLowQuality = false,
    orderStatus = 'pending',
    location,
    customerLocation,
    restaurantLocation,
    forceLowPowerMode = false
  } = options;

  // If user has explicit preference, use it
  if (userPreference) {
    return getTrackingConfig(userPreference);
  }

  // Calculate based on conditions
  let mode: TrackingMode = 'medium';
  let distanceToDestination = null;

  // Calculate distance to destination if possible
  if (location && customerLocation) {
    distanceToDestination = calculateDistance(
      { lat: location.latitude, lng: location.longitude },
      { lat: customerLocation.latitude, lng: customerLocation.longitude }
    );
  }

  if (batteryLevel < 20 || isLowBattery || forceLowPowerMode || isLowQuality || networkQuality === 'low') {
    mode = 'low';
  } else if ((batteryLevel > 80 && networkQuality === 'high' && locationAccuracy < 50) || 
             (orderStatus === 'delivering' && distanceToDestination && distanceToDestination < 1)) {
    mode = 'high';
  }

  // Get default config for the determined mode
  const result = getTrackingConfig(mode);
  
  // Attach calculated distance if available
  if (distanceToDestination !== null) {
    result.distanceToDestination = distanceToDestination;
  }

  return result;
}

export function getTrackingConfig(mode: TrackingMode): TrackingModeResult {
  switch (mode) {
    case 'high':
      return {
        trackingMode: mode,
        interval: 5000,
        distanceFilter: 5,
        enableHighAccuracy: true
      };
    case 'low':
      return {
        trackingMode: mode,
        interval: 60000,
        distanceFilter: 50,
        enableHighAccuracy: false
      };
    case 'medium':
    default:
      return {
        trackingMode: mode,
        interval: 15000,
        distanceFilter: 10,
        enableHighAccuracy: true
      };
  }
}

export function getTrackingInterval(mode: TrackingMode): number {
  return getTrackingConfig(mode).interval;
}

// Helper function to calculate distance between two points
function calculateDistance(point1: {lat: number, lng: number}, point2: {lat: number, lng: number}): number {
  if (!point1 || !point2) return 0;
  
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  
  const dLat = toRad(point2.lat - point1.lat);
  const dLon = toRad(point2.lng - point1.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) * Math.cos(toRad(point2.lat)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
