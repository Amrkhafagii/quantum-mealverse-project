
import { useState, useEffect } from 'react';

interface BatteryStatus {
  batteryLevel: number | null;
  isLowBattery: boolean;
  isCharging: boolean | null;
}

export function useBatteryStatus(options: { minimumBatteryLevel?: number } = {}): BatteryStatus {
  const { minimumBatteryLevel = 20 } = options;
  const [batteryStatus, setBatteryStatus] = useState<BatteryStatus>({
    batteryLevel: null,
    isLowBattery: false,
    isCharging: null
  });

  useEffect(() => {
    let batteryManager: any = null;

    const updateBatteryStatus = (battery: any) => {
      const level = battery.level * 100;
      const isLow = level <= minimumBatteryLevel;

      setBatteryStatus({
        batteryLevel: level,
        isLowBattery: isLow,
        isCharging: battery.charging
      });
    };

    const initBattery = async () => {
      try {
        if ('getBattery' in navigator) {
          batteryManager = await (navigator as any).getBattery();
          updateBatteryStatus(batteryManager);

          // Add event listeners for battery changes
          batteryManager.addEventListener('levelchange', () => updateBatteryStatus(batteryManager));
          batteryManager.addEventListener('chargingchange', () => updateBatteryStatus(batteryManager));
        } else {
          console.log('Battery Status API not supported');
        }
      } catch (error) {
        console.error('Error accessing Battery Status API:', error);
      }
    };

    initBattery();

    return () => {
      if (batteryManager) {
        batteryManager.removeEventListener('levelchange', updateBatteryStatus);
        batteryManager.removeEventListener('chargingchange', updateBatteryStatus);
      }
    };
  }, [minimumBatteryLevel]);

  return batteryStatus;
}
