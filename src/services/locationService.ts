
import { supabase } from '@/lib/supabase';
import { UnifiedLocation } from '@/types/unifiedLocation';

export interface LocationServiceResult {
  success: boolean;
  data?: any;
  error?: string;
}

export const locationService = {
  // Store a new location entry
  async storeLocation(location: Partial<UnifiedLocation>): Promise<LocationServiceResult> {
    try {
      const locationData = {
        latitude: location.latitude!,
        longitude: location.longitude!,
        accuracy: location.accuracy,
        altitude: location.altitude,
        altitude_accuracy: location.altitudeAccuracy,
        heading: location.heading,
        speed: location.speed,
        timestamp: location.timestamp || new Date().toISOString(),
        source: location.source || 'unknown',
        location_type: location.location_type || 'user',
        user_id: location.user_id,
        order_id: location.orderId,
        delivery_assignment_id: location.deliveryAssignmentId,
        restaurant_id: location.restaurantId,
        device_info: location.device_info,
        is_moving: location.isMoving,
        battery_level: location.battery_level,
        is_anonymized: location.is_anonymized || false,
        user_consent: true,
        retention_expires_at: location.user_id ? 
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : // 30 days for users
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()    // 7 days for anonymous
      };

      const { data, error } = await supabase
        .from('unified_locations')
        .insert([locationData])
        .select()
        .single();

      if (error) {
        console.error('Error storing location:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Error in storeLocation:', error);
      return { success: false, error: error.message };
    }
  },

  // Get locations for a specific user
  async getUserLocations(userId: string, limit: number = 100): Promise<LocationServiceResult> {
    try {
      const { data, error } = await supabase
        .from('unified_locations')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching user locations:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error: any) {
      console.error('Error in getUserLocations:', error);
      return { success: false, error: error.message };
    }
  },

  // Get the most recent location for a user
  async getLastKnownLocation(userId: string): Promise<LocationServiceResult> {
    try {
      const { data, error } = await supabase
        .from('unified_locations')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching last known location:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || null };
    } catch (error: any) {
      console.error('Error in getLastKnownLocation:', error);
      return { success: false, error: error.message };
    }
  },

  // Get locations within a specific time range
  async getLocationsByTimeRange(
    startTime: string, 
    endTime: string, 
    userId?: string
  ): Promise<LocationServiceResult> {
    try {
      let query = supabase
        .from('unified_locations')
        .select('*')
        .gte('timestamp', startTime)
        .lte('timestamp', endTime)
        .order('timestamp', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching locations by time range:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error: any) {
      console.error('Error in getLocationsByTimeRange:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete locations older than specified days for privacy compliance
  async cleanupOldLocations(retentionDays: number = 30): Promise<LocationServiceResult> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const { error } = await supabase
        .from('unified_locations')
        .delete()
        .lt('retention_expires_at', cutoffDate.toISOString());

      if (error) {
        console.error('Error cleaning up old locations:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error in cleanupOldLocations:', error);
      return { success: false, error: error.message };
    }
  },

  // Get location statistics
  async getLocationStats(userId?: string): Promise<LocationServiceResult> {
    try {
      let query = supabase
        .from('unified_locations')
        .select('source, accuracy, timestamp');

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching location stats:', error);
        return { success: false, error: error.message };
      }

      const locations = data || [];
      const stats = {
        total_locations: locations.length,
        sources: locations.reduce((acc, loc) => {
          acc[loc.source] = (acc[loc.source] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        average_accuracy: locations.length > 0 
          ? locations.reduce((sum, loc) => sum + (loc.accuracy || 0), 0) / locations.length 
          : 0,
        date_range: locations.length > 0 
          ? {
              earliest: Math.min(...locations.map(loc => new Date(loc.timestamp).getTime())),
              latest: Math.max(...locations.map(loc => new Date(loc.timestamp).getTime()))
            }
          : null
      };

      return { success: true, data: stats };
    } catch (error: any) {
      console.error('Error in getLocationStats:', error);
      return { success: false, error: error.message };
    }
  }
};

export default locationService;
