
import { DeliveryLocation } from '@/types/location';

export interface AccuracyConfig {
  highAccuracy: boolean;
  timeout: number;
  maximumAge: number;
}

export interface AccuracyLevel {
  level: 'very-high' | 'high' | 'medium' | 'low' | 'very-low';
  description: string;
  color: string;
}

export const getAccuracyLevel = (accuracy?: number): AccuracyLevel => {
  if (!accuracy) {
    return {
      level: 'very-low',
      description: 'Unknown',
      color: 'text-gray-500'
    };
  }

  if (accuracy <= 5) {
    return {
      level: 'very-high',
      description: 'Very High',
      color: 'text-green-600'
    };
  } else if (accuracy <= 10) {
    return {
      level: 'high',
      description: 'High',
      color: 'text-green-500'
    };
  } else if (accuracy <= 50) {
    return {
      level: 'medium',
      description: 'Medium',
      color: 'text-yellow-500'
    };
  } else if (accuracy <= 100) {
    return {
      level: 'low',
      description: 'Low',
      color: 'text-orange-500'
    };
  } else {
    return {
      level: 'very-low',
      description: 'Very Low',
      color: 'text-red-500'
    };
  }
};

export const getOptimalAccuracyConfig = (
  batteryLevel?: number,
  isMoving?: boolean,
  networkQuality?: string
): AccuracyConfig => {
  const lowBattery = batteryLevel && batteryLevel < 20;
  const poorNetwork = networkQuality === 'low' || networkQuality === 'offline';

  if (lowBattery || poorNetwork) {
    return {
      highAccuracy: false,
      timeout: 15000,
      maximumAge: 300000 // 5 minutes
    };
  }

  if (isMoving) {
    return {
      highAccuracy: true,
      timeout: 10000,
      maximumAge: 60000 // 1 minute
    };
  }

  return {
    highAccuracy: true,
    timeout: 8000,
    maximumAge: 120000 // 2 minutes
  };
};

export const enhanceLocationWithAccuracy = (
  location: DeliveryLocation,
  config: AccuracyConfig
): DeliveryLocation => {
  const accuracyLevel = getAccuracyLevel(location.accuracy);
  
  return {
    ...location,
    source: location.source || (config.highAccuracy ? 'gps' : 'network')
  };
};
