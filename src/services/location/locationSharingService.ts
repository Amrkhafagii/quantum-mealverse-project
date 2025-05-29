
import { supabase } from '@/integrations/supabase/client';
import { LocationSharingPermission } from '@/types/location-sharing';

export class LocationSharingService {
  // Get location sharing permissions for a delivery assignment
  async getLocationSharingPermission(
    deliveryAssignmentId: string,
    customerUserId: string
  ): Promise<LocationSharingPermission | null> {
    try {
      const { data, error } = await supabase
        .from('location_sharing_permissions')
        .select('*')
        .eq('delivery_assignment_id', deliveryAssignmentId)
        .eq('customer_user_id', customerUserId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Error getting location sharing permission:', error);
      return null;
    }
  }

  // Update location sharing settings
  async updateLocationSharingSettings(
    deliveryAssignmentId: string,
    customerUserId: string,
    settings: {
      is_location_sharing_enabled?: boolean;
      privacy_level?: 'precise' | 'approximate' | 'disabled';
      sharing_expires_at?: string;
    }
  ): Promise<LocationSharingPermission | null> {
    try {
      const { data, error } = await supabase
        .from('location_sharing_permissions')
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq('delivery_assignment_id', deliveryAssignmentId)
        .eq('customer_user_id', customerUserId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating location sharing settings:', error);
      return null;
    }
  }

  // Check if location sharing is enabled and not expired
  async isLocationSharingEnabled(
    deliveryAssignmentId: string,
    customerUserId: string
  ): Promise<boolean> {
    try {
      const permission = await this.getLocationSharingPermission(
        deliveryAssignmentId,
        customerUserId
      );

      if (!permission || !permission.is_location_sharing_enabled) {
        return false;
      }

      if (permission.privacy_level === 'disabled') {
        return false;
      }

      // Check if sharing has expired
      if (permission.sharing_expires_at) {
        const expiryTime = new Date(permission.sharing_expires_at);
        const now = new Date();
        if (now > expiryTime) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error checking location sharing status:', error);
      return false;
    }
  }

  // Get privacy level for location sharing
  async getPrivacyLevel(
    deliveryAssignmentId: string,
    customerUserId: string
  ): Promise<'precise' | 'approximate' | 'disabled'> {
    try {
      const permission = await this.getLocationSharingPermission(
        deliveryAssignmentId,
        customerUserId
      );

      return permission?.privacy_level || 'disabled';
    } catch (error) {
      console.error('Error getting privacy level:', error);
      return 'disabled';
    }
  }

  // Extend sharing expiry time
  async extendSharingTime(
    deliveryAssignmentId: string,
    customerUserId: string,
    additionalHours: number = 2
  ): Promise<boolean> {
    try {
      const newExpiryTime = new Date();
      newExpiryTime.setHours(newExpiryTime.getHours() + additionalHours);

      const { error } = await supabase
        .from('location_sharing_permissions')
        .update({
          sharing_expires_at: newExpiryTime.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('delivery_assignment_id', deliveryAssignmentId)
        .eq('customer_user_id', customerUserId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error extending sharing time:', error);
      return false;
    }
  }
}

export const locationSharingService = new LocationSharingService();
