
import { supabase } from '@/integrations/supabase/client';
import type { 
  DeliveryLocationAccuracySettings, 
  DeliveryLocationQualityLog, 
  LocationValidationResult,
  LocationProvider 
} from '@/types/location-accuracy';

class DeliveryLocationAccuracyService {
  // Location Accuracy Settings Management
  async getLocationAccuracySettings(deliveryUserId: string): Promise<DeliveryLocationAccuracySettings | null> {
    const { data, error } = await supabase
      .from('delivery_location_accuracy_settings')
      .select('*')
      .eq('delivery_user_id', deliveryUserId)
      .single();

    if (error) {
      console.error('Error fetching location accuracy settings:', error);
      throw error;
    }

    return data;
  }

  async updateLocationAccuracySettings(
    deliveryUserId: string, 
    updates: Partial<DeliveryLocationAccuracySettings>
  ): Promise<DeliveryLocationAccuracySettings> {
    const { data, error } = await supabase
      .from('delivery_location_accuracy_settings')
      .upsert({
        delivery_user_id: deliveryUserId,
        ...updates
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating location accuracy settings:', error);
      throw error;
    }

    return data;
  }

  // Location Quality Validation
  async validateLocationQuality(
    deliveryUserId: string,
    latitude: number,
    longitude: number,
    accuracy?: number,
    provider: LocationProvider = 'gps',
    timestamp: string = new Date().toISOString()
  ): Promise<LocationValidationResult> {
    const { data, error } = await supabase
      .rpc('validate_location_quality', {
        p_delivery_user_id: deliveryUserId,
        p_latitude: latitude,
        p_longitude: longitude,
        p_accuracy: accuracy,
        p_provider: provider,
        p_timestamp: timestamp
      });

    if (error) {
      console.error('Error validating location quality:', error);
      throw error;
    }

    return data[0] as LocationValidationResult;
  }

  // Location Quality Logging
  async logLocationQuality(
    deliveryUserId: string,
    locationData: {
      latitude: number;
      longitude: number;
      accuracy?: number;
      timestamp_recorded: string;
      confidence_score?: number;
      accuracy_score?: number;
      recency_score?: number;
      source_score?: number;
      network_score?: number;
      location_provider?: string;
      validation_passed: boolean;
      validation_errors?: string[];
      backup_provider_used?: boolean;
      network_type?: string;
      network_quality?: string;
      battery_level?: number;
      is_moving?: boolean;
    }
  ): Promise<DeliveryLocationQualityLog> {
    const { data, error } = await supabase
      .from('delivery_location_quality_logs')
      .insert({
        delivery_user_id: deliveryUserId,
        ...locationData
      })
      .select()
      .single();

    if (error) {
      console.error('Error logging location quality:', error);
      throw error;
    }

    return data;
  }

  async getLocationQualityHistory(
    deliveryUserId: string,
    limit: number = 50
  ): Promise<DeliveryLocationQualityLog[]> {
    const { data, error } = await supabase
      .from('delivery_location_quality_logs')
      .select('*')
      .eq('delivery_user_id', deliveryUserId)
      .order('timestamp_recorded', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching location quality history:', error);
      throw error;
    }

    return data || [];
  }

  // Location Quality Analytics
  async getLocationQualityStats(
    deliveryUserId: string,
    fromDate?: string,
    toDate?: string
  ): Promise<{
    total_locations: number;
    valid_locations: number;
    invalid_locations: number;
    avg_confidence_score: number;
    avg_accuracy: number;
    backup_provider_usage: number;
    most_common_errors: { error: string; count: number }[];
  }> {
    const query = supabase
      .from('delivery_location_quality_logs')
      .select('*')
      .eq('delivery_user_id', deliveryUserId);

    if (fromDate) {
      query.gte('timestamp_recorded', fromDate);
    }

    if (toDate) {
      query.lte('timestamp_recorded', toDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching location quality stats:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return {
        total_locations: 0,
        valid_locations: 0,
        invalid_locations: 0,
        avg_confidence_score: 0,
        avg_accuracy: 0,
        backup_provider_usage: 0,
        most_common_errors: []
      };
    }

    const totalLocations = data.length;
    const validLocations = data.filter(log => log.validation_passed).length;
    const invalidLocations = totalLocations - validLocations;
    
    const avgConfidenceScore = data
      .filter(log => log.confidence_score !== null)
      .reduce((sum, log) => sum + (log.confidence_score || 0), 0) / 
      Math.max(data.filter(log => log.confidence_score !== null).length, 1);

    const avgAccuracy = data
      .filter(log => log.accuracy !== null)
      .reduce((sum, log) => sum + (log.accuracy || 0), 0) / 
      Math.max(data.filter(log => log.accuracy !== null).length, 1);

    const backupProviderUsage = data.filter(log => log.backup_provider_used).length;

    // Count error frequencies
    const errorCounts: { [key: string]: number } = {};
    data.forEach(log => {
      if (log.validation_errors && log.validation_errors.length > 0) {
        log.validation_errors.forEach(error => {
          errorCounts[error] = (errorCounts[error] || 0) + 1;
        });
      }
    });

    const mostCommonErrors = Object.entries(errorCounts)
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      total_locations: totalLocations,
      valid_locations: validLocations,
      invalid_locations: invalidLocations,
      avg_confidence_score: Math.round(avgConfidenceScore * 100) / 100,
      avg_accuracy: Math.round(avgAccuracy * 100) / 100,
      backup_provider_usage: backupProviderUsage,
      most_common_errors: mostCommonErrors
    };
  }

  // Configuration Helpers
  async updateAccuracyThreshold(deliveryUserId: string, threshold: number): Promise<void> {
    await this.updateLocationAccuracySettings(deliveryUserId, {
      minimum_accuracy_threshold: threshold
    });
  }

  async updateConfidenceThreshold(deliveryUserId: string, threshold: number): Promise<void> {
    await this.updateLocationAccuracySettings(deliveryUserId, {
      minimum_confidence_score: threshold
    });
  }

  async setLocationProviders(
    deliveryUserId: string, 
    primary: LocationProvider, 
    fallback: LocationProvider
  ): Promise<void> {
    await this.updateLocationAccuracySettings(deliveryUserId, {
      primary_provider: primary,
      fallback_provider: fallback
    });
  }

  async toggleStrictEnforcement(deliveryUserId: string, enabled: boolean): Promise<void> {
    await this.updateLocationAccuracySettings(deliveryUserId, {
      strict_accuracy_enforcement: enabled
    });
  }
}

export const deliveryLocationAccuracyService = new DeliveryLocationAccuracyService();
