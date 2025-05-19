
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStorage, useStorageMigration } from '@/hooks/useStorage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from '@/components/ui/badge';
import { SyncStatusIndicator } from '@/components/sync/SyncStatusIndicator';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { Platform } from '@/utils/platform';
import { useToast } from '@/hooks/use-toast';
import { useSyncManager } from '@/services/sync/syncManager';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon, Download, Upload, Trash2, RefreshCw } from 'lucide-react';

export function StorageDemo() {
  const [key, setKey] = useState('test-key');
  const [inputValue, setInputValue] = useState('');
  const { value, setValue, removeValue, isLoading, storageType } = useStorage(key, '');
  const { exportStorageData, importStorageData, isExporting, isImporting } = useStorageMigration();
  const [exportedData, setExportedData] = useState('');
  const [importData, setImportData] = useState('');
  const { isOnline } = useConnectionStatus();
  const { toast } = useToast();
  const { clearAllPendingActions, getLastSyncTimestamp, manualSync } = useSyncManager();
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  
  // Get the last sync time on component mount
  useEffect(() => {
    const updateLastSyncTime = async () => {
      const timestamp = await getLastSyncTimestamp();
      if (timestamp) {
        setLastSyncTime(new Date(timestamp).toLocaleString());
      }
    };
    
    updateLastSyncTime();
  }, [getLastSyncTimestamp]);

  const handleSetValue = () => {
    if (inputValue) {
      setValue(inputValue);
      setInputValue('');
      toast({
        title: "Value saved",
        description: `Saved value to "${key}"`,
      });
    }
  };

  const handleRemoveValue = () => {
    removeValue();
    toast({
      title: "Value removed",
      description: `Removed value for "${key}"`,
    });
  };

  const handleExport = async () => {
    const data = await exportStorageData();
    if (data) {
      setExportedData(data);
      toast({
        title: "Data exported",
        description: "All storage data exported successfully",
      });
    } else {
      toast({
        title: "Export failed",
        description: "Could not export storage data",
        variant: "destructive"
      });
    }
  };

  const handleImport = async () => {
    try {
      if (!importData) {
        toast({
          title: "No data to import",
          description: "Please paste data to import",
          variant: "destructive"
        });
        return;
      }
      
      const success = await importStorageData(importData);
      if (success) {
        setImportData('');
        toast({
          title: "Data imported",
          description: "Storage data imported successfully",
        });
      } else {
        throw new Error("Import failed");
      }
    } catch (error) {
      toast({
        title: "Import failed",
        description: "Could not import storage data. Is it valid?",
        variant: "destructive"
      });
    }
  };

  const handleClearPendingActions = async () => {
    await clearAllPendingActions();
    toast({
      title: "Pending actions cleared",
      description: "All pending offline actions have been removed",
    });
  };

  const handleForceSync = async () => {
    if (!isOnline) {
      toast({
        title: "You're offline",
        description: "Connect to the internet to sync your data",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Syncing...",
      description: "Forcing immediate sync of pending actions",
    });
    
    const success = await manualSync();
    
    if (success) {
      toast({
        title: "Sync completed",
        description: "All pending actions have been processed",
      });
      
      const timestamp = await getLastSyncTimestamp();
      if (timestamp) {
        setLastSyncTime(new Date(timestamp).toLocaleString());
      }
    } else {
      toast({
        title: "Sync incomplete",
        description: "Some actions could not be processed",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Storage Demo</h1>
        <SyncStatusIndicator showLabel={true} />
      </div>
      
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Storage Information</AlertTitle>
        <AlertDescription>
          Currently using: <Badge variant="outline">{storageType}</Badge>
          <p className="mt-2 text-sm text-muted-foreground">
            Platform: {Platform.isNative() ? 'Native App' : 'Web Browser'}
            {' · '}
            Network: {isOnline ? 'Online' : 'Offline'}
          </p>
          {lastSyncTime && (
            <p className="mt-1 text-sm text-muted-foreground">
              Last sync: {lastSyncTime}
            </p>
          )}
        </AlertDescription>
      </Alert>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Test Storage</CardTitle>
            <CardDescription>Test basic storage operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Storage key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Value to store"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Button onClick={handleSetValue}>Save</Button>
            </div>
            <div>
              <p className="text-sm mb-2">Current value:</p>
              <div className="p-2 border rounded-md bg-muted">
                {isLoading ? 'Loading...' : value === null ? 'null' : String(value)}
              </div>
              <Button 
                onClick={handleRemoveValue} 
                variant="destructive" 
                size="sm"
                className="mt-2"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Sync Options</CardTitle>
            <CardDescription>Manage offline sync and data migration</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="migration">
              <TabsList className="mb-4">
                <TabsTrigger value="migration">Data Migration</TabsTrigger>
                <TabsTrigger value="sync">Sync Management</TabsTrigger>
              </TabsList>
              
              <TabsContent value="migration" className="space-y-4">
                <div>
                  <Button 
                    onClick={handleExport}
                    disabled={isExporting}
                    className="mb-2"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isExporting ? 'Exporting...' : 'Export Data'}
                  </Button>
                  <Textarea 
                    placeholder="Exported data will appear here"
                    value={exportedData}
                    className="h-[100px]"
                    readOnly
                  />
                </div>
                
                <div>
                  <Button 
                    onClick={handleImport}
                    disabled={isImporting || !importData}
                    className="mb-2"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isImporting ? 'Importing...' : 'Import Data'}
                  </Button>
                  <Textarea 
                    placeholder="Paste exported data here to import"
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    className="h-[100px]"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="sync" className="space-y-4">
                <div className="flex items-center justify-between">
                  <Button 
                    onClick={handleClearPendingActions}
                    variant="outline"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Pending Actions
                  </Button>
                  
                  <Button onClick={handleForceSync}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Force Sync Now
                  </Button>
                </div>
                
                {Platform.isNative() && (
                  <div className="mt-4 p-4 border rounded-md">
                    <h3 className="font-medium mb-2">Native Background Sync</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Background sync is enabled for this app. Your data will sync automatically.
                    </p>
                    {lastSyncTime && (
                      <p className="text-xs">Last background sync: {lastSyncTime}</p>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
