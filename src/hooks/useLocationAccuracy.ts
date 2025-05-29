
import { useState, useEffect, useCallback } from 'react';
import { deliveryLocationAccuracyService } from '@/services/delivery/locationAccuracyService';
import type { 
  DeliveryLocationAccuracySettings, 
  DeliveryLocationQualityLog,
  LocationProvider 
} from '@/types/location-accuracy';
import { toast } from '@/hooks/use-toast';

export function useLocationAccuracy(deliveryUserId?: string) {
  const [settings, setSettings] = useState<DeliveryLocationAccuracySettings | null>(null);
  const [qualityHistory, setQualityHistory] = useState<DeliveryLocationQualityLog[]>([]);
  const [qualityStats, setQualityStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load accuracy settings and quality data
  const loadLocationAccuracyData = useCallback(async () => {
    if (!deliveryUserId) return;

    try {
      setLoading(true);
      const [settingsData, historyData, statsData] = await Promise.all([
        deliveryLocationAccuracyService.getLocationAccuracySettings(deliveryUserId),
        deliveryLocationAccuracyService.getLocationQualityHistory(deliveryUserId, 20),
        deliveryLocationAccuracyService.getLocationQualityStats(deliveryUserId)
      ]);

      setSettings(settingsData);
      setQualityHistory(historyData);
      setQualityStats(statsData);
    } catch (error) {
      console.error('Error loading location accuracy data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load location accuracy settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [deliveryUserId]);

  // Update settings
  const updateSettings = useCallback(async (updates: Partial<DeliveryLocationAccuracySettings>) => {
    if (!deliveryUserId) return;

    try {
      setIsProcessing(true);
      const updatedSettings = await deliveryLocationAccuracyService.updateLocationAccuracySettings(
        deliveryUserId, 
        updates
      );
      setSettings(updatedSettings);
      toast({
        title: 'Success',
        description: 'Location accuracy settings updated successfully'
      });
      return updatedSettings;
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update location accuracy settings',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  }, [deliveryUserId]);

  // Validate location quality
  const validateLocation = useCallback(async (
    latitude: number,
    longitude: number,
    accuracy?: number,
    provider: LocationProvider = 'gps'
  ) => {
    if (!deliveryUserId) return null;

    try {
      const result = await deliveryLocationAccuracyService.validateLocationQuality(
        deliveryUserId,
        latitude,
        longitude,
        accuracy,
        provider
      );

      // Log the validation result
      await deliveryLocationAccuracyService.logLocationQuality(deliveryUserId, {
        latitude,
        longitude,
        accuracy,
        timestamp_recorded: new Date().toISOString(),
        confidence_score: result.confidence_score,
        location_provider: provider,
        validation_passed: result.is_valid,
        validation_errors: result.validation_errors,
        backup_provider_used: result.should_use_backup
      });

      // Refresh history if validation failed
      if (!result.is_valid) {
        loadLocationAccuracyData();
      }

      return result;
    } catch (error) {
      console.error('Error validating location:', error);
      return null;
    }
  }, [deliveryUserId, loadLocationAccuracyData]);

  // Convenience methods
  const updateAccuracyThreshold = useCallback(async (threshold: number) => {
    return await updateSettings({ minimum_accuracy_threshold: threshold });
  }, [updateSettings]);

  const updateConfidenceThreshold = useCallback(async (threshold: number) => {
    return await updateSettings({ minimum_confidence_score: threshold });
  }, [updateSettings]);

  const setLocationProviders = useCallback(async (primary: LocationProvider, fallback: LocationProvider) => {
    return await updateSettings({ 
      primary_provider: primary, 
      fallback_provider: fallback 
    });
  }, [updateSettings]);

  const toggleStrictEnforcement = useCallback(async (enabled: boolean) => {
    return await updateSettings({ strict_accuracy_enforcement: enabled });
  }, [updateSettings]);

  useEffect(() => {
    loadLocationAccuracyData();
  }, [loadLocationAccuracyData]);

  return {
    // Data
    settings,
    qualityHistory,
    qualityStats,
    loading,
    isProcessing,

    // Methods
    loadLocationAccuracyData,
    updateSettings,
    validateLocation,
    updateAccuracyThreshold,
    updateConfidenceThreshold,
    setLocationProviders,
    toggleStrictEnforcement
  };
}
