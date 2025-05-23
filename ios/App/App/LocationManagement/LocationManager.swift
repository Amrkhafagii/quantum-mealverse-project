import UIKit
import Capacitor
import CoreLocation
import CoreMotion
import BackgroundTasks
import NetworkExtension

class LocationManager: NSObject {
    static let shared = LocationManager()
    
    // Delegate managers
    private let standardLocationDelegate = StandardLocationDelegate()
    private let significantLocationDelegate = SignificantLocationDelegate()
    
    // Location managers
    var locationManager: CLLocationManager?
    var significantLocationManager: CLLocationManager?
    
    // Sub-managers
    private let batteryMonitor = BatteryMonitor()
    private let locationQualityManager = LocationQualityManager()
    private let hybridPositioningManager = HybridPositioningManager()
    
    // State
    private(set) var isMoving: Bool = true
    
    private override init() {
        super.init()
        setupLocationManager()
        batteryMonitor.startMonitoring()
        
        // Set up delegates
        standardLocationDelegate.onLocationUpdate = { [weak self] location in
            self?.handleLocationUpdate(location)
        }
        
        significantLocationDelegate.onLocationUpdate = { [weak self] location in
            self?.handleLocationUpdate(location)
        }
    }
    
    deinit {
        cleanup()
    }
    
    // MARK: - Setup
    
    func setupLocationManager() {
        // Setup main location manager
        locationManager = CLLocationManager()
        locationManager?.delegate = standardLocationDelegate
        
        // Setup separate manager for significant location changes
        significantLocationManager = CLLocationManager()
        significantLocationManager?.delegate = significantLocationDelegate
        
        // Configure initial settings
        updateLocationSettingsBasedOnBattery()
    }
    
    // MARK: - Permission Handling
    
    func checkLocationPermission() {
        guard let locationManager = locationManager else { return }
        
        let status: CLAuthorizationStatus
        if #available(iOS 14.0, *) {
            status = locationManager.authorizationStatus
        } else {
            status = CLLocationManager.authorizationStatus()
        }
        
