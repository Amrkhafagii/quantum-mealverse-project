
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Sync, 
  Database, 
  Wifi, 
  Battery, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  HardDrive,
  Settings,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { useDataSync } from '@/hooks/useDataSync';
import { formatDistanceToNow } from 'date-fns';

interface DataSynchronizationSettingsProps {
  deliveryUserId: string;
}

export const DataSynchronizationSettings: React.FC<DataSynchronizationSettingsProps> = ({
  deliveryUserId
}) => {
  const {
    settings,
    syncLogs,
    conflicts,
    stats,
    loading,
    isProcessing,
    updateStorageSettings,
    updateSyncFrequency,
    updateConflictResolution,
    performManualSync,
    resolveConflict,
    cleanupOldData
  } = useDataSync(deliveryUserId);

  if (loading) {
    return (
      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <div className="text-quantum-cyan">Loading sync settings...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!settings) {
    return (
      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardContent className="pt-6">
          <div className="text-center text-red-400">
            Failed to load sync settings. Please try refreshing.
          </div>
        </CardContent>
      </Card>
    );
  }

  const storageUsagePercent = stats ? (stats.storage_used_mb / stats.storage_limit_mb) * 100 : 0;

  return (
    <div className="space-y-6">
      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Synchronization Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="storage" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="storage" className="flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                Storage
              </TabsTrigger>
              <TabsTrigger value="frequency" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Frequency
              </TabsTrigger>
              <TabsTrigger value="conflicts" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Conflicts
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex items-center gap-2">
                <Sync className="h-4 w-4" />
                Sync Logs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="storage" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Offline Storage Limits</h3>
                  <Button 
                    onClick={cleanupOldData} 
                    disabled={isProcessing}
                    variant="outline"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Cleanup Old Data
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max-locations">Maximum Offline Locations</Label>
                    <Input
                      id="max-locations"
                      type="number"
                      value={settings.max_offline_locations}
                      onChange={(e) => updateStorageSettings(
                        parseInt(e.target.value),
                        settings.location_storage_duration_days,
                        settings.storage_limit_mb,
                        settings.auto_cleanup_enabled
                      )}
                      min="100"
                      max="10000"
                      step="100"
                    />
                    <p className="text-sm text-muted-foreground">
                      Number of location records to store locally
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="storage-duration">Storage Duration (days)</Label>
                    <Input
                      id="storage-duration"
                      type="number"
                      value={settings.location_storage_duration_days}
                      onChange={(e) => updateStorageSettings(
                        settings.max_offline_locations,
                        parseInt(e.target.value),
                        settings.storage_limit_mb,
                        settings.auto_cleanup_enabled
                      )}
                      min="1"
                      max="365"
                    />
                    <p className="text-sm text-muted-foreground">
                      How long to keep data locally
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="storage-limit">Storage Limit (MB)</Label>
                    <div className="space-y-2">
                      <Slider
                        value={[settings.storage_limit_mb]}
                        onValueChange={(value) => updateStorageSettings(
                          settings.max_offline_locations,
                          settings.location_storage_duration_days,
                          value[0],
                          settings.auto_cleanup_enabled
                        )}
                        max={500}
                        min={10}
                        step={10}
                      />
                      <div className="text-sm text-muted-foreground">
                        {settings.storage_limit_mb} MB limit
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="auto-cleanup"
                        checked={settings.auto_cleanup_enabled}
                        onCheckedChange={(checked) => updateStorageSettings(
                          settings.max_offline_locations,
                          settings.location_storage_duration_days,
                          settings.storage_limit_mb,
                          checked
                        )}
                      />
                      <Label htmlFor="auto-cleanup">Auto Cleanup</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Automatically remove old data when limits are reached
                    </p>
                  </div>
                </div>

                {stats && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Storage Usage</Label>
                      <span className="text-sm text-muted-foreground">
                        {stats.storage_used_mb} MB / {stats.storage_limit_mb} MB
                      </span>
                    </div>
                    <Progress value={storageUsagePercent} className="w-full" />
                    {storageUsagePercent > 80 && (
                      <p className="text-sm text-yellow-600">
                        Storage is nearly full. Consider cleaning up old data.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="frequency" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Sync Frequency Preferences</h3>
                  <Button 
                    onClick={performManualSync} 
                    disabled={isProcessing}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
                    Manual Sync
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="auto-sync"
                        checked={settings.auto_sync_enabled}
                        onCheckedChange={(checked) => updateSyncFrequency(
                          checked,
                          settings.sync_frequency_minutes,
                          settings.wifi_only_sync,
                          settings.battery_optimized_sync
                        )}
                      />
                      <Label htmlFor="auto-sync">Enable Auto Sync</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Automatically sync data at regular intervals
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sync-frequency">Sync Frequency (minutes)</Label>
                    <Select
                      value={settings.sync_frequency_minutes.toString()}
                      onValueChange={(value) => updateSyncFrequency(
                        settings.auto_sync_enabled,
                        parseInt(value),
                        settings.wifi_only_sync,
                        settings.battery_optimized_sync
                      )}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 minute</SelectItem>
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="wifi-only"
                        checked={settings.wifi_only_sync}
                        onCheckedChange={(checked) => updateSyncFrequency(
                          settings.auto_sync_enabled,
                          settings.sync_frequency_minutes,
                          checked,
                          settings.battery_optimized_sync
                        )}
                      />
                      <Label htmlFor="wifi-only" className="flex items-center gap-2">
                        <Wifi className="h-4 w-4" />
                        WiFi Only Sync
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Only sync when connected to WiFi
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="battery-optimized"
                        checked={settings.battery_optimized_sync}
                        onCheckedChange={(checked) => updateSyncFrequency(
                          settings.auto_sync_enabled,
                          settings.sync_frequency_minutes,
                          settings.wifi_only_sync,
                          checked
                        )}
                      />
                      <Label htmlFor="battery-optimized" className="flex items-center gap-2">
                        <Battery className="h-4 w-4" />
                        Battery Optimized
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Reduce sync frequency when battery is low
                    </p>
                  </div>
                </div>

                {stats && (
                  <div className="space-y-2">
                    <Separator />
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-400">{stats.successful_syncs}</div>
                        <div className="text-sm text-muted-foreground">Successful</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-400">{stats.failed_syncs}</div>
                        <div className="text-sm text-muted-foreground">Failed</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-400">{stats.average_sync_duration}ms</div>
                        <div className="text-sm text-muted-foreground">Avg Duration</div>
                      </div>
                    </div>
                    {stats.last_sync_time && (
                      <div className="text-center text-sm text-muted-foreground">
                        Last sync: {formatDistanceToNow(new Date(stats.last_sync_time))} ago
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="conflicts" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Conflict Resolution Preferences</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location-strategy">Location Conflict Strategy</Label>
                    <Select
                      value={settings.location_conflict_strategy}
                      onValueChange={(value) => updateConflictResolution(
                        value,
                        settings.settings_conflict_strategy,
                        settings.auto_resolve_conflicts,
                        settings.prompt_for_manual_resolution
                      )}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="server_wins">Server Wins</SelectItem>
                        <SelectItem value="client_wins">Client Wins</SelectItem>
                        <SelectItem value="timestamp_wins">Newest Wins</SelectItem>
                        <SelectItem value="merge">Smart Merge</SelectItem>
                        <SelectItem value="manual">Manual Resolution</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="settings-strategy">Settings Conflict Strategy</Label>
                    <Select
                      value={settings.settings_conflict_strategy}
                      onValueChange={(value) => updateConflictResolution(
                        settings.location_conflict_strategy,
                        value,
                        settings.auto_resolve_conflicts,
                        settings.prompt_for_manual_resolution
                      )}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="server_wins">Server Wins</SelectItem>
                        <SelectItem value="client_wins">Client Wins</SelectItem>
                        <SelectItem value="timestamp_wins">Newest Wins</SelectItem>
                        <SelectItem value="merge">Smart Merge</SelectItem>
                        <SelectItem value="manual">Manual Resolution</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="auto-resolve"
                        checked={settings.auto_resolve_conflicts}
                        onCheckedChange={(checked) => updateConflictResolution(
                          settings.location_conflict_strategy,
                          settings.settings_conflict_strategy,
                          checked,
                          settings.prompt_for_manual_resolution
                        )}
                      />
                      <Label htmlFor="auto-resolve">Auto Resolve Conflicts</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Automatically resolve conflicts using the selected strategy
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="prompt-manual"
                        checked={settings.prompt_for_manual_resolution}
                        onCheckedChange={(checked) => updateConflictResolution(
                          settings.location_conflict_strategy,
                          settings.settings_conflict_strategy,
                          settings.auto_resolve_conflicts,
                          checked
                        )}
                      />
                      <Label htmlFor="prompt-manual">Prompt for Manual Resolution</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Show notifications for conflicts requiring manual resolution
                    </p>
                  </div>
                </div>

                {stats && stats.unresolved_conflicts > 0 && (
                  <div className="border border-yellow-500/20 bg-yellow-500/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-yellow-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">
                        {stats.unresolved_conflicts} unresolved conflicts
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Some data conflicts require manual resolution.
                    </p>
                  </div>
                )}

                {conflicts.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Recent Conflicts</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {conflicts.slice(0, 5).map((conflict) => (
                        <div key={conflict.id} className="border rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{conflict.conflict_type}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(conflict.created_at))} ago
                              </span>
                            </div>
                            {conflict.resolved ? (
                              <CheckCircle className="h-4 w-4 text-green-400" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-400" />
                            )}
                          </div>
                          {!conflict.resolved && conflict.requires_user_input && (
                            <Button
                              size="sm"
                              onClick={() => resolveConflict(conflict.id, conflict.server_data)}
                              disabled={isProcessing}
                            >
                              Resolve
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="logs" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Sync Operation Logs</h3>
                
                {syncLogs.length > 0 ? (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {syncLogs.map((log) => (
                      <div key={log.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant={log.success ? "default" : "destructive"}>
                              {log.sync_type}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(log.start_time))} ago
                            </span>
                          </div>
                          {log.success ? (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-400" />
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {log.locations_synced} locations synced • {log.duration_ms}ms
                          {log.conflicts_detected && log.conflicts_detected > 0 && (
                            <> • {log.conflicts_detected} conflicts</>
                          )}
                        </div>
                        {log.error_message && (
                          <div className="text-sm text-red-400 mt-1">
                            Error: {log.error_message}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No sync operations recorded yet
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
