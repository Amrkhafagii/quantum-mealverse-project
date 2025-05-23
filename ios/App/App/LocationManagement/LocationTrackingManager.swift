import CoreLocation

class LocationTrackingManager {
    enum TrackingMode {
        case aggressive
        case balanced
        case conservative
        case batterySaver
    }
    
    // Configuration
    private var currentTrackingMode: TrackingMode = .balanced
    private var useSignificantLocationChanges = false
    private var desiredAccuracy: CLLocationAccuracy = kCLLocationAccuracyBest
    private var distanceFilter: CLLocationDistance = 10.0
    
    // State
    private var lowPowerModeInitiated = false
    private var manualLocationRequestInProgress = false
    private var isMoving = false
    
    // MARK: - Tracking Configuration
    
    func applyTrackingSettings(to locationManager: CLLocationManager?) {
        locationManager?.desiredAccuracy = desiredAccuracy
        locationManager?.distanceFilter = distanceFilter
        locationManager?.pausesLocationUpdatesAutomatically = false
        locationManager?.allowsBackgroundLocationUpdates = true
        locationManager?.activityType = isMoving ? .fitness : .otherNavigation
    }
    
    // MARK: - Movement-based Tracking
    
    func adjustTrackingBasedOnMovement(isMoving: Bool, locationManager: CLLocationManager?) {
        self.isMoving = isMoving
        
        if isMoving {
            desiredAccuracy = kCLLocationAccuracyBest
            distanceFilter = 10.0
            locationManager?.activityType = .fitness
        } else {
            desiredAccuracy = kCLLocationAccuracyHundredMeters
            distanceFilter = 100.0
            locationManager?.activityType = .other
        }
        
        locationManager?.desiredAccuracy = desiredAccuracy
        locationManager?.distanceFilter = distanceFilter
    }
    
    // MARK: - Location Updates Control
    
    func startStandardLocationUpdates(_ locationManager: CLLocationManager?) {
        locationManager?.startUpdatingLocation()
        print("Started standard location updates with accuracy: \(desiredAccuracy), distance filter: \(distanceFilter)")
    }
    
    func stopStandardLocationUpdates(_ locationManager: CLLocationManager?) {
        locationManager?.stopUpdatingLocation()
    }
    
    func startSignificantLocationChanges(_ locationManager: CLLocationManager?) {
        locationManager?.startMonitoringSignificantLocationChanges()
        useSignificantLocationChanges = true
    }
    
    func stopSignificantLocationChanges(_ locationManager: CLLocationManager?) {
        locationManager?.stopMonitoringSignificantLocationChanges()
        useSignificantLocationChanges = false
    }
    
    func stopAllLocationUpdates(_ locationManager: CLLocationManager?) {
        stopStandardLocationUpdates(locationManager)
        stopSignificantLocationChanges(locationManager)
    }
    
    // MARK: - Manual Location Request
    
    func requestSingleLocationUpdate(_ locationManager: CLLocationManager?) {
        manualLocationRequestInProgress = true
        locationManager?.requestLocation()
    }
    
    func handleManualRequestCompletion() {
        manualLocationRequestInProgress = false
    }
    
    // MARK: - Battery State Management
    
    func updateSettingsForBatteryState(
        batteryLevel: Float,
        isLowPowerMode: Bool,
        locationManager: CLLocationManager?
    ) {
        if isLowPowerMode || batteryLevel < 20 {
            enableBatterySaverMode(locationManager)
        } else if batteryLevel < 50 {
            enableConservativeMode(locationManager)
        } else {
            enableBalancedMode(locationManager)
        }
    }
    
    private func enableBatterySaverMode(_ locationManager: CLLocationManager?) {
        desiredAccuracy = kCLLocationAccuracyHundredMeters
        distanceFilter = 200.0
        currentTrackingMode = .batterySaver
        applySettings(locationManager)
        print("Enabled battery saver mode")
    }
    
    private func enableConservativeMode(_ locationManager: CLLocationManager?) {
        desiredAccuracy = kCLLocationAccuracyNearestTenMeters
        distanceFilter = 50.0
        currentTrackingMode = .conservative
        applySettings(locationManager)
        print("Enabled conservative mode")
    }
    
    private func enableBalancedMode(_ locationManager: CLLocationManager?) {
        desiredAccuracy = kCLLocationAccuracyBest
        distanceFilter = 20.0
        currentTrackingMode = .balanced
        applySettings(locationManager)
        print("Enabled balanced mode")
    }
    
    private func applySettings(_ locationManager: CLLocationManager?) {
        locationManager?.desiredAccuracy = desiredAccuracy
        locationManager?.distanceFilter = distanceFilter
    }
    
    // MARK: - App Lifecycle
    
    func handleAppActivation(_ locationManager: CLLocationManager?) {
        desiredAccuracy = kCLLocationAccuracyBest
        distanceFilter = 10.0
        applySettings(locationManager)
        startStandardLocationUpdates(locationManager)
    }
    
    func handleAppBackground(_ locationManager: CLLocationManager?) {
        if useSignificantLocationChanges {
            startSignificantLocationChanges(locationManager)
            stopStandardLocationUpdates(locationManager)
        } else {
            desiredAccuracy = kCLLocationAccuracyHundredMeters
            distanceFilter = 50.0
            applySettings(locationManager)
        }
    }
}
