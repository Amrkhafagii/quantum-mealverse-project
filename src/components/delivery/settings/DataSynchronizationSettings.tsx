
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Database, RefreshCw, Settings, Clock, Wifi, Battery, HardDrive, Trash2 } from 'lucide-react';
import { useDataSync } from '@/hooks/useDataSync';
import { formatDistanceToNow } from 'date-fns';

interface DataSynchronizationSettingsProps {
  deliveryUserId: string;
}

export function DataSynchronizationSettings({ deliveryUserId }: DataSynchronizationSettingsProps) {
  const {
    settings,
    syncLogs,
    conflicts,
    stats,
    loading,
    isProcessing,
    updateSettings,
    performManualSync,
    resolveConflict,
    cleanupOldData,
    updateStorageSettings,
    updateSyncFrequency,
    updateConflictResolution
  } = useDataSync(deliveryUserId);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">Loading sync settings...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-400">Failed to load sync settings</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const storagePercentage = stats ? (stats.storage_used_mb / stats.storage_limit_mb) * 100 : 0;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="storage" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="frequency">Sync Frequency</TabsTrigger>
          <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
          <TabsTrigger value="logs">Sync Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="storage">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Offline Storage Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Storage Usage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Storage Usage</Label>
                  <span className="text-sm text-muted-foreground">
                    {stats?.storage_used_mb || 0} MB / {settings.storage_limit_mb} MB
                  </span>
                </div>
                <Progress value={storagePercentage} className="w-full" />
              </div>

              {/* Max Offline Locations */}
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
                  Number of location records to store offline
                </p>
              </div>

              {/* Storage Duration */}
              <div className="space-y-2">
                <Label htmlFor="storage-duration">Storage Duration (Days)</Label>
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
                  How long to keep location data before cleanup
                </p>
              </div>

              {/* Storage Limit */}
              <div className="space-y-2">
                <Label htmlFor="storage-limit">Storage Limit (MB)</Label>
                <Input
                  id="storage-limit"
                  type="number"
                  value={settings.storage_limit_mb}
                  onChange={(e) => updateStorageSettings(
                    settings.max_offline_locations,
                    settings.location_storage_duration_days,
                    parseFloat(e.target.value),
                    settings.auto_cleanup_enabled
                  )}
                  min="10"
                  max="1000"
                  step="10"
                />
                <p className="text-sm text-muted-foreground">
                  Maximum storage space for offline data
                </p>
              </div>

              {/* Auto Cleanup */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto Cleanup</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically remove old data when limits are reached
                  </p>
                </div>
                <Switch
                  checked={settings.auto_cleanup_enabled}
                  onCheckedChange={(checked) => updateStorageSettings(
                    settings.max_offline_locations,
                    settings.location_storage_duration_days,
                    settings.storage_limit_mb,
                    checked
                  )}
                />
              </div>

              <Button
                onClick={cleanupOldData}
                disabled={isProcessing}
                variant="outline"
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clean Up Old Data Now
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="frequency">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Sync Frequency Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Auto Sync */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto Sync Enabled</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically sync data in the background
                  </p>
                </div>
                <Switch
                  checked={settings.auto_sync_enabled}
                  onCheckedChange={(checked) => updateSyncFrequency(
                    checked,
                    settings.sync_frequency_minutes,
                    settings.wifi_only_sync,
                    settings.battery_optimized_sync
                  )}
                />
              </div>

              {/* Sync Frequency */}
              <div className="space-y-2">
                <Label htmlFor="sync-frequency">Sync Interval (Minutes)</Label>
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

              {/* WiFi Only */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4" />
                  <div>
                    <Label>WiFi Only Sync</Label>
                    <p className="text-sm text-muted-foreground">
                      Only sync when connected to WiFi
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.wifi_only_sync}
                  onCheckedChange={(checked) => updateSyncFrequency(
                    settings.auto_sync_enabled,
                    settings.sync_frequency_minutes,
                    checked,
                    settings.battery_optimized_sync
                  )}
                />
              </div>

              {/* Battery Optimized */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Battery className="h-4 w-4" />
                  <div>
                    <Label>Battery Optimized Sync</Label>
                    <p className="text-sm text-muted-foreground">
                      Reduce sync frequency when battery is low
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.battery_optimized_sync}
                  onCheckedChange={(checked) => updateSyncFrequency(
                    settings.auto_sync_enabled,
                    settings.sync_frequency_minutes,
                    settings.wifi_only_sync,
                    checked
                  )}
                />
              </div>

              <Separator />

              {/* Manual Sync */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Manual Sync</Label>
                    <p className="text-sm text-muted-foreground">
                      {stats?.last_sync_time 
                        ? `Last sync: ${formatDistanceToNow(new Date(stats.last_sync_time))} ago`
                        : 'Never synced'
                      }
                    </p>
                  </div>
                  <Button
                    onClick={performManualSync}
                    disabled={isProcessing}
                    size="sm"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conflicts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Conflict Resolution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Location Conflicts Strategy */}
              <div className="space-y-2">
                <Label>Location Conflict Strategy</Label>
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
                    <SelectItem value="merge">Merge Data</SelectItem>
                    <SelectItem value="manual">Manual Resolution</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Settings Conflicts Strategy */}
              <div className="space-y-2">
                <Label>Settings Conflict Strategy</Label>
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
                    <SelectItem value="merge">Merge Data</SelectItem>
                    <SelectItem value="manual">Manual Resolution</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Auto Resolve */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto Resolve Conflicts</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically resolve conflicts using the selected strategy
                  </p>
                </div>
                <Switch
                  checked={settings.auto_resolve_conflicts}
                  onCheckedChange={(checked) => updateConflictResolution(
                    settings.location_conflict_strategy,
                    settings.settings_conflict_strategy,
                    checked,
                    settings.prompt_for_manual_resolution
                  )}
                />
              </div>

              {/* Unresolved Conflicts */}
              {conflicts.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Unresolved Conflicts</Label>
                    <Badge variant="destructive">{conflicts.length}</Badge>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {conflicts.map((conflict) => (
                      <div key={conflict.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{conflict.conflict_type} conflict</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(conflict.created_at))} ago
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => resolveConflict(conflict.id, conflict.server_data)}
                          >
                            Resolve
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Sync Statistics & Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Sync Stats */}
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.successful_syncs}</div>
                    <div className="text-sm text-muted-foreground">Successful</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{stats.failed_syncs}</div>
                    <div className="text-sm text-muted-foreground">Failed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{stats.unresolved_conflicts}</div>
                    <div className="text-sm text-muted-foreground">Conflicts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.average_sync_duration}ms</div>
                    <div className="text-sm text-muted-foreground">Avg Duration</div>
                  </div>
                </div>
              )}

              <Separator />

              {/* Recent Sync Logs */}
              <div className="space-y-2">
                <Label>Recent Sync Operations</Label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {syncLogs.map((log) => (
                    <div key={log.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant={log.success ? "default" : "destructive"}>
                              {log.sync_type}
                            </Badge>
                            <span className="text-sm">{log.operation_type}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(log.start_time))} ago
                            {log.duration_ms && ` • ${log.duration_ms}ms`}
                            {log.locations_synced && ` • ${log.locations_synced} locations`}
                          </p>
                        </div>
                        {!log.success && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      {log.error_message && (
                        <p className="text-sm text-red-600 mt-2">{log.error_message}</p>
                      )}
                    </div>
                  ))}
                  {syncLogs.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No sync operations yet</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
