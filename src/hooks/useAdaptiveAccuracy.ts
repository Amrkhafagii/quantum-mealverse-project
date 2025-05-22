import { useState, useEffect, useCallback } from 'react';
import { Device } from '@capacitor/device';
import { Network } from '@capacitor/network';
import { Capacitor } from '@capacitor/core';
import { NetworkType } from '@/types/unifiedLocation';

interface AccuracySettings {
  enableHighAccuracy: boolean;
  timeout: number;
  maximumAge: number;
  minimumDistance?: number; // meters
  updateInterval?: number;  // milliseconds
}

interface AdaptiveAccuracyOptions {
  activityContext?: 'stationary' | 'walking' | 'driving' | 'unknown';
  batteryThreshold?: number; // percentage below which to reduce accuracy
  networkRequired?: boolean; // whether network is required for the feature
}

export const useAdaptiveAccuracy = (options: AdaptiveAccuracyOptions = {}) => {
  const {
    activityContext = 'unknown',
    batteryThreshold = 15,
    networkRequired = false
  } = options;
  
  const [accuracySettings, setAccuracySettings] = useState<AccuracySettings>({
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  });
  
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isLowBattery, setIsLowBattery] = useState(false);
  const [networkType, setNetworkType] = useState<NetworkType>('unknown');
  const [isNetworkAvailable, setIsNetworkAvailable] = useState(true);
  
  // Monitor battery level
  const checkBatteryLevel = useCallback(async () => {
    try {
      const info = await Device.getBatteryInfo();
      const level = Math.round(info.batteryLevel * 100);
      setBatteryLevel(level);
      setIsLowBattery(level <= batteryThreshold);
    } catch (error) {
      console.warn('Error checking battery level:', error);
    }
  }, [batteryThreshold]);
  
  // Monitor network status
  const checkNetworkStatus = useCallback(async () => {
    try {
      const status = await Network.getStatus();
      setIsNetworkAvailable(status.connected);
      
      if (status.connectionType === 'wifi') {
        setNetworkType('wifi');
      } else if (status.connectionType === 'cellular') {
        // This is a simplification; in a real app you might want to detect cellular generation
        setNetworkType('cellular_4g');
      } else {
        setNetworkType('unknown');
      }
    } catch (error) {
      console.warn('Error checking network status:', error);
    }
  }, []);
  
  // Update accuracy settings based on context
  const updateAccuracySettings = useCallback(() => {
    // Start with default settings
    let settings: AccuracySettings = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };
    
    // Adjust based on battery level
    if (isLowBattery) {
      settings = {
        ...settings,
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 60000, // 1 minute
        updateInterval: 60000 // 1 minute
      };
    }
    
    // Adjust based on network availability if network is required for the feature
    if (networkRequired && !isNetworkAvailable) {
      settings = {
        ...settings,
        enableHighAccuracy: false,
        maximumAge: 300000, // 5 minutes
        updateInterval: 300000 // 5 minutes
      };
    }
    
    // Adjust based on activity context
    switch (activityContext) {
      case 'stationary':
        settings = {
          ...settings,
          minimumDistance: 50, // Only update if moved 50 meters
          updateInterval: settings.updateInterval || 60000 // 1 minute
        };
        break;
      
      case 'walking':
        settings = {
          ...settings,
          minimumDistance: 10, // Update if moved 10 meters
          updateInterval: settings.updateInterval || 15000 // 15 seconds
        };
        break;
      
      case 'driving':
        settings = {
          ...settings,
          minimumDistance: 100, // Update if moved 100 meters
          updateInterval: settings.updateInterval || 5000 // 5 seconds
        };
        break;
      
      default:
        // For unknown activity, use moderate settings
        settings = {
          ...settings,
          minimumDistance: 25, // Update if moved 25 meters
          updateInterval: settings.updateInterval || 30000 // 30 seconds
        };
    }
    
    // Platform-specific optimizations
    if (Capacitor.isNativePlatform()) {
      // Native platforms can handle more frequent updates efficiently
      if (!isLowBattery) {
        settings.updateInterval = Math.max(settings.updateInterval || 0, 3000);
      }
    } else {
      // Web platform - be more conservative with updates
      settings.updateInterval = Math.max(settings.updateInterval || 0, 10000);
    }
    
    // Update the settings state
    setAccuracySettings(settings);
  }, [activityContext, isLowBattery, isNetworkAvailable, networkRequired]);
  
  // Check status when component mounts and set up listeners
  useEffect(() => {
    checkBatteryLevel();
    checkNetworkStatus();
    updateAccuracySettings();
    
    // Set up event listeners if on native platform
    if (Capacitor.isNativePlatform()) {
      Network.addListener('networkStatusChange', () => {
        checkNetworkStatus();
        updateAccuracySettings();
      });
      
      // Set up interval for battery checks (batteries drain over time)
      const batteryInterval = setInterval(checkBatteryLevel, 60000); // Check battery every minute
      
      return () => {
        clearInterval(batteryInterval);
        Network.removeAllListeners();
      };
    } else {
      // Browser environment
      window.addEventListener('online', checkNetworkStatus);
      window.addEventListener('offline', checkNetworkStatus);
      
      return () => {
        window.removeEventListener('online', checkNetworkStatus);
        window.removeEventListener('offline', checkNetworkStatus);
      };
    }
  }, [checkBatteryLevel, checkNetworkStatus, updateAccuracySettings]);
  
  // Update settings when dependencies change
  useEffect(() => {
    updateAccuracySettings();
  }, [activityContext, isLowBattery, isNetworkAvailable, updateAccuracySettings]);
  
  return {
    accuracySettings,
    batteryLevel,
    isLowBattery,
    networkType,
    isNetworkAvailable
  };
};
