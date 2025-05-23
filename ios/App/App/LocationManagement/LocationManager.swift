import CoreLocation
import UIKit

class LocationManager: NSObject {
    static let shared = LocationManager()
    
    // Core location managers
    var locationManager: CLLocationManager?
    private var standardLocationDelegate: StandardLocationDelegate?
    private var significantLocationDelegate: SignificantLocationDelegate?
    
    // Supporting components
    private let batteryMonitor = BatteryMonitor()
    private let locationQualityManager = LocationQualityManager()
    private let hybridPositioningManager = HybridPositioningManager()
    
    // Configuration
    private var isTrackingEnabled = false
    private var useSignificantLocationChanges = false
    private var desiredAccuracy: CLLocationAccuracy = kCLLocationAccuracyBest
    private var distanceFilter: CLLocationDistance = 10.0
    
    // State
    private var lastKnownLocation: CLLocation?
    private var lowPowerModeInitiated = false
    private var manualLocationRequestInProgress = false

    private override init() {
        super.init()
        setupLocationManager()
        batteryMonitor.startMonitoring()
    }
    
    deinit {
        batteryMonitor.stopMonitoring()
    }
    
    // MARK: - Setup
    
    private func setupLocationManager() {
        // Initialize standard location manager
        locationManager = CLLocationManager()
        standardLocationDelegate = StandardLocationDelegate()
        locationManager?.delegate = standardLocationDelegate
        locationManager?.desiredAccuracy = desiredAccuracy
        locationManager?.distanceFilter = distanceFilter
        locationManager?.allowsBackgroundLocationUpdates = true
        locationManager?.pausesLocationUpdatesAutomatically = false
        
        // Set up delegate callbacks
        standardLocationDelegate?.onLocationUpdate = { [weak self] location in
            self?.handleLocationUpdate(location, source: "standard")
        }
        
        standardLocationDelegate?.onError = { [weak self] error in
            self?.handleLocationError(error)
        }
        
        // Initialize significant change location service
        let significantChangeManager = CLLocationManager()
        significantLocationDelegate = SignificantLocationDelegate()
        significantChangeManager.delegate = significantLocationDelegate
        
        significantLocationDelegate?.onLocationUpdate = { [weak self] location in
            self?.handleLocationUpdate(location, source: "significant")
        }
        
        significantLocationDelegate?.onError = { [weak self] error in
            self?.handleLocationError(error)
        }
    }
    
    // MARK: - Location Updates
    
    private func handleLocationUpdate(_ location: CLLocation, source: String) {
        // Check if the location is of acceptable quality
        guard isQualityLocation(location) else {
            locationQualityManager.takePoorQualityAction(
                locationManager: locationManager,
                startHybridPositioningCallback: { [weak self] in
                    self?.hybridPositioningManager.startHybridPositioning()
                }
            )
            return
        }
        
        // Update last known location
        lastKnownLocation = location
        
        // Post location update notification
        postLocationUpdateNotification(location, source: source)
        
        // End manual location request if in progress
        if manualLocationRequestInProgress {
            manualLocationRequestInProgress = false
        }
    }
    
    private func handleLocationError(_ error: Error) {
        print("Location manager error: \(error.localizedDescription)")
        
        // Handle specific error types
        if let clError = error as? CLError {
            switch clError.code {
            case .denied:
                // Location access denied, handle accordingly
                print("Location access was denied by the user.")
                stopLocationUpdates()
            case .locationUnknown:
                // Unable to determine location
                print("Location is unknown.")
            default:
                // Handle other errors
                print("An unexpected location error occurred.")
            }
        }
    }
    
    private func postLocationUpdateNotification(_ location: CLLocation, source: String) {
        // Post a notification with the location data
        NotificationCenter.default.post(
            name: NSNotification.Name("locationUpdate"),
            object: nil,
            userInfo: [
                "latitude": location.coordinate.latitude,
                "longitude": location.coordinate.longitude,
                "accuracy": location.horizontalAccuracy,
                "timestamp": location.timestamp.timeIntervalSince1970 * 1000,
                "source": source
            ]
        )
        
        // Post a separate notification for background fetch
        NotificationCenter.default.post(
            name: NSNotification.Name("locationUpdateAvailable"),
            object: nil,
            userInfo: ["location": location]
        )
    }
    
    // MARK: - Location Permissions
    
    func checkLocationPermission() -> CLAuthorizationStatus {
        // Check current location authorization status
        let authStatus: CLAuthorizationStatus
        if #available(iOS 14.0, *) {
            authStatus = locationManager?.authorizationStatus ?? .notDetermined
        } else {
            authStatus = CLLocationManager.authorizationStatus()
        }
        
