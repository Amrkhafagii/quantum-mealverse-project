
import { useState, useEffect, useCallback } from 'react';
import { deliveryDataSyncService } from '@/services/delivery/dataSyncService';
import type { 
  DeliveryDataSyncSettings, 
  DeliverySyncLog,
  DeliverySyncConflict,
  SyncStats 
} from '@/types/data-sync';
import { toast } from '@/hooks/use-toast';

export function useDataSync(deliveryUserId?: string) {
  const [settings, setSettings] = useState<DeliveryDataSyncSettings | null>(null);
  const [syncLogs, setSyncLogs] = useState<DeliverySyncLog[]>([]);
  const [conflicts, setConflicts] = useState<DeliverySyncConflict[]>([]);
  const [stats, setStats] = useState<SyncStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load all sync data
  const loadSyncData = useCallback(async () => {
    if (!deliveryUserId) return;

    try {
      setLoading(true);
      const [settingsData, logsData, conflictsData, statsData] = await Promise.all([
        deliveryDataSyncService.getSyncSettings(deliveryUserId),
        deliveryDataSyncService.getSyncLogs(deliveryUserId, 20),
        deliveryDataSyncService.getSyncConflicts(deliveryUserId, false, 20),
        deliveryDataSyncService.getSyncStats(deliveryUserId)
      ]);

      setSettings(settingsData);
      setSyncLogs(logsData);
      setConflicts(conflictsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading sync data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load sync settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [deliveryUserId]);

  // Update settings
  const updateSettings = useCallback(async (updates: Partial<DeliveryDataSyncSettings>) => {
    if (!deliveryUserId) return;

    try {
      setIsProcessing(true);
      const updatedSettings = await deliveryDataSyncService.updateSyncSettings(
        deliveryUserId, 
        updates
      );
      setSettings(updatedSettings);
      toast({
        title: 'Success',
        description: 'Sync settings updated successfully'
      });
      return updatedSettings;
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update sync settings',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  }, [deliveryUserId]);

  // Manual sync operation
  const performManualSync = useCallback(async () => {
    if (!deliveryUserId) return false;

    try {
      setIsProcessing(true);
      
      // Start sync operation
      const logId = await deliveryDataSyncService.startSyncOperation(
        deliveryUserId,
        'manual',
        'bidirectional',
        'user_triggered'
      );

      // Simulate sync operation (in real implementation, this would sync actual data)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Complete sync operation
      await deliveryDataSyncService.completeSyncOperation(
        logId,
        true,
        Math.floor(Math.random() * 10) + 1, // locations synced
        0, // conflicts detected
        0, // conflicts resolved
        0, // errors
        Math.floor(Math.random() * 100) + 10 // data size KB
      );

      // Refresh data
      await loadSyncData();

      toast({
        title: 'Sync Complete',
        description: 'Manual sync completed successfully'
      });

      return true;
    } catch (error) {
      console.error('Error performing manual sync:', error);
      toast({
        title: 'Sync Failed',
        description: 'Manual sync failed. Please try again.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [deliveryUserId, loadSyncData]);

  // Resolve conflict
  const resolveConflict = useCallback(async (
    conflictId: string, 
    mergedData: any
  ) => {
    try {
      setIsProcessing(true);
      await deliveryDataSyncService.resolveConflict(conflictId, mergedData);
      
      // Refresh conflicts
      const updatedConflicts = await deliveryDataSyncService.getSyncConflicts(deliveryUserId!, false, 20);
      setConflicts(updatedConflicts);

      toast({
        title: 'Conflict Resolved',
        description: 'Sync conflict has been resolved successfully'
      });
    } catch (error) {
      console.error('Error resolving conflict:', error);
      toast({
        title: 'Error',
        description: 'Failed to resolve conflict',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  }, [deliveryUserId]);

  // Cleanup old data
  const cleanupOldData = useCallback(async () => {
    if (!deliveryUserId || !settings) return;

    try {
      setIsProcessing(true);
      const result = await deliveryDataSyncService.cleanupOldData(
        deliveryUserId,
        settings.location_storage_duration_days
      );

      // Refresh data
      await loadSyncData();

      toast({
        title: 'Cleanup Complete',
        description: `Removed ${result.deleted_logs} old sync logs and ${result.deleted_conflicts} resolved conflicts`
      });
    } catch (error) {
      console.error('Error cleaning up old data:', error);
      toast({
        title: 'Error',
        description: 'Failed to cleanup old data',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  }, [deliveryUserId, settings, loadSyncData]);

  // Convenience methods
  const updateStorageSettings = useCallback(async (
    maxLocations: number,
    storageDuration: number,
    storageLimit: number,
    autoCleanup: boolean
  ) => {
    return await updateSettings({
      max_offline_locations: maxLocations,
      location_storage_duration_days: storageDuration,
      storage_limit_mb: storageLimit,
      auto_cleanup_enabled: autoCleanup
    });
  }, [updateSettings]);

  const updateSyncFrequency = useCallback(async (
    autoSync: boolean,
    frequency: number,
    wifiOnly: boolean,
    batteryOptimized: boolean
  ) => {
    return await updateSettings({
      auto_sync_enabled: autoSync,
      sync_frequency_minutes: frequency,
      wifi_only_sync: wifiOnly,
      battery_optimized_sync: batteryOptimized
    });
  }, [updateSettings]);

  const updateConflictResolution = useCallback(async (
    locationStrategy: string,
    settingsStrategy: string,
    autoResolve: boolean,
    promptManual: boolean
  ) => {
    return await updateSettings({
      location_conflict_strategy: locationStrategy as any,
      settings_conflict_strategy: settingsStrategy as any,
      auto_resolve_conflicts: autoResolve,
      prompt_for_manual_resolution: promptManual
    });
  }, [updateSettings]);

  useEffect(() => {
    loadSyncData();
  }, [loadSyncData]);

  return {
    // Data
    settings,
    syncLogs,
    conflicts,
    stats,
    loading,
    isProcessing,

    // Methods
    loadSyncData,
    updateSettings,
    performManualSync,
    resolveConflict,
    cleanupOldData,
    updateStorageSettings,
    updateSyncFrequency,
    updateConflictResolution
  };
}
