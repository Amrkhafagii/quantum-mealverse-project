
import { supabase } from '@/integrations/supabase/client';
import type { BatteryPerformanceSettings } from '@/types/batteryPerformance';

class BatteryPerformanceService {
  async getBatteryPerformanceSettings(deliveryUserId: string): Promise<BatteryPerformanceSettings | null> {
    try {
      const { data, error } = await supabase
        .from('battery_performance_settings')
        .select('*')
        .eq('delivery_user_id', deliveryUserId)
        .single();

      if (error) {
        console.error('Error fetching battery performance settings:', error);
        return null;
      }

      return data as BatteryPerformanceSettings;
    } catch (error) {
      console.error('Error in getBatteryPerformanceSettings:', error);
      return null;
    }
  }

  async updateBatteryPerformanceSettings(
    deliveryUserId: string,
    updates: Partial<BatteryPerformanceSettings>
  ): Promise<BatteryPerformanceSettings | null> {
    try {
      const { data, error } = await supabase
        .from('battery_performance_settings')
        .upsert({
          delivery_user_id: deliveryUserId,
          ...updates
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating battery performance settings:', error);
        throw error;
      }

      return data as BatteryPerformanceSettings;
    } catch (error) {
      console.error('Error in updateBatteryPerformanceSettings:', error);
      return null;
    }
  }

  async createDefaultSettings(deliveryUserId: string): Promise<BatteryPerformanceSettings | null> {
    try {
      const { data, error } = await supabase
        .from('battery_performance_settings')
        .insert({
          delivery_user_id: deliveryUserId
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating default battery performance settings:', error);
        throw error;
      }

      return data as BatteryPerformanceSettings;
    } catch (error) {
      console.error('Error in createDefaultSettings:', error);
      return null;
    }
  }

  async getCurrentBatteryLevel(): Promise<number> {
    try {
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery();
        return Math.round(battery.level * 100);
      }
      return 100; // Default if battery API not available
    } catch (error) {
      console.error('Error getting battery level:', error);
      return 100;
    }
  }

  async getNetworkQuality(): Promise<'wifi' | 'cellular' | 'poor' | 'offline'> {
    try {
      if (!navigator.onLine) return 'offline';
      
      // Use connection API if available
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection.type === 'wifi') return 'wifi';
        if (connection.effectiveType === '4g') return 'cellular';
        if (connection.effectiveType === '3g' || connection.effectiveType === '2g') return 'poor';
      }
      
      return 'cellular'; // Default assumption
    } catch (error) {
      console.error('Error getting network quality:', error);
      return 'cellular';
    }
  }

  calculateOptimalTrackingInterval(
    settings: BatteryPerformanceSettings,
    batteryLevel: number,
    networkQuality: 'wifi' | 'cellular' | 'poor' | 'offline',
    isMoving: boolean
  ): number {
    let interval: number;

    // Start with tracking mode base interval
    switch (settings.tracking_mode) {
      case 'high':
        interval = settings.high_accuracy_interval;
        break;
      case 'low':
        interval = settings.low_accuracy_interval;
        break;
      case 'adaptive':
        // Use battery thresholds for adaptive mode
        if (batteryLevel >= settings.battery_high_threshold) {
          interval = settings.high_accuracy_interval;
        } else if (batteryLevel >= settings.battery_medium_threshold) {
          interval = settings.medium_accuracy_interval;
        } else {
          interval = settings.low_accuracy_interval;
        }
        break;
      default:
        interval = settings.medium_accuracy_interval;
    }

    // Apply network quality adjustments
    if (settings.network_quality_optimization) {
      switch (networkQuality) {
        case 'wifi':
          interval = Math.min(interval, settings.wifi_preferred_interval);
          break;
        case 'cellular':
          interval = Math.max(interval, settings.cellular_interval);
          break;
        case 'poor':
          interval = Math.max(interval, settings.poor_network_interval);
          break;
        case 'offline':
          interval = settings.offline_mode_interval;
          break;
      }
    }

    // Apply motion detection adjustments
    if (settings.motion_detection_enabled && !isMoving) {
      interval *= 3; // Reduce frequency when stationary
    }

    // Apply battery-specific adjustments
    if (settings.auto_reduce_accuracy_on_low_battery && batteryLevel <= settings.battery_low_threshold) {
      interval *= 2;
    }

    return Math.max(5000, Math.min(interval, 300000)); // Min 5 seconds, max 5 minutes
  }

  getDistanceFilter(
    settings: BatteryPerformanceSettings,
    batteryLevel: number,
    isMoving: boolean
  ): number {
    let filter: number;

    // Base distance filter on tracking mode
    switch (settings.tracking_mode) {
      case 'high':
        filter = settings.distance_filter_high;
        break;
      case 'low':
        filter = settings.distance_filter_low;
        break;
      case 'adaptive':
        if (batteryLevel >= settings.battery_high_threshold) {
          filter = settings.distance_filter_high;
        } else if (batteryLevel >= settings.battery_medium_threshold) {
          filter = settings.distance_filter_medium;
        } else {
          filter = settings.distance_filter_low;
        }
        break;
      default:
        filter = settings.distance_filter_medium;
    }

    // Increase filter when stationary
    if (settings.motion_detection_enabled && !isMoving) {
      filter *= 2;
    }

    return filter;
  }
}

export const batteryPerformanceService = new BatteryPerformanceService();
