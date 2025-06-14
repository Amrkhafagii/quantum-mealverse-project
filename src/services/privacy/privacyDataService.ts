
import { supabase } from '@/integrations/supabase/client';
import { 
  LocationDataRetentionPolicy, 
  DataAnonymizationSettings, 
  ThirdPartySharePreferences 
} from '@/types/privacy';

export const getLocationRetentionPolicy = async (userId: string): Promise<LocationDataRetentionPolicy | null> => {
  try {
    const { data, error } = await supabase
      .from('location_data_retention_policies')
      .select('*')
      .eq('location_data_retention_policies_user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching location retention policy:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    // Map database field names to interface field names
    return {
      id: data.id,
      user_id: data.location_data_retention_policies_user_id,
      retention_period_days: data.retention_period_days,
      auto_anonymize_after_days: data.auto_anonymize_after_days,
      auto_delete_after_days: data.auto_delete_after_days,
      export_format: data.export_format as 'json' | 'csv' | 'gpx',
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Error in getLocationRetentionPolicy:', error);
    return null;
  }
};

export const updateLocationRetentionPolicy = async (
  userId: string, 
  policy: Partial<LocationDataRetentionPolicy>
): Promise<LocationDataRetentionPolicy | null> => {
  try {
    const { data, error } = await supabase
      .from('location_data_retention_policies')
      .upsert({
        location_data_retention_policies_user_id: userId,
        retention_period_days: policy.retention_period_days,
        auto_anonymize_after_days: policy.auto_anonymize_after_days,
        auto_delete_after_days: policy.auto_delete_after_days,
        export_format: policy.export_format
      })
      .select()
      .single();

    if (error) throw error;

    // Map database field names to interface field names
    return {
      id: data.id,
      user_id: data.location_data_retention_policies_user_id,
      retention_period_days: data.retention_period_days,
      auto_anonymize_after_days: data.auto_anonymize_after_days,
      auto_delete_after_days: data.auto_delete_after_days,
      export_format: data.export_format as 'json' | 'csv' | 'gpx',
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Error updating location retention policy:', error);
    return null;
  }
};

export const getDataAnonymizationSettings = async (userId: string): Promise<DataAnonymizationSettings | null> => {
  try {
    const { data, error } = await supabase
      .from('data_anonymization_settings')
      .select('*')
      .eq('data_anonymization_settings_user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching anonymization settings:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    // Map database field names to interface field names
    return {
      id: data.id,
      user_id: data.data_anonymization_settings_user_id,
      anonymize_location_data: data.anonymize_location_data,
      anonymize_device_info: data.anonymize_device_info,
      anonymize_usage_patterns: data.anonymize_usage_patterns,
      precision_reduction_level: data.precision_reduction_level,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Error in getDataAnonymizationSettings:', error);
    return null;
  }
};

export const updateDataAnonymizationSettings = async (
  userId: string, 
  settings: Partial<DataAnonymizationSettings>
): Promise<DataAnonymizationSettings | null> => {
  try {
    const { data, error } = await supabase
      .from('data_anonymization_settings')
      .upsert({
        data_anonymization_settings_user_id: userId,
        anonymize_location_data: settings.anonymize_location_data,
        anonymize_device_info: settings.anonymize_device_info,
        anonymize_usage_patterns: settings.anonymize_usage_patterns,
        precision_reduction_level: settings.precision_reduction_level
      })
      .select()
      .single();

    if (error) throw error;

    // Map database field names to interface field names
    return {
      id: data.id,
      user_id: data.data_anonymization_settings_user_id,
      anonymize_location_data: data.anonymize_location_data,
      anonymize_device_info: data.anonymize_device_info,
      anonymize_usage_patterns: data.anonymize_usage_patterns,
      precision_reduction_level: data.precision_reduction_level,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Error updating anonymization settings:', error);
    return null;
  }
};

export const getThirdPartySharePreferences = async (userId: string): Promise<ThirdPartySharePreferences | null> => {
  try {
    // Since third_party_share_preferences table doesn't exist, return default values
    console.log('Third party share preferences table not found, returning defaults for user:', userId);
    
    return {
      id: 'default',
      user_id: userId,
      analytics_sharing: false,
      marketing_sharing: false,
      research_sharing: false,
      location_sharing_partners: [],
      data_processing_consent: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in getThirdPartySharePreferences:', error);
    return null;
  }
};

export const updateThirdPartySharePreferences = async (
  userId: string, 
  preferences: Partial<ThirdPartySharePreferences>
): Promise<ThirdPartySharePreferences | null> => {
  try {
    // Since third_party_share_preferences table doesn't exist, just return the preferences
    console.log('Third party share preferences table not found, returning provided preferences for user:', userId);
    
    return {
      id: 'default',
      user_id: userId,
      analytics_sharing: preferences.analytics_sharing || false,
      marketing_sharing: preferences.marketing_sharing || false,
      research_sharing: preferences.research_sharing || false,
      location_sharing_partners: preferences.location_sharing_partners || [],
      data_processing_consent: preferences.data_processing_consent || false,
      consent_date: preferences.consent_date,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error updating third party share preferences:', error);
    return null;
  }
};

export const exportLocationData = async (userId: string, format: 'json' | 'csv' | 'gpx' = 'json') => {
  try {
    const { data, error } = await supabase
      .from('data_export_requests')
      .insert({
        data_export_requests_user_id: userId,
        request_type: 'location_history',
        export_format: format,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    console.log('Location data export request created:', data.id);
    return data;
  } catch (error) {
    console.error('Error creating location data export request:', error);
    throw error;
  }
};
