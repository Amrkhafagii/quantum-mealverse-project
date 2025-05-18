
import React, { useEffect, useState } from 'react';
import { MapPin, MapPinOff, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import { Platform } from '@/utils/platform';
import { Badge } from '@/components/ui/badge';

export const BackgroundLocationPermissionsPrompt = () => {
  const [androidVersion, setAndroidVersion] = useState<number>(0);
  const {
    permissionStatus,
    backgroundPermissionStatus,
    requestPermission,
    requestBackgroundPermission,
    isRequesting,
    hasEducationalUiBeenShown
  } = useLocationPermission();
  
  // Get Android version on component mount
  useEffect(() => {
    const getAndroidVersion = async () => {
      if (Platform.isAndroid()) {
        const version = await Platform.getAndroidVersion();
        setAndroidVersion(version);
      }
    };
    
    getAndroidVersion();
  }, []);
  
  // Check if we need background permission explanation
  // For Android 10+ (API level 29+), we need to show educational UI
  const needsBackgroundExplanation = Platform.isAndroid() && androidVersion >= 10 && 
    permissionStatus === 'granted' && backgroundPermissionStatus !== 'granted';
  
  // When user has foreground but not background permission and hasn't seen educational UI
  const showEducationalUI = needsBackgroundExplanation && !hasEducationalUiBeenShown;
  
  // Handle permission request
  const handleRequestPermission = async () => {
    if (permissionStatus !== 'granted') {
      await requestPermission();
    } else if (backgroundPermissionStatus !== 'granted') {
      await requestBackgroundPermission();
    }
  };
  
  // Don't show anything if not on Android or if we don't need permissions
  if (!Platform.isAndroid() || 
      (permissionStatus === 'granted' && backgroundPermissionStatus === 'granted') || 
      (!showEducationalUI && backgroundPermissionStatus === 'denied')) {
    return null;
  }
  
  return (
    <Card className="border-yellow-200 dark:border-yellow-800 mb-6">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Location Access</CardTitle>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800">
            Important
          </Badge>
        </div>
        <CardDescription>
          This app requires background location access to function properly
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium">Background location access</p>
              <p className="text-xs text-muted-foreground mt-1">
                This allows the app to track your location even when the app is closed or not in use. This is essential for:
              </p>
              <ul className="list-disc list-inside text-xs text-muted-foreground mt-2 space-y-1 ml-2">
                <li>Sending real-time delivery updates</li>
                <li>Optimizing delivery routes automatically</li>
                <li>Calculating accurate arrival times</li>
              </ul>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <p className="text-xs">
                Your location data is only used while you're on an active delivery and is not stored permanently.
                You can disable this permission anytime in your device settings.
              </p>
            </div>
          </div>
          
          {permissionStatus === 'denied' && (
            <div className="flex items-start gap-3">
              <MapPinOff className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Permission denied</p>
                <p className="text-xs mt-1">
                  Location access has been denied. Please enable location permissions in your device settings.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-3 pt-2">
        {(permissionStatus !== 'granted' || backgroundPermissionStatus !== 'granted') && (
          <Button 
            onClick={handleRequestPermission}
            disabled={isRequesting || permissionStatus === 'denied'}
          >
            {isRequesting ? 'Requesting...' : 
              permissionStatus !== 'granted' ? 
                'Allow location access' : 
                'Allow background location'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
