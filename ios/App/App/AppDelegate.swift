import UIKit
import Capacitor
import CoreLocation
import CoreMotion
import BackgroundTasks

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?
    
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Initialize location manager
        LocationManager.shared.checkLocationPermission()
        
        // Start monitoring battery level changes (already initialized in LocationManager)
        
        // Initialize motion activity manager for activity-based tracking
        ActivityManager.shared.startActivityMonitoring()
        
        // Register for remote notifications
        NotificationManager.shared.registerForPushNotifications(application)
        
        // Register background tasks
        if #available(iOS 13.0, *) {
            BackgroundSync.register()
        }
        
        return true
    }
    
    // MARK: - Application Lifecycle Methods
    
    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Update location tracking for background mode
        LocationManager.shared.handleAppDidEnterBackground()
        
        // Save the current location state
        LocationManager.shared.saveCriticalLocationData()
        
        // Schedule background sync when going to background
        if #available(iOS 13.0, *) {
            BackgroundSync.scheduleAppRefresh()
        }
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Update location tracking for foreground mode
        LocationManager.shared.handleAppDidBecomeActive()
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Cleanup
        LocationManager.shared.cleanup()
        ActivityManager.shared.stopActivityMonitoring()
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
        
        if #available(iOS 13.0, *) {
            // For iOS 13+, we use the BGTask framework registered in didFinishLaunchingWithOptions
            // Just forward to the notification-based sync if needed
            NotificationCenter.default.post(name: Notification.Name("backgroundSyncStarted"), object: nil)
            
            // Set a timeout to ensure we call the completion handler
            DispatchQueue.main.asyncAfter(deadline: .now() + 20) {
                completionHandler(.noData)
            }
            
            // Listen for sync completion
            let observer = NotificationCenter.default.addObserver(forName: Notification.Name("backgroundSyncCompleted"), object: nil, queue: .main) { _ in
                NotificationCenter.default.removeObserver(observer)
                completionHandler(.newData)
            }
        } else {
            // Legacy background fetch handling
            handleLegacyBackgroundFetch(application, completionHandler: completionHandler)
        }
    }
    
    private func handleLegacyBackgroundFetch(_ application: UIApplication, completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
        // Request a single location update during background fetch
        guard let locationManager = LocationManager.shared.locationManager else {
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
            let locationUpdateHandler: ((CLLocation) -> Void) = { location in
                // Cancel the timeout
                locationFetchTimeout.cancel()
                
                // Process the location
                if LocationManager.shared.isQualityLocation(location) {
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
