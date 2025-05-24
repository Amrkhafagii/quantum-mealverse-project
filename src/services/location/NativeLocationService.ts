
import { LocationTrackingOptions } from './LocationService';
import { BaseLocationService } from './BaseLocationService';
import { DeliveryLocation } from '@/types/location';
import { Geolocation } from '@capacitor/geolocation';

export class NativeLocationService extends BaseLocationService {
  private _watchId: string | null = null;
  
  async getCurrentLocation(): Promise<DeliveryLocation | null> {
    try {
      // Check permissions first
      const status = await this.getPermissionStatus();
      if (status !== 'granted') {
        await this.requestPermission();
      }
      
      // Get current position using Capacitor
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
      
      if (position) {
        const location: DeliveryLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy || 0,
          altitude: position.coords.altitude || null,
          heading: position.coords.heading || null,
          speed: position.coords.speed || undefined,
          timestamp: position.timestamp,
          source: 'gps'
        };
        
        this.updateLocation(location);
        return location;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting native location:', error);
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
      
      // Configure tracking options
      const watchOptions = {
        enableHighAccuracy: options.enableHighAccuracy !== false,
        timeout: 30000, // Default timeout
        maximumAge: 0 // Default maximumAge
      };
      
      // Start watching position
      this._watchId = await Geolocation.watchPosition(
        watchOptions,
        (position) => {
          if (position) {
            const location: DeliveryLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy || 0,
              altitude: position.coords.altitude || null,
              heading: position.coords.heading || null,
              speed: position.coords.speed || undefined,
              timestamp: position.timestamp,
              source: 'gps'
            };
            
            this.updateLocation(location);
          }
        }
      );
      
      this._isTracking = true;
      return true;
    } catch (error) {
      console.error('Error starting native location tracking:', error);
      return false;
    }
  }
  
  async stopTracking(): Promise<void> {
    if (this._watchId) {
      await Geolocation.clearWatch({ id: this._watchId });
      this._watchId = null;
    }
    
    this._isTracking = false;
  }
}
