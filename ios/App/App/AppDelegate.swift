import UIKit
import Capacitor
import CoreLocation
import CoreMotion

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, CLLocationManagerDelegate {

    var window: UIWindow?
    private var locationManager: CLLocationManager?
    private var backgroundTask: UIBackgroundTaskIdentifier = .invalid
    private var motionManager: CMMotionActivityManager?
    private var isMoving: Bool = true
    private var lastSignificantLocation: CLLocation?
    private var poorQualityLocationCount: Int = 0
    private var batteryLevelMonitoringEnabled: Bool = false
    
    // Location filtering parameters
    private let minimumHorizontalAccuracy: CLLocationAccuracy = 100.0
    private let significantDistance: CLLocationDistance = 50.0 // 50 meters considered significant
    private let poorQualityThreshold: Int = 3 // Number of consecutive poor quality locations before taking action

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Initialize location manager
        locationManager = CLLocationManager()
        locationManager?.delegate = self
        
        // Set location manager properties with battery-optimized defaults
        updateLocationSettingsBasedOnBattery()
        
        // Initialize motion activity manager for activity-based tracking
        motionManager = CMMotionActivityManager()
        
        // Check for location permission status on launch
        checkLocationPermission()
        
        // Start monitoring battery level changes
        startBatteryMonitoring()
        
        // Register for remote notifications
        registerForPushNotifications(application)
        
        // Override point for customization after application launch.
        return true
    }
    
    // MARK: - Battery Level Monitoring
    
    private func startBatteryMonitoring() {
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
    
    @objc private func batteryLevelDidChange(_ notification: Notification) {
        updateLocationSettingsBasedOnBattery()
    }
    
    private func updateLocationSettingsBasedOnBattery() {
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
    
    // MARK: - Location Permission Handling
    
    func checkLocationPermission() {
        guard let locationManager = locationManager else { return }
        
        switch locationManager.authorizationStatus {
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
        // This would typically be shown after the user has used the app with when-in-use permissions
        // In a real implementation, you might want to track usage and only show this after certain conditions
        
        // For Capacitor, we would use a plugin to show a native dialog and then request permissions
        // For simplicity in this example, we'll directly request always authorization
        Timer.scheduledTimer(withTimeInterval: 2.0, repeats: false) { [weak self] _ in
            self?.locationManager?.requestAlwaysAuthorization()
        }
    }
    
    func enableBackgroundLocationUpdates() {
        guard let locationManager = locationManager else { return }
        
        // Enable background location updates
        locationManager.allowsBackgroundLocationUpdates = true
        locationManager.pausesLocationUpdatesAutomatically = true // Let system optimize pausing
        
        // Start significant location changes which uses less battery
        startSignificantLocationChanges()
        
        // Also start standard updates when in foreground for better accuracy
        locationManager.startUpdatingLocation()
        
        // Start activity monitoring
        startActivityMonitoring()
        
        print("Background location updates enabled")
    }
    
    // MARK: - Activity-Based Location Tracking
    
    private func startActivityMonitoring() {
        guard let motionManager = motionManager, 
              CMMotionActivityManager.isActivityAvailable() else {
            return
        }
        
        // Begin monitoring motion activity
        let queue = OperationQueue()
        motionManager.startActivityUpdates(to: queue) { [weak self] (activity) in
            guard let self = self else { return }
            
            // Check if the device is stationary
            let isNowStationary = activity?.stationary ?? false
            
            // If movement state changed
            if self.isMoving != !isNowStationary {
                self.isMoving = !isNowStationary
                
                DispatchQueue.main.async {
                    // If stationary, reduce location updates
                    if isNowStationary {
                        print("Device is stationary, reducing location updates")
                        self.pauseHighAccuracyLocationUpdates()
                    } else {
                        print("Device is moving, resuming regular location updates")
                        self.resumeLocationUpdates()
                    }
                }
            }
        }
    }
    
    private func stopActivityMonitoring() {
        motionManager?.stopActivityUpdates()
    }
    
    private func pauseHighAccuracyLocationUpdates() {
        guard let locationManager = locationManager else { return }
        
        // Stop standard updates to save battery
        locationManager.stopUpdatingLocation()
        
        // Keep significant location changes running for critical updates
        if !locationManager.monitoringSignificantLocationChanges {
            startSignificantLocationChanges()
        }
    }
    
    private func resumeLocationUpdates() {
        guard let locationManager = locationManager else { return }
        
        // If in foreground, restart standard location updates
        if UIApplication.shared.applicationState != .background {
            locationManager.startUpdatingLocation()
        }
    }
    
    // MARK: - Significant Location Changes
    
    private func startSignificantLocationChanges() {
        guard let locationManager = locationManager,
              CLLocationManager.significantLocationChangeMonitoringAvailable() else {
            print("Significant location change monitoring not available")
            return
        }
        
        locationManager.startMonitoringSignificantLocationChanges()
        print("Started monitoring significant location changes")
    }
    
    // MARK: - Location Filtering
    
    private func isQualityLocation(_ location: CLLocation) -> Bool {
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
    
    private func takePoorQualityAction() {
        if poorQualityLocationCount >= poorQualityThreshold {
            print("Multiple poor quality locations detected. Adjusting strategy.")
            // Restart location updates with different settings
            guard let locationManager = locationManager else { return }
            
            locationManager.stopUpdatingLocation()
            
            // Use a different accuracy temporarily
            let originalAccuracy = locationManager.desiredAccuracy
            locationManager.desiredAccuracy = kCLLocationAccuracyHundredMeters
            
            // Restart after a short delay
            DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
                // Reset to original accuracy
                locationManager.desiredAccuracy = originalAccuracy
                locationManager.startUpdatingLocation()
            }
            
            // Reset counter
            poorQualityLocationCount = 0
        }
    }
    
    // MARK: - CLLocationManagerDelegate
    
    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        checkLocationPermission()
    }
    
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }
        
        // Filter low quality or insignificant locations
        guard isQualityLocation(location) else {
            // Take action if too many poor quality locations
            takePoorQualityAction()
            return
        }
        
        // When we receive location updates in the background, extend background execution time
        if UIApplication.shared.applicationState == .background {
            extendBackgroundExecution()
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
                "isMoving": isMoving
            ]
        )
    }
    
    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        print("Location manager failed with error: \(error.localizedDescription)")
    }
    
    // MARK: - Background Task Handling
    
    func extendBackgroundExecution() {
        // End previous task if one exists
        if backgroundTask != .invalid {
            UIApplication.shared.endBackgroundTask(backgroundTask)
            backgroundTask = .invalid
        }
        
        // Begin new background task with proper completion handler
        backgroundTask = UIApplication.shared.beginBackgroundTask { [weak self] in
            // Clean up code if the task is ending
            guard let self = self else { return }
            
            if self.backgroundTask != .invalid {
                // Save any critical state or data before the task ends
                self.saveCriticalLocationData()
                
                UIApplication.shared.endBackgroundTask(self.backgroundTask)
                self.backgroundTask = .invalid
            }
        }
    }
    
    // Save critical location data before background task expires
    private func saveCriticalLocationData() {
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
    
    // MARK: - Application Lifecycle Methods
    
    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
        
        // Make sure we're monitoring significant location changes for battery efficiency
        startSignificantLocationChanges()
        
        // Stop standard location updates in background to save battery
        locationManager?.stopUpdatingLocation()
        
        // Save the current location state
        saveCriticalLocationData()
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
        
        // Switch to standard location updates for better accuracy when foregrounded
        if locationManager?.authorizationStatus == .authorizedAlways || 
           locationManager?.authorizationStatus == .authorizedWhenInUse {
            
            // Update settings based on latest battery level
            updateLocationSettingsBasedOnBattery()
            
            // Start regular updates if moving or just activated
            locationManager?.startUpdatingLocation()
        }
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
        saveCriticalLocationData()
        stopActivityMonitoring()
        
        // Clean up any battery monitoring
        if batteryLevelMonitoringEnabled {
            UIDevice.current.isBatteryMonitoringEnabled = false
            NotificationCenter.default.removeObserver(self, name: UIDevice.batteryLevelDidChangeNotification, object: nil)
        }
    }
    
    // MARK: - URL and User Activity Handling
    
    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
    
    // MARK: - Push Notifications
    
    func registerForPushNotifications(_ application: UIApplication) {
        UNUserNotificationCenter.current().requestAuthorization(
            options: [.alert, .sound, .badge]
        ) { granted, _ in
            guard granted else { return }
            
            DispatchQueue.main.async {
                application.registerForRemoteNotifications()
            }
        }
    }
    
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        // Forward to Capacitor
        NotificationCenter.default.post(
            name: Notification.Name(CAPNotifications.DidRegisterForRemoteNotificationsWithDeviceToken.name()),
            object: deviceToken
        )
    }
    
    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        // Forward to Capacitor
        NotificationCenter.default.post(
            name: Notification.Name(CAPNotifications.DidFailToRegisterForRemoteNotificationsWithError.name()),
            object: error
        )
    }
    
    // MARK: - Background App Refresh
    
    func application(_ application: UIApplication, performFetchWithCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
        // This is called when the system wakes up the app for a background fetch
        print("Background fetch initiated")
        
        // Request a single location update during background fetch
        guard let locationManager = locationManager else {
            completionHandler(.failed)
            return
        }
        
        // Only proceed if we have authorization
        if locationManager.authorizationStatus == .authorizedAlways {
            // Reset location manager with energy efficient settings for this fetch
            locationManager.desiredAccuracy = kCLLocationAccuracyHundredMeters
            locationManager.distanceFilter = 50
            
            // Set a timeout for the fetch
            let locationFetchTimeout = DispatchWorkItem {
                print("Location fetch timed out")
                completionHandler(.failed)
            }
            
            // Schedule timeout
            DispatchQueue.main.asyncAfter(deadline: .now() + 25, execute: locationFetchTimeout)
            
            // Create a one-time location update handler
            let locationUpdateHandler: ((CLLocation) -> Void) = { [weak self] location in
                guard let self = self else { return }
                
                // Cancel the timeout
                locationFetchTimeout.cancel()
                
                // Process the location
                if self.isQualityLocation(location) {
                    // Post the location update
                    NotificationCenter.default.post(
                        name: NSNotification.Name("locationUpdate"),
                        object: nil,
                        userInfo: [
                            "latitude": location.coordinate.latitude,
                            "longitude": location.coordinate.longitude,
                            "accuracy": location.horizontalAccuracy,
                            "timestamp": location.timestamp.timeIntervalSince1970 * 1000,
                            "source": "background_fetch"
                        ]
                    )
                    completionHandler(.newData)
                } else {
                    completionHandler(.noData)
                }
            }
            
            // Temporarily store the handler
            // In a real implementation, you'd use a more robust solution to handle the callback
            objc_setAssociatedObject(self, "oneTimeLocationHandler", locationUpdateHandler, .OBJC_ASSOCIATION_RETAIN)
            
            // Request a single location update
            locationManager.requestLocation()
        } else {
            // No authorization for background location
            completionHandler(.noData)
        }
    }
}

// Extension to help with single location updates during background fetch
extension CLLocationManager {
    static var oneTimeHandlers = [CLLocationManager: (CLLocation) -> Void]()
    
    func requestLocation(completion: @escaping (CLLocation) -> Void) {
        CLLocationManager.oneTimeHandlers[self] = completion
        self.requestLocation()
    }
}

extension CLLocationManagerDelegate {
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        if let completion = CLLocationManager.oneTimeHandlers[manager],
           let location = locations.last {
            completion(location)
            CLLocationManager.oneTimeHandlers.removeValue(forKey: manager)
        }
    }
}
