import UIKit
import BackgroundTasks

class BackgroundFetchManager {
    static let shared = BackgroundFetchManager()
    
    private init() {}
    
    func handleLegacyBackgroundFetch(_ application: UIApplication, completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
        print("Handling legacy background fetch")
        
        // Perform background fetch operations for iOS < 13
        DispatchQueue.global(qos: .utility).async {
            // Background fetch logic here
            completionHandler(.noData)
        }
    }
    
    @available(iOS 13.0, *)
    func handleBackgroundFetch(task: BGAppRefreshTask) {
        BackgroundSync.handleBackgroundSync(task: task)
    }
}
