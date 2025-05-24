
import Foundation
import UIKit
import Capacitor

class AppInitializer {
    static let shared = AppInitializer()
    private var servicesInitialized = false
    
    private init() {}
    
    func initializeServicesSync(_ application: UIApplication) {
        print("Initializing app services synchronously")
        
        // Register custom plugins with Capacitor
        registerCustomPlugins()
        
        servicesInitialized = true
        print("App services initialized successfully")
    }
    
    private func registerCustomPlugins() {
        print("Registering custom plugins with Capacitor")
        
        // The LocationPermissionsPlugin will be automatically registered by Capacitor
        // based on the .h and .m files in the project
        print("Custom plugins registration complete")
    }
    
    func initializeCapacitorStorage() {
        print("Initializing Capacitor storage")
        // Capacitor storage initialization if needed
    }
    
    func isServicesInitialized() -> Bool {
        return servicesInitialized
    }
    
    func handleAppDidEnterBackground(_ application: UIApplication) {
        print("App entered background")
    }
    
    func handleAppDidBecomeActive(_ application: UIApplication) {
        print("App became active")
    }
    
    func handleAppWillTerminate(_ application: UIApplication) {
        print("App will terminate")
    }
}
