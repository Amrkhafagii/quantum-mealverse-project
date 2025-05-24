
import { DeliveryLocation } from '@/types/location';
import { LocationFreshness } from '@/types/unifiedLocation';
import { Platform } from '@/utils/platform';
import { LocationPermissionService } from '@/services/permission/LocationPermissionService';

export type LocationSource = 'gps' | 'network' | 'manual' | 'cached';
export type LocationPermissionStatus = 'granted' | 'denied' | 'prompt';
export type LocationTrackingMode = 'high' | 'balanced' | 'low-power' | 'passive';
export type LocationCallback = (location: DeliveryLocation) => void;

/**
 * LocationService interface - defines the contract for location services
 */
export interface ILocationService {
  // Core location methods
  getCurrentLocation(): Promise<DeliveryLocation | null>;
  startTracking(options?: LocationTrackingOptions): Promise<boolean>;
  stopTracking(): Promise<void>;
  
  // Permission methods
  getPermissionStatus(): Promise<LocationPermissionStatus>;
  requestPermission(): Promise<LocationPermissionStatus>;
  
  // Location state
  isTracking(): boolean;
  getLastKnownLocation(): DeliveryLocation | null;
  getFreshness(): LocationFreshness;
  
  // Events
  addLocationListener(callback: LocationCallback): string;
  removeLocationListener(id: string): boolean;
}

/**
 * Options for location tracking
 */
export interface LocationTrackingOptions {
  mode?: LocationTrackingMode;
  interval?: number; // milliseconds
  fastestInterval?: number; // milliseconds
  distanceFilter?: number; // meters
  enableHighAccuracy?: boolean;
  timeout?: number; // milliseconds
  maximumAge?: number; // milliseconds
  backgroundTracking?: boolean;
}

/**
 * Abstract base class for location services
 */
export abstract class BaseLocationService implements ILocationService {
  protected _isTracking: boolean = false;
  protected _lastLocation: DeliveryLocation | null = null;
  protected _freshness: LocationFreshness = 'invalid';
  protected _listeners: Map<string, LocationCallback> = new Map();
  protected _permissionService: LocationPermissionService;
  
  constructor() {
    this._permissionService = LocationPermissionService.getInstance();
  }

  abstract getCurrentLocation(): Promise<DeliveryLocation | null>;
  abstract startTracking(options?: LocationTrackingOptions): Promise<boolean>;
  abstract stopTracking(): Promise<void>;
  
  async getPermissionStatus(): Promise<LocationPermissionStatus> {
    const status = await this._permissionService.checkPermissions();
    return this.mapPermissionStatus(status.location);
  }
  
  async requestPermission(): Promise<LocationPermissionStatus> {
    const status = await this._permissionService.requestPermissions();
    return this.mapPermissionStatus(status.location);
  }
  
  isTracking(): boolean {
    return this._isTracking;
  }
  
  getLastKnownLocation(): DeliveryLocation | null {
    return this._lastLocation;
  }
  
  getFreshness(): LocationFreshness {
    return this._freshness;
  }
  
  addLocationListener(callback: LocationCallback): string {
    const id = Math.random().toString(36).substring(2, 9);
    this._listeners.set(id, callback);
    return id;
  }
  
  removeLocationListener(id: string): boolean {
    return this._listeners.delete(id);
  }
  
  protected updateLocation(location: DeliveryLocation): void {
    this._lastLocation = location;
    this.updateFreshness(location);
    
    // Notify all listeners
    this._listeners.forEach(callback => {
      try {
        callback(location);
      } catch (error) {
        console.error('Error in location listener:', error);
      }
    });
  }
  
  protected updateFreshness(location: DeliveryLocation): void {
    const now = Date.now();
    const locationTime = location.timestamp;
    const diff = now - locationTime;
    
    if (diff < 60000) { // Less than 1 minute
      this._freshness = 'fresh';
    } else if (diff < 300000) { // Less than 5 minutes
      this._freshness = 'moderate';
    } else if (diff < 1800000) { // Less than 30 minutes
      this._freshness = 'stale';
    } else {
      this._freshness = 'invalid';
    }
  }
  
  protected mapPermissionStatus(status: string): LocationPermissionStatus {
    switch (status) {
      case 'granted': return 'granted';
      case 'denied': return 'denied';
      default: return 'prompt';
    }
  }
}

/**
 * Factory for creating the appropriate location service based on platform
 */
export class LocationServiceFactory {
  private static instance: ILocationService | null = null;
  
  static async getLocationService(): Promise<ILocationService> {
    if (!this.instance) {
      if (Platform.isNative()) {
        // Lazy load the native service
        const module = await import('./NativeLocationService');
        this.instance = new module.NativeLocationService();
      } else {
        // Lazy load the web service
        const module = await import('./WebLocationService');
        this.instance = new module.WebLocationService();
      }
    }
    return this.instance;
  }
}

export default LocationServiceFactory;
