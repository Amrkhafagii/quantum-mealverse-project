
import { useState, useEffect, useCallback } from 'react';
import { 
  areNotificationsSupported,
  checkNotificationPermissions,
  requestNotificationPermissions,
  initializePushNotifications,
  initializeLocalNotifications
} from '@/services/notification/mobileNotificationService';
import { useConnectionStatus } from './useConnectionStatus';
import { Platform } from '@/utils/platform';
import { useToast } from './use-toast';

export const useNotificationPermissions = () => {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [pushPermissionGranted, setPushPermissionGranted] = useState<boolean>(false);
  const [localPermissionGranted, setLocalPermissionGranted] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { isOnline } = useConnectionStatus();
  const { toast } = useToast();

  // Check if notifications are supported on this device
  useEffect(() => {
    const supported = areNotificationsSupported();
    setIsSupported(supported);

    if (!supported) {
      setIsLoading(false);
    }
  }, []);

  // Check current permissions status when component mounts
  useEffect(() => {
    const checkPermissions = async () => {
      if (!isSupported) return;

      try {
        const { push, local } = await checkNotificationPermissions();
        setPushPermissionGranted(push);
        setLocalPermissionGranted(local);
        
        // If permissions are granted, initialize
        if (push || local) {
          await initializeNotifications();
        }
      } catch (error) {
        console.error('Error checking notification permissions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkPermissions();
  }, [isSupported]);

  // Initialize notifications system
  const initializeNotifications = useCallback(async () => {
    if (!isSupported || !isOnline || isInitialized) return false;

    setIsLoading(true);
    try {
      let initialized = false;
      
      // Try to initialize push notifications first
      if (pushPermissionGranted) {
        const pushResult = await initializePushNotifications();
        initialized = pushResult || initialized;
      }
      
      // Then initialize local notifications
      if (localPermissionGranted) {
        const localResult = await initializeLocalNotifications();
        initialized = localResult || initialized;
      }
      
      setIsInitialized(initialized);
      return initialized;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, isOnline, isInitialized, pushPermissionGranted, localPermissionGranted]);

  // Request permissions from the user
  const requestPermissions = useCallback(async () => {
    if (!isSupported) {
      toast({
        title: "Not supported",
        description: "Notifications are not supported on this device.",
        variant: "destructive"
      });
      return false;
    }

    setIsLoading(true);
    try {
      const { push, local } = await requestNotificationPermissions();
      setPushPermissionGranted(push);
      setLocalPermissionGranted(local);
      
      if (push || local) {
        const initialized = await initializeNotifications();
        return initialized;
      }
      
      return false;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      toast({
        title: "Permission Error",
        description: "Could not request notification permissions.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, initializeNotifications, toast]);

  return {
    isSupported,
    pushPermissionGranted,
    localPermissionGranted,
    isPermissionGranted: pushPermissionGranted || localPermissionGranted,
    isInitialized,
    isLoading,
    requestPermissions,
    initializeNotifications
  };
};
