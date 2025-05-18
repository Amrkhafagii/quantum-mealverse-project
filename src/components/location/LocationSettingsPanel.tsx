
import React from 'react';
import { Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Platform } from '@/utils/platform'; // Add missing import

export const LocationSettingsPanel = () => {
  const { 
    permissionStatus, 
    backgroundPermissionStatus,
    requestPermissions,
    trackingEnabled,
    enableTracking 
  } = useLocationPermission();

  const handleLocationToggle = async (enabled: boolean) => {
    if (enabled && permissionStatus !== 'granted') {
      const granted = await requestPermissions();
      if (!granted) {
        toast({
          title: 'Location permission required',
          description: 'Please grant location permission to enable tracking',
          variant: 'destructive'
        });
        return;
      }
    }
    
    enableTracking(enabled);
  };

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="flex items-start gap-4">
        <Shield className="h-5 w-5 mt-0.5 text-muted-foreground" />
        <div>
          <h3 className="text-base font-medium">Location Services</h3>
          <p className="text-sm text-muted-foreground">
            Control how the app accesses and uses your location
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="location-tracking" className="font-medium">
              Location Tracking
            </Label>
            <p className="text-xs text-muted-foreground">
              Allow the app to access your location
            </p>
          </div>
          <Switch 
            id="location-tracking"
            checked={trackingEnabled}
            onCheckedChange={handleLocationToggle}
          />
        </div>

        {permissionStatus === 'denied' && (
          <div className="flex items-start gap-2 rounded-md bg-yellow-50 dark:bg-yellow-950 p-3">
            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div className="text-xs text-yellow-600 dark:text-yellow-400">
              <p className="font-medium">Location access is denied</p>
              <p>Please enable location access in your device settings to use this feature.</p>
            </div>
          </div>
        )}

        {Platform.isAndroid() && backgroundPermissionStatus !== 'granted' && trackingEnabled && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => requestPermissions()}
            className="w-full"
          >
            Enable background location
          </Button>
        )}
      </div>
    </div>
  );
};
