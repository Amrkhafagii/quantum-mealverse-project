
import { useState, useEffect, useCallback } from 'react';
import { batteryPerformanceService } from '@/services/batteryPerformanceService';
import { BatteryPerformanceSettings } from '@/types/batteryPerformance';
import { toast } from '@/hooks/use-toast';

export function useBatteryPerformanceSettings(deliveryUserId?: string) {
  const [settings, setSettings] = useState<BatteryPerformanceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState<number>(100);
  const [networkQuality, setNetworkQuality] = useState<'wifi' | 'cellular' | 'poor' | 'offline'>('cellular');

  // Load settings
  const loadSettings = useCallback(async () => {
    if (!deliveryUserId) return;

    try {
      setLoading(true);
      const data = await batteryPerformanceService.getBatteryPerformanceSettings(deliveryUserId);
      setSettings(data);
    } catch (error) {
      console.error('Error loading battery performance settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load battery performance settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [deliveryUserId]);

  // Update settings
  const updateSettings = useCallback(async (updates: Partial<BatteryPerformanceSettings>) => {
    if (!deliveryUserId) return;

    try {
      setIsProcessing(true);
      const updatedSettings = await batteryPerformanceService.updateBatteryPerformanceSettings(
        deliveryUserId,
        updates
      );
      
      if (updatedSettings) {
        setSettings(updatedSettings);
        toast({
          title: 'Settings Updated',
          description: 'Battery performance settings have been saved',
        });
      }
    } catch (error) {
      console.error('Error updating battery performance settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update battery performance settings',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  }, [deliveryUserId]);

  // Monitor battery level
  const monitorBattery = useCallback(async () => {
    const level = await batteryPerformanceService.getCurrentBatteryLevel();
    setBatteryLevel(level);
  }, []);

  // Monitor network quality
  const monitorNetwork = useCallback(async () => {
    const quality = await batteryPerformanceService.getNetworkQuality();
    setNetworkQuality(quality);
  }, []);

  // Calculate optimal tracking configuration
  const getOptimalTrackingConfig = useCallback((isMoving: boolean = false) => {
    if (!settings) return null;

    const interval = batteryPerformanceService.calculateOptimalTrackingInterval(
      settings,
      batteryLevel,
      networkQuality,
      isMoving
    );

    const distanceFilter = batteryPerformanceService.getDistanceFilter(
      settings,
      batteryLevel,
      isMoving
    );

    return {
      interval,
      distanceFilter,
      enableHighAccuracy: settings.tracking_mode === 'high' || 
        (settings.tracking_mode === 'adaptive' && batteryLevel >= settings.battery_high_threshold),
      backgroundProcessing: settings.background_processing_enabled,
      locationBatching: settings.location_batching_enabled,
      batchSize: settings.batch_size,
      batchTimeout: settings.batch_timeout_seconds * 1000
    };
  }, [settings, batteryLevel, networkQuality]);

  // Initialize
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Set up monitoring intervals
  useEffect(() => {
    const batteryInterval = setInterval(monitorBattery, 30000); // Every 30 seconds
    const networkInterval = setInterval(monitorNetwork, 60000); // Every minute

    // Initial check
    monitorBattery();
    monitorNetwork();

    return () => {
      clearInterval(batteryInterval);
      clearInterval(networkInterval);
    };
  }, [monitorBattery, monitorNetwork]);

  return {
    settings,
    loading,
    isProcessing,
    batteryLevel,
    networkQuality,
    updateSettings,
    loadSettings,
    getOptimalTrackingConfig
  };
}
