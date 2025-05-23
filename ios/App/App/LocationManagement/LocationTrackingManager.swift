
import CoreLocation

class LocationTrackingManager {
    // Configuration
    private var useSignificantLocationChanges = false
    private var desiredAccuracy: CLLocationAccuracy = kCLLocationAccuracyBest
    private var distanceFilter: CLLocationDistance = 10.0
    
    // State
    private var lowPowerModeInitiated = false
    private var manualLocationRequestInProgress = false
    
    // Apply tracking settings to location manager
    func applyTrackingSettings(to locationManager: CLLocationManager?) {
        locationManager?.desiredAccuracy = desiredAccuracy
        locationManager?.distanceFilter = distanceFilter
    }
    
    // Start standard location updates
    func startStandardLocationUpdates(_ locationManager: CLLocationManager?) {
        locationManager?.startUpdatingLocation()
    }
    
    // Stop standard location updates
    func stopStandardLocationUpdates(_ locationManager: CLLocationManager?) {
        locationManager?.stopUpdatingLocation()
    }
    
    // Start significant location changes
    func startSignificantLocationChanges(_ locationManager: CLLocationManager?) {
        locationManager?.startMonitoringSignificantLocationChanges()
    }
    
    // Stop significant location changes
    func stopSignificantLocationChanges(_ locationManager: CLLocationManager?) {
        locationManager?.stopMonitoringSignificantLocationChanges()
    }
    
    // Stop all location updates
    func stopAllLocationUpdates(_ locationManager: CLLocationManager?) {
        stopStandardLocationUpdates(locationManager)
        stopSignificantLocationChanges(locationManager)
    }
    
    // Request a single location update
    func requestSingleLocationUpdate(_ locationManager: CLLocationManager?) {
        manualLocationRequestInProgress = true
        locationManager?.requestLocation()
    }
    
    // Mark manual location request as complete
    func handleManualRequestCompletion() {
        if manualLocationRequestInProgress {
            manualLocationRequestInProgress = false
        }
    }
    
    // Update settings based on battery state
    func updateSettingsForBatteryState(
        batteryLevel: Float,
        isLowPowerMode: Bool,
        locationManager: CLLocationManager?
    ) {
        if batteryLevel < 0.2 || isLowPowerMode {
            if !lowPowerModeInitiated {
                // Reduce accuracy and distance filter to conserve battery
                desiredAccuracy = kCLLocationAccuracyHundredMeters
                distanceFilter = 100.0
                locationManager?.desiredAccuracy = desiredAccuracy
                locationManager?.distanceFilter = distanceFilter
                lowPowerModeInitiated = true
                print("Low power mode: Reducing location accuracy")
            }
        } else {
            if lowPowerModeInitiated {
                // Restore normal accuracy and distance filter
                desiredAccuracy = kCLLocationAccuracyBest
                distanceFilter = 10.0
                locationManager?.desiredAccuracy = desiredAccuracy
                locationManager?.distanceFilter = distanceFilter
                lowPowerModeInitiated = false
                print("Normal power mode: Restoring location accuracy")
            }
        }
    }
    
    // Handle app becoming active
    func handleAppActivation(_ locationManager: CLLocationManager?) {
        startStandardLocationUpdates(locationManager)
    }
    
    // Handle app entering background
    func handleAppBackground(_ locationManager: CLLocationManager?) {
        if useSignificantLocationChanges {
            startSignificantLocationChanges(locationManager)
            stopStandardLocationUpdates(locationManager)
        } else {
            // Reduce accuracy to save battery when in background
            locationManager?.desiredAccuracy = kCLLocationAccuracyHundredMeters
            locationManager?.distanceFilter = 50
        }
    }
}
