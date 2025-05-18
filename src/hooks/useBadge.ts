
import { useEffect, useState } from 'react';
import { BadgeService } from '@/services/badge/badgeService';
import { Platform } from '@/utils/platform';

export function useBadge() {
  const [badgeCount, setBadgeCount] = useState<number>(0);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(false);
  
  // Check if badges are supported on this platform
  useEffect(() => {
    const checkSupport = async () => {
      const supported = Platform.isNative();
      setIsSupported(supported);
      
      if (supported) {
        // Load current badge count
        const count = await BadgeService.getBadgeCount();
        setBadgeCount(count);
        
        // Check permission status
        const hasPermission = await BadgeService.requestPermission();
        setPermissionGranted(hasPermission);
      }
    };
    
    checkSupport();
  }, []);
  
  // Function to update badge count
  const updateBadgeCount = async (count: number) => {
    if (!isSupported) return false;
    
    const success = await BadgeService.setBadgeCount(count);
    if (success) {
      setBadgeCount(count);
    }
    return success;
  };
  
  // Function to increment badge
  const incrementBadge = async (amount = 1) => {
    if (!isSupported) return false;
    
    const success = await BadgeService.incrementBadge(amount);
    if (success) {
      const newCount = await BadgeService.getBadgeCount();
      setBadgeCount(newCount);
    }
    return success;
  };
  
  // Function to decrement badge
  const decrementBadge = async (amount = 1) => {
    if (!isSupported) return false;
    
    const success = await BadgeService.decrementBadge(amount);
    if (success) {
      const newCount = await BadgeService.getBadgeCount();
      setBadgeCount(newCount);
    }
    return success;
  };
  
  // Function to clear badge
  const clearBadge = async () => {
    if (!isSupported) return false;
    
    const success = await BadgeService.clearBadge();
    if (success) {
      setBadgeCount(0);
    }
    return success;
  };
  
  // Add requestPermission method to match the interface used in components
  const requestPermission = async () => {
    if (!isSupported) return false;
    
    const granted = await BadgeService.requestPermission();
    setPermissionGranted(granted);
    return granted;
  };
  
  return {
    badgeCount,
    permissionGranted,
    isSupported,
    updateBadgeCount,
    incrementBadge,
    decrementBadge,
    clearBadge,
    requestPermission
  };
}
