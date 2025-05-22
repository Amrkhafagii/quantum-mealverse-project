
import React, { useState, useEffect } from 'react';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { MapPin, Battery } from 'lucide-react';
import { useResponsive } from '@/contexts/ResponsiveContext';
import ResponsiveContainer from '@/components/ui/responsive-container';
import { Platform } from '@/utils/platform';
import { useAuth } from '@/hooks/useAuth';

export const BackgroundTrackingPermissions: React.FC = () => {
  const { 
    permissionStatus,
    backgroundPermissionStatus,
    requestPermission,
    requestBackgroundPermission
  } = useLocationPermission();
  
  const { user } = useAuth();
  const { isMobile, isPlatformIOS, isPlatformAndroid } = useResponsive();
  const [showAlert, setShowAlert] = useState(false);
  
  useEffect(() => {
    // Check if we should automatically prompt for permissions on mobile
    // Only do this if the user is authenticated and we're on a mobile device
    const autoRequestLocationOnMobile = async () => {
      if (Platform.isNative() && user) {
        // If we're on a mobile device and the permission hasn't been decided yet
        // request it automatically after a short delay
        if (permissionStatus === 'prompt') {
          // Wait a moment to let the app finish initializing
          setTimeout(async () => {
            try {
              await requestPermission();
            } catch (err) {
              console.error("Error auto-requesting location permission:", err);
            }
          }, 1500);
        }
      }
    };
    
    autoRequestLocationOnMobile();
    
    // Check permissions for showing the alert
    if (Platform.isNative() && user) {
      const hasPermission = permissionStatus === "granted" 
        && backgroundPermissionStatus === "granted";
      
      setShowAlert(!hasPermission);
    } else {
      // Don't show the alert if user is not authenticated
      setShowAlert(false);
    }
  }, [permissionStatus, backgroundPermissionStatus, requestPermission, user]);
  
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
    } catch (err) {
      console.error("Error requesting permissions:", err);
    }
  };
  
  // Don't show anything if not on a mobile device or user is not authenticated
  if (!Platform.isNative() || !user || !showAlert) {
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
