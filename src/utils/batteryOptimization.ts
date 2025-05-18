
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
}
