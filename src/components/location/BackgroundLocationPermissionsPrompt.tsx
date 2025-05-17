
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, AlertTriangle, Info } from 'lucide-react';
import { useLocationPermissions } from '@/hooks/useLocationPermissions';
import { Platform } from '@/utils/platform';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface BackgroundLocationPermissionsPromptProps {
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
  dismissable?: boolean;
  onDismiss?: () => void;
  compact?: boolean;
}

const BackgroundLocationPermissionsPrompt: React.FC<BackgroundLocationPermissionsPromptProps> = ({
  onPermissionGranted,
  onPermissionDenied,
  dismissable = true,
  onDismiss,
  compact = false
}) => {
  const { 
    permissionStatus, 
    backgroundPermissionStatus,
    requestPermission, 
    requestBackgroundPermission, 
    isRequesting,
    hasEducationalUiBeenShown
  } = useLocationPermissions();

  const isAndroid10OrAbove = Platform.isAndroid() && Platform.getAndroidVersion() >= 10;
  const needsBackgroundPermission = Platform.isAndroid() && 
                                    backgroundPermissionStatus !== 'granted' &&
                                    permissionStatus === 'granted';

  const handleRequestPermission = async () => {
    // First request regular location permission if not already granted
    if (permissionStatus !== 'granted') {
      const result = await requestPermission();
      if (!result) {
        if (onPermissionDenied) onPermissionDenied();
        return;
      }
    }

    // If on Android 10+ and need background permission, request it
    if (isAndroid10OrAbove && needsBackgroundPermission) {
      const result = await requestBackgroundPermission();
      if (result && onPermissionGranted) {
        onPermissionGranted();
      } else if (!result && onPermissionDenied) {
        onPermissionDenied();
      }
    } else if (onPermissionGranted) {
      onPermissionGranted();
    }
  };

  // If all permissions are granted or we're not on Android, don't show
  if ((permissionStatus === 'granted' && (!isAndroid10OrAbove || backgroundPermissionStatus === 'granted')) ||
      !Platform.isNative()) {
    return null;
  }

  return (
    <Card className={compact ? "border-quantum-cyan/20" : "holographic-card"}>
      <CardHeader className={compact ? "p-4" : "p-6"}>
        <CardTitle className="flex items-center gap-2 text-quantum-cyan">
          <MapPin className="h-5 w-5" />
          {isAndroid10OrAbove && needsBackgroundPermission
            ? "Background Location Required"
            : "Enable Location Services"}
        </CardTitle>
      </CardHeader>
      <CardContent className={compact ? "p-4 pt-0" : "p-6 pt-0"}>
        <div className="space-y-4">
          {isAndroid10OrAbove && needsBackgroundPermission ? (
            <>
              <Alert variant="default" className="bg-blue-900/30 border-blue-500/30">
                <Info className="h-4 w-4 text-blue-400" />
                <AlertTitle>Background Location Access</AlertTitle>
                <AlertDescription>
                  To track deliveries even when the app is closed, we need permission to access your location in the background. This helps optimize delivery routes and provide accurate ETAs.
                </AlertDescription>
              </Alert>
              <p className="text-gray-300 text-sm">
                When prompted, please select "Allow all the time" to enable background location tracking.
              </p>
            </>
          ) : (
            <p className="text-gray-300">
              We need your location to find restaurants near you and provide personalized meal recommendations.
            </p>
          )}
          
          {permissionStatus === 'denied' && (
            <Alert variant="destructive" className="bg-red-900/20 border-red-700/30">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertTitle>Permission Denied</AlertTitle>
              <AlertDescription>
                Location access is denied. Please enable location services in your device settings to use this feature.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter className={compact ? "p-4 pt-0 flex justify-between" : "p-6 pt-0 flex justify-between"}>
        <div className="flex gap-2">
          <Button
            onClick={handleRequestPermission}
            disabled={isRequesting || permissionStatus === 'denied'}
            className="bg-quantum-cyan hover:bg-quantum-cyan/80 text-quantum-black"
          >
            {isRequesting ? 'Requesting...' : (
              isAndroid10OrAbove && needsBackgroundPermission 
                ? 'Enable Background Location' 
                : 'Enable Location'
            )}
          </Button>
          
          {dismissable && (
            <Button
              variant="ghost"
              onClick={onDismiss}
              className="border border-gray-700"
            >
              Not Now
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default BackgroundLocationPermissionsPrompt;
