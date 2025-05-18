
import { useState, useEffect } from 'react';
import { Platform } from '@/utils/platform';

interface BatteryStatus {
  level: number | null;
  charging: boolean | null;
  isLowBattery: boolean;
  batteryPowerSaveMode: boolean;
}

export function useBatteryStatus(): BatteryStatus {
  const [batteryStatus, setBatteryStatus] = useState<BatteryStatus>({
    level: null,
    charging: null,
    isLowBattery: false,
    batteryPowerSaveMode: false,
  });

  useEffect(() => {
    let batteryManager: any = null;
    let powerModeObserver: any = null;

    // Function to get battery information for web
    const getBatteryForWeb = async () => {
      if ('getBattery' in navigator) {
        try {
          batteryManager = await (navigator as any).getBattery();
          
          const updateBatteryStatus = () => {
            const newStatus = {
              level: batteryManager.level,
              charging: batteryManager.charging,
              isLowBattery: batteryManager.level <= 0.2, // 20% or below
              batteryPowerSaveMode: false, // We can't detect this on web
            };
            
            setBatteryStatus(newStatus);
          };
          
          // Initial update
          updateBatteryStatus();
          
          // Listen for changes
          batteryManager.addEventListener('levelchange', updateBatteryStatus);
          batteryManager.addEventListener('chargingchange', updateBatteryStatus);
          
          // Cleanup listeners
          return () => {
            batteryManager.removeEventListener('levelchange', updateBatteryStatus);
            batteryManager.removeEventListener('chargingchange', updateBatteryStatus);
          };
        } catch (e) {
          console.error('Error getting battery status:', e);
        }
      }
    };

    // Function to get battery information for native platforms
    const getBatteryForNative = async () => {
      try {
        if (Platform.isIOS || Platform.isAndroid) {
          // Use the Device plugin from Capacitor (similar to what we do in Platform class)
          const { Device } = require('@capacitor/device');
          
          const info = await Device.getBatteryInfo();
          
          setBatteryStatus({
            level: info.batteryLevel,
            charging: info.isCharging,
            isLowBattery: info.batteryLevel <= 0.2, // 20% or below
            batteryPowerSaveMode: false, // We'd need a separate API for this
          });
          
          // On iOS, we can try to detect Low Power Mode
          if (Platform.isIOS) {
            // This is a placeholder - in a real app we'd use a native module
            console.log('Would check for Low Power Mode on iOS');
          }
          
          // On Android, we can try to detect Battery Saver mode
          if (Platform.isAndroid) {
            // This is a placeholder - in a real app we'd use a native module
            console.log('Would check for Battery Saver mode on Android');
          }
        }
      } catch (e) {
        console.error('Error getting native battery status:', e);
      }
    };

    // Initialize battery status based on platform
    if (Platform.isWeb) {
      getBatteryForWeb();
    } else {
      getBatteryForNative();
    }

    // Cleanup
    return () => {
      if (powerModeObserver) {
        // Cleanup for native observers if needed
      }
    };
  }, []);

  return batteryStatus;
}

export default useBatteryStatus;
