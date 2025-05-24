
import React from 'react';
import { useDeliveryLocationService } from '@/hooks/useDeliveryLocationService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DeliveryLocationControls } from '@/components/delivery/DeliveryLocationControls'; // Fixed import

const DeliverySettings = () => {
  const {
    isTracking,
    trackingMode,
    trackingInterval,
    lastLocation,
    startTracking,
    stopTracking,
    refreshLocation,
    hasLocationPermission,
    requestLocationPermission,
    permissionStatus
  } = useDeliveryLocationService();
  
  const handleToggleTracking = async () => {
    if (isTracking) {
      await stopTracking();
    } else {
      await startTracking();
    }
  };
  
  const handleUpdateLocation = async () => {
    await refreshLocation();
  };
  
  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Delivery Location Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="location-tracking">Location Tracking</Label>
            <Switch 
              id="location-tracking"
              checked={isTracking} 
              onCheckedChange={handleToggleTracking}
            />
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>Current mode: {trackingMode}</p>
            <p>Update interval: {Math.round(trackingInterval / 1000)}s</p>
            <p>Permission status: {permissionStatus}</p>
            {lastLocation && (
              <p className="mt-2">
                Last position: {lastLocation.latitude.toFixed(6)}, {lastLocation.longitude.toFixed(6)}
              </p>
            )}
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button onClick={handleUpdateLocation} variant="outline" size="sm">
              Update Location
            </Button>
            
            {!hasLocationPermission && (
              <Button onClick={requestLocationPermission} variant="default" size="sm">
                Request Permission
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      <DeliveryLocationControls 
        onLocationUpdate={handleUpdateLocation}
        showHelp={true}
      />
      
      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="accuracy">Accuracy</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="background-updates">Background Updates</Label>
                <Switch id="background-updates" />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="high-accuracy">High Accuracy Mode</Label>
                <Switch id="high-accuracy" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="accuracy">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="adaptive-tracking">Adaptive Tracking</Label>
                <Switch id="adaptive-tracking" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="battery-saving">Battery Saving</Label>
                <Switch id="battery-saving" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="motion-detection">Motion Detection</Label>
                <Switch id="motion-detection" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="privacy">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="anonymize-data">Anonymize Data</Label>
                <Switch id="anonymize-data" />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="location-history">Store Location History</Label>
                <Switch id="location-history" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeliverySettings;
