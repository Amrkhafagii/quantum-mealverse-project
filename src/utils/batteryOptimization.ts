
import { Device } from '@capacitor/device';

/**
 * Utility for battery-aware operations
 */
export class BatteryOptimization {
  // Battery thresholds
  static LOW_BATTERY_THRESHOLD = 0.15; // 15%
  static CRITICAL_BATTERY_THRESHOLD = 0.05; // 5%
  
  /**
   * Get current device battery level
   */
  static async getBatteryLevel(): Promise<number> {
    try {
      const batteryInfo = await Device.getBatteryInfo();
      return batteryInfo.batteryLevel;
    } catch (err) {
      console.error('Error getting battery level:', err);
      return 1.0; // Default to 100% if unable to determine
    }
  }
  
  /**
   * Check if device is in low power mode
   */
  static async isLowPowerModeEnabled(): Promise<boolean> {
    try {
      const powerInfo = await Device.getBatteryInfo();
      return powerInfo.isLowPowerMode || false;
    } catch (err) {
      console.error('Error checking low power mode:', err);
      return false;
    }
  }
  
  /**
   * Determine if the device is in a low battery state
   */
  static async isLowBatteryState(): Promise<boolean> {
    const level = await this.getBatteryLevel();
    return level <= this.LOW_BATTERY_THRESHOLD;
  }
  
  /**
   * Determine if the battery is critically low
   */
  static async isCriticalBatteryState(): Promise<boolean> {
    const level = await this.getBatteryLevel();
    return level <= this.CRITICAL_BATTERY_THRESHOLD;
  }
  
  /**
   * Calculate optimal location update interval based on battery state
   * @param baseDuration Base interval in milliseconds
   * @param isMoving Whether the device is in motion
   * @param distanceToDestination Distance to destination in km (if applicable)
   */
  static async getOptimalUpdateInterval(
    baseDuration: number = 30000,
    isMoving: boolean = true,
    distanceToDestination?: number
  ): Promise<number> {
    const batteryLevel = await this.getBatteryLevel();
    const isLowPower = await this.isLowPowerModeEnabled();
    
    let modifier = 1.0;
    
    // Battery level adjustments
    if (batteryLevel <= this.CRITICAL_BATTERY_THRESHOLD) {
      modifier *= 4; // Drastically reduce frequency at critical battery
    } else if (batteryLevel <= this.LOW_BATTERY_THRESHOLD) {
      modifier *= 2.5; // Significantly reduce frequency at low battery
    } else if (batteryLevel <= 0.3) {
      modifier *= 1.5; // Moderately reduce frequency at 30% battery
    }
    
    // Movement-based adjustments
    if (!isMoving) {
      modifier *= 3; // Reduce frequency when stationary
    }
    
    // Low power mode adjustments
    if (isLowPower) {
      modifier *= 2; // Reduce frequency in low power mode
    }
    
    // Distance-based adjustments (if applicable)
    if (distanceToDestination !== undefined) {
      if (distanceToDestination < 0.5) {
        // Within 500m of destination, increase frequency
        modifier *= 0.5;
      } else if (distanceToDestination < 2) {
        // Within 2km, slightly increase frequency
        modifier *= 0.8;
      } else if (distanceToDestination > 10) {
        // Far from destination, reduce frequency
        modifier *= 1.5;
      }
    }
    
    return Math.round(baseDuration * modifier);
  }
  
  /**
   * Get optimal distance filter based on battery state and movement
   * Returns distance in meters
   */
  static async getOptimalDistanceFilter(
    isMoving: boolean = true,
    speedKmh: number = 0
  ): Promise<number> {
    const batteryLevel = await this.getBatteryLevel();
    const isLowPower = await this.isLowPowerModeEnabled();
    
    // Base distance filter
    let baseFilter = 10; // 10 meters
    
    // Adjust based on battery level
    if (batteryLevel <= this.CRITICAL_BATTERY_THRESHOLD) {
      baseFilter = 50; // 50 meters at critical battery
    } else if (batteryLevel <= this.LOW_BATTERY_THRESHOLD) {
      baseFilter = 30; // 30 meters at low battery
    } else if (batteryLevel <= 0.3) {
      baseFilter = 20; // 20 meters at 30% battery
    }
    
    // Adjust based on movement
    if (!isMoving) {
      baseFilter *= 3; // Larger filter when stationary
    } else if (speedKmh > 50) {
      baseFilter *= 5; // Much larger filter at high speeds
    } else if (speedKmh > 20) {
      baseFilter *= 2; // Larger filter at moderate speeds
    }
    
    // Adjust for low power mode
    if (isLowPower) {
      baseFilter *= 1.5;
    }
    
    return baseFilter;
  }
  
  /**
   * Determine the optimal location accuracy priority based on battery state
   * Returns a priority string that can be mapped to platform-specific values
   */
  static async getLocationPriority(
    distanceToDestination?: number
  ): Promise<'high' | 'balanced' | 'low' | 'passive'> {
    const batteryLevel = await this.getBatteryLevel();
    const isLowPower = await this.isLowPowerModeEnabled();
    
    // Near destination, we need more accuracy regardless of battery
    if (distanceToDestination !== undefined && distanceToDestination < 0.3) {
      return 'high';
    }
    
    if (await this.isCriticalBatteryState()) {
      return 'passive';
    }
    
    if (await this.isLowBatteryState() || isLowPower) {
      return 'low';
    }
    
    return 'balanced';
  }
}
