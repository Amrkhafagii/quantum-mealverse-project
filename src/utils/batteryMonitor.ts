
import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

interface BatteryMonitorOptions {
  minimumBatteryLevel?: number;
  checkInterval?: number;
}

/**
 * Hook to monitor device battery level
 */
export function useBatteryMonitor({ 
  minimumBatteryLevel = 15,
  checkInterval = 60000 // 1 minute
}: BatteryMonitorOptions = {}) {
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isLowBattery, setIsLowBattery] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (!isNative) return;

    const checkBattery = async () => {
      try {
        // Use Capacitor to get battery info if available
        if ('BatteryStatus' in window) {
          // @ts-ignore - Using Capacitor plugin that might not be typed
          const batteryInfo = await window.BatteryStatus.getBatteryStatus();
          if (batteryInfo && typeof batteryInfo.batteryLevel === 'number') {
            const level = Math.round(batteryInfo.batteryLevel * 100);
            setBatteryLevel(level);
            setIsLowBattery(level <= minimumBatteryLevel);
          }
        }
      } catch (error) {
        console.error('Error getting battery status:', error);
      }
    };

    // Initial check
    checkBattery();

    // Set up interval for periodic checks
    const batteryCheckInterval = setInterval(checkBattery, checkInterval);

    return () => clearInterval(batteryCheckInterval);
  }, [isNative, minimumBatteryLevel, checkInterval]);

  return { batteryLevel, isLowBattery };
}
