
import UIKit
import Capacitor
import CoreLocation

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, CLLocationManagerDelegate {

    var window: UIWindow?
    private var locationManager: CLLocationManager?
    private var backgroundTask: UIBackgroundTaskIdentifier = .invalid

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Initialize location manager
        locationManager = CLLocationManager()
        locationManager?.delegate = self
        
        // Set location manager properties
        locationManager?.desiredAccuracy = kCLLocationAccuracyBest
        locationManager?.distanceFilter = 10 // Update location when user moves 10 meters
        
        // Check for location permission status on launch
        checkLocationPermission()
        
        // Register for remote notifications
        registerForPushNotifications(application)
        
        // Override point for customization after application launch.
        return true
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
        locationManager.pausesLocationUpdatesAutomatically = false
        
        // Start significant location changes which uses less battery
        locationManager.startMonitoringSignificantLocationChanges()
        
        // Also start standard updates when in foreground for better accuracy
        locationManager.startUpdatingLocation()
        
        print("Background location updates enabled")
    }
    
    // MARK: - CLLocationManagerDelegate
    
    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        checkLocationPermission()
    }
    
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }
        
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
                "timestamp": location.timestamp.timeIntervalSince1970 * 1000
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
        
        // Begin new background task
        backgroundTask = UIApplication.shared.beginBackgroundTask { [weak self] in
            // Clean up code if the task is ending
            guard let self = self else { return }
            
            if self.backgroundTask != .invalid {
                UIApplication.shared.endBackgroundTask(self.backgroundTask)
                self.backgroundTask = .invalid
            }
        }
    }
    
    // MARK: - Push Notification Registration
    
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

    // MARK: - Application Lifecycle Methods
    
    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
        
        // Make sure we're monitoring significant location changes
        locationManager?.startMonitoringSignificantLocationChanges()
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
        
        // Switch to standard location updates for better accuracy when foregrounded
        if locationManager?.authorizationStatus == .authorizedAlways {
            locationManager?.startUpdatingLocation()
        }
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

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
}
