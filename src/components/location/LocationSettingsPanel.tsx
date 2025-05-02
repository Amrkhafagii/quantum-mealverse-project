
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MapPin, AlertCircle, Clock, Settings } from 'lucide-react';

const LocationSettingsPanel = () => {
  const { 
    permissionStatus, 
    location,
    trackingEnabled,
    toggleTracking,
    requestPermission,
    lastUpdated,
  } = useLocationPermission();
  
  const formatDate = (date: Date | null) => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(date);
  };

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-quantum-cyan" />
          Location Settings
        </CardTitle>
        <CardDescription>
          Manage how we use your location data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="location-tracking">Location Tracking</Label>
            <p className="text-sm text-gray-400">
              Enable to see nearby restaurants and get delivery estimates
            </p>
          </div>
          <Switch
            id="location-tracking"
            checked={trackingEnabled}
            onCheckedChange={toggleTracking}
          />
        </div>
        
        {permissionStatus === 'denied' && (
          <div className="bg-red-900/20 border border-red-700/30 rounded-md p-3 text-sm">
            <div className="flex gap-2">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
              <p>
                Location access has been denied in your browser settings. 
                Please enable location services to use all features.
              </p>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          <div className="p-3 bg-quantum-black/50 rounded-md">
            <div className="text-xs text-gray-400 mb-1">Location Status</div>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                permissionStatus === 'granted' ? 'bg-green-500' : 
                permissionStatus === 'prompt' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span>
                {permissionStatus === 'granted' ? 'Allowed' : 
                 permissionStatus === 'prompt' ? 'Not Set' : 'Denied'}
              </span>
            </div>
          </div>
          
          <div className="p-3 bg-quantum-black/50 rounded-md">
            <div className="text-xs text-gray-400 mb-1">Last Updated</div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1 text-gray-400" />
              <span>{formatDate(lastUpdated)}</span>
            </div>
          </div>
          
          <div className="p-3 bg-quantum-black/50 rounded-md">
            <div className="text-xs text-gray-400 mb-1">Update Frequency</div>
            <div className="flex items-center">
              <Settings className="h-4 w-4 mr-1 text-gray-400" />
              <span>Every 15 minutes</span>
            </div>
          </div>
        </div>
        
        {location && (
          <div className="p-3 bg-quantum-black/50 rounded-md mt-2">
            <div className="text-xs text-gray-400 mb-1">Current Location</div>
            <div className="font-mono text-sm">
              {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </div>
          </div>
        )}
        
        <div className="pt-4">
          <Button 
            onClick={requestPermission} 
            disabled={permissionStatus === 'granted' || permissionStatus === 'denied'}
            variant="outline"
            className="w-full"
          >
            <MapPin className="h-4 w-4 mr-2" />
            {permissionStatus === 'denied' ? 'Location Access Denied' :
             permissionStatus === 'granted' ? 'Location Access Granted' : 'Request Location Access'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationSettingsPanel;
