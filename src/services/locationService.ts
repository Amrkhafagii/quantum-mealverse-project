import { DeliveryLocation } from '@/types/location';
import { UnifiedLocation, LocationPrivacySettings } from '@/types/unifiedLocation';
import { supabase } from '@/lib/supabase';
import { logLocationDebug } from '@/utils/locationDebug';

// Default privacy settings
const DEFAULT_PRIVACY_SETTINGS: LocationPrivacySettings = {
  trackingEnabled: true,
  anonymizeData: false,
  retentionPeriodDays: 30,
  shareWithThirdParties: false,
  automaticallyAnonymize: true,
  collectDeviceInfo: true,
  allowPreciseLocation: true,
  allowBackgroundTracking: true
};

// Save location to database
export const saveLocation = async (location: UnifiedLocation): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('locations').insert(location);
    
    if (error) {
      console.error('Error saving location:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception saving location:', error);
    return false;
  }
};

// Get location history from database
export const getLocationHistory = async (userId: string, limit = 10): Promise<UnifiedLocation[]> => {
  try {
    const { data, error } = await supabase
      .from('locations')
      .select()
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching location history:', error);
      return [];
    }
    
    return data as UnifiedLocation[];
  } catch (error) {
    console.error('Exception fetching location history:', error);
    return [];
  }
};

// Get privacy settings for a user
export const getPrivacySettings = async (userId: string): Promise<LocationPrivacySettings> => {
  try {
    const { data, error } = await supabase
      .from('location_privacy_settings')
      .select()
      .eq('user_id', userId)
      .single();
    
    if (error || !data) {
      console.log('No privacy settings found, using defaults');
      return DEFAULT_PRIVACY_SETTINGS;
    }
    
    return data as LocationPrivacySettings;
  } catch (error) {
    console.error('Exception fetching privacy settings:', error);
    return DEFAULT_PRIVACY_SETTINGS;
  }
};

// Save privacy settings for a user
export const savePrivacySettings = async (userId: string, settings: LocationPrivacySettings): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('location_privacy_settings')
      .update(settings)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error saving privacy settings:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception saving privacy settings:', error);
    return false;
  }
};

export const createUnifiedLocation = (deliveryLocation: DeliveryLocation, additionalData?: any): UnifiedLocation => {
  logLocationDebug('creating-unified-location', { deliveryLocation, additionalData });
  
  const unifiedLocation: UnifiedLocation = {
    latitude: deliveryLocation.latitude,
    longitude: deliveryLocation.longitude,
    accuracy: deliveryLocation.accuracy,
    altitude: deliveryLocation.altitude,
    altitudeAccuracy: deliveryLocation.altitudeAccuracy,
    heading: deliveryLocation.heading,
    speed: deliveryLocation.speed,
    timestamp: typeof deliveryLocation.timestamp === 'number' 
      ? new Date(deliveryLocation.timestamp).toISOString()
      : deliveryLocation.timestamp.toString(),
    source: deliveryLocation.source,
    isMoving: deliveryLocation.isMoving,
    orderId: additionalData?.orderId,
    restaurantId: additionalData?.restaurantId,
    deliveryAssignmentId: additionalData?.deliveryAssignmentId,
    user_id: additionalData?.user_id,
    location_type: additionalData?.location_type,
    battery_level: additionalData?.battery_level,
    is_anonymized: additionalData?.is_anonymized
  };

  return unifiedLocation;
};

// Delete location history for a user
export const deleteLocationHistory = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('locations')
      .delete()
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error deleting location history:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception deleting location history:', error);
    return false;
  }
};

// Anonymize location data
export const anonymizeLocation = (location: UnifiedLocation): UnifiedLocation => {
  // Create a copy to avoid mutating the original
  const anonymized = { ...location };
  
  // Round coordinates to reduce precision (roughly to neighborhood level)
  anonymized.latitude = Math.round(location.latitude * 100) / 100;
  anonymized.longitude = Math.round(location.longitude * 100) / 100;
  
  // Remove or obfuscate identifying information
  delete anonymized.user_id;
  delete anonymized.device_info;
  anonymized.is_anonymized = true;
  
  return anonymized;
};

// Get the most recent location for a user
export const getMostRecentLocation = async (userId: string): Promise<UnifiedLocation | null> => {
  try {
    const { data, error } = await supabase
      .from('locations')
      .select()
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(1);
    
    if (error || !data || data.length === 0) {
      return null;
    }
    
    return data[0] as UnifiedLocation;
  } catch (error) {
    console.error('Exception fetching most recent location:', error);
    return null;
  }
};
