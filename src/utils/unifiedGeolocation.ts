
import { Capacitor } from '@capacitor/core';
import { Geolocation, Position } from '@capacitor/geolocation';
import { DeliveryLocation } from '@/types/location';

export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Request geolocation permission on both web and native
 */
export async function requestLocationPermission(): Promise<'granted' | 'denied' | 'prompt'> {
  if (isNativePlatform()) {
    try {
      const perm = await Geolocation.requestPermissions();
      // On iOS/Android, check location result
      if (perm.location === 'granted' || perm.coarseLocation === 'granted') {
        return 'granted';
      }
      if (perm.location === 'prompt' || perm.coarseLocation === 'prompt') {
        return 'prompt';
      }
      return 'denied';
    } catch (e) {
      return 'denied';
    }
  } else {
    // Web: try to request geolocation
    try {
      return await new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          () => resolve('granted'),
          (err) => {
            if (err.code === 1) return resolve('denied');
            if (err.code === 2) return resolve('denied');
            if (err.code === 3) return resolve('prompt');
            resolve('denied');
          },
          { timeout: 5000 }
        );
      });
    } catch {
      return 'denied';
    }
  }
}

/**
 * Get current position using the best available method.
 */
export async function getUnifiedCurrentLocation(): Promise<DeliveryLocation | null> {
  if (isNativePlatform()) {
    try {
      const position: Position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude ?? undefined,
        heading: position.coords.heading ?? undefined,
        speed: position.coords.speed ?? undefined,
        timestamp: position.timestamp,
        source: 'gps'
      };
    } catch (e: any) {
      if (e?.message?.includes('kCLErrorLocationUnknown')) {
        throw new Error('Unable to determine your location. Please move to a location with better reception and try again.');
      }
      throw new Error('Failed to get your location on this device. Make sure permissions are granted in iOS/Android settings.');
    }
  } else if ('geolocation' in navigator) {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude ?? undefined,
            heading: position.coords.heading ?? undefined,
            speed: position.coords.speed ?? undefined,
            timestamp: position.timestamp,
            source: 'gps'
          });
        },
        (err) => {
          if (err.code === 1) return reject(new Error('Location access denied. Please enable location in your browser preferences.'));
          if (err.code === 2) return reject(new Error('Location unavailable. Try moving to an area with better connectivity.'));
          if (err.code === 3) return reject(new Error('Location request timed out. Please try again.'));
          return reject(new Error('Could not get your location. Please check your device settings.'));
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
      );
    });
  } else {
    throw new Error('Geolocation is not supported in your environment.');
  }
}
