
import { supabase } from '@/integrations/supabase/client';
import { LocationHistoryEntry, LocationQueryParams } from '@/types/unifiedLocation';
import { toast } from 'sonner';

/**
 * Fetch a user's location history
 */
export const fetchLocationHistory = async (
  userId: string,
  params: Partial<LocationQueryParams> = {}
): Promise<LocationHistoryEntry[]> => {
  try {
    const { startDate, endDate, limit = 50, includeExpired = false } = params;
    
    let query = supabase
      .from('unified_locations')
      .select('*')
      .eq('user_id', userId)
      .eq('location_type', 'user')
      .order('timestamp', { ascending: false });
    
    // Apply date filters if provided
    if (startDate) {
      query = query.gte('timestamp', startDate);
    }
    
    if (endDate) {
      query = query.lte('timestamp', endDate);
    }
    
    // Exclude expired locations unless explicitly requested
    if (!includeExpired) {
      const now = new Date().toISOString();
      query = query.or(`retention_expires_at.gt.${now},retention_expires_at.is.null`);
    }
    
    // Apply limit
    query = query.limit(limit);
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching location history:', error);
      throw error;
    }
    
    return data as unknown as LocationHistoryEntry[];
  } catch (error) {
    console.error('Error in fetchLocationHistory:', error);
    return [];
  }
};

/**
 * Export a user's location history
 */
export const exportLocationHistory = async (
  userId: string,
  format: 'json' | 'csv' = 'json', 
  startDate?: string,
  endDate?: string
): Promise<Blob> => {
  try {
    const locations = await fetchLocationHistory(userId, { 
      startDate,
      endDate,
      includeExpired: true,
      limit: 1000 // Higher limit for exports
    });
    
    let content: string;
    let mimeType: string;
    
    if (format === 'csv') {
      content = convertToCSV(locations);
      mimeType = 'text/csv';
    } else {
      content = JSON.stringify(locations, null, 2);
      mimeType = 'application/json';
    }
    
    return new Blob([content], { type: mimeType });
  } catch (error) {
    console.error('Error exporting location history:', error);
    toast.error('Failed to export location history');
    throw error;
  }
};

/**
 * Delete a user's location history
 */
export const deleteLocationHistory = async (
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<{ success: boolean, count: number }> => {
  try {
    let query = supabase
      .from('unified_locations')
      .delete()
      .eq('user_id', userId)
      .eq('location_type', 'user');
    
    // Apply date filters if provided
    if (startDate) {
      query = query.gte('timestamp', startDate);
    }
    
    if (endDate) {
      query = query.lte('timestamp', endDate);
    }
    
    // Get count before deletion
    const { count } = await supabase
      .from('unified_locations')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('location_type', 'user')
      .gte(startDate ? 'timestamp' : 'id', startDate || '')
      .lte(endDate ? 'timestamp' : 'id', endDate || '');
    
    // Execute deletion
    const { error } = await query;
    
    if (error) {
      console.error('Error deleting location history:', error);
      throw error;
    }
    
    return { success: true, count: count || 0 };
  } catch (error) {
    console.error('Error in deleteLocationHistory:', error);
    return { success: false, count: 0 };
  }
};

/**
 * Convert location data to CSV format
 */
const convertToCSV = (locations: LocationHistoryEntry[]): string => {
  if (locations.length === 0) return '';
  
  // Define headers
  const headers = [
    'timestamp',
    'latitude',
    'longitude',
    'accuracy',
    'speed',
    'source',
    'address',
    'place_name',
    'activity'
  ];
  
  // Create CSV content
  const csvRows = [];
  csvRows.push(headers.join(','));
  
  for (const location of locations) {
    const row = [
      location.timestamp,
      location.latitude,
      location.longitude,
      location.accuracy || '',
      location.speed || '',
      location.source,
      location.address?.replace(/,/g, ';') || '',
      location.place_name?.replace(/,/g, ';') || '',
      location.activity?.replace(/,/g, ';') || ''
    ];
    
    csvRows.push(row.join(','));
  }
  
  return csvRows.join('\n');
};

/**
 * Get location statistics for a user
 */
export const getLocationStats = async (userId: string): Promise<{
  totalLocations: number;
  firstLocation: string | null;
  lastLocation: string | null;
  uniqueDevices: number;
}> => {
  try {
    // Total locations
    const { count } = await supabase
      .from('unified_locations')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('location_type', 'user');
    
    // First location
    const { data: firstLocationData } = await supabase
      .from('unified_locations')
      .select('timestamp')
      .eq('user_id', userId)
      .eq('location_type', 'user')
      .order('timestamp', { ascending: true })
      .limit(1)
      .single();
    
    // Last location
    const { data: lastLocationData } = await supabase
      .from('unified_locations')
      .select('timestamp')
      .eq('user_id', userId)
      .eq('location_type', 'user')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();
    
    // Unique devices
    const { data: devicesData } = await supabase
      .from('unified_locations')
      .select('device_info')
      .eq('user_id', userId)
      .eq('location_type', 'user')
      .not('device_info', 'is', null);
    
    const uniqueDevices = new Set();
    if (devicesData) {
      devicesData.forEach(item => {
        // Need to check if device_info exists and has the required properties
        const deviceInfo = item.device_info as any;
        if (deviceInfo && typeof deviceInfo === 'object') {
          // Check if platform and model exist as properties
          const platform = deviceInfo.platform;
          const model = deviceInfo.model;
          
          if (platform && model) {
            uniqueDevices.add(`${platform}:${model}`);
          }
        }
      });
    }
    
    return {
      totalLocations: count || 0,
      firstLocation: firstLocationData?.timestamp || null,
      lastLocation: lastLocationData?.timestamp || null,
      uniqueDevices: uniqueDevices.size
    };
  } catch (error) {
    console.error('Error in getLocationStats:', error);
    return {
      totalLocations: 0,
      firstLocation: null,
      lastLocation: null,
      uniqueDevices: 0
    };
  }
};
