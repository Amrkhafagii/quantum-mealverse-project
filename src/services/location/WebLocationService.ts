
import { LocationData, LocationError, ILocationService } from './LocationServiceInterface';
import { logLocationDebug } from '@/utils/locationDebug';

export class WebLocationService implements ILocationService {
  private watchId: number | null = null;
  private lastKnownLocation: LocationData | null = null;
  private options: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 30000
  };

  async getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            // Fix: Ensure timestamp is number
            timestamp: typeof position.timestamp === 'number' ? position.timestamp : Date.now()
          };
          
          this.lastKnownLocation = locationData;
          logLocationDebug('web-location-success', locationData);
          resolve(locationData);
        },
        (error) => {
          const locationError: LocationError = {
            code: error.code,
            message: error.message
          };
          logLocationDebug('web-location-error', locationError);
          reject(new Error(locationError.message));
        },
        this.options
      );
    });
  }

  async startWatching(callback: (location: LocationData) => void, errorCallback?: (error: LocationError) => void): Promise<void> {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported');
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          // Fix: Ensure timestamp is number
          timestamp: typeof position.timestamp === 'number' ? position.timestamp : Date.now()
        };
        
        this.lastKnownLocation = locationData;
        logLocationDebug('web-location-watch-update', locationData);
        callback(locationData);
      },
      (error) => {
        const locationError: LocationError = {
          code: error.code,
          message: error.message
        };
        logLocationDebug('web-location-watch-error', locationError);
        if (errorCallback) {
          errorCallback(locationError);
        }
      },
      this.options
    );
  }

  async stopWatching(): Promise<void> {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      logLocationDebug('web-location-watch-stopped', {});
    }
  }

  async getLastKnownLocation(): Promise<LocationData | null> {
    return this.lastKnownLocation;
  }

  setOptions(options: Partial<PositionOptions>): void {
    this.options = { ...this.options, ...options };
  }
}

