import UIKit
import Capacitor
import CoreLocation
import CoreMotion
import BackgroundTasks
import ObjectiveC

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?
    private var servicesInitialized = false
    
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Set up appearance for navigation bars and toolbars
        configureUIAppearance()
        
        // Initialize plugins and core services immediately
        // This ensures that the LocationPermissionsPlugin is available before any UI components try to use it
        initializeServices(application)
        
        return true
    }
    
    // Configure appearance settings for navigation and toolbar
    private func configureUIAppearance() {
        if #available(iOS 15.0, *) {
            // Modern appearance configuration for iOS 15+
            let navigationBarAppearance = UINavigationBarAppearance()
            navigationBarAppearance.configureWithDefaultBackground()
            UINavigationBar.appearance().standardAppearance = navigationBarAppearance
            UINavigationBar.appearance().compactAppearance = navigationBarAppearance
            UINavigationBar.appearance().scrollEdgeAppearance = navigationBarAppearance
            
            // Ensure toolbar has proper sizing
            let toolbarAppearance = UIToolbarAppearance()
            toolbarAppearance.configureWithDefaultBackground()
            UIToolbar.appearance().standardAppearance = toolbarAppearance
            UIToolbar.appearance().compactAppearance = toolbarAppearance
            UIToolbar.appearance().scrollEdgeAppearance = toolbarAppearance
        } else {
            // Legacy appearance configuration
            UINavigationBar.appearance().isTranslucent = false
            UIToolbar.appearance().isTranslucent = false
        }
        
        // Ensure minimum width for toolbars
        UIView.swizzleAutoresizingMaskIntoConstraintsIfNeeded()
    }
    
    private func initializeServices(_ application: UIApplication) {
        guard !servicesInitialized else { return }
        
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
        
        servicesInitialized = true
        print("Services initialized successfully")
    }
    
    // MARK: - Application Lifecycle Methods
    
    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        guard servicesInitialized else { return }
        
        // Update location tracking for background mode
        LocationManager.shared.handleAppDidEnterBackground()
        
        // Save the current location state
        LocationManager.shared.requestLocation()

        // Schedule background sync when going to background
        if #available(iOS 13.0, *) {
            BackgroundSync.scheduleAppRefresh()
        }
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // If services not initialized yet, do it now
        if !servicesInitialized {
            initializeServices(application)
        }
        
        // Update location tracking for foreground mode
        LocationManager.shared.handleAppDidBecomeActive()
    }

    func applicationWillTerminate(_ application: UIApplication) {
        guard servicesInitialized else { return }
        
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
        guard servicesInitialized else {
            completionHandler(.noData)
            return
        }
        
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
            
            // Declare the observer variable before the closure
            var observer: NSObjectProtocol?
            
            // Now set the observer
            observer = NotificationCenter.default.addObserver(forName: Notification.Name("backgroundSyncCompleted"), object: nil, queue: .main) { _ in
                // Use optional binding to safely remove the observer
                if let observerToRemove = observer {
                    NotificationCenter.default.removeObserver(observerToRemove)
                }
                completionHandler(.newData)
            }
        } else {
            // Legacy background fetch handling
            handleLegacyBackgroundFetch(application, completionHandler: completionHandler)
        }
    }
    
    private func handleLegacyBackgroundFetch(_ application: UIApplication, completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
        // Use the LocationManager directly for background fetch
        guard let locationManager = LocationManager.shared.locationManager else {
            completionHandler(.failed)
            return
        }
        
        // Only proceed if we have authorization
        let authStatus: CLAuthorizationStatus
        if #available(iOS 14.0, *) {
            authStatus = locationManager.authorizationStatus
        } else {
            authStatus = CLLocationManager.authorizationStatus()
        }
        
        if authStatus == .authorizedAlways {
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
            
            // Request a single location update
            var didComplete = false
            
            let locationHandler: LocationUpdateCompletion = { location in
                // Only process once
                guard !didComplete else { return }
                didComplete = true
                
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
            
            // Declare the observer variable before the closure
            var observer: NSObjectProtocol?
            
            // Set the observer in a separate statement
            observer = NotificationCenter.default.addObserver(
                forName: NSNotification.Name("locationUpdateAvailable"), 
                object: nil, 
                queue: .main
            ) { notification in
                if let location = notification.userInfo?["location"] as? CLLocation {
                    locationHandler(location)
                }
            }
            
            // Set a timeout to remove observer
            DispatchQueue.main.asyncAfter(deadline: .now() + 20) {
                // Use optional binding to safely remove the observer
                if let observerToRemove = observer {
                    NotificationCenter.default.removeObserver(observerToRemove)
                }
                if !didComplete {
                    completionHandler(.noData)
                }
            }
            
            // Request the location update
            locationManager.requestLocation()
        } else {
            // No authorization for background location
            completionHandler(.noData)
        }
    }
}

// Utility extension to fix auto-layout issues with UIToolbar
extension UIView {
    static var isSwizzled = false
    
    static func swizzleAutoresizingMaskIntoConstraintsIfNeeded() {
        if isSwizzled { return }
        isSwizzled = true
        
        // Only swizzle if we're on iOS 15+ where the issue is most common
        if #available(iOS 15.0, *) {
            let originalSelector = #selector(getter: UIView.translatesAutoresizingMaskIntoConstraints)
            let swizzledSelector = #selector(UIView.swizzled_translatesAutoresizingMaskIntoConstraints)
            
            guard let originalMethod = class_getInstanceMethod(UIView.self, originalSelector),
                  let swizzledMethod = class_getInstanceMethod(UIView.self, swizzledSelector) else {
                return
            }
            
            method_exchangeImplementations(originalMethod, swizzledMethod)
        }
    }
    
    @objc func swizzled_translatesAutoresizingMaskIntoConstraints() -> Bool {
        // Fix the zero-width issue specifically for toolbar content views
        if String(describing: type(of: self)).contains("UIToolbarContentView") {
            // Ensure toolbar content views have proper sizing behavior
            return false
        }
        
        // For all other views, use the original implementation
        return self.swizzled_translatesAutoresizingMaskIntoConstraints()
    }
}

// Type alias for location update completion handler
typealias LocationUpdateCompletion = (CLLocation) -> Void