        switch status {
        case .notDetermined:
            // Start with requesting when-in-use first
            locationManager.requestWhenInUseAuthorization()
        case .restricted, .denied:
            // Handle denied permissions - could trigger an event for the JS side
            print("Location permissions are denied or restricted")
            NotificationCenter.default.post(name: NSNotification.Name("locationPermissionDenied"), object: nil)
        case .authorizedWhenInUse:
            // User has granted when-in-use permission, show dialog for always allow
            showAlwaysAllowDialog()
        case .authorizedAlways:
            // Full permissions granted, enable background updates
            enableBackgroundLocationUpdates()
        @unknown default:
            print("Unknown location authorization status")
        }
    }
    
    func showAlwaysAllowDialog() {
        // For simplicity, directly request always authorization after a short delay
        Timer.scheduledTimer(withTimeInterval: 2.0, repeats: false) { [weak self] _ in
            self?.locationManager?.requestAlwaysAuthorization()
        }
    }
    
    func enableBackgroundLocationUpdates() {
        guard let locationManager = locationManager else { return }
        
        // Enable background location updates
        locationManager.allowsBackgroundLocationUpdates = true
        locationManager.pausesLocationUpdatesAutomatically = true // Let system optimize pausing
        
        // Start hybrid positioning system
        hybridPositioningManager.startHybridPositioning(locationManager: locationManager, significantLocationManager: significantLocationManager)
        
        // Also start standard updates when in foreground for better accuracy
        locationManager.startUpdatingLocation()
        
        print("Background location updates enabled")
    }
    
    // MARK: - Location Tracking Methods
    
    func startSignificantLocationChanges() {
        guard let significantLocationManager = significantLocationManager,
              CLLocationManager.significantLocationChangeMonitoringAvailable() else {
            print("Significant location change monitoring not available")
            return
        }
        
        // Start monitoring significant location changes
        significantLocationManager.startMonitoringSignificantLocationChanges()
        print("Started monitoring significant location changes")
    }
    
    func pauseHighAccuracyLocationUpdates() {
        guard let locationManager = locationManager else { return }
        
        // Stop standard updates to save battery
        locationManager.stopUpdatingLocation()
        
        // Keep significant location changes running for critical updates
        startSignificantLocationChanges()
    }
    
    func resumeLocationUpdates() {
        guard let locationManager = locationManager else { return }
        
        // If in foreground, restart standard location updates
        if UIApplication.shared.applicationState != .background {
            locationManager.startUpdatingLocation()
        }
    }
    
    // MARK: - Handle Location Updates
    
    private func handleLocationUpdate(_ location: CLLocation) {
        // Process through quality manager first
        if locationQualityManager.isQualityLocation(location) {
            // Add to hybrid locations buffer for processing
            hybridPositioningManager.addToHybridLocationsBuffer(location)
            
            // Report the location
            reportLocationUpdate(location)
        } else {
            // Take action if too many poor quality locations
            locationQualityManager.takePoorQualityAction(
                locationManager: locationManager,
                startHybridPositioningCallback: { [weak self] in
                    guard let self = self else { return }
                    self.hybridPositioningManager.startHybridPositioning(
                        locationManager: self.locationManager, 
                        significantLocationManager: self.significantLocationManager
                    )
                }
            )
        }
    }
    
    // MARK: - Reporting Location Updates
    
    private func reportLocationUpdate(_ location: CLLocation) {
        // When we receive location updates in the background, extend background execution time
        if UIApplication.shared.applicationState == .background {
            BackgroundTaskManager.shared.extendBackgroundExecution()
        }
        
        // Determine source
        let source: String
        if location.horizontalAccuracy <= 20 {
            source = "gps" // High accuracy typical of GPS
        } else if location.horizontalAccuracy <= 65 {
            source = "wifi" // Medium accuracy typical of WiFi
        } else {
            source = "cell_tower" // Lower accuracy typical of cell towers
        }
        
        // Post notification with location data for JS bridge to pick up
        NotificationCenter.default.post(
            name: NSNotification.Name("locationUpdate"),
            object: nil,
            userInfo: [
                "latitude": location.coordinate.latitude,
                "longitude": location.coordinate.longitude,
                "accuracy": location.horizontalAccuracy,
                "timestamp": location.timestamp.timeIntervalSince1970 * 1000,
                "speed": location.speed,
                "isMoving": isMoving,
                "source": source
            ]
        )
        
        // Also post notification for the single location request system
        NotificationCenter.default.post(
            name: NSNotification.Name("locationUpdateAvailable"),
            object: nil,
            userInfo: ["location": location]
        )
    }
    
    // MARK: - Battery-based Settings
    
    func updateLocationSettingsBasedOnBattery() {
        guard let locationManager = locationManager else { return }
        
        let batteryLevel = UIDevice.current.batteryLevel
        
        // If battery level cannot be determined (-1.0) or is above 50%, use high accuracy
        if batteryLevel == -1.0 || batteryLevel > 0.50 {
            locationManager.desiredAccuracy = kCLLocationAccuracyBest
            locationManager.distanceFilter = 10 // Update location when user moves 10 meters
        } 
        // Medium battery (20% - 50%)
        else if batteryLevel > 0.20 {
            locationManager.desiredAccuracy = kCLLocationAccuracyNearestTenMeters
            locationManager.distanceFilter = 25 // Update location when user moves 25 meters
        } 
        // Low battery (below 20%)
        else {
            locationManager.desiredAccuracy = kCLLocationAccuracyHundredMeters
            locationManager.distanceFilter = 50 // Update location when user moves 50 meters
        }
        
        print("Battery level: \(batteryLevel), accuracy: \(locationManager.desiredAccuracy), filter: \(locationManager.distanceFilter)")
    }
    
    // MARK: - Activity-Based Tracking
    
    func setIsMoving(_ moving: Bool) {
        isMoving = moving
        
        if moving {
            print("Device is moving, resuming regular location updates")
            resumeLocationUpdates()
        } else {
            print("Device is stationary, reducing location updates")
            pauseHighAccuracyLocationUpdates()
        }
    }
    
    // MARK: - App State Handling
    
    func handleAppDidEnterBackground() {
        // Make sure we're monitoring significant location changes for battery efficiency
        startSignificantLocationChanges()
        
        // Stop standard location updates in background to save battery
        locationManager?.stopUpdatingLocation()
    }
    
    func handleAppDidBecomeActive() {
        let authStatus: CLAuthorizationStatus
        if #available(iOS 14.0, *), let locationManager = locationManager {
            authStatus = locationManager.authorizationStatus
        } else {
            authStatus = CLLocationManager.authorizationStatus()
        }
        
        // Switch to standard location updates for better accuracy when foregrounded
        if authStatus == .authorizedAlways || authStatus == .authorizedWhenInUse {
            // Update settings based on latest battery level
            updateLocationSettingsBasedOnBattery()
            
            // Restart hybrid positioning
            hybridPositioningManager.startHybridPositioning(
                locationManager: locationManager, 
                significantLocationManager: significantLocationManager
            )
        }
    }
    
    // MARK: - Cleanup
    
    func saveCriticalLocationData() {
        // Save latest location to UserDefaults for recovery
        if let lastLocation = hybridPositioningManager.lastSignificantLocation {
            let locationDict: [String: Any] = [
                "latitude": lastLocation.coordinate.latitude,
                "longitude": lastLocation.coordinate.longitude,
                "timestamp": lastLocation.timestamp.timeIntervalSince1970,
                "accuracy": lastLocation.horizontalAccuracy
            ]
            
            UserDefaults.standard.set(locationDict, forKey: "lastSavedLocation")
        }
    }
    
    func cleanup() {
        batteryMonitor.stopMonitoring()
        saveCriticalLocationData()
    }
}

// Type alias for location update completion handler
typealias LocationUpdateCompletion = (CLLocation) -> Void
