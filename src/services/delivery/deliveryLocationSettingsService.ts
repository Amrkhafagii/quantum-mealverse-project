
import { supabase } from '@/integrations/supabase/client';
import type { DeliveryLocationSettings, DeliveryLocationSettingsUpdate } from '@/types/delivery-location-settings';

class DeliveryLocationSettingsService {
  async getLocationSettings(deliveryUserId: string): Promise<DeliveryLocationSettings | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_or_create_delivery_location_settings', {
          p_delivery_user_id: deliveryUserId
        });

      if (error) {
        console.error('Error fetching location settings:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getLocationSettings:', error);
      return null;
    }
  }

  async updateLocationSettings(
    deliveryUserId: string, 
    settings: DeliveryLocationSettingsUpdate
  ): Promise<DeliveryLocationSettings | null> {
    try {
      const { data, error } = await supabase
        .from('delivery_location_settings')
        .update(settings)
        .eq('delivery_user_id', deliveryUserId)
        .select()
        .single();

      if (error) {
        console.error('Error updating location settings:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateLocationSettings:', error);
      return null;
    }
  }

  async updateAccuracyThresholds(
    deliveryUserId: string,
    thresholds: {
      high_accuracy_threshold?: number;
      medium_accuracy_threshold?: number;
      low_accuracy_threshold?: number;
    }
  ): Promise<DeliveryLocationSettings | null> {
    return this.updateLocationSettings(deliveryUserId, thresholds);
  }

  async updateTrackingIntervals(
    deliveryUserId: string,
    intervals: {
      high_accuracy_interval?: number;
      medium_accuracy_interval?: number;
      low_accuracy_interval?: number;
    }
  ): Promise<DeliveryLocationSettings | null> {
    return this.updateLocationSettings(deliveryUserId, intervals);
  }

  async updateGeofencingSettings(
    deliveryUserId: string,
    settings: {
      delivery_zone_radius?: number;
      geofence_entry_notifications?: boolean;
      geofence_exit_notifications?: boolean;
      custom_geofence_zones?: any[];
    }
  ): Promise<DeliveryLocationSettings | null> {
    return this.updateLocationSettings(deliveryUserId, settings);
  }

  async updateSharingSettings(
    deliveryUserId: string,
    settings: {
      location_sharing_duration?: number;
      auto_stop_sharing_after_delivery?: boolean;
      sharing_precision_level?: 'high' | 'medium' | 'low';
    }
  ): Promise<DeliveryLocationSettings | null> {
    return this.updateLocationSettings(deliveryUserId, settings);
  }
}

export const deliveryLocationSettingsService = new DeliveryLocationSettingsService();
