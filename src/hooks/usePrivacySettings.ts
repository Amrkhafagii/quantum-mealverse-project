
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { privacyDataService } from '@/services/privacy/privacyDataService';
import type { LocationDataRetentionPolicy, DataAnonymizationSettings, ThirdPartySharePreferences } from '@/types/privacy';

export const usePrivacySettings = (userId: string) => {
  const [locationRetentionPolicy, setLocationRetentionPolicy] = useState<LocationDataRetentionPolicy | null>(null);
  const [anonymizationSettings, setAnonymizationSettings] = useState<DataAnonymizationSettings | null>(null);
  const [sharingPreferences, setSharingPreferences] = useState<ThirdPartySharePreferences | null>(null);
  const [loading, setLoading] = useState(false);

  const loadSettings = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const [locationPolicy, anonymization, sharing] = await Promise.all([
        privacyDataService.getLocationDataRetentionPolicy(userId),
        privacyDataService.getDataAnonymizationSettings(userId),
        privacyDataService.getThirdPartySharePreferences(userId)
      ]);

      setLocationRetentionPolicy(locationPolicy);
      setAnonymizationSettings(anonymization);
      setSharingPreferences(sharing);
    } catch (error) {
      console.error('Error loading privacy settings:', error);
      toast.error('Failed to load privacy settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [userId]);

  const updateLocationRetention = async (policy: Partial<LocationDataRetentionPolicy>) => {
    if (!userId) return;
    
    try {
      const result = await privacyDataService.updateLocationDataRetentionPolicy(userId, policy);
      if (result.success) {
        setLocationRetentionPolicy(prev => prev ? { ...prev, ...policy } : null);
        toast.success('Location retention policy updated');
      } else {
        toast.error('Failed to update location retention policy');
      }
    } catch (error) {
      console.error('Error updating location retention:', error);
      toast.error('Failed to update location retention policy');
    }
  };

  const updateAnonymization = async (settings: Partial<DataAnonymizationSettings>) => {
    if (!userId) return;
    
    try {
      const result = await privacyDataService.updateDataAnonymizationSettings(userId, settings);
      if (result.success) {
        setAnonymizationSettings(prev => prev ? { ...prev, ...settings } : null);
        toast.success('Anonymization settings updated');
      } else {
        toast.error('Failed to update anonymization settings');
      }
    } catch (error) {
      console.error('Error updating anonymization:', error);
      toast.error('Failed to update anonymization settings');
    }
  };

  const updateSharing = async (preferences: Partial<ThirdPartySharePreferences>) => {
    if (!userId) return;
    
    try {
      const result = await privacyDataService.updateThirdPartySharePreferences(userId, preferences);
      if (result.success) {
        setSharingPreferences(prev => prev ? { ...prev, ...preferences } : null);
        toast.success('Sharing preferences updated');
      } else {
        toast.error('Failed to update sharing preferences');
      }
    } catch (error) {
      console.error('Error updating sharing preferences:', error);
      toast.error('Failed to update sharing preferences');
    }
  };

  const deleteLocationHistory = async () => {
    if (!userId) return;
    
    try {
      const result = await privacyDataService.deleteLocationHistory(userId);
      if (result.success) {
        toast.success('Location history deleted');
      } else {
        toast.error('Failed to delete location history');
      }
    } catch (error) {
      console.error('Error deleting location history:', error);
      toast.error('Failed to delete location history');
    }
  };

  const anonymizeLocationData = async (settings: DataAnonymizationSettings) => {
    if (!userId) return;
    
    try {
      const result = await privacyDataService.anonymizeLocationData(userId, settings);
      if (result.success) {
        toast.success('Location data anonymized');
      } else {
        toast.error('Failed to anonymize location data');
      }
    } catch (error) {
      console.error('Error anonymizing location data:', error);
      toast.error('Failed to anonymize location data');
    }
  };

  const exportLocationData = async (format: string = 'json') => {
    if (!userId) return;
    
    try {
      const result = await privacyDataService.exportLocationData(userId, format);
      if (result.success) {
        toast.success('Data export initiated');
      } else {
        toast.error('Failed to export data');
      }
    } catch (error) {
      console.error('Error exporting location data:', error);
      toast.error('Failed to export data');
    }
  };

  return {
    locationRetentionPolicy,
    anonymizationSettings,
    sharingPreferences,
    loading,
    updateLocationRetention,
    updateAnonymization,
    updateSharing,
    deleteLocationHistory,
    anonymizeLocationData,
    exportLocationData,
    refreshSettings: loadSettings
  };
};
