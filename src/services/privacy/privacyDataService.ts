import { supabase } from '@/integrations/supabase/client';
import type { 
  LocationDataRetentionPolicy, 
  DataAnonymizationSettings, 
  ThirdPartySharePreferences,
  DataExportRequest,
  LocationAnonymizationLog
} from '@/types/privacy';

export const getLocationDataRetentionPolicy = async (userId: string): Promise<LocationDataRetentionPolicy> => {
  try {
    const { data, error } = await supabase
      .from('location_data_retention_policies')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching location retention policy:', error);
    throw error;
  }
};

export const updateLocationDataRetentionPolicy = async (
  userId: string, 
  policy: Partial<LocationDataRetentionPolicy>
): Promise<LocationDataRetentionPolicy> => {
  try {
    const { data, error } = await supabase
      .from('location_data_retention_policies')
      .upsert({ 
        user_id: userId, 
        ...policy,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating location retention policy:', error);
    throw error;
  }
};

export const getDataAnonymizationSettings = async (userId: string): Promise<DataAnonymizationSettings> => {
  try {
    const { data, error } = await supabase
      .from('data_anonymization_settings')
      .select('*')
      .eq('data_anonymization_settings_user_id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching anonymization settings:', error);
    throw error;
  }
};

export const updateDataAnonymizationSettings = async (
  userId: string, 
  settings: Partial<DataAnonymizationSettings>
): Promise<DataAnonymizationSettings> => {
  try {
    const { data, error } = await supabase
      .from('data_anonymization_settings')
      .upsert({ 
        data_anonymization_settings_user_id: userId, 
        ...settings,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating anonymization settings:', error);
    throw error;
  }
};

export const getThirdPartySharePreferences = async (userId: string): Promise<ThirdPartySharePreferences> => {
  try {
    const { data, error } = await supabase
      .from('third_party_share_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching sharing preferences:', error);
    throw error;
  }
};

export const updateThirdPartySharePreferences = async (
  userId: string, 
  preferences: Partial<ThirdPartySharePreferences>
): Promise<ThirdPartySharePreferences> => {
  try {
    const { data, error } = await supabase
      .from('third_party_share_preferences')
      .upsert({ 
        user_id: userId, 
        ...preferences,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating sharing preferences:', error);
    throw error;
  }
};

export const deleteLocationData = async (userId: string, olderThanDays?: number): Promise<{ success: boolean; deletedCount?: number }> => {
  try {
    let query = supabase
      .from('location_tracking')
      .delete()
      .eq('user_id', userId);

    if (olderThanDays) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
      query = query.lte('created_at', cutoffDate.toISOString());
    }

    const { data, error, count } = await query;

    if (error) throw error;
    return { success: true, deletedCount: count || 0 };
  } catch (error) {
    console.error('Error deleting location data:', error);
    return { success: false };
  }
};

export const anonymizeLocationData = async (userId: string, precisionLevel: number): Promise<{ success: boolean; processedCount?: number }> => {
  try {
    // This would implement the actual anonymization logic
    // For now, we'll return a mock success response
    console.log('Anonymizing location data for user:', userId, 'with precision level:', precisionLevel);
    
    // Log the anonymization operation
    const { data, error } = await supabase
      .from('location_anonymization_logs')
      .insert({
        user_id: userId,
        original_location_count: 0,
        anonymized_location_count: 0,
        anonymization_method: 'precision_reduction',
        precision_level: precisionLevel,
        processed_at: new Date().toISOString()
      });
      
    if (error) throw error;
    return { success: true, processedCount: 0 };
  } catch (error) {
    console.error('Error anonymizing location data:', error);
    return { success: false };
  }
};

export const exportLocationData = async (userId: string, format: string = 'json', includeAnonymized: boolean = false): Promise<{ success: boolean; fileUrl?: string }> => {
  try {
    const { data, error } = await supabase
      .from('data_export_requests')
      .insert({
        data_export_requests_user_id: userId,
        request_type: 'location_history',
        export_format: format,
        status: 'pending',
        include_anonymized: includeAnonymized
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error creating export request:', error);
    return { success: false };
  }
};

export const getExportRequests = async (userId: string): Promise<DataExportRequest[]> => {
  try {
    const { data, error } = await supabase
      .from('data_export_requests')
      .select('*')
      .eq('data_export_requests_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching export requests:', error);
    return [];
  }
};

export const getAnonymizationLogs = async (userId: string): Promise<LocationAnonymizationLog[]> => {
  try {
    const { data, error } = await supabase
      .from('location_anonymization_logs')
      .select('*')
      .eq('user_id', userId)
      .order('processed_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching anonymization logs:', error);
    return [];
  }
};

export const privacyDataService = {
  getLocationDataRetentionPolicy,
  updateLocationDataRetentionPolicy,
  getDataAnonymizationSettings,
  updateDataAnonymizationSettings,
  getThirdPartySharePreferences,
  updateThirdPartySharePreferences,
  deleteLocationData,
  anonymizeLocationData,
  exportLocationData,
  getExportRequests,
  getAnonymizationLogs
};
