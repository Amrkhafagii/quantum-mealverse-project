
import { useState, useEffect } from 'react';
import { Platform } from '@/utils/platform';

interface BatteryStatus {
  batteryLevel: number;
  isCharging: boolean;
  isLowBattery: boolean;
  batteryTemperature?: number; // in Celsius
}

interface BatteryMonitorOptions {
  minimumBatteryLevel?: number; // Percentage threshold for low battery
  pollingInterval?: number; // How often to check battery (ms)
}

/**
 * Hook to monitor battery status with optimizations
 */
export function useBatteryMonitor(options: BatteryMonitorOptions = {}) {
  const { 
    minimumBatteryLevel = 15, 
    pollingInterval = 60000 // Default to checking every minute
  } = options;
  
  const [batteryStatus, setBatteryStatus] = useState<BatteryStatus>({
    batteryLevel: 100,
    isCharging: true,
    isLowBattery: false
  });
  
  useEffect(() => {
    let batteryManager: any = null;
    let intervalId: number | null = null;
    
    const updateBatteryStatus = (battery: any) => {
      const newStatus: BatteryStatus = {
        batteryLevel: Math.floor(battery.level * 100),
        isCharging: battery.charging,
        isLowBattery: battery.level * 100 <= minimumBatteryLevel
      };
      
      setBatteryStatus(newStatus);
    };
    
    const initBattery = async () => {
      try {
        // Try to use the Battery API if available
        if ('getBattery' in navigator) {
          // @ts-ignore - getBattery is not in the standard TypeScript definitions
          batteryManager = await navigator.getBattery();
          
          // Update initial status
          updateBatteryStatus(batteryManager);
          
          // Add event listeners for battery changes
          batteryManager.addEventListener('levelchange', () => {
            updateBatteryStatus(batteryManager);
          });
          
          batteryManager.addEventListener('chargingchange', () => {
            updateBatteryStatus(batteryManager);
          });
        } else if (Platform.isNative()) {
          // For native platforms, we would use a native plugin
          // This is placeholder code - in a real app would integrate with Capacitor/Cordova
          console.log('Using native battery API on mobile device');
          
          // Set up polling instead for native platforms
          intervalId = window.setInterval(() => {
            // Mock implementation - in real app would call native API
            const mockBatteryLevel = localStorage.getItem('mockBatteryLevel');
            const level = mockBatteryLevel ? parseInt(mockBatteryLevel, 10) : 75;
            
            setBatteryStatus({
              batteryLevel: level,
              isCharging: false,
              isLowBattery: level <= minimumBatteryLevel
            });
          }, pollingInterval);
        } else {
          // Fallback for platforms without battery API
          console.log('Battery API not available, using default values');
          setBatteryStatus({
            batteryLevel: 100,
            isCharging: true,
            isLowBattery: false
          });
        }
      } catch (error) {
        console.error('Error initializing battery monitor:', error);
        
        // Fallback to a safe default
        setBatteryStatus({
          batteryLevel: 100,
          isCharging: true,
          isLowBattery: false
        });
      }
    };
    
    initBattery();
    
    // Clean up
    return () => {
      if (batteryManager) {
        batteryManager.removeEventListener('levelchange', updateBatteryStatus);
        batteryManager.removeEventListener('chargingchange', updateBatteryStatus);
      }
      
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [minimumBatteryLevel, pollingInterval]);
  
  // Utility function for setting mock battery level (for testing)
  const setMockBatteryLevel = (level: number) => {
    if (level < 0 || level > 100) return;
    localStorage.setItem('mockBatteryLevel', level.toString());
    
    // Immediately update the state as well
    setBatteryStatus(prev => ({
      ...prev,
      batteryLevel: level,
      isLowBattery: level <= minimumBatteryLevel
    }));
  };
  
  return { 
    ...batteryStatus, 
    setMockBatteryLevel // Expose this for testing purposes
  };
}

export default useBatteryMonitor;
