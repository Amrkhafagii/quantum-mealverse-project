
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { privacyDataService } from '@/services/privacy/privacyDataService';
import type { LocationDataRetentionPolicy, DataAnonymizationSettings, ThirdPartySharePreferences } from '@/types/privacy';

export const usePrivacySettings = (userId: string) => {
  const [locationRetentionPolicy, setLocationRetentionPolicy] = useState<LocationDataRetentionPolicy | null>(null);
  const [anonymizationSettings, setAnonymizationSettings] = useState<DataAnonymizationSettings | null>(null);
  const [sharingPreferences, setSharingPreferences] = useState<ThirdPartySharePreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadSettings = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const [locationPolicy, anonymization, sharing] = await Promise.all([
        privacyDataService.getLocationDataRetentionPolicy(userId),
        privacyDataService.getDataAnonymizationSettings(userId),
        privacyDataService.getThirdPartySharePreferences(userId)
      ]);

      setLocationRetentionPolicy(locationPolicy as LocationDataRetentionPolicy);
      setAnonymizationSettings(anonymization as DataAnonymizationSettings);
      setSharingPreferences(sharing as ThirdPartySharePreferences);
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
    
    setIsProcessing(true);
    try {
      const result = await privacyDataService.updateLocationDataRetentionPolicy(userId, policy);
      if (result) {
        setLocationRetentionPolicy(prev => prev ? { ...prev, ...policy } : null);
        toast.success('Location retention policy updated');
      } else {
        toast.error('Failed to update location retention policy');
      }
    } catch (error) {
      console.error('Error updating location retention:', error);
      toast.error('Failed to update location retention policy');
    } finally {
      setIsProcessing(false);
    }
  };

  const updateAnonymization = async (settings: Partial<DataAnonymizationSettings>) => {
    if (!userId) return;
    
    setIsProcessing(true);
    try {
      const result = await privacyDataService.updateDataAnonymizationSettings(userId, settings);
      if (result) {
        setAnonymizationSettings(prev => prev ? { ...prev, ...settings } : null);
        toast.success('Anonymization settings updated');
      } else {
        toast.error('Failed to update anonymization settings');
      }
    } catch (error) {
      console.error('Error updating anonymization:', error);
      toast.error('Failed to update anonymization settings');
    } finally {
      setIsProcessing(false);
    }
  };

  const updateSharing = async (preferences: Partial<ThirdPartySharePreferences>) => {
    if (!userId) return;
    
    setIsProcessing(true);
    try {
      const result = await privacyDataService.updateThirdPartySharePreferences(userId, preferences);
      if (result) {
        setSharingPreferences(prev => prev ? { ...prev, ...preferences } : null);
        toast.success('Sharing preferences updated');
      } else {
        toast.error('Failed to update sharing preferences');
      }
    } catch (error) {
      console.error('Error updating sharing preferences:', error);
      toast.error('Failed to update sharing preferences');
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteLocationHistory = async (olderThanDays?: number) => {
    if (!userId) return;
    
    setIsProcessing(true);
    try {
      const result = await privacyDataService.deleteLocationData(userId, olderThanDays);
      if (result.success) {
        toast.success('Location history deleted');
      } else {
        toast.error('Failed to delete location history');
      }
    } catch (error) {
      console.error('Error deleting location history:', error);
      toast.error('Failed to delete location history');
    } finally {
      setIsProcessing(false);
    }
  };

  const anonymizeLocationData = async (precisionLevel: number) => {
    if (!userId) return;
    
    setIsProcessing(true);
    try {
      const result = await privacyDataService.anonymizeLocationData(userId, precisionLevel);
      if (result.success) {
        toast.success('Location data anonymized');
      } else {
        toast.error('Failed to anonymize location data');
      }
    } catch (error) {
      console.error('Error anonymizing location data:', error);
      toast.error('Failed to anonymize location data');
    } finally {
      setIsProcessing(false);
    }
  };

  const exportLocationData = async (format: string = 'json', includeAnonymized: boolean = false) => {
    if (!userId) return;
    
    setIsProcessing(true);
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
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    locationRetentionPolicy,
    retentionPolicy: locationRetentionPolicy, // Alias for backward compatibility
    anonymizationSettings,
    sharingPreferences,
    loading,
    isProcessing,
    updateLocationRetention,
    updateRetentionPolicy: updateLocationRetention, // Alias for backward compatibility
    updateAnonymization,
    updateAnonymizationSettings: updateAnonymization, // Alias for backward compatibility
    updateSharing,
    updateSharingPreferences: updateSharing, // Alias for backward compatibility
    deleteLocationHistory,
    anonymizeLocationData,
    exportLocationData,
    refreshSettings: loadSettings
  };
};
