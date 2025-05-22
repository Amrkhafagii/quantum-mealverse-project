
import { supabase } from '@/integrations/supabase/client';
import { UnifiedLocation, LocationQueryParams, LocationPrivacySettings, LocationType, LocationSource } from '@/types/unifiedLocation';
import { DeliveryLocation } from '@/types/location';

// Default location privacy settings
const DEFAULT_PRIVACY_SETTINGS: LocationPrivacySettings = {
  retentionDays: 30, // GDPR-friendly default
  automaticallyAnonymize: true,
  collectDeviceInfo: true,
  allowPreciseLocation: true
};

/**
 * Save a location to the unified locations table
 */
export const saveLocation = async (
  location: Partial<UnifiedLocation>
): Promise<UnifiedLocation | null> => {
  try {
    // Apply privacy settings
    const settings = await getUserPrivacySettings(location.user_id);
    const locationWithPrivacy = applyPrivacySettings(location, settings);

    // Calculate retention expiry date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + settings.retentionDays);
    
    // Check if source is valid, default to 'manual' if not
    if (!isValidSource(location.source)) {
      console.warn(`Invalid location source: ${location.source}, defaulting to 'manual'`);
      location.source = 'manual';
    }
    
    const locationToSave = {
      ...locationWithPrivacy,
      retention_expires_at: expiryDate.toISOString(),
      id: location.id || crypto.randomUUID(),
      timestamp: location.timestamp || new Date().toISOString(),
      source: location.source || 'manual'
    };

    // Use type assertion to tell TypeScript this table exists
    const { data, error } = await supabase
      .from('unified_locations' as any)
      .insert(locationToSave)
      .select();

    if (error) {
      console.error('Error saving location:', error);
      throw error;
    }

    return data && data.length > 0 ? (data[0] as unknown as UnifiedLocation) : null;
  } catch (error) {
    console.error('Error in saveLocation:', error);
    return null;
  }
};

/**
 * Check if source is a valid LocationSource type
 */
function isValidSource(source?: string): source is LocationSource {
  if (!source) return false;
  return ['gps', 'network', 'wifi', 'cell_tower', 'ip', 'manual', 'cached'].includes(source);
}

/**
 * Query locations based on filters
 */
export const queryLocations = async (
  params: LocationQueryParams
): Promise<UnifiedLocation[]> => {
  try {
    let query = supabase
      .from('unified_locations' as any)
      .select();

    // Apply filters
    if (params.userId) {
      query = query.eq('user_id', params.userId);
    }
    
    if (params.orderId) {
      query = query.eq('order_id', params.orderId);
    }
    
    if (params.deliveryAssignmentId) {
      query = query.eq('delivery_assignment_id', params.deliveryAssignmentId);
    }
    
    if (params.restaurantId) {
      query = query.eq('restaurant_id', params.restaurantId);
    }
    
    if (params.locationType) {
      query = query.eq('location_type', params.locationType);
    }

    // Date filtering
    if (params.startDate) {
      query = query.gte('timestamp', params.startDate);
    }
    
    if (params.endDate) {
      query = query.lte('timestamp', params.endDate);
    }
    
    // By default, don't include expired locations
    if (!params.includeExpired) {
      const now = new Date().toISOString();
      query = query.or(`retention_expires_at.gt.${now},retention_expires_at.is.null`);
    }

    // Apply limit if specified
    if (params.limit) {
      query = query.limit(params.limit);
    }

    // Order by timestamp
    query = query.order('timestamp', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error querying locations:', error);
      throw error;
    }

    return (data || []) as unknown as UnifiedLocation[];
  } catch (error) {
    console.error('Error in queryLocations:', error);
    return [];
  }
};

/**
 * Get the latest location for a specific entity
 */
export const getLatestLocation = async (
  type: LocationType,
  id: string,
  idField: 'user_id' | 'order_id' | 'delivery_assignment_id' | 'restaurant_id'
): Promise<UnifiedLocation | null> => {
  try {
    const { data, error } = await supabase
      .from('unified_locations' as any)
      .select()
      .eq('location_type', type)
      .eq(idField, id)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No location found
        return null;
      }
      console.error('Error getting latest location:', error);
      throw error;
    }

    return data as unknown as UnifiedLocation;
  } catch (error) {
    console.error('Error in getLatestLocation:', error);
    return null;
  }
};

/**
 * Delete a location by id
 */
export const deleteLocation = async (locationId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('unified_locations' as any)
      .delete()
      .eq('id', locationId);

    if (error) {
      console.error('Error deleting location:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteLocation:', error);
    return false;
  }
};

/**
 * Delete all locations for a user within a time range
 */
