
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { MapPin, Shield, Clock } from 'lucide-react';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import { formatDistanceToNow } from 'date-fns';

const LocationSettingsPanel: React.FC = () => {
  const { 
    permissionStatus, 
    trackingEnabled, 
    isTracking,
    toggleTracking
  } = useLocationPermission();

  const handleToggleTracking = async () => {
    await toggleTracking(!trackingEnabled);
  };

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-quantum-cyan" />
          Location Settings
        </CardTitle>
        <CardDescription>Manage how the app uses your location</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="font-medium">Location Tracking</div>
            <div className="text-sm text-gray-400">
              {trackingEnabled 
                ? "Enabled: Get restaurant recommendations near you" 
                : "Disabled: You won't see nearby recommendations"}
            </div>
          </div>
          <Switch
            checked={trackingEnabled}
            onCheckedChange={handleToggleTracking}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="font-medium">Browser Permission</div>
            <div className="text-sm text-gray-400">
              {permissionStatus === 'granted' 
                ? "Granted: Browser has access to your location" 
                : permissionStatus === 'denied'
                ? "Denied: Update your browser settings to enable"
                : "Not set: Permission has not been requested"}
            </div>
          </div>
          <div className="flex h-5 w-5 items-center justify-center">
            {permissionStatus === 'granted' ? (
              <Shield className="h-5 w-5 text-green-500" />
            ) : permissionStatus === 'denied' ? (
              <Shield className="h-5 w-5 text-red-500" />
            ) : (
              <Shield className="h-5 w-5 text-yellow-500" />
            )}
          </div>
        </div>
        
        {permissionStatus === 'denied' && (
          <div className="rounded-md p-4 bg-quantum-black/40">
            <p className="text-sm text-gray-300">
              Location access is currently denied in your browser settings. To enable:
            </p>
            <ol className="list-decimal list-inside mt-2 text-sm text-gray-400 space-y-1">
              <li>Open your browser settings</li>
              <li>Navigate to Privacy &amp; Security</li>
              <li>Update location permissions for this site</li>
            </ol>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </div>
        )}
        
        <div className="border-t border-quantum-gray/20 pt-4">
          <p className="text-xs text-gray-400">
            Location data is only used while you use the app and is not shared with third parties.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationSettingsPanel;
