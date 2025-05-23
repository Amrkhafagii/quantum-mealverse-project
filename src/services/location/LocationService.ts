
import { Geolocation } from '@capacitor/geolocation';
import { locationPermissionService } from '../permission/LocationPermissionService';
import { Preferences } from '@capacitor/preferences';

export interface LocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export interface LocationWatchOptions extends LocationOptions {
  distanceFilter?: number; // minimum distance in meters between position updates
}

export class LocationService {
  private static instance: LocationService;
  private watchId: string | null = null;
  private isTracking = false;
  private lastLocation: { latitude: number; longitude: number; timestamp: number } | null = null;
  private callbacks: Set<(location: { latitude: number; longitude: number }) => void> = new Set();
  private errorCallbacks: Set<(error: any) => void> = new Set();
  
  // Storage keys
  private readonly LAST_LOCATION_KEY = 'last_tracked_location';
  
  private constructor() {}
  
  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }
  
  /**
   * Initialize location service
   */
  public async initialize(): Promise<void> {
    try {
      console.log('Initializing location service');
      
      // Initialize permissions service first
      await locationPermissionService.initialize();
      
      // Load last known location from storage
      await this.loadLastLocation();
      
      console.log('Location service initialized successfully');
    } catch (error) {
      console.error('Error initializing location service:', error);
    }
  }
  
  /**
   * Start tracking location
   */
  public async startTracking(options: LocationWatchOptions = {}): Promise<boolean> {
    try {
      if (this.isTracking) {
        console.log('Location tracking is already active');
        return true;
      }
      
      // Ensure we have permissions
      const status = await locationPermissionService.checkPermissions();
      if (status.location !== 'granted') {
        console.log('No location permission, requesting...');
        const requestResult = await locationPermissionService.requestPermissions();
        if (requestResult.location !== 'granted') {
          console.error('Location permission denied');
          return false;
        }
      }
      
      // Default options
      const watchOptions: LocationWatchOptions = {
        enableHighAccuracy: true, 
        timeout: 10000,
        maximumAge: 3000,
        distanceFilter: 5, // 5 meters
        ...options
      };
      
      console.log('Starting location tracking with options:', watchOptions);
      
      // Start watching position
      this.watchId = await Geolocation.watchPosition(watchOptions, (position) => {
        if (!position) return;
        
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: position.timestamp
        };
        
        // Cache the location
        this.lastLocation = location;
        this.saveLastLocation(location);
        
        // Notify callbacks
        this.notifyLocationUpdate(location);
      });
      
      this.isTracking = true;
      return true;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      this.notifyError(error);
      return false;
    }
  }
  
  /**
   * Stop tracking location
   */
  public async stopTracking(): Promise<void> {
    try {
      if (this.watchId) {
        await Geolocation.clearWatch({ id: this.watchId });
        this.watchId = null;
        this.isTracking = false;
        console.log('Location tracking stopped');
      }
    } catch (error) {
      console.error('Error stopping location tracking:', error);
      this.notifyError(error);
    }
  }
  
  /**
   * Get current location once
   */
  public async getCurrentLocation(options: LocationOptions = {}): Promise<{ latitude: number; longitude: number }> {
    try {
      // Check permissions first
      const status = await locationPermissionService.checkPermissions();
      if (status.location !== 'granted') {
        await locationPermissionService.requestPermissions();
      }
      
      // Default options
      const locationOptions: LocationOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
        ...options
      };
      
      const position = await Geolocation.getCurrentPosition(locationOptions);
      
      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      
      // Update last location
      this.lastLocation = {
        ...location,
        timestamp: position.timestamp
      };
      
      // Save to storage
      this.saveLastLocation(this.lastLocation);
      
      return location;
    } catch (error) {
      console.error('Error getting current location:', error);
      this.notifyError(error);
      throw error;
    }
  }
  
  /**
   * Get last known location
   */
  public getLastLocation(): { latitude: number; longitude: number } | null {
    if (!this.lastLocation) return null;
    
    return {
      latitude: this.lastLocation.latitude,
      longitude: this.lastLocation.longitude
    };
  }
  
  /**
   * Add location update listener
   */
  public addLocationListener(callback: (location: { latitude: number; longitude: number }) => void): void {
    this.callbacks.add(callback);
    
    // If we have a cached location, notify immediately
    if (this.lastLocation) {
      callback({
        latitude: this.lastLocation.latitude,
        longitude: this.lastLocation.longitude
      });
    }
  }
  
  /**
   * Remove location update listener
   */
  public removeLocationListener(callback: (location: { latitude: number; longitude: number }) => void): void {
    this.callbacks.delete(callback);
  }
  
  /**
   * Add error listener
   */
  public addErrorListener(callback: (error: any) => void): void {
    this.errorCallbacks.add(callback);
  }
  
  /**
   * Remove error listener
   */
  public removeErrorListener(callback: (error: any) => void): void {
    this.errorCallbacks.delete(callback);
  }
  
  /**
   * Check if tracking is active
   */
  public isTrackingActive(): boolean {
    return this.isTracking;
  }
  
  /**
   * Save last location to storage
   */
  private async saveLastLocation(location: { latitude: number; longitude: number; timestamp: number }): Promise<void> {
    try {
      await Preferences.set({
        key: this.LAST_LOCATION_KEY,
        value: JSON.stringify(location)
      });
    } catch (error) {
      console.error('Error saving location to storage:', error);
    }
  }
  
  /**
   * Load last location from storage
   */
  private async loadLastLocation(): Promise<void> {
    try {
      const { value } = await Preferences.get({ key: this.LAST_LOCATION_KEY });
      if (value) {
        this.lastLocation = JSON.parse(value);
        console.log('Loaded last location from storage:', this.lastLocation);
      }
    } catch (error) {
      console.error('Error loading location from storage:', error);
    }
  }
  
  /**
   * Notify all registered callbacks about location update
   */
  private notifyLocationUpdate(location: { latitude: number; longitude: number; timestamp: number }): void {
    const locationData = {
      latitude: location.latitude,
      longitude: location.longitude
    };
    
    this.callbacks.forEach(callback => {
      try {
        callback(locationData);
      } catch (error) {
        console.error('Error in location callback:', error);
      }
    });
  }
  
  /**
   * Notify all registered error callbacks
   */
  private notifyError(error: any): void {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (callbackError) {
        console.error('Error in error callback:', callbackError);
      }
    });
  }
  
  /**
   * Clear storage (for development/testing)
   */
  public async clearStorage(): Promise<void> {
    try {
      await Preferences.remove({ key: this.LAST_LOCATION_KEY });
      this.lastLocation = null;
      console.log('Location storage cleared');
    } catch (error) {
      console.error('Error clearing location storage:', error);
    }
  }
}

// Export singleton instance
export const locationService = LocationService.getInstance();
