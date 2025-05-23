import CoreLocation
import UIKit

class LocationManager: NSObject {
    static let shared = LocationManager()
    
    // Core location managers
    var locationManager: CLLocationManager?
    private var standardLocationDelegate: StandardLocationDelegate?
    private var significantLocationDelegate: SignificantLocationDelegate?
    private var significantLocationManager: CLLocationManager?

    // Supporting components
    private let batteryMonitor = BatteryMonitor()
    private let locationQualityManager = LocationQualityManager()
    private let hybridPositioningManager = HybridPositioningManager()
    private let trackingManager = LocationTrackingManager()
    
    // State
    private var lastKnownLocation: CLLocation?
    private var isTrackingEnabled = false
    private(set) var isMoving = false
    
    // Synchronization
    private let initializationLock = NSLock()
    private var isInitialized = false
    
    private override init() {
        super.init()
        // Do minimal setup in init
        print("LocationManager instance created")
    }
    
    deinit {
        batteryMonitor.stopMonitoring()
    }
    
    // New synchronous initialization method
    func initializeSync() {
        initializationLock.lock()
        defer { initializationLock.unlock() }
        
        if isInitialized {
            print("LocationManager already initialized, skipping")
            return
        }
        
        print("LocationManager performing synchronized initialization")
        
        // Setup location managers
        setupLocationManager()
        
        // Start battery monitoring
        batteryMonitor.startMonitoring()
        
        // Check permissions immediately
        checkLocationPermission()
        
        isInitialized = true
        print("LocationManager initialization complete")
    }
    
    private func setupLocationManager() {
        print("Setting up location manager")
        
        locationManager = CLLocationManager()
        standardLocationDelegate = StandardLocationDelegate()
        locationManager?.delegate = standardLocationDelegate
        locationManager?.allowsBackgroundLocationUpdates = true
        locationManager?.pausesLocationUpdatesAutomatically = false
        
        standardLocationDelegate?.onLocationUpdate = { [weak self] location in
            self?.handleLocationUpdate(location, source: "standard")
        }
        
        standardLocationDelegate?.onError = { [weak self] error in
            self?.handleLocationError(error)
        }
        
        standardLocationDelegate?.onAuthorizationChange = { [weak self] status in
            self?.handleAuthorizationChange(status)
            // Notify the plugin that permissions have changed
            NotificationCenter.default.post(
                name: NSNotification.Name("locationPermissionChanged"),
                object: nil,
                userInfo: ["status": status]
            )
        }
        
        // Setup significant location change manager
        let significantChangeManager = CLLocationManager()
        significantLocationManager = significantChangeManager
        significantLocationDelegate = SignificantLocationDelegate()
        significantChangeManager.delegate = significantLocationDelegate
        significantChangeManager.allowsBackgroundLocationUpdates = true
        significantChangeManager.pausesLocationUpdatesAutomatically = false
        
        // Call setup on the delegate with the manager
        significantLocationDelegate?.setup(with: significantChangeManager)
        
        significantLocationDelegate?.onLocationUpdate = { [weak self] location in
            self?.handleLocationUpdate(location, source: "significant")
        }
        
        significantLocationDelegate?.onError = { [weak self] error in
            self?.handleLocationError(error)
        }
        
        trackingManager.applyTrackingSettings(to: locationManager)
        
        print("Location manager setup complete")
    }
    
    // MARK: - Public Interface
    
    func setIsMoving(_ moving: Bool) {
        if isMoving != moving {
            isMoving = moving
            trackingManager.adjustTrackingBasedOnMovement(isMoving: moving, locationManager: locationManager)
        }
    }
    
    func checkLocationPermission() -> CLAuthorizationStatus {
        if #available(iOS 14.0, *) {
            return locationManager?.authorizationStatus ?? .notDetermined
        } else {
            return CLLocationManager.authorizationStatus()
        }
    }
    
    func requestLocationPermission(background: Bool, completion: @escaping (Bool) -> Void) {
        let authStatus = checkLocationPermission()
        
        switch authStatus {
        case .notDetermined:
            background ? locationManager?.requestAlwaysAuthorization() : locationManager?.requestWhenInUseAuthorization()
            standardLocationDelegate?.onAuthorizationChange = { status in
                completion(status == .authorizedAlways || status == .authorizedWhenInUse)
            }
        case .restricted, .denied:
            completion(false)
        case .authorizedAlways, .authorizedWhenInUse:
            completion(true)
        @unknown default:
            completion(false)
        }
    }
    
    func startLocationUpdates() {
        isTrackingEnabled = true
        trackingManager.startStandardLocationUpdates(locationManager)
    }
    
    func stopLocationUpdates() {
        isTrackingEnabled = false
        trackingManager.stopAllLocationUpdates(locationManager)
    }
    
    func updateLocationSettingsBasedOnBattery() {
        trackingManager.updateSettingsForBatteryState(
            batteryLevel: batteryMonitor.getCurrentBatteryLevel(),
            isLowPowerMode: batteryMonitor.isLowPowerModeEnabled(),
            locationManager: locationManager
        )
    }
    
    func requestLocation() {
        trackingManager.requestSingleLocationUpdate(locationManager)
    }
    
    func handleAppDidBecomeActive() {
        if isTrackingEnabled {
            trackingManager.handleAppActivation(locationManager)
        }
    }
    
    func handleAppDidEnterBackground() {
        if isTrackingEnabled {
            trackingManager.handleAppBackground(locationManager)
            
            // Use location-specific background task manager
            LocationBackgroundTaskManager.shared.extendBackgroundExecution()
        }
    }
    
    func isQualityLocation(_ location: CLLocation) -> Bool {
        return locationQualityManager.isQualityLocation(location)
    }
    
    func cleanup() {
        trackingManager.stopAllLocationUpdates(locationManager)
        batteryMonitor.stopMonitoring()
        
        // End any background tasks
        LocationBackgroundTaskManager.shared.endBackgroundTask()
    }
    
    // MARK: - Private Methods
    
    private func handleLocationUpdate(_ location: CLLocation, source: String) {
        guard isQualityLocation(location) else {
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
            return
        }
        
        lastKnownLocation = location
        postLocationUpdateNotification(location, source: source)
        trackingManager.handleManualRequestCompletion()
    }
    
    private func handleLocationError(_ error: Error) {
        if let clError = error as? CLError, clError.code == .denied {
            stopLocationUpdates()
        }
    }
    
    private func handleAuthorizationChange(_ status: CLAuthorizationStatus) {
        NotificationCenter.default.post(
            name: NSNotification.Name("locationAuthorizationDidChange"),
            object: nil,
            userInfo: ["status": status.rawValue]
        )
    }
    
    private func postLocationUpdateNotification(_ location: CLLocation, source: String) {
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
    }
}
