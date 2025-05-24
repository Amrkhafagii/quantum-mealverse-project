
import { ILocationService, LocationTrackingOptions } from './LocationService';
import { DeliveryLocation } from '@/types/location';
import { LocationPermissionStatus, LocationFreshness } from '@/types/unifiedLocation';

export abstract class BaseLocationService implements ILocationService {
  protected _isTracking: boolean = false;
  protected _lastLocation: DeliveryLocation | null = null;
  protected _listeners: Map<string, (location: DeliveryLocation) => void> = new Map();
  protected _locationFreshness: LocationFreshness = 'invalid';

  abstract getCurrentLocation(): Promise<DeliveryLocation | null>;
  abstract startTracking(options?: LocationTrackingOptions): Promise<boolean>;
  abstract stopTracking(): Promise<void>;

  getLastKnownLocation(): DeliveryLocation | null {
    return this._lastLocation;
  }

  async getPermissionStatus(): Promise<LocationPermissionStatus> {
    return 'prompt';
  }

  async requestPermission(): Promise<LocationPermissionStatus> {
    return 'prompt';
  }

  addLocationListener(callback: (location: DeliveryLocation) => void): string {
    const id = `listener-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this._listeners.set(id, callback);
    return id;
  }

  removeLocationListener(id: string): void {
    this._listeners.delete(id);
  }

  getFreshness(): LocationFreshness {
    return this._locationFreshness;
  }

  updateTrackingOptions(options: LocationTrackingOptions): Promise<boolean> {
    return Promise.resolve(true);
  }

  clearLocationCache(): void {
    this._lastLocation = null;
    this._locationFreshness = 'invalid';
  }

  protected updateLocation(location: DeliveryLocation): void {
    this._lastLocation = location;
    this._locationFreshness = 'fresh';
    
    // Notify all listeners
    this._listeners.forEach(callback => {
      try {
        callback(location);
      } catch (error) {
        console.error('Error in location listener:', error);
      }
    });
  }
}
