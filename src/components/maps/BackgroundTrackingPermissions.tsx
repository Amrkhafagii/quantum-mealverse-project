
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import { Platform } from '@/utils/platform';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { nativeServices } from '@/utils/nativeServices';
import { toast } from '@/components/ui/use-toast';

interface BackgroundTrackingPermissionsProps {
  onPermissionChanged?: (granted: boolean) => void;
  showStatus?: boolean;
  compact?: boolean;
}

const BackgroundTrackingPermissions: React.FC<BackgroundTrackingPermissionsProps> = ({
  onPermissionChanged,
  showStatus = true,
  compact = false
}) => {
  const {
    permissionStatus,
    backgroundPermissionStatus,
    requestPermission,
    requestBackgroundPermission,
    isRequesting
  } = useLocationPermission();

  const handleEnableBackgroundTracking = async () => {
    // Request foreground permission if needed
    if (permissionStatus !== 'granted') {
      const foregroundGranted = await requestPermission();
      if (!foregroundGranted) {
        toast({
          title: "Permission Denied",
          description: "Location permission is required for tracking",
          variant: "destructive"
        });
        if (onPermissionChanged) onPermissionChanged(false);
        return;
      }
    }
    
    // Request background permission on Android 10+
    if (Platform.isAndroid()) {
      const backgroundGranted = await requestBackgroundPermission();
      
      if (backgroundGranted) {
        // Start foreground service
        await nativeServices.startLocationTrackingService();
        
        toast({
          title: "Background Tracking Enabled",
          description: "Delivery tracking will work even when the app is in the background",
        });
        
        if (onPermissionChanged) onPermissionChanged(true);
      } else {
        toast({
          title: "Limited Tracking",
          description: "Tracking will only work when the app is open",
          variant: "warning"
        });
        
        if (onPermissionChanged) onPermissionChanged(false);
      }
    }
  };

  if (!Platform.isAndroid() || !showStatus) {
    return null;
  }

  // If we have all permissions, just show status
  if (permissionStatus === 'granted' && backgroundPermissionStatus === 'granted' && showStatus) {
    return (
      <div className="mb-4">
        <Alert variant="default" className="bg-green-900/20 border-green-500/30">
          <CheckCircle2 className="h-4 w-4 text-green-400" />
          <AlertTitle>Background Tracking Enabled</AlertTitle>
          <AlertDescription>
            Delivery tracking is active even when the app is running in the background.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <Card className={`mb-4 ${compact ? "border-quantum-cyan/20" : "holographic-card"}`}>
      <CardHeader className={compact ? "p-4" : "p-6"}>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-quantum-cyan">
            <MapPin className="h-5 w-5" />
            Background Tracking
          </CardTitle>
          
          {permissionStatus === 'granted' && (
            <Badge variant={backgroundPermissionStatus === 'granted' ? "success" : "destructive"}>
              {backgroundPermissionStatus === 'granted' ? "Enabled" : "Limited"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className={compact ? "p-4 pt-0" : "p-6 pt-0"}>
        <div className="space-y-4">
          <Alert variant="default" className="bg-blue-900/30 border-blue-500/30">
            <Info className="h-4 w-4 text-blue-400" />
            <AlertTitle>Enhanced Delivery Tracking</AlertTitle>
            <AlertDescription>
              To optimize deliveries and provide the best experience, we need permission to track location in the background.
              This helps with route optimization and accurate delivery times.
            </AlertDescription>
          </Alert>
          
          {permissionStatus === 'denied' && (
            <Alert variant="destructive" className="bg-red-900/20 border-red-700/30">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertTitle>Location Access Required</AlertTitle>
              <AlertDescription>
                Please enable location access in your device settings before enabling background tracking.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter className={compact ? "p-4 pt-0" : "p-6 pt-0"}>
        <Button
          onClick={handleEnableBackgroundTracking}
          disabled={isRequesting || permissionStatus === 'denied'}
          className="bg-quantum-cyan hover:bg-quantum-cyan/80 text-quantum-black"
        >
          {isRequesting ? 'Requesting...' : 'Enable Background Tracking'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BackgroundTrackingPermissions;
