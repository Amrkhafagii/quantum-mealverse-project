import UIKit
import Capacitor
import CapacitorPreferences
import CapacitorGeolocation
import CoreLocation
import CoreMotion
import BackgroundTasks
import ObjectiveC

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?
    
    // Singleton instance for access from static contexts
    static var shared: AppDelegate {
        return UIApplication.shared.delegate as! AppDelegate
    }
    
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Register Capacitor plugins - including our custom LocationPermissionsPlugin
        self.registerCustomPlugins()
     
        // Set up appearance for navigation bars and toolbars
        UIAppearanceManager.configureUIAppearance()
        
        // Initialize plugins and core services immediately and synchronously
        // This ensures that the LocationPermissionsPlugin is available before any UI components try to use it
        AppInitializer.shared.initializeServicesSync(application)
        
        // Initialize Capacitor Storage - Required for Storage plugins to work properly
        AppInitializer.shared.initializeCapacitorStorage()
        
        // Register background task for iOS 13+
        if #available(iOS 13.0, *) {
            BackgroundSync.register()
        }
        
        return true
    }
    
    // MARK: - Custom Plugin Registration
    private func registerCustomPlugins() {
        // Explicitly register our custom LocationPermissionsPlugin
        // This ensures Capacitor knows about our plugin and can route calls to it
        print("Registering custom LocationPermissionsPlugin")
        
        // The plugin is automatically registered via the CAP_PLUGIN macro in LocationPermissionsPlugin.m
        // But we can add additional initialization here if needed
        
        // Verify the plugin is available
        if let bridge = CAPBridge.getDefault() {
            let pluginManager = bridge.pluginManager
            if let _ = pluginManager?.getPlugin("LocationPermissions") {
                print("LocationPermissionsPlugin successfully registered")
            } else {
                print("Warning: LocationPermissionsPlugin not found in plugin registry")
            }
        }
    }
    
    // MARK: - Application Lifecycle Methods
    
    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        AppInitializer.shared.handleAppDidEnterBackground(application)
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        AppInitializer.shared.handleAppDidBecomeActive(application)
    }

    func applicationWillTerminate(_ application: UIApplication) {
        AppInitializer.shared.handleAppWillTerminate(application)
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
        guard AppInitializer.shared.isServicesInitialized() else {
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
            BackgroundFetchManager.shared.handleLegacyBackgroundFetch(application, completionHandler: completionHandler)
        }
    }
    
    @available(iOS 13.0, *)
    func handleBackgroundRefresh(task: BGAppRefreshTask) {
        BackgroundFetchManager.shared.handleBackgroundFetch(task: task)
    }
}
