
import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Settings } from "lucide-react";
import { useLocationPermission } from "@/hooks/useLocationPermission";
import { Platform } from "@/utils/platform";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/components/ui/use-toast';

export const BackgroundTrackingPermissions = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [androidVersion, setAndroidVersion] = useState<number>(0);
  const {
    permissionStatus,
    backgroundPermissionStatus,
    requestPermission,
    requestBackgroundPermission,
    isRequesting
  } = useLocationPermission();

  // Get Android version when component mounts
  useEffect(() => {
    const getVersion = async () => {
      if (Platform.isAndroid()) {
        const version = await Platform.getAndroidVersion();
        setAndroidVersion(version);
      }
    };

    getVersion();
  }, []);

  // Only show for Android devices that need background permission
  const needsBackgroundPermission = Platform.isAndroid() && 
    (androidVersion >= 10) && 
    permissionStatus === 'granted' && 
    backgroundPermissionStatus !== 'granted';
    
  if (!needsBackgroundPermission) {
    return null;
  }

  const handleRequestPermission = async () => {
    if (permissionStatus !== 'granted') {
      const granted = await requestPermission();
      if (!granted) {
        toast({ 
          title: "Permission denied", 
          description: "Location permission is required for delivery tracking",
          variant: "destructive"
        });
        return;
      }
    }
    
    if (backgroundPermissionStatus !== 'granted') {
      const granted = await requestBackgroundPermission();
      if (granted) {
        toast({ 
          title: "Permission granted", 
          description: "Background location is now enabled",
          variant: "default"
        });
      } else {
        toast({ 
          title: "Permission denied", 
          description: "Background location is required for delivery tracking",
          variant: "destructive"
        });
      }
    }
    
    setShowDialog(false);
  };

  return (
    <>
      <Alert variant="warning" className="mb-4 border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-950">
        <MapPin className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        <AlertTitle className="text-yellow-800 dark:text-yellow-300">Background location required</AlertTitle>
        <AlertDescription className="text-yellow-700 dark:text-yellow-400 text-sm">
          To track deliveries properly, this app needs permission to access your location in the background.
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2 border-yellow-300 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900"
            onClick={() => setShowDialog(true)}
          >
            Enable background location
          </Button>
        </AlertDescription>
      </Alert>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Background Location Permission</AlertDialogTitle>
            <AlertDialogDescription>
              For delivery tracking to work properly, the app needs permission to access your location even when the app is not in use.
              
              <div className="mt-4 space-y-2">
                <p className="font-medium text-sm">This permission is needed to:</p>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>Track delivery progress in real-time</li>
                  <li>Calculate accurate delivery times</li>
                  <li>Optimize delivery routes</li>
                  <li>Notify you when deliveries are nearby</li>
                </ul>
              </div>
              
              <div className="mt-4 text-sm">
                Your location data is only used during active deliveries and is not stored permanently.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Later</AlertDialogCancel>
            <AlertDialogAction onClick={handleRequestPermission} disabled={isRequesting}>
              {isRequesting ? "Requesting..." : "Grant Permission"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