export const deleteUserLocationHistory = async (
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<boolean> => {
  try {
    let query = supabase
      .from('unified_locations' as any)
      .delete()
      .eq('user_id', userId);
    
    if (startDate) {
      query = query.gte('timestamp', startDate);
    }
    
    if (endDate) {
      query = query.lte('timestamp', endDate);
    }
    
    const { error } = await query;

    if (error) {
      console.error('Error deleting location history:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteUserLocationHistory:', error);
    return false;
  }
};

/**
 * Find nearby locations using PostGIS
 */
export const findNearbyLocations = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 5,
  type?: LocationType,
  limit: number = 20
): Promise<UnifiedLocation[]> => {
  try {
    // Since we can't use function call directly, use a raw SQL query
    const sql = `
      SELECT * FROM unified_locations
      WHERE ST_DWithin(
        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
        $3 * 1000
      )
      ${type ? "AND location_type = $4" : ""}
      ORDER BY ST_Distance(
        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
      )
      LIMIT ${type ? "$5" : "$4"}
    `;
    
    const params = type 
      ? [longitude, latitude, radiusKm, type, limit]
      : [longitude, latitude, radiusKm, limit];
    
    // Use a standard RPC call to execute custom queries
    const { data, error } = await supabase.rpc('query_raw' as any, { 
      sql_query: sql, 
      params: params 
    });

    if (error) {
      console.error('Error finding nearby locations:', error);
      throw error;
    }

    return (data || []) as unknown as UnifiedLocation[];
  } catch (error) {
    console.error('Error in findNearbyLocations:', error);
    return [];
  }
};

/**
 * Convert a delivery location to unified location
 */
export const toUnifiedLocation = (
  deliveryLocation: DeliveryLocation,
  type: LocationType,
  userId?: string,
  orderId?: string,
  deliveryAssignmentId?: string,
  restaurantId?: string
): UnifiedLocation => {
  return {
    id: crypto.randomUUID(),
    location_type: type,
    user_id: userId,
    order_id: orderId,
    delivery_assignment_id: deliveryAssignmentId,
    restaurant_id: restaurantId,
    latitude: deliveryLocation.latitude,
    longitude: deliveryLocation.longitude,
    accuracy: deliveryLocation.accuracy,
    speed: deliveryLocation.speed,
    is_moving: deliveryLocation.isMoving,
    timestamp: new Date(deliveryLocation.timestamp || Date.now()).toISOString(),
    source: 'gps'
  };
};

/**
 * Get user privacy settings for location data
 */
async function getUserPrivacySettings(
  userId?: string
): Promise<LocationPrivacySettings> {
  if (!userId) {
    return DEFAULT_PRIVACY_SETTINGS;
  }

  try {
    // Query user_preferences table to get location_tracking settings
    const { data, error } = await supabase
      .from('user_preferences')
      .select('location_tracking_enabled')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      console.warn('No user preferences found, using defaults', error);
      return DEFAULT_PRIVACY_SETTINGS;
    }

    // User has opted out of location tracking
    if (data.location_tracking_enabled === false) {
      return {
        ...DEFAULT_PRIVACY_SETTINGS,
        automaticallyAnonymize: true,
        collectDeviceInfo: false,
        allowPreciseLocation: false
      };
    }

    return DEFAULT_PRIVACY_SETTINGS;
  } catch (error) {
    console.error('Error getting user privacy settings:', error);
    return DEFAULT_PRIVACY_SETTINGS;
  }
}

/**
 * Apply privacy settings to location data
 */
function applyPrivacySettings(
  location: Partial<UnifiedLocation>,
  settings: LocationPrivacySettings
): Partial<UnifiedLocation> {
  const result = { ...location };

  // Apply anonymization if needed
  if (settings.automaticallyAnonymize) {
    result.is_anonymized = true;
    delete result.user_id;
  }

  // Remove device info if not collecting
  if (!settings.collectDeviceInfo) {
    delete result.device_info;
  }

  // Reduce location precision if needed
  if (!settings.allowPreciseLocation && result.latitude !== undefined && result.longitude !== undefined) {
    // Round to lower precision (roughly 1km precision)
    result.latitude = Math.round(result.latitude * 100) / 100;
    result.longitude = Math.round(result.longitude * 100) / 100;
    
    // Mark that precision was reduced
    result.accuracy = result.accuracy ? Math.max(1000, result.accuracy) : 1000;
  }

  return result;
}

/**
 * Export location history for a user
 */
export const exportLocationHistory = async (
  userId: string,
  startDate?: string,
  endDate?: string,
  format: 'json' | 'csv' = 'json'
): Promise<string> => {
  try {
    const locations = await queryLocations({
      userId,
      startDate,
      endDate,
      includeExpired: true
    });

    if (format === 'csv') {
      return convertLocationsToCSV(locations);
    } else {
      return JSON.stringify(locations, null, 2);
    }
  } catch (error) {
    console.error('Error exporting location history:', error);
    throw error;
  }
};

/**
 * Helper to convert locations to CSV
 */
function convertLocationsToCSV(locations: UnifiedLocation[]): string {
  if (locations.length === 0) {
    return '';
  }

  // Create headers
  const headers = [
    'id', 'timestamp', 'latitude', 'longitude', 
    'location_type', 'accuracy', 'speed', 'source'
  ];

  // Create CSV content
  let csv = headers.join(',') + '\n';

  // Add rows
  locations.forEach(location => {
    const row = [
      location.id,
      location.timestamp,
      location.latitude,
      location.longitude,
      location.location_type,
      location.accuracy || '',
      location.speed || '',
      location.source
    ];
    
    csv += row.join(',') + '\n';
  });

  return csv;
}
