
import { Device } from '@capacitor/device';

// Battery state interface
export interface BatteryState {
  isLow: boolean;
  level: number;
  isCharging: boolean;
}

export interface OptimizationSettings {
  movementThreshold: number;
  updateIntervalNormal: number; // milliseconds
  updateIntervalLow: number; // milliseconds
  proximityThreshold: number; // meters
  proximityUpdateFrequency: number; // milliseconds
  batchUploadThreshold: number; // count of locations before upload
  batchTimeThreshold: number; // milliseconds
}

export class BatteryOptimization {
  private batteryState: BatteryState = {
    isLow: false,
    level: 100,
    isCharging: false
  };

  private settings: OptimizationSettings = {
    movementThreshold: 10, // meters
    updateIntervalNormal: 10000, // 10 seconds
    updateIntervalLow: 30000, // 30 seconds
    proximityThreshold: 100, // meters
    proximityUpdateFrequency: 5000, // 5 seconds
    batchUploadThreshold: 5, // locations
    batchTimeThreshold: 60000 // 1 minute
  };

  constructor(customSettings?: Partial<OptimizationSettings>) {
    if (customSettings) {
      this.settings = { ...this.settings, ...customSettings };
    }
    this.initBatteryMonitoring();
  }

  private async initBatteryMonitoring() {
    try {
      const info = await Device.getBatteryInfo();
      this.batteryState = {
        level: info.batteryLevel * 100,
        isCharging: info.isCharging,
        isLow: info.batteryLevel < 0.2
      };
      
      // Set up battery monitoring
      window.addEventListener('batterystatus', this.handleBatteryChange);
    } catch (error) {
      console.error('Error initializing battery monitoring:', error);
    }
  }

  private handleBatteryChange = (event: any) => {
    // This handler would work with the actual Capacitor/Cordova battery events
    this.batteryState = {
      level: event.level,
      isCharging: event.isPlugged,
      isLow: event.level < 20
    };
  }

  public getUpdateInterval(): number {
    if (this.batteryState.isLow && !this.batteryState.isCharging) {
      return this.settings.updateIntervalLow;
    }
    return this.settings.updateIntervalNormal;
  }

  public getMovementThreshold(): number {
    if (this.batteryState.isLow && !this.batteryState.isCharging) {
      return this.settings.movementThreshold * 2;  // Double the movement threshold when battery is low
    }
    return this.settings.movementThreshold;
  }

  public shouldBatchUpdates(): boolean {
    return this.batteryState.isLow && !this.batteryState.isCharging;
  }
  
  public getBatchSettings() {
    return {
      count: this.settings.batchUploadThreshold,
      timeThreshold: this.settings.batchTimeThreshold
    };
  }
  
  public getProximitySettings() {
    return {
      threshold: this.settings.proximityThreshold,
      updateFrequency: this.settings.proximityUpdateFrequency
    };
  }
  
  public getBatteryState(): BatteryState {
    return {...this.batteryState};
  }

  // Static methods for battery optimization 
  static async getBatteryLevel(): Promise<number> {
    try {
      const info = await Device.getBatteryInfo();
      return info.batteryLevel * 100;
    } catch (error) {
      console.error('Error getting battery level:', error);
      return 100; // Default to 100% if unable to get actual level
    }
  }

  static async isLowPowerModeEnabled(): Promise<boolean> {
    // This is a placeholder since Capacitor doesn't directly expose low power mode
    try {
      const info = await Device.getBatteryInfo();
      // If battery is low and not charging, assume low power mode might be on
      return info.batteryLevel < 0.2 && !info.isCharging;
    } catch (error) {
      console.error('Error checking low power mode:', error);
      return false;
    }
  }

  static async getOptimalUpdateInterval(): Promise<number> {
    try {
      const info = await Device.getBatteryInfo();
      return info.batteryLevel < 0.2 ? 30000 : 10000; // 30 seconds if battery low, 10 seconds otherwise
    } catch (error) {
      console.error('Error getting optimal update interval:', error);
      return 10000; // Default to 10 seconds
    }
  }

  static async isLowBatteryState(): Promise<boolean> {
    try {
      const info = await Device.getBatteryInfo();
      return info.batteryLevel < 0.2;
    } catch (error) {
      console.error('Error checking battery state:', error);
      return false;
    }
  }
  
  static async getOptimalDistanceFilter(isMoving: boolean, speedKmh: number = 0): Promise<number> {
    // Calculate optimal distance filter based on movement and speed
    if (!isMoving) return 50; // Higher threshold when stationary
    
    // Adjust threshold based on speed
    if (speedKmh > 50) return 100; // Highway speeds
    if (speedKmh > 20) return 50; // Urban driving
    return 20; // Walking/slow movement
  }
  
  static async getLocationPriority(distanceToDestination?: number): Promise<'high' | 'balanced' | 'low' | 'passive'> {
    // Determine priority based on distance to destination
    if (!distanceToDestination) return 'balanced';
    
    if (distanceToDestination < 500) return 'high'; // Close to destination, need high accuracy
    if (distanceToDestination < 3000) return 'balanced'; // Within a few km
    return 'low'; // Far away, low power is acceptable
  }
  
  static async getOptimalUpdateInterval(
    baseInterval: number,
    isMoving: boolean,
    distanceToDestination?: number
  ): Promise<number> {
    // Get battery and power mode status
    const batteryLevel = await BatteryOptimization.getBatteryLevel();
    const isLowPowerMode = await BatteryOptimization.isLowPowerModeEnabled();
    
    // Base adjustments
    let interval = baseInterval;
    
    // Adjust for battery level
    if (batteryLevel < 20) {
      interval *= 2; // Double interval when battery is low
    }
    
    // Adjust for power mode
    if (isLowPowerMode) {
      interval *= 1.5; // Increase interval in low power mode
    }
    
    // Adjust for movement state
    if (!isMoving) {
      interval *= 3; // Much less frequent updates when stationary
    }
    
    // Adjust for proximity to destination
    if (distanceToDestination) {
      if (distanceToDestination < 500) {
        interval = Math.min(interval, 5000); // More frequent when close to destination
      } else if (distanceToDestination > 5000) {
        interval *= 1.5; // Less frequent when far away
      }
    }
    
    // Ensure minimum and maximum bounds
    return Math.max(5000, Math.min(interval, 60000));
  }
}
