import UIKit
import Capacitor
import CoreLocation
import CoreMotion
import BackgroundTasks
import ObjectiveC
import NetworkExtension

class LocationManager: NSObject, CLLocationManagerDelegate {
    static let shared = LocationManager()
    
    // Location manager
    var locationManager: CLLocationManager?
    var significantLocationManager: CLLocationManager?
    private var lastSignificantLocation: CLLocation?
    private var poorQualityLocationCount: Int = 0
    var isMoving: Bool = true
    
    // Hybrid positioning properties
    private var wifiPositioningEnabled: Bool = true
    private var cellTowerPositioningEnabled: Bool = true
    private var inaccurateLocationsCount: Int = 0
    private var hybridLocationsBuffer: [CLLocation] = []
    private let hybridLocationsBufferMaxSize = 5
    private var lastPositioningAttemptTimestamp: Date?
    
    // Battery monitoring
    private var batteryLevelMonitoringEnabled: Bool = false
    
    // Location filtering parameters
    private let minimumHorizontalAccuracy: CLLocationAccuracy = 100.0
    private let significantDistance: CLLocationDistance = 50.0 // 50 meters considered significant
    private let poorQualityThreshold: Int = 3 // Number of consecutive poor quality locations
    
    private override init() {
        super.init()
        setupLocationManager()
        startBatteryMonitoring()
    }
    
    // MARK: - Setup
    
    func setupLocationManager() {
        // Setup main location manager
        locationManager = CLLocationManager()
        locationManager?.delegate = self
        
        // Setup separate manager for significant location changes
        significantLocationManager = CLLocationManager()
        significantLocationManager?.delegate = self
        
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
            self.showAlwaysAllowDialog()
        case .authorizedAlways:
            // Full permissions granted, enable background updates
            self.enableBackgroundLocationUpdates()
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
        startHybridPositioning()
        
        // Also start standard updates when in foreground for better accuracy
        locationManager.startUpdatingLocation()
        
        print("Background location updates enabled")
    }
    
    // MARK: - Hybrid Positioning System
    
    func startHybridPositioning() {
        guard let locationManager = locationManager,
              let significantLocationManager = significantLocationManager else { return }
        
        // 1. GPS/Core Location - Standard updates
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
        locationManager.startUpdatingLocation()
        
        // 2. Significant Location Changes - Battery efficient background updates
        if CLLocationManager.significantLocationChangeMonitoringAvailable() {
            significantLocationManager.startMonitoringSignificantLocationChanges()
        }
        
        // 3. Enable WiFi positioning if allowed and available
        if wifiPositioningEnabled {
            // WiFi positioning happens automatically when using CoreLocation
            // But we can ensure WiFi is enabled when possible
            if #available(iOS 13.0, *) {
                activateWifiIfNeeded()
            }
        }
        
        // Clear and initialize the location buffer
        hybridLocationsBuffer.removeAll()
        
