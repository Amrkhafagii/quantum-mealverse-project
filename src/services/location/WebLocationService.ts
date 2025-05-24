
import { LocationTrackingOptions } from './LocationService';
import { BaseLocationService } from './BaseLocationService';
import { DeliveryLocation } from '@/types/location';
import { getBrowserLocation, watchBrowserLocation } from '@/utils/webGeolocation';

export class WebLocationService extends BaseLocationService {
  private _watchId: number | null = null;
  private _clearWatchFn: (() => void) | null = null;
  
  async getCurrentLocation(): Promise<DeliveryLocation | null> {
    try {
      // Check permissions first
      const status = await this.getPermissionStatus();
      if (status !== 'granted') {
        await this.requestPermission();
      }
      
      const location = await getBrowserLocation();
      if (location) {
        const deliveryLocation: DeliveryLocation = {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy || 0, // Ensure accuracy is not undefined
          altitude: location.altitude || null,
          altitudeAccuracy: location.altitudeAccuracy || null,
          heading: location.heading || null,
          speed: location.speed || undefined,
          timestamp: location.timestamp,
          source: 'gps' as const // Ensure correct type
        };
        
        this.updateLocation(deliveryLocation);
        return deliveryLocation;
      }
      return null;
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }
  
  async startTracking(options: LocationTrackingOptions = {}): Promise<boolean> {
    if (this._isTracking) {
      return true;
    }
    
    try {
      // Check permissions first
      const status = await this.getPermissionStatus();
      if (status !== 'granted') {
        const newStatus = await this.requestPermission();
        if (newStatus !== 'granted') {
          return false;
        }
      }
      
      // Get initial location
      await this.getCurrentLocation();
      
      // Start watching location
      this._clearWatchFn = watchBrowserLocation(
        (location) => {
          if (location) {
            const deliveryLocation: DeliveryLocation = {
              latitude: location.latitude,
              longitude: location.longitude,
              accuracy: location.accuracy || 0, // Ensure accuracy is not undefined
              altitude: location.altitude || null,
              altitudeAccuracy: location.altitudeAccuracy || null,
              heading: location.heading || null,
              speed: location.speed || undefined,
              timestamp: location.timestamp,
              source: 'gps' as const // Ensure correct type
            };
            
            this.updateLocation(deliveryLocation);
          }
        },
        (error) => console.error('Error watching location:', error)
      );
      
      this._isTracking = true;
      return true;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      return false;
    }
  }
  
  async stopTracking(): Promise<void> {
    if (this._clearWatchFn) {
      this._clearWatchFn();
      this._clearWatchFn = null;
    }
    
    this._isTracking = false;
  }
}
