
import { useState, useEffect } from 'react';
import { Device } from '@capacitor/device';
import { Capacitor } from '@capacitor/core';

interface BatteryMonitorOptions {
  minimumBatteryLevel?: number;
  interval?: number;
}

export function useBatteryMonitor({
  minimumBatteryLevel = 15,
  interval = 60000
}: BatteryMonitorOptions = {}) {
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [isLowBattery, setIsLowBattery] = useState(false);

  useEffect(() => {
    let intervalId: number;
    
    const checkBattery = async () => {
      try {
        if (Capacitor.isNativePlatform()) {
          const batteryInfo = await Device.getBatteryInfo();
          setBatteryLevel(batteryInfo.batteryLevel ? Math.round(batteryInfo.batteryLevel * 100) : null);
          setIsCharging(batteryInfo.isCharging || false);
          
          if (batteryInfo.batteryLevel !== null) {
            setIsLowBattery(batteryInfo.batteryLevel * 100 < minimumBatteryLevel);
          }
        } else {
          // Web environment or simulator - provide mock data
          const mockBatteryLevel = Math.floor(Math.random() * 100);
          setBatteryLevel(mockBatteryLevel);
          setIsCharging(Math.random() > 0.8); // 20% chance of charging
          setIsLowBattery(mockBatteryLevel < minimumBatteryLevel);
        }
      } catch (error) {
        console.error('Failed to get battery info:', error);
        // Provide default values if we can't access the battery
        setBatteryLevel(70); // Arbitrary default
        setIsCharging(false);
        setIsLowBattery(false);
      }
    };
    
    // Check initially
    checkBattery();
    
    // Set up interval to check battery regularly
    intervalId = window.setInterval(checkBattery, interval);
    
    return () => {
      window.clearInterval(intervalId);
    };
  }, [minimumBatteryLevel, interval]);

  return {
    batteryLevel,
    isCharging,
    isLowBattery
  };
}

// Static version of the functions for non-hook usage
export const BatteryOptimization = {
  async getBatteryLevel(): Promise<number> {
    try {
      if (Capacitor.isNativePlatform()) {
        const batteryInfo = await Device.getBatteryInfo();
        return batteryInfo.batteryLevel !== null ? Math.round(batteryInfo.batteryLevel * 100) : 100;
      }
      return 100; // Default for non-native platforms
    } catch (error) {
      console.error('Failed to get battery level:', error);
      return 100; // Default on error
    }
  },
  
  async isChargingNow(): Promise<boolean> {
    try {
      if (Capacitor.isNativePlatform()) {
        const batteryInfo = await Device.getBatteryInfo();
        return batteryInfo.isCharging || false;
      }
      return false; // Default for non-native platforms
    } catch (error) {
      console.error('Failed to get charging status:', error);
      return false; // Default on error
    }
  },
  
  async isLowPowerModeEnabled(): Promise<boolean> {
    // This is a mock implementation as there's no direct way to check
    // low power mode in Capacitor currently
    try {
      if (Capacitor.isNativePlatform()) {
        const batteryInfo = await Device.getBatteryInfo();
        return (batteryInfo.batteryLevel || 1) < 0.2; // Consider low power if < 20%
      }
      return false;
    } catch (error) {
      console.error('Failed to check low power mode:', error);
      return false;
    }
  }
};