        print("Hybrid positioning system started")
    }
    
    @available(iOS 13.0, *)
    private func activateWifiIfNeeded() {
        // Request WiFi information access - this improves location accuracy when WiFi is used
        NEHotspotHelper.register(options: [:], queue: .main) { _ in }
        
        // Note: This is just to request WiFi access - actual WiFi positioning
        // is handled automatically by CoreLocation, this just ensures WiFi
        // is a factor in the location determination
    }
    
    // Add a location to the hybrid buffer and process when we have enough data
    private func addToHybridLocationsBuffer(_ location: CLLocation) {
        // Only add quality locations to buffer
        guard location.horizontalAccuracy > 0 && location.horizontalAccuracy < 100 else {
            return
        }
        
        // Add to buffer
        hybridLocationsBuffer.append(location)
        
        // Maintain max buffer size
        if hybridLocationsBuffer.count > hybridLocationsBufferMaxSize {
            hybridLocationsBuffer.removeFirst()
        }
        
        // If we have enough locations, process them
        if hybridLocationsBuffer.count >= 3 {
            processHybridLocations()
        }
    }
    
    // Process the buffered locations to get a more accurate position
    private func processHybridLocations() {
        // Skip if buffer is empty
        guard !hybridLocationsBuffer.isEmpty else { return }
        
        // Simple approach: use the location with best accuracy
        var bestLocation = hybridLocationsBuffer[0]
        
        for location in hybridLocationsBuffer {
            if location.horizontalAccuracy < bestLocation.horizontalAccuracy {
                bestLocation = location
            }
        }
        
        // Use the best location
        reportLocationUpdate(bestLocation)
    }
    
    // MARK: - Battery Level Monitoring
    
    func startBatteryMonitoring() {
        // Enable battery monitoring
        UIDevice.current.isBatteryMonitoringEnabled = true
        batteryLevelMonitoringEnabled = true
        
        // Initial battery level check
        updateLocationSettingsBasedOnBattery()
        
        // Listen for battery level changes
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(batteryLevelDidChange),
            name: UIDevice.batteryLevelDidChangeNotification,
            object: nil
        )
    }
    
    @objc func batteryLevelDidChange(_ notification: Notification) {
        updateLocationSettingsBasedOnBattery()
    }
    
    func stopBatteryMonitoring() {
        if batteryLevelMonitoringEnabled {
            UIDevice.current.isBatteryMonitoringEnabled = false
            NotificationCenter.default.removeObserver(self, name: UIDevice.batteryLevelDidChangeNotification, object: nil)
            batteryLevelMonitoringEnabled = false
        }
    }
    
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
        if CLLocationManager.significantLocationChangeMonitoringAvailable() {
            startSignificantLocationChanges()
        }
    }
    
    func resumeLocationUpdates() {
        guard let locationManager = locationManager else { return }
        
        // If in foreground, restart standard location updates
        if UIApplication.shared.applicationState != .background {
            locationManager.startUpdatingLocation()
        }
    }
    
    // MARK: - Location Quality Management
    
    func isQualityLocation(_ location: CLLocation) -> Bool {
        // Check horizontal accuracy
        guard location.horizontalAccuracy > 0 && location.horizontalAccuracy < minimumHorizontalAccuracy else {
            poorQualityLocationCount += 1
            print("Poor quality location detected: accuracy \(location.horizontalAccuracy)m")
            return false
        }
        
        // Reset poor quality counter since we got a good location
        poorQualityLocationCount = 0
        
        // Check for significant movement if we have a previous location
        if let lastLocation = lastSignificantLocation {
            let distance = location.distance(from: lastLocation)
            if distance < significantDistance {
                // Not significant movement
                print("Movement not significant: \(distance)m")
                return false
            }
        }
        
        // This is a quality location
        lastSignificantLocation = location
        return true
    }
    
    func takePoorQualityAction() {
        if poorQualityLocationCount >= poorQualityThreshold {
            print("Multiple poor quality locations detected. Adjusting strategy.")
            // Restart location updates with different settings
            guard let locationManager = locationManager else { return }
            
            locationManager.stopUpdatingLocation()
            
            // Reset inaccurate counter
            poorQualityLocationCount = 0
            
            // Try to activate hybrid positioning
            startHybridPositioning()
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
    
    // MARK: - CLLocationManagerDelegate
    
    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        checkLocationPermission()
    }
    
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }
        
        // Add to hybrid location buffer for processing
        addToHybridLocationsBuffer(location)
        
        // Filter low quality locations
        if isQualityLocation(location) {
            reportLocationUpdate(location)
        } else {
            // Take action if too many poor quality locations
            takePoorQualityAction()
        }
    }
    
    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        print("Location manager failed with error: \(error.localizedDescription)")
        
        // If we get an error with the main location manager, try the significant change service
        if manager == locationManager && CLLocationManager.significantLocationChangeMonitoringAvailable() {
            startSignificantLocationChanges()
        }
    }
    
    // MARK: - Activity-Based Location Tracking
    
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
            startHybridPositioning()
        }
    }
    
    func saveCriticalLocationData() {
        // Save latest location to UserDefaults for recovery
        if let lastLocation = lastSignificantLocation {
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
        stopBatteryMonitoring()
        saveCriticalLocationData()
    }
}

// Type alias for location update completion handler
typealias LocationUpdateCompletion = (CLLocation) -> Void
