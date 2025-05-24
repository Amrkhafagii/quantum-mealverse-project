
import { Capacitor } from '@capacitor/core';
import { Geolocation, Position } from '@capacitor/geolocation';
import { DeliveryLocation } from '@/types/location';

export const isNativeApp = (): boolean => {
  return Capacitor.isNativePlatform();
};

export const requestLocationPermissions = async (): Promise<boolean> => {
  if (!isNativeApp()) {
    // For web, we'll handle permission requests differently
    return true;
  }

  try {
    const permissions = await Geolocation.requestPermissions();
    return permissions.location === 'granted';
  } catch (error) {
    console.error('Error requesting location permissions:', error);
    return false;
  }
};

export const getCurrentPosition = async (options?: {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}): Promise<DeliveryLocation | null> => {
  try {
    const position: Position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: options?.enableHighAccuracy ?? true,
      timeout: options?.timeout ?? 10000,
      maximumAge: options?.maximumAge ?? 300000, // 5 minutes
    });

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude || undefined,
      heading: position.coords.heading || undefined,
      speed: position.coords.speed || undefined,
      timestamp: position.timestamp,
      source: 'gps'
    };
  } catch (error) {
    console.error('Error getting current position:', error);
    return null;
  }
};

export const watchPosition = async (
  callback: (location: DeliveryLocation | null) => void,
  options?: {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
  }
): Promise<string | null> => {
  try {
    const watchId = await Geolocation.watchPosition(
      {
        enableHighAccuracy: options?.enableHighAccuracy ?? true,
        timeout: options?.timeout ?? 10000,
        maximumAge: options?.maximumAge ?? 300000,
      },
      (position, err) => {
        if (err) {
          console.error('Watch position error:', err);
          callback(null);
          return;
        }

        if (position) {
          const location: DeliveryLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
            timestamp: position.timestamp,
            source: 'gps'
          };
          callback(location);
        }
      }
    );

    return watchId;
  } catch (error) {
    console.error('Error starting position watch:', error);
    return null;
  }
};

export const clearWatch = async (watchId: string): Promise<void> => {
  try {
    await Geolocation.clearWatch({ id: watchId });
  } catch (error) {
    console.error('Error clearing position watch:', error);
  }
};
