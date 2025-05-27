
import { supabase } from '@/integrations/supabase/client';
import type { 
  LocationDataRetentionPolicy, 
  DataAnonymizationSettings, 
  ThirdPartySharePreferences,
  DataExportRequest,
  LocationExportData,
  LocationAnonymizationLog
} from '@/types/privacy';

class PrivacyDataService {
  // Location Data Retention Policies
  async getLocationRetentionPolicy(userId: string): Promise<LocationDataRetentionPolicy | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_or_create_location_retention_policy', {
          p_user_id: userId
        });

      if (error) {
        console.error('Error fetching location retention policy:', error);
        throw error;
      }

      return data as LocationDataRetentionPolicy;
    } catch (error) {
      console.error('Error in getLocationRetentionPolicy:', error);
      return null;
    }
  }

  async updateLocationRetentionPolicy(
    userId: string, 
    updates: Partial<LocationDataRetentionPolicy>
  ): Promise<LocationDataRetentionPolicy | null> {
    try {
      const { data, error } = await supabase
        .from('location_data_retention_policies')
        .upsert({
          user_id: userId,
          ...updates
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating location retention policy:', error);
        throw error;
      }

      return data as LocationDataRetentionPolicy;
    } catch (error) {
      console.error('Error in updateLocationRetentionPolicy:', error);
      return null;
    }
  }

  // Data Anonymization Settings
  async getAnonymizationSettings(userId: string): Promise<DataAnonymizationSettings | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_or_create_anonymization_settings', {
          p_user_id: userId
        });

      if (error) {
        console.error('Error fetching anonymization settings:', error);
        throw error;
      }

      return data as DataAnonymizationSettings;
    } catch (error) {
      console.error('Error in getAnonymizationSettings:', error);
      return null;
    }
  }

  async updateAnonymizationSettings(
    userId: string, 
    updates: Partial<DataAnonymizationSettings>
  ): Promise<DataAnonymizationSettings | null> {
    try {
      const { data, error } = await supabase
        .from('data_anonymization_settings')
        .upsert({
          user_id: userId,
          ...updates
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating anonymization settings:', error);
        throw error;
      }

      return data as DataAnonymizationSettings;
    } catch (error) {
      console.error('Error in updateAnonymizationSettings:', error);
      return null;
    }
  }

  // Third-party Sharing Preferences
  async getSharingPreferences(userId: string): Promise<ThirdPartySharePreferences | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_or_create_sharing_preferences', {
          p_user_id: userId
        });

      if (error) {
        console.error('Error fetching sharing preferences:', error);
        throw error;
      }

      // Transform the data to match our interface
      if (data) {
        const transformedData: ThirdPartySharePreferences = {
          ...data,
          location_sharing_partners: Array.isArray(data.location_sharing_partners) 
            ? (data.location_sharing_partners as string[])
            : []
        };
        return transformedData;
      }

      return null;
    } catch (error) {
      console.error('Error in getSharingPreferences:', error);
      return null;
    }
  }

  async updateSharingPreferences(
    userId: string, 
    updates: Partial<ThirdPartySharePreferences>
  ): Promise<ThirdPartySharePreferences | null> {
    try {
      const { data, error } = await supabase
        .from('third_party_sharing_preferences')
        .upsert({
          user_id: userId,
          ...updates
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating sharing preferences:', error);
        throw error;
      }

      // Transform the data to match our interface
      if (data) {
        const transformedData: ThirdPartySharePreferences = {
          ...data,
          location_sharing_partners: Array.isArray(data.location_sharing_partners) 
            ? (data.location_sharing_partners as string[])
            : []
        };
        return transformedData;
      }

      return null;
    } catch (error) {
      console.error('Error in updateSharingPreferences:', error);
      return null;
    }
  }

  // Location Data Management
  async deleteLocationHistory(userId: string, olderThanDays?: number): Promise<number> {
    try {
      const { data, error } = await supabase
        .rpc('delete_user_location_history', {
          p_user_id: userId,
          p_older_than_days: olderThanDays
        });

      if (error) {
        console.error('Error deleting location history:', error);
        throw error;
      }

      return data || 0;
    } catch (error) {
      console.error('Error in deleteLocationHistory:', error);
      return 0;
    }
  }

  async anonymizeLocationData(userId: string, precisionLevel: number = 3): Promise<number> {
    try {
      const { data, error } = await supabase
        .rpc('anonymize_user_location_data', {
          p_user_id: userId,
          p_precision_level: precisionLevel
        });

      if (error) {
        console.error('Error anonymizing location data:', error);
        throw error;
      }

      return data || 0;
    } catch (error) {
      console.error('Error in anonymizeLocationData:', error);
      return 0;
    }
  }

  async exportLocationData(
    userId: string, 
    format: 'json' | 'csv' | 'gpx' = 'json',
    includeAnonymized: boolean = false
  ): Promise<LocationExportData | null> {
    try {
      const { data, error } = await supabase
        .rpc('export_user_location_data', {
          p_user_id: userId,
          p_format: format,
          p_include_anonymized: includeAnonymized
        });

      if (error) {
        console.error('Error exporting location data:', error);
        throw error;
      }

      return data as unknown as LocationExportData;
    } catch (error) {
      console.error('Error in exportLocationData:', error);
      return null;
    }
  }

  // Get anonymization log
  async getAnonymizationLog(userId: string): Promise<LocationAnonymizationLog[]> {
    try {
      const { data, error } = await supabase
        .from('location_anonymization_log')
        .select('*')
        .eq('user_id', userId)
        .order('processed_at', { ascending: false });

      if (error) {
        console.error('Error fetching anonymization log:', error);
        throw error;
      }

      return (data || []) as LocationAnonymizationLog[];
    } catch (error) {
      console.error('Error in getAnonymizationLog:', error);
      return [];
    }
  }

  // Get export requests
  async getExportRequests(userId: string): Promise<DataExportRequest[]> {
    try {
      const { data, error } = await supabase
        .from('data_export_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching export requests:', error);
        throw error;
      }

      return (data || []) as DataExportRequest[];
    } catch (error) {
      console.error('Error in getExportRequests:', error);
      return [];
    }
  }
}

export const privacyDataService = new PrivacyDataService();
