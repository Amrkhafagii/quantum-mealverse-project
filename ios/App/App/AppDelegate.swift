
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
        
        // Set up appearance for navigation bars and toolbars
        UIAppearanceManager.configureUIAppearance()
        
        // Initialize plugins and core services immediately and synchronously
        AppInitializer.shared.initializeServicesSync(application)
        
        // Initialize Capacitor Storage
        AppInitializer.shared.initializeCapacitorStorage()
        
        // Register background task for iOS 13+
        if #available(iOS 13.0, *) {
            BackgroundSync.register()
        }
        
        return true
    }
    
    // MARK: - Application Lifecycle Methods
    
    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        AppInitializer.shared.handleAppDidEnterBackground(application)
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        AppInitializer.shared.handleAppDidBecomeActive(application)
    }

    func applicationWillTerminate(_ application: UIApplication) {
        AppInitializer.shared.handleAppWillTerminate(application)
    }
    
    // MARK: - URL and User Activity Handling
    
    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
    
    // MARK: - Push Notifications
    
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        NotificationCenter.default.post(
            name: Notification.Name(CAPNotifications.DidRegisterForRemoteNotificationsWithDeviceToken.name()),
            object: deviceToken
        )
    }
    
    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
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
        
        print("Background fetch initiated")
        
        if #available(iOS 13.0, *) {
            NotificationCenter.default.post(name: Notification.Name("backgroundSyncStarted"), object: nil)
            
            DispatchQueue.main.asyncAfter(deadline: .now() + 20) {
                completionHandler(.noData)
            }
            
            var observer: NSObjectProtocol?
            
            observer = NotificationCenter.default.addObserver(forName: Notification.Name("backgroundSyncCompleted"), object: nil, queue: .main) { _ in
                if let observerToRemove = observer {
                    NotificationCenter.default.removeObserver(observerToRemove)
                }
                completionHandler(.newData)
            }
        } else {
            BackgroundFetchManager.shared.handleLegacyBackgroundFetch(application, completionHandler: completionHandler)
        }
    }
    
    @available(iOS 13.0, *)
    func handleBackgroundRefresh(task: BGAppRefreshTask) {
        BackgroundFetchManager.shared.handleBackgroundFetch(task: task)
    }
}
