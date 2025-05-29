
import { supabase } from '@/integrations/supabase/client';
import type { 
  DeliveryDataSyncSettings, 
  DeliverySyncLog,
  DeliverySyncConflict,
  SyncStats,
  SyncType,
  OperationType,
  ConflictType,
  ConflictStrategy
} from '@/types/data-sync';

class DeliveryDataSyncService {
  // Sync Settings Management
  async getSyncSettings(deliveryUserId: string): Promise<DeliveryDataSyncSettings | null> {
    const { data, error } = await supabase
      .from('delivery_data_sync_settings')
      .select('*')
      .eq('delivery_user_id', deliveryUserId)
      .single();

    if (error) {
      console.error('Error fetching sync settings:', error);
      throw error;
    }

    if (!data) return null;

    // Cast enum-like fields to proper types
    return {
      ...data,
      location_conflict_strategy: data.location_conflict_strategy as ConflictStrategy,
      settings_conflict_strategy: data.settings_conflict_strategy as ConflictStrategy
    };
  }

  async updateSyncSettings(
    deliveryUserId: string, 
    updates: Partial<DeliveryDataSyncSettings>
  ): Promise<DeliveryDataSyncSettings> {
    const { data, error } = await supabase
      .from('delivery_data_sync_settings')
      .upsert({
        delivery_user_id: deliveryUserId,
        ...updates
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating sync settings:', error);
      throw error;
    }

    // Cast enum-like fields to proper types
    return {
      ...data,
      location_conflict_strategy: data.location_conflict_strategy as ConflictStrategy,
      settings_conflict_strategy: data.settings_conflict_strategy as ConflictStrategy
    };
  }

  // Sync Logging
  async startSyncOperation(
    deliveryUserId: string,
    syncType: SyncType,
    operationType: OperationType,
    syncTrigger?: string,
    networkType?: string,
    connectionQuality?: string,
    batteryLevel?: number
  ): Promise<string> {
    const { data, error } = await supabase
      .rpc('log_sync_operation', {
        p_delivery_user_id: deliveryUserId,
        p_sync_type: syncType,
        p_operation_type: operationType,
        p_sync_trigger: syncTrigger,
        p_network_type: networkType,
        p_connection_quality: connectionQuality,
        p_battery_level: batteryLevel
      });

    if (error) {
      console.error('Error starting sync operation:', error);
      throw error;
    }

    return data;
  }

  async completeSyncOperation(
    logId: string,
    success: boolean,
    locationsSynced: number = 0,
    conflictsDetected: number = 0,
    conflictsResolved: number = 0,
    errorsEncountered: number = 0,
    dataSizeKb: number = 0,
    errorMessage?: string,
    errorDetails?: any
  ): Promise<boolean> {
    const { data, error } = await supabase
      .rpc('complete_sync_operation', {
        p_log_id: logId,
        p_success: success,
        p_locations_synced: locationsSynced,
        p_conflicts_detected: conflictsDetected,
        p_conflicts_resolved: conflictsResolved,
        p_errors_encountered: errorsEncountered,
        p_data_size_kb: dataSizeKb,
        p_error_message: errorMessage,
        p_error_details: errorDetails
      });

    if (error) {
      console.error('Error completing sync operation:', error);
      throw error;
    }

    return data;
  }

  async getSyncLogs(
    deliveryUserId: string, 
    limit: number = 50
  ): Promise<DeliverySyncLog[]> {
    const { data, error } = await supabase
      .from('delivery_sync_logs')
      .select('*')
      .eq('delivery_user_id', deliveryUserId)
      .order('start_time', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching sync logs:', error);
      throw error;
    }

    // Cast enum-like fields to proper types
    return (data || []).map(log => ({
      ...log,
      sync_type: log.sync_type as SyncType,
      operation_type: log.operation_type as OperationType
    }));
  }

  // Conflict Management
  async logSyncConflict(
    deliveryUserId: string,
    syncLogId: string,
    conflictType: ConflictType,
    resourceId: string,
    resourceType: string,
    localData: any,
    serverData: any,
    resolutionStrategy: ConflictStrategy = 'timestamp_wins',
    conflictScore: number = 0.5
  ): Promise<string> {
    const { data, error } = await supabase
      .rpc('log_sync_conflict', {
        p_delivery_user_id: deliveryUserId,
        p_sync_log_id: syncLogId,
        p_conflict_type: conflictType,
        p_resource_id: resourceId,
        p_resource_type: resourceType,
        p_local_data: localData,
        p_server_data: serverData,
        p_resolution_strategy: resolutionStrategy,
        p_conflict_score: conflictScore
      });

    if (error) {
      console.error('Error logging sync conflict:', error);
      throw error;
    }

    return data;
  }

  async getSyncConflicts(
    deliveryUserId: string,
    includeResolved: boolean = false,
    limit: number = 50
  ): Promise<DeliverySyncConflict[]> {
    let query = supabase
      .from('delivery_sync_conflicts')
      .select('*')
      .eq('delivery_user_id', deliveryUserId);

    if (!includeResolved) {
      query = query.eq('resolved', false);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching sync conflicts:', error);
      throw error;
    }

    // Cast enum-like fields to proper types
    return (data || []).map(conflict => ({
      ...conflict,
      conflict_type: conflict.conflict_type as ConflictType,
      resolution_strategy: conflict.resolution_strategy as ConflictStrategy
    }));
  }

  async resolveConflict(
    conflictId: string,
    mergedData: any,
    resolvedBy: string = 'manual'
  ): Promise<DeliverySyncConflict> {
    const { data, error } = await supabase
      .from('delivery_sync_conflicts')
      .update({
        resolved: true,
        resolved_at: new Date().toISOString(),
        resolved_by: resolvedBy,
        merged_data: mergedData
      })
      .eq('id', conflictId)
      .select()
      .single();

    if (error) {
      console.error('Error resolving conflict:', error);
      throw error;
    }

    // Cast enum-like fields to proper types
    return {
      ...data,
      conflict_type: data.conflict_type as ConflictType,
      resolution_strategy: data.resolution_strategy as ConflictStrategy
    };
  }

  // Analytics
  async getSyncStats(deliveryUserId: string): Promise<SyncStats> {
    const { data: logs, error } = await supabase
      .from('delivery_sync_logs')
      .select('*')
      .eq('delivery_user_id', deliveryUserId);

    if (error) {
      console.error('Error fetching sync stats:', error);
      throw error;
    }

    const { data: conflicts } = await supabase
      .from('delivery_sync_conflicts')
      .select('*')
      .eq('delivery_user_id', deliveryUserId);

    const { data: settings } = await supabase
      .from('delivery_data_sync_settings')
      .select('storage_limit_mb')
      .eq('delivery_user_id', deliveryUserId)
      .single();

    const totalSyncs = logs?.length || 0;
    const successfulSyncs = logs?.filter(log => log.success).length || 0;
    const failedSyncs = totalSyncs - successfulSyncs;
    
    const totalConflicts = conflicts?.length || 0;
    const resolvedConflicts = conflicts?.filter(conflict => conflict.resolved).length || 0;
    const unresolvedConflicts = totalConflicts - resolvedConflicts;

    const avgDuration = logs?.reduce((sum, log) => sum + (log.duration_ms || 0), 0) / Math.max(totalSyncs, 1);
    
    const lastSync = logs?.find(log => log.success)?.start_time;
    
    // Estimate storage used (simplified calculation)
    const storageUsed = logs?.reduce((sum, log) => sum + (log.data_size_kb || 0), 0) / 1024 || 0;

    return {
      total_syncs: totalSyncs,
      successful_syncs: successfulSyncs,
      failed_syncs: failedSyncs,
      total_conflicts: totalConflicts,
      resolved_conflicts: resolvedConflicts,
      unresolved_conflicts: unresolvedConflicts,
      average_sync_duration: Math.round(avgDuration),
      last_sync_time: lastSync,
      storage_used_mb: Math.round(storageUsed * 100) / 100,
      storage_limit_mb: settings?.storage_limit_mb || 50
    };
  }

  // Storage Management
  async cleanupOldData(
    deliveryUserId: string,
    olderThanDays: number = 30
  ): Promise<{ deleted_logs: number; deleted_conflicts: number }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    const cutoffIso = cutoffDate.toISOString();

    const { data: deletedLogs, error: logsError } = await supabase
      .from('delivery_sync_logs')
      .delete()
      .eq('delivery_user_id', deliveryUserId)
      .lt('start_time', cutoffIso)
      .select('id');

    if (logsError) {
      console.error('Error cleaning up old sync logs:', logsError);
    }

    const { data: deletedConflicts, error: conflictsError } = await supabase
      .from('delivery_sync_conflicts')
      .delete()
      .eq('delivery_user_id', deliveryUserId)
      .eq('resolved', true)
      .lt('created_at', cutoffIso)
      .select('id');

    if (conflictsError) {
      console.error('Error cleaning up old conflicts:', conflictsError);
    }

    return {
      deleted_logs: deletedLogs?.length || 0,
      deleted_conflicts: deletedConflicts?.length || 0
    };
  }
}

export const deliveryDataSyncService = new DeliveryDataSyncService();