        return authStatus
    }
    
    func requestLocationPermission(background: Bool, completion: @escaping (Bool) -> Void) {
        // Request location permissions based on background usage
        let authStatus = checkLocationPermission()
        
        switch authStatus {
        case .notDetermined:
            // Request permission based on background usage
            if background {
                locationManager?.requestAlwaysAuthorization()
            } else {
                locationManager?.requestWhenInUseAuthorization()
            }
            
            // Monitor authorization changes
            NotificationCenter.default.addObserver(forName: NSNotification.Name.CLLocationManagerDidChangeAuthorization, object: nil, queue: .main) { [weak self] _ in
                let newAuthStatus = self?.checkLocationPermission() ?? .notDetermined
                let granted = (newAuthStatus == .authorizedAlways || newAuthStatus == .authorizedWhenInUse)
                completion(granted)
                
                // Remove observer after callback
                NotificationCenter.default.removeObserver(self as Any, name: NSNotification.Name.CLLocationManagerDidChangeAuthorization, object: nil)
            }
        case .restricted, .denied:
            // Permissions denied or restricted
            completion(false)
        case .authorizedAlways, .authorizedWhenInUse:
            // Permissions already granted
            completion(true)
        @unknown default:
            completion(false)
        }
    }
    
    // MARK: - Location Tracking Control
    
    func startLocationUpdates() {
        // Start location updates with current settings
        isTrackingEnabled = true
        startStandardLocationUpdates()
    }
    
    func stopLocationUpdates() {
        // Stop all location updates
        isTrackingEnabled = false
        stopStandardLocationUpdates()
        stopSignificantLocationChanges()
    }
    
    private func startStandardLocationUpdates() {
        // Start standard location updates
        locationManager?.startUpdatingLocation()
    }
    
    private func stopStandardLocationUpdates() {
        // Stop standard location updates
        locationManager?.stopUpdatingLocation()
    }
    
    private func startSignificantLocationChanges() {
        // Start monitoring significant location changes
        locationManager?.startMonitoringSignificantLocationChanges()
    }
    
    private func stopSignificantLocationChanges() {
        // Stop monitoring significant location changes
        locationManager?.stopMonitoringSignificantLocationChanges()
    }
    
    // MARK: - Battery Management
    
    func updateLocationSettingsBasedOnBattery() {
        // Adjust location settings based on battery level
        let batteryLevel = batteryMonitor.getCurrentBatteryLevel()
        let isLowPowerMode = batteryMonitor.isLowPowerModeEnabled()
        
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
    
    // MARK: - Manual Location Request
    
    func requestLocation() {
        // Request a single location update
        manualLocationRequestInProgress = true
        locationManager?.requestLocation()
    }
    
    // MARK: - App Lifecycle Handlers
    
    func handleAppDidBecomeActive() {
        print("App became active - updating location tracking settings")
        if isTrackingEnabled {
            startStandardLocationUpdates()
        }
    }
    
    func handleAppDidEnterBackground() {
        print("App entered background - optimizing location tracking for background")
        if isTrackingEnabled {
            // Switch to lower power tracking when in background
            if useSignificantLocationChanges {
                startSignificantLocationChanges()
                stopStandardLocationUpdates()
            } else {
                // Reduce accuracy to save battery when in background
                locationManager?.desiredAccuracy = kCLLocationAccuracyHundredMeters
                locationManager?.distanceFilter = 50
            }
        }
    }
    
    // MARK: - Background Tasks
    
    func saveCriticalLocationData() {
        // Save any critical location data before app termination
        if let location = lastKnownLocation {
            print("Saving critical location data: \(location.coordinate.latitude), \(location.coordinate.longitude)")
            
            // Extend background execution time
            let taskManager = BackgroundTaskManager.shared
            taskManager.extendBackgroundExecution()
            
            // Perform background save operations
            // (in a real implementation, persist to storage here)
            
            // End background task when complete
            DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                taskManager.endBackgroundTask()
            }
        }
    }
    
    // MARK: - Location Quality Management
    
    func isQualityLocation(_ location: CLLocation) -> Bool {
        return locationQualityManager.isQualityLocation(location)
    }
    
    // MARK: - Cleanup
    
    func cleanup() {
        if let locationManager = locationManager {
            locationManager.stopUpdatingLocation()
            locationManager.stopMonitoringSignificantLocationChanges()
        }
        batteryMonitor.stopMonitoring()
    }
}
