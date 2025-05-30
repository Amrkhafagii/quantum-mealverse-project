
import { LocationData, LocationConfig, LocationError, LocationWatchOptions, LocationWatchCallback } from '@/types/location';

export class LocationManager {
  private watchId: number | null = null;
  private callbacks: Set<LocationWatchCallback> = new Set();

  startWatching(callback: LocationWatchCallback, options?: LocationWatchOptions): void {
    this.callbacks.add(callback);
    
    if (!this.watchId && navigator.geolocation) {
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          const location: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
            timestamp: position.timestamp,
            source: 'gps'
          };
          
          this.callbacks.forEach(cb => cb(location));
        },
        (error) => {
          const locationError: LocationError = {
            code: error.code,
            message: error.message,
            timestamp: Date.now()
          };
          
          this.callbacks.forEach(cb => cb(null, locationError));
        },
        options
      );
    }
  }

  stopWatching(callback?: LocationWatchCallback): void {
    if (callback) {
      this.callbacks.delete(callback);
    } else {
      this.callbacks.clear();
    }
    
    if (this.callbacks.size === 0 && this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  getCurrentPosition(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
            timestamp: position.timestamp,
            source: 'gps'
          };
          resolve(location);
        },
        (error) => {
          reject({
            code: error.code,
            message: error.message,
            timestamp: Date.now()
          });
        }
      );
    });
  }
}

export const locationManager = new LocationManager();
