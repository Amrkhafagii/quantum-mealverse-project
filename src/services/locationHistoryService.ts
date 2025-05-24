
import { supabase } from '@/lib/supabase';
import { UnifiedLocation, LocationSource } from '@/types/unifiedLocation';

export interface LocationHistoryEntry extends UnifiedLocation {
  id: string;
}

export interface LocationQueryParams {
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
  source?: LocationSource[];
  minAccuracy?: number;
  userId?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

/**
 * Fetch location history for a user
 */
export async function fetchLocationHistory(
  userId: string,
  params: LocationQueryParams = {}
): Promise<LocationHistoryEntry[]> {
  try {
    const {
      startDate,
      endDate,
      limit = 50,
      offset = 0,
      source,
      minAccuracy,
      orderBy = 'timestamp',
      orderDirection = 'desc'
    } = params;
    
    let query = supabase
      .from('unified_locations')
      .select('*')
      .eq('user_id', userId)
      .order(orderBy, { ascending: orderDirection === 'asc' })
      .limit(limit)
      .range(offset, offset + limit - 1);
    
    if (startDate) {
      query = query.gte('timestamp', startDate);
    }
    
    if (endDate) {
      query = query.lte('timestamp', endDate);
    }
    
    if (source && source.length > 0) {
      query = query.in('source', source);
    }
    
    if (typeof minAccuracy === 'number') {
      query = query.lte('accuracy', minAccuracy);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching location history:', error);
      throw error;
    }
    
    return data as LocationHistoryEntry[] || [];
  } catch (error) {
    console.error('Error in fetchLocationHistory:', error);
    throw error;
  }
}

/**
 * Export location history as a file
 */
export async function exportLocationHistory(
  userId: string,
  format: 'json' | 'csv' = 'json',
  startDate?: string,
  endDate?: string
): Promise<Blob> {
  try {
    const locations = await fetchLocationHistory(userId, {
      startDate,
      endDate,
      limit: 1000,
      orderDirection: 'asc'
    });
    
    if (format === 'csv') {
      return generateCSV(locations);
    } else {
      return new Blob([JSON.stringify(locations, null, 2)], {
        type: 'application/json'
      });
    }
  } catch (error) {
    console.error('Error exporting location history:', error);
    throw error;
  }
}

/**
 * Generate a CSV file from location history
 */
function generateCSV(locations: LocationHistoryEntry[]): Blob {
  const headers = [
    'id',
    'timestamp',
    'latitude',
    'longitude',
    'accuracy',
    'altitude',
    'source',
    'speed'
  ];
  
  const rows = locations.map(location => [
    location.id || '',
    new Date(location.timestamp).toISOString(),
    location.latitude,
    location.longitude,
    location.accuracy,
    location.altitude,
    location.source,
    location.speed
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  return new Blob([csvContent], { type: 'text/csv' });
}

/**
 * Delete location history
 */
export async function deleteLocationHistory(
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<{ success: boolean, count: number }> {
  try {
    let query = supabase
      .from('unified_locations')
      .delete({ count: 'exact' })
      .eq('user_id', userId);
    
    if (startDate) {
      query = query.gte('timestamp', startDate);
    }
    
    if (endDate) {
      query = query.lte('timestamp', endDate);
    }
    
    const { error, count } = await query;
    
    if (error) {
      console.error('Error deleting location history:', error);
      throw error;
    }
    
    return { 
      success: true, 
      count: count || 0
    };
  } catch (error) {
    console.error('Error in deleteLocationHistory:', error);
    throw error;
  }
}

/**
 * Get location statistics
 */
export async function getLocationStats(userId: string): Promise<{
  totalLocations: number;
  firstLocation: string | null;
  lastLocation: string | null;
  uniqueDevices: number;
}> {
  try {
    // Get total count
    const { count: totalCount, error: countError } = await supabase
      .from('unified_locations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (countError) throw countError;
    
    // Get first and last locations
    const { data: firstData, error: firstError } = await supabase
      .from('unified_locations')
      .select('timestamp')
      .eq('user_id', userId)
      .order('timestamp', { ascending: true })
      .limit(1)
      .single();
    
    if (firstError && firstError.code !== 'PGRST116') throw firstError;
    
    const { data: lastData, error: lastError } = await supabase
      .from('unified_locations')
      .select('timestamp')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();
    
    if (lastError && lastError.code !== 'PGRST116') throw lastError;
    
    // Count unique devices
    const { data: devicesData, error: devicesError } = await supabase
      .from('unified_locations')
      .select('device_info')
      .eq('user_id', userId)
      .not('device_info', 'is', null);
    
    if (devicesError) throw devicesError;
    
    const uniqueDeviceMap = new Map();
    devicesData?.forEach(item => {
      if (item.device_info?.uuid) {
        uniqueDeviceMap.set(item.device_info.uuid, true);
      }
    });
    
    return {
      totalLocations: totalCount || 0,
      firstLocation: firstData?.timestamp || null,
      lastLocation: lastData?.timestamp || null,
      uniqueDevices: uniqueDeviceMap.size
    };
  } catch (error) {
    console.error('Error getting location stats:', error);
    return {
      totalLocations: 0,
      firstLocation: null,
      lastLocation: null,
      uniqueDevices: 0
    };
  }
}
