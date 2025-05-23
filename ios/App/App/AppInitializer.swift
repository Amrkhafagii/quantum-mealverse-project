
import UIKit
import Capacitor
import CoreLocation
import BackgroundTasks

class AppInitializer {
    // Singleton instance
    static let shared = AppInitializer()
    
    private var servicesInitialized = false
    private let initializationSemaphore = DispatchSemaphore(value: 0)
    
    private init() {}
    
    // Initialize Capacitor's storage system
    func initializeCapacitorStorage() {
        // Capacitor automatically uses UserDefaults.standard
        // This test is just to verify storage access
        DispatchQueue.global(qos: .userInitiated).async {
            do {
                // Create a small test file to verify storage access
                let fileManager = FileManager.default
                let documentDirectory = fileManager.urls(for: .documentDirectory, in: .userDomainMask).first!
                let testFilePath = documentDirectory.appendingPathComponent("storage_test.txt")
                
                try "Storage test".write(to: testFilePath, atomically: true, encoding: .utf8)
                try fileManager.removeItem(at: testFilePath)
                
                print("Storage system initialized successfully")
            } catch {
                print("Error initializing storage system: \(error.localizedDescription)")
            }
        }
    }
    
    // New synchronous initialization method
    func initializeServicesSync(_ application: UIApplication) {
        guard !servicesInitialized else { return }
        
        print("Starting synchronous service initialization")
        
        // Initialize location manager first, as a priority
        let locationManager = LocationManager.shared
        locationManager.initializeSync()
        
        // Initialize motion activity manager for activity-based tracking
        ActivityManager.shared.startActivityMonitoring()
        
        // Register for remote notifications
        NotificationManager.shared.registerForPushNotifications(application)
        
        // Register background tasks
        if #available(iOS 13.0, *) {
            BackgroundSync.register()
        }
        
        servicesInitialized = true
        print("Services initialized successfully in synchronized mode")
        
        // Signal that initialization is complete
        initializationSemaphore.signal()
    }
    
    // Original method but modified to use the semaphore
    func initializeServices(_ application: UIApplication) {
        // If already initialized or initializing, wait for completion
        if servicesInitialized {
            return
        } else {
            // Wait with a timeout to prevent deadlock
            let _ = initializationSemaphore.wait(timeout: .now() + 3.0)
            if !servicesInitialized {
                // If still not initialized after timeout, do it now
                initializeServicesSync(application)
            }
        }
    }
    
    func handleAppDidEnterBackground(_ application: UIApplication) {
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
    
    func handleAppDidBecomeActive(_ application: UIApplication) {
        // If services not initialized yet, do it now
        if !servicesInitialized {
            initializeServices(application)
        }
        
        // Update location tracking for foreground mode
        LocationManager.shared.handleAppDidBecomeActive()
    }
    
    func handleAppWillTerminate(_ application: UIApplication) {
        guard servicesInitialized else { return }
        
        // Cleanup
        LocationManager.shared.cleanup()
        ActivityManager.shared.stopActivityMonitoring()
    }
    
    func isServicesInitialized() -> Bool {
        return servicesInitialized
    }
}
