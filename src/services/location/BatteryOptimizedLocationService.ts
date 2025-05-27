
import { supabase } from '@/integrations/supabase/client';

export interface LocationUpdate {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  battery_level?: number;
  is_moving: boolean;
  location_source: 'gps' | 'network' | 'passive';
}

export interface BatteryOptimizationConfig {
  highAccuracyInterval: number;
  mediumAccuracyInterval: number;
  lowAccuracyInterval: number;
  batteryThreshold: {
    high: number; // Above this percentage, use high accuracy
    medium: number; // Above this percentage, use medium accuracy
    low: number; // Below this, use low accuracy
  };
  speedThreshold: number; // km/h - if moving faster, increase frequency
  movementThreshold: number; // meters - distance to consider as movement
}

export class BatteryOptimizedLocationService {
  private static instance: BatteryOptimizedLocationService;
  private watchId: number | null = null;
  private isTracking = false;
  private lastLocation: GeolocationPosition | null = null;
  private batteryLevel = 100;
  private config: BatteryOptimizationConfig;
  private currentInterval: number | null = null;
  private deliveryUserId: string | null = null;
  private assignmentId: string | null = null;

  private constructor() {
    this.config = {
      highAccuracyInterval: 5000, // 5 seconds
      mediumAccuracyInterval: 15000, // 15 seconds
      lowAccuracyInterval: 60000, // 1 minute
      batteryThreshold: {
        high: 50,
        medium: 20,
        low: 0
      },
      speedThreshold: 5, // 5 km/h
      movementThreshold: 10 // 10 meters
    };
  }

  static getInstance(): BatteryOptimizedLocationService {
    if (!this.instance) {
      this.instance = new BatteryOptimizedLocationService();
    }
    return this.instance;
  }

  async startTracking(deliveryUserId: string, assignmentId: string): Promise<boolean> {
    if (this.isTracking) {
      return true;
    }

    this.deliveryUserId = deliveryUserId;
    this.assignmentId = assignmentId;

    try {
      // Request location permission
      const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      if (permission.state === 'denied') {
        throw new Error('Location permission denied');
      }

      // Initialize battery monitoring
      await this.initializeBatteryMonitoring();

      // Start location tracking with adaptive intervals
      await this.startAdaptiveTracking();

      this.isTracking = true;
      console.log('Battery optimized location tracking started');
      return true;
    } catch (error) {
      console.error('Failed to start location tracking:', error);
      return false;
    }
  }

  async stopTracking(): Promise<void> {
    if (!this.isTracking) {
      return;
    }

    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    if (this.currentInterval !== null) {
      clearInterval(this.currentInterval);
      this.currentInterval = null;
    }

    this.isTracking = false;
    console.log('Location tracking stopped');
  }

  private async initializeBatteryMonitoring(): Promise<void> {
    try {
      // Modern battery API
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery();
        this.batteryLevel = Math.round(battery.level * 100);
        
        battery.addEventListener('levelchange', () => {
          this.batteryLevel = Math.round(battery.level * 100);
          this.adjustTrackingFrequency();
        });
      }
    } catch (error) {
      console.warn('Battery monitoring not available:', error);
    }
  }

  private async startAdaptiveTracking(): Promise<void> {
    const trackingOptions = this.getOptimalTrackingOptions();
    
    this.watchId = navigator.geolocation.watchPosition(
      (position) => this.handleLocationUpdate(position),
      (error) => this.handleLocationError(error),
      trackingOptions
    );

    // Set up periodic adjustment of tracking frequency
    this.currentInterval = window.setInterval(() => {
      this.adjustTrackingFrequency();
    }, 30000); // Check every 30 seconds
  }

  private getOptimalTrackingOptions(): PositionOptions {
    const interval = this.calculateOptimalInterval();
    
    return {
      enableHighAccuracy: interval <= this.config.mediumAccuracyInterval,
      timeout: Math.min(interval, 30000),
      maximumAge: Math.min(interval / 2, 10000)
    };
  }

  private calculateOptimalInterval(): number {
    // Base interval on battery level
    let interval: number;
    
    if (this.batteryLevel > this.config.batteryThreshold.high) {
      interval = this.config.highAccuracyInterval;
    } else if (this.batteryLevel > this.config.batteryThreshold.medium) {
      interval = this.config.mediumAccuracyInterval;
    } else {
      interval = this.config.lowAccuracyInterval;
    }

    // Adjust based on movement speed
    if (this.lastLocation) {
      const speed = this.lastLocation.coords.speed || 0;
      const speedKmh = speed * 3.6; // Convert m/s to km/h
      
      if (speedKmh > this.config.speedThreshold) {
        interval = Math.max(interval / 2, this.config.highAccuracyInterval);
      }
    }

    return interval;
  }

  private adjustTrackingFrequency(): void {
    if (!this.isTracking) return;

    const newOptions = this.getOptimalTrackingOptions();
    
    // Restart tracking with new options
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
    }
    
    this.watchId = navigator.geolocation.watchPosition(
      (position) => this.handleLocationUpdate(position),
      (error) => this.handleLocationError(error),
      newOptions
    );
  }

  private async handleLocationUpdate(position: GeolocationPosition): Promise<void> {
    try {
      const isMoving = this.detectMovement(position);
      
      const locationUpdate: LocationUpdate = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        speed: position.coords.speed || undefined,
        heading: position.coords.heading || undefined,
        battery_level: this.batteryLevel,
        is_moving: isMoving,
        location_source: position.coords.accuracy < 50 ? 'gps' : 'network'
      };

      // Store location in database
      await this.storeLocationUpdate(locationUpdate);
      
      this.lastLocation = position;
    } catch (error) {
      console.error('Error handling location update:', error);
    }
  }

  private detectMovement(currentPosition: GeolocationPosition): boolean {
    if (!this.lastLocation) return false;

    const distance = this.calculateDistance(
      this.lastLocation.coords.latitude,
      this.lastLocation.coords.longitude,
      currentPosition.coords.latitude,
      currentPosition.coords.longitude
    );

    return distance > this.config.movementThreshold;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private async storeLocationUpdate(update: LocationUpdate): Promise<void> {
    if (!this.deliveryUserId || !this.assignmentId) return;

    try {
      const { error } = await supabase
        .from('delivery_location_updates')
        .insert({
          delivery_user_id: this.deliveryUserId,
          assignment_id: this.assignmentId,
          ...update
        });

      if (error) {
        console.error('Error storing location update:', error);
      }
    } catch (error) {
      console.error('Error storing location update:', error);
    }
  }

  private handleLocationError(error: GeolocationPositionError): void {
    console.error('Location error:', error);
  }

  // Public methods for configuration
  updateConfig(newConfig: Partial<BatteryOptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    if (this.isTracking) {
      this.adjustTrackingFrequency();
    }
  }

  getCurrentBatteryLevel(): number {
    return this.batteryLevel;
  }

  isCurrentlyTracking(): boolean {
    return this.isTracking;
  }

  getLastLocation(): GeolocationPosition | null {
    return this.lastLocation;
  }
}

export const batteryOptimizedLocationService = BatteryOptimizedLocationService.getInstance();
