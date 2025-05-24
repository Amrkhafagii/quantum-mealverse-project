
export type TrackingMode = 'high' | 'medium' | 'low';

export interface TrackingModeOptions {
  batteryLevel?: number;
  networkQuality?: string;
  locationAccuracy?: number;
  isMoving?: boolean;
  userPreference?: TrackingMode;
}

export interface TrackingModeResult {
  trackingMode: TrackingMode;
  interval: number;
  distanceFilter: number;
  enableHighAccuracy: boolean;
}

export function calculateTrackingMode(options: TrackingModeOptions = {}): TrackingModeResult {
  const {
    batteryLevel = 100,
    networkQuality = 'high',
    locationAccuracy = 100,
    isMoving = false,
    userPreference
  } = options;

  // If user has explicit preference, use it
  if (userPreference) {
    return getTrackingConfig(userPreference);
  }

  // Calculate based on conditions
  let mode: TrackingMode = 'medium';

  if (batteryLevel < 20 || networkQuality === 'low') {
    mode = 'low';
  } else if (batteryLevel > 80 && networkQuality === 'high' && locationAccuracy < 50) {
    mode = 'high';
  }

  return getTrackingConfig(mode);
}

function getTrackingConfig(mode: TrackingMode): TrackingModeResult {
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
