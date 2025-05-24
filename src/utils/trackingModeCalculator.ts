
import { DeliveryLocation } from '@/types/location';

export type TrackingMode = 'passive' | 'balanced' | 'high-precision' | 'standard' | 'medium';

export interface TrackingModeResult {
  trackingMode: TrackingMode;
  trackingInterval: number; // milliseconds
  enableHighAccuracy: boolean;
  distanceToDestination: number | null;
  distanceFilter: number; // meters
}

interface TrackingModeOptions {
  isLowBattery?: boolean;
  isLowQuality?: boolean;
  orderStatus?: string;
  location?: DeliveryLocation | null;
  customerLocation?: { latitude: number; longitude: number } | null;
  restaurantLocation?: { latitude: number; longitude: number } | null;
  forceLowPowerMode?: boolean;
}

// Calculate the optimal tracking mode based on various factors
export function calculateTrackingMode(options: TrackingModeOptions = {}): TrackingModeResult {
  const {
    isLowBattery = false,
    isLowQuality = false,
    orderStatus = 'pending',
    location = null,
    customerLocation = null,
    restaurantLocation = null,
    forceLowPowerMode = false,
  } = options;

  let trackingMode: TrackingMode = 'standard';
  let distanceToDestination: number | null = null;
  
  // Check if we should force low power mode
  if (forceLowPowerMode) {
    trackingMode = 'passive';
  }
  // If battery is low, use passive mode
  else if (isLowBattery) {
    trackingMode = 'passive';
  }
  // If network quality is low, use balanced mode
  else if (isLowQuality) {
    trackingMode = 'balanced';
  }
  // If order is active and we're close to destination, use high precision
  else if (orderStatus === 'active' && location && customerLocation) {
    // Calculate distance to customer
    distanceToDestination = calculateDistance(
      location.latitude, 
      location.longitude,
      customerLocation.latitude,
      customerLocation.longitude
    );
    
    if (distanceToDestination < 1000) {
      trackingMode = 'high-precision';
    } else if (distanceToDestination < 5000) {
      trackingMode = 'balanced';
    } else {
      trackingMode = 'standard';
    }
  }
  // Default to standard mode for other cases
  else {
    trackingMode = 'standard';
  }
  
  return {
    trackingMode,
    trackingInterval: getTrackingInterval(trackingMode),
    enableHighAccuracy: trackingMode === 'high-precision',
    distanceToDestination,
    distanceFilter: getDistanceFilter(trackingMode),
  };
}

// Get tracking interval based on mode
export function getTrackingInterval(mode: TrackingMode): number {
  switch (mode) {
    case 'high-precision':
      return 10000; // 10 seconds
    case 'balanced':
      return 30000; // 30 seconds
    case 'standard':
      return 60000; // 1 minute
    case 'passive':
      return 120000; // 2 minutes
    case 'medium':
      return 45000; // 45 seconds
    default:
      return 60000; // 1 minute default
  }
}

// Get distance filter based on mode (minimum distance in meters before updates)
function getDistanceFilter(mode: TrackingMode): number {
  switch (mode) {
    case 'high-precision':
      return 10; // 10 meters
    case 'balanced':
      return 50; // 50 meters
    case 'standard':
      return 100; // 100 meters
    case 'passive':
      return 500; // 500 meters
    case 'medium':
      return 75; // 75 meters
    default:
      return 100;
  }
}

// Calculate distance between two points in meters
function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}
