
import React, { useState, useEffect } from 'react';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { MapPin, Battery } from 'lucide-react';
import { useResponsive } from '@/contexts/ResponsiveContext';
import ResponsiveContainer from '@/components/ui/responsive-container';
import { Platform } from '@/utils/platform';

export const BackgroundTrackingPermissions: React.FC = () => {
  const { 
    permissionStatus,
    backgroundPermissionStatus,
    requestPermission,
    requestBackgroundPermission,
    checkLocationPermissions
  } = useLocationPermission();
  
  const { isMobile, isPlatformIOS, isPlatformAndroid } = useResponsive();
  const [showAlert, setShowAlert] = useState(false);
  
  useEffect(() => {
    // Only check permissions if we're on a mobile device
    if (Platform.isNative()) {
      checkLocationPermissions();
      const hasPermission = permissionStatus === "granted" 
        && backgroundPermissionStatus === "granted";
      
      setShowAlert(!hasPermission);
    }
  }, [permissionStatus, backgroundPermissionStatus, checkLocationPermissions]);
  
  const handleRequestPermission = async () => {
    try {
      // First request regular location permission if not granted
      if (permissionStatus !== "granted") {
        await requestPermission();
      }
      
      // Then request background location if regular is granted
      if (backgroundPermissionStatus !== "granted") {
        await requestBackgroundPermission();
      }
      
      // Check permissions again
      await checkLocationPermissions();
    } catch (err) {
      console.error("Error requesting permissions:", err);
    }
  };
  
  // Don't show anything if not on a mobile device
  if (!Platform.isNative() || !showAlert) {
    return null;
  }
  
  return (
    <ResponsiveContainer respectSafeArea maxWidth="lg">
      <Alert className={`mb-4 ${isMobile ? 'mt-2' : 'mt-4'} border-amber-500`}>
        <MapPin className="h-5 w-5 text-amber-500" />
        <AlertTitle className="text-amber-500">
          Location permissions needed
        </AlertTitle>
        <AlertDescription className="text-sm text-gray-700 dark:text-gray-300">
          <div className="mb-2">
            For the best experience, please enable location permissions.
          </div>
          {isPlatformAndroid && permissionStatus !== "granted" && (
            <div className="mb-1 text-xs opacity-75">
              * Background location helps with order tracking features.
            </div>
          )}
          {isPlatformIOS && (
            <div className="mb-1 text-xs opacity-75">
              <div className="flex items-center gap-1">
                <Battery size={12} />
                <span>We optimize location usage to preserve battery life.</span>
              </div>
            </div>
          )}
          <Button
            size="sm"
            variant="outline"
            className="mt-2 border-amber-500 text-amber-700 hover:bg-amber-50"
            onClick={handleRequestPermission}
          >
            Enable Location
          </Button>
        </AlertDescription>
      </Alert>
    </ResponsiveContainer>
  );
};
