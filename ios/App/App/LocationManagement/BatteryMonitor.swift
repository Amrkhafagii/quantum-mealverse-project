
import UIKit

class BatteryMonitor {
    private var batteryLevelMonitoringEnabled: Bool = false
    
    func startMonitoring() {
        // Enable battery monitoring
        UIDevice.current.isBatteryMonitoringEnabled = true
        batteryLevelMonitoringEnabled = true
        
        // Listen for battery level changes
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(batteryLevelDidChange),
            name: UIDevice.batteryLevelDidChangeNotification,
            object: nil
        )
    }
    
    func stopMonitoring() {
        if batteryLevelMonitoringEnabled {
            UIDevice.current.isBatteryMonitoringEnabled = false
            NotificationCenter.default.removeObserver(self, name: UIDevice.batteryLevelDidChangeNotification, object: nil)
            batteryLevelMonitoringEnabled = false
        }
    }
    
    @objc func batteryLevelDidChange(_ notification: Notification) {
        // Update location settings based on battery level
        LocationManager.shared.updateLocationSettingsBasedOnBattery()
    }
    
    func getCurrentBatteryLevel() -> Float {
        return UIDevice.current.batteryLevel
    }
    
    func isLowPowerModeEnabled() -> Bool {
        if #available(iOS 9.0, *) {
            return ProcessInfo.processInfo.isLowPowerModeEnabled
        }
        return false
    }
}
