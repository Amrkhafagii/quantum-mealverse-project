
import UIKit
import BackgroundTasks

@available(iOS 13.0, *)
class BackgroundSync {
    static func register() {
        BGTaskScheduler.shared.register(forTaskWithIdentifier: "com.lovable.background.refresh", 
                                      using: nil) { task in
            AppDelegate.shared.handleBackgroundRefresh(task: task as! BGAppRefreshTask)
        }
    }
    
    static func scheduleAppRefresh() {
        let request = BGAppRefreshTaskRequest(identifier: "com.lovable.background.refresh")
        // Request refresh after 15 minutes
        request.earliestBeginDate = Date(timeIntervalSinceNow: 15 * 60)
        
        do {
            try BGTaskScheduler.shared.submit(request)
            print("Background refresh scheduled successfully")
        } catch {
            print("Failed to schedule background refresh: \(error)")
        }
    }
    
    static func performBackgroundSync(completion: @escaping (Bool) -> Void) {
        // 1. Request location update
        LocationManager.shared.requestLocation()
        
        // 2. Any additional sync operations would go here
        
        // 3. Simulate completion after 5 seconds
        DispatchQueue.main.asyncAfter(deadline: .now() + 5) {
            print("Background sync completed")
            completion(true)
        }
    }
}
