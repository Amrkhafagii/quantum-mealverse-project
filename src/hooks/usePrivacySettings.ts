
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { privacyDataService } from '@/services/privacy/privacyDataService';
import { toast } from '@/components/ui/use-toast';
import type { 
  LocationDataRetentionPolicy, 
  DataAnonymizationSettings, 
  ThirdPartySharePreferences 
} from '@/types/privacy';

export function usePrivacySettings() {
  const { user } = useAuth();
  const [retentionPolicy, setRetentionPolicy] = useState<LocationDataRetentionPolicy | null>(null);
  const [anonymizationSettings, setAnonymizationSettings] = useState<DataAnonymizationSettings | null>(null);
  const [sharingPreferences, setSharingPreferences] = useState<ThirdPartySharePreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadPrivacySettings();
    }
  }, [user?.id]);

  const loadPrivacySettings = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const [retention, anonymization, sharing] = await Promise.all([
        privacyDataService.getLocationRetentionPolicy(user.id),
        privacyDataService.getAnonymizationSettings(user.id),
        privacyDataService.getSharingPreferences(user.id)
      ]);

      setRetentionPolicy(retention);
      setAnonymizationSettings(anonymization);
      setSharingPreferences(sharing);
    } catch (error) {
      console.error('Error loading privacy settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load privacy settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateRetentionPolicy = async (updates: Partial<LocationDataRetentionPolicy>) => {
    if (!user?.id) return;

    try {
      setIsProcessing(true);
      const updated = await privacyDataService.updateLocationRetentionPolicy(user.id, updates);
      if (updated) {
        setRetentionPolicy(updated);
        toast({
          title: 'Success',
          description: 'Retention policy updated successfully'
        });
      }
    } catch (error) {
      console.error('Error updating retention policy:', error);
      toast({
        title: 'Error',
        description: 'Failed to update retention policy',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const updateAnonymizationSettings = async (updates: Partial<DataAnonymizationSettings>) => {
    if (!user?.id) return;

    try {
      setIsProcessing(true);
      const updated = await privacyDataService.updateAnonymizationSettings(user.id, updates);
      if (updated) {
        setAnonymizationSettings(updated);
        toast({
          title: 'Success',
          description: 'Anonymization settings updated successfully'
        });
      }
    } catch (error) {
      console.error('Error updating anonymization settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update anonymization settings',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const updateSharingPreferences = async (updates: Partial<ThirdPartySharePreferences>) => {
    if (!user?.id) return;

    try {
      setIsProcessing(true);
      const updated = await privacyDataService.updateSharingPreferences(user.id, updates);
      if (updated) {
        setSharingPreferences(updated);
        toast({
          title: 'Success',
          description: 'Sharing preferences updated successfully'
        });
      }
    } catch (error) {
      console.error('Error updating sharing preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to update sharing preferences',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteLocationHistory = async (olderThanDays?: number) => {
    if (!user?.id) return;

    try {
      setIsProcessing(true);
      const deletedCount = await privacyDataService.deleteLocationHistory(user.id, olderThanDays);
      toast({
        title: 'Success',
        description: `Deleted ${deletedCount} location records`
      });
      return deletedCount;
    } catch (error) {
      console.error('Error deleting location history:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete location history',
        variant: 'destructive'
      });
      return 0;
    } finally {
      setIsProcessing(false);
    }
  };

  const anonymizeLocationData = async (precisionLevel: number = 3) => {
    if (!user?.id) return;

    try {
      setIsProcessing(true);
      const anonymizedCount = await privacyDataService.anonymizeLocationData(user.id, precisionLevel);
      toast({
        title: 'Success',
        description: `Anonymized ${anonymizedCount} location records`
      });
      return anonymizedCount;
    } catch (error) {
      console.error('Error anonymizing location data:', error);
      toast({
        title: 'Error',
        description: 'Failed to anonymize location data',
        variant: 'destructive'
      });
      return 0;
    } finally {
      setIsProcessing(false);
    }
  };

  const exportLocationData = async (format: 'json' | 'csv' | 'gpx' = 'json', includeAnonymized: boolean = false) => {
    if (!user?.id) return null;

    try {
      setIsProcessing(true);
      const exportData = await privacyDataService.exportLocationData(user.id, format, includeAnonymized);
      
      if (exportData) {
        // Create and download the file
        const fileName = `location-data-${exportData.export_date.split('T')[0]}.${format}`;
        let fileContent: string;
        let mimeType: string;

        switch (format) {
          case 'json':
            fileContent = JSON.stringify(exportData, null, 2);
            mimeType = 'application/json';
            break;
          case 'csv':
            const headers = 'ID,Latitude,Longitude,Accuracy,Timestamp,Location Type,Is Anonymized\n';
            const rows = exportData.data.map(item => 
              `${item.id},${item.latitude},${item.longitude},${item.accuracy || ''},${item.timestamp},${item.location_type},${item.is_anonymized}`
            ).join('\n');
            fileContent = headers + rows;
            mimeType = 'text/csv';
            break;
          case 'gpx':
            fileContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Privacy Export">
  <trk>
    <name>Location History</name>
    <trkseg>
      ${exportData.data.map(item => 
        `<trkpt lat="${item.latitude}" lon="${item.longitude}">
          <time>${item.timestamp}</time>
        </trkpt>`
      ).join('\n      ')}
    </trkseg>
  </trk>
</gpx>`;
            mimeType = 'application/gpx+xml';
            break;
          default:
            throw new Error(`Unsupported format: ${format}`);
        }

        const blob = new Blob([fileContent], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: 'Success',
          description: `Location data exported as ${format.toUpperCase()}`
        });
      }

      return exportData;
    } catch (error) {
      console.error('Error exporting location data:', error);
      toast({
        title: 'Error',
        description: 'Failed to export location data',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    retentionPolicy,
    anonymizationSettings,
    sharingPreferences,
    loading,
    isProcessing,
    updateRetentionPolicy,
    updateAnonymizationSettings,
    updateSharingPreferences,
    deleteLocationHistory,
    anonymizeLocationData,
    exportLocationData,
    refreshSettings: loadPrivacySettings
  };
}
