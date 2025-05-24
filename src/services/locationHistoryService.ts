
import { supabase } from '@/lib/supabase';
import { LocationHistoryEntry } from '@/types/location';
import { UnifiedLocation } from '@/types/unifiedLocation';

export interface LocationQueryParams {
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
  source?: string[];
  minAccuracy?: number;
  userId?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export const locationHistoryService = {
  // Get location history with filters
  async getLocationHistory(params: LocationQueryParams = {}): Promise<LocationHistoryEntry[]> {
    try {
      let query = supabase
        .from('unified_locations')
        .select('*');

      // Apply filters
      if (params.userId) {
        query = query.eq('user_id', params.userId);
      }

      if (params.startDate) {
        query = query.gte('timestamp', params.startDate);
      }

      if (params.endDate) {
        query = query.lte('timestamp', params.endDate);
      }

      if (params.minAccuracy) {
        query = query.gte('accuracy', params.minAccuracy);
      }

      if (params.source && params.source.length > 0) {
        query = query.in('source', params.source);
      }

      // Apply ordering
      const orderBy = params.orderBy || 'timestamp';
      const orderDirection = params.orderDirection || 'desc';
      query = query.order(orderBy, { ascending: orderDirection === 'asc' });

      // Apply pagination
      if (params.limit) {
        query = query.limit(params.limit);
      }

      if (params.offset) {
        query = query.range(params.offset, (params.offset + (params.limit || 50)) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching location history:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getLocationHistory:', error);
      return [];
    }
  },

  // Get location stats
  async getLocationStats(userId?: string): Promise<{
    totalLocations: number;
    uniqueDays: number;
    averageAccuracy: number;
    sources: { [key: string]: number };
  }> {
    try {
      let query = supabase
        .from('unified_locations')
        .select('*');

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const locations = data || [];
      
      // Calculate stats
      const totalLocations = locations.length;
      const uniqueDays = new Set(
        locations.map(loc => new Date(loc.timestamp).toDateString())
      ).size;
      
      const averageAccuracy = locations.reduce((sum, loc) => sum + (loc.accuracy || 0), 0) / totalLocations;
      
      const sources = locations.reduce((acc, loc) => {
        acc[loc.source] = (acc[loc.source] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

      return {
        totalLocations,
        uniqueDays,
        averageAccuracy,
        sources
      };
    } catch (error) {
      console.error('Error getting location stats:', error);
      return {
        totalLocations: 0,
        uniqueDays: 0,
        averageAccuracy: 0,
        sources: {}
      };
    }
  },

  // Store location
  async storeLocation(location: Partial<UnifiedLocation>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('unified_locations')
        .insert([{
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          altitude: location.altitude,
          heading: location.heading,
          speed: location.speed,
          timestamp: location.timestamp || new Date().toISOString(),
          source: location.source || 'unknown',
          user_id: location.user_id,
          location_type: location.location_type || 'user',
          device_info: location.device_info,
          is_moving: location.isMoving,
          battery_level: location.battery_level,
          is_anonymized: location.is_anonymized || false,
          user_consent: location.user_id ? true : false
        }]);

      if (error) {
        console.error('Error storing location:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in storeLocation:', error);
      return false;
    }
  },

  // Get recent locations
  async getRecentLocations(userId?: string, limit: number = 10): Promise<LocationHistoryEntry[]> {
    try {
      let query = supabase
        .from('unified_locations')
        .select('*');

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent locations:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getRecentLocations:', error);
      return [];
    }
  },

  // Get location by ID
  async getLocationById(id: string): Promise<LocationHistoryEntry | null> {
    try {
      const { data, error } = await supabase
        .from('unified_locations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching location by ID:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getLocationById:', error);
      return null;
    }
  },

  // Update location
  async updateLocation(id: string, updates: Partial<UnifiedLocation>): Promise<LocationHistoryEntry | null> {
    try {
      const { data, error } = await supabase
        .from('unified_locations')
        .update(updates)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error updating location:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateLocation:', error);
      return null;
    }
  },

  // Delete old locations (for privacy/retention)
  async deleteOldLocations(olderThanDays: number, userId?: string): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      let query = supabase
        .from('unified_locations')
        .delete()
        .lt('timestamp', cutoffDate.toISOString());

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { error } = await query;

      if (error) {
        console.error('Error deleting old locations:', error);
        return 0;
      }

      return 1; // Supabase doesn't return affected count, so we return 1 for success
    } catch (error) {
      console.error('Error in deleteOldLocations:', error);
      return 0;
    }
  }
};

export default locationHistoryService;
