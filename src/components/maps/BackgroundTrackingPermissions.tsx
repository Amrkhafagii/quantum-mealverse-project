
import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, AlertCircle } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Geolocation, PermissionStatus } from '@capacitor/geolocation';
import { BackgroundGeolocation } from '@/utils/backgroundGeolocation';
import { toast } from 'sonner';
import { App } from '@capacitor/app';
import { NativeMarket } from '@capacitor-community/native-market';
import { Platform } from '@/utils/platform';

interface BackgroundTrackingPermissionsProps {
  onPermissionGranted?: () => void;
  onTrackingStarted?: () => void;
  onTrackingStopped?: () => void;
}

const BackgroundTrackingPermissions: React.FC<BackgroundTrackingPermissionsProps> = ({
  onPermissionGranted,
  onTrackingStarted,
  onTrackingStopped
}) => {
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [isTrackingEnabled, setIsTrackingEnabled] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  
  // Check permission status on mount
  useEffect(() => {
    checkPermissions();
  }, []);
  
  // Check if permissions are granted
  const checkPermissions = async () => {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      setIsChecking(true);
      
      const status = await Geolocation.checkPermissions();
      
      // Best effort to check background permissions - may not work on all plugins
      let backgroundStatus = { backgroundLocation: 'denied' as PermissionState };
      try {
        // Only call if available
        if (typeof BackgroundGeolocation.checkPermissions === 'function') {
          backgroundStatus = await BackgroundGeolocation.checkPermissions();
        }
      } catch (err) {
        console.log('Background permission check not supported', err);
      }
      
      // Check if both foreground and background permissions are granted
      const isGranted = 
        status.location === 'granted' && 
        backgroundStatus.backgroundLocation === 'granted';
        
      setPermissionStatus(isGranted ? 'granted' : 'denied');
      
      if (isGranted && onPermissionGranted) {
        onPermissionGranted();
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
      toast.error("Could not check location permissions");
    } finally {
      setIsChecking(false);
    }
  };
  
  // Request permissions
  const requestPermissions = async () => {
    if (!Capacitor.isNativePlatform()) {
      toast.error("This feature is only available on mobile devices");
      return;
    }
    
    try {
      setIsChecking(true);
      
      // First request foreground permissions
      const status = await Geolocation.requestPermissions({
        // Remove android/ios specific properties as they're not in the type
        permissions: ['location', 'coarseLocation']
      });
      
      // Then request background permissions if foreground is granted
      if (status.location === 'granted') {
        // Best effort to request background permissions
        let isGranted = false;
        
        try {
          // Only call if available
          if (typeof BackgroundGeolocation.requestPermissions === 'function') {
            const backgroundStatus = await BackgroundGeolocation.requestPermissions();
            isGranted = backgroundStatus.backgroundLocation === 'granted';
          } else {
            // Fallback approach
            console.log('Using fallback for background permissions');
            isGranted = true; // Optimistic
          }
        } catch (err) {
          console.log('Background permission request not supported', err);
        }
        
        setPermissionStatus(isGranted ? 'granted' : 'denied');
        
        if (isGranted) {
          toast.success("Background location permissions granted");
          if (onPermissionGranted) {
            onPermissionGranted();
          }
        } else {
          toast.error("Background location permission is required for real-time tracking");
        }
      } else {
        toast.error("Location permission is required for delivery tracking");
        setPermissionStatus('denied');
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      toast.error("Could not request location permissions");
    } finally {
      setIsChecking(false);
    }
  };
  
  // Open app settings
  const openAppSettings = async () => {
    try {
      // Use appropriate method to open settings based on platform
      if (Platform.isIOS()) {
        // iOS uses settings URL scheme 
        window.location.href = 'app-settings:';
      } else if (Platform.isAndroid()) {
        // For Android, try to use native market
        await NativeMarket.openStoreListing({
          appId: 'app.lovable.117bb8e72e6f4681936555049936510d'
        });
      }
    } catch (error) {
      console.error('Error opening app settings:', error);
      
      // Fallback to system settings
      try {
        await NativeMarket.openStoreListing({
          appId: 'app.lovable.117bb8e72e6f4681936555049936510d'
        });
      } catch (fallbackError) {
        console.error('Error opening store listing:', fallbackError);
        toast.error("Could not open app settings");
      }
    }
  };
  
  // Toggle background tracking
  const toggleTracking = useCallback(async () => {
    if (!Capacitor.isNativePlatform() || permissionStatus !== 'granted') {
      return;
    }
    
    try {
      if (!isTrackingEnabled) {
        // Start tracking
        await BackgroundGeolocation.addWatcher(
          {
            backgroundMessage: "Quantum Mealverse is tracking your location for delivery",
            backgroundTitle: "Location Tracking Active",
            requestPermissions: true,
            stale: false,
            distanceFilter: 10
          },
          (location, err) => {
            if (err) {
              console.error("Error in background tracking:", err);
              return;
            }
            
            if (location) {
              console.log("Background location update:", location);
              // Any additional location handling here
            }
          }
        );
        
        setIsTrackingEnabled(true);
        toast.success("Background tracking started");
        
        if (onTrackingStarted) {
          onTrackingStarted();
        }
      } else {
        // Stop tracking
        await BackgroundGeolocation.removeWatcher({
          id: "background-location-watcher"
        });
        
        setIsTrackingEnabled(false);
        toast.success("Background tracking stopped");
        
        if (onTrackingStopped) {
          onTrackingStopped();
        }
      }
    } catch (error) {
      console.error("Error toggling background tracking:", error);
      toast.error("Could not toggle background tracking");
    }
  }, [isTrackingEnabled, permissionStatus, onTrackingStarted, onTrackingStopped]);

  // Not available on web
  if (!Capacitor.isNativePlatform()) {
    return (
      <Alert className="mb-4 bg-blue-50 border-blue-300">
        <MapPin className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-700">
          Background location tracking is only available on native mobile apps.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {permissionStatus === 'denied' && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Background location permission is required for real-time delivery tracking.
            <Button
              variant="link"
              className="p-0 h-auto font-semibold underline ml-2"
              onClick={openAppSettings}
            >
              Open Settings
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        {permissionStatus === 'prompt' && (
          <Button 
            onClick={requestPermissions} 
            disabled={isChecking}
            className="flex-1"
          >
            <MapPin className="mr-2 h-4 w-4" />
            {isChecking ? "Checking Permissions..." : "Enable Background Tracking"}
          </Button>
        )}
        
        {permissionStatus === 'granted' && (
          <Button 
            onClick={toggleTracking}
            variant={isTrackingEnabled ? "destructive" : "default"}
            className="flex-1"
          >
            <MapPin className="mr-2 h-4 w-4" />
            {isTrackingEnabled ? "Stop Background Tracking" : "Start Background Tracking"}
          </Button>
        )}
      </div>
      
      {isTrackingEnabled && (
        <div className="flex items-center mt-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
          <p className="text-sm text-green-700">Background location tracking active</p>
        </div>
      )}
    </div>
  );
};

export default BackgroundTrackingPermissions;
