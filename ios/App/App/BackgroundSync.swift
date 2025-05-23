
import Foundation
import BackgroundTasks

@available(iOS 13.0, *)
class BackgroundSync {
    static let shared = BackgroundSync()
    private let backgroundTaskIdentifier = "com.lovable.background.sync"
    
    static func register() {
        BGTaskScheduler.shared.register(
            forTaskWithIdentifier: "com.lovable.background.sync",
            using: nil
        ) { task in
            guard let task = task as? BGAppRefreshTask else { return }
            shared.handleBackgroundSync(task)
        }
    }
    
    static func scheduleAppRefresh() {
        shared.scheduleAppRefresh()
    }
    
    private func scheduleAppRefresh() {
        let request = BGAppRefreshTaskRequest(identifier: backgroundTaskIdentifier)
        request.earliestBeginDate = Date(timeIntervalSinceNow: 15 * 60) // 15 minutes
        
        do {
            try BGTaskScheduler.shared.submit(request)
            print("Background refresh scheduled")
        } catch {
            print("Could not schedule background refresh: \(error)")
        }
    }
    
    private func handleBackgroundSync(_ task: BGAppRefreshTask) {
        // Schedule the next refresh
        scheduleAppRefresh()
        
        // Extend background execution time with our refactored BackgroundTaskManager
        BackgroundTaskManager.shared.extendBackgroundExecution()
        
        // Post notification for observers
        NotificationCenter.default.post(name: Notification.Name("backgroundSyncStarted"), object: nil)
        
        // Set expiration handler to clean up if we run out of time
        task.expirationHandler = {
            // Clean up any resources and save state
            BackgroundTaskManager.shared.endBackgroundTask()
            print("Background sync task expired")
        }
        
        // Perform sync operations
        performSync {
            // Mark task complete when done
            task.setTaskCompleted(success: true)
            
            // End extended background task
            BackgroundTaskManager.shared.endBackgroundTask()
            
            // Post notification that sync is complete
            NotificationCenter.default.post(name: Notification.Name("backgroundSyncCompleted"), object: nil)
        }
    }
    
    private func performSync(completion: @escaping () -> Void) {
        // Execute background sync operations:
        // 1. Get current location
        LocationManager.shared.locationManager?.requestLocation()
        
        // 2. Continue with additional sync operations
        // ... additional sync code would go here ...
        
        // For this example, we'll just wait a bit and then complete
        DispatchQueue.main.asyncAfter(deadline: .now() + 5.0) {
            print("Background sync completed")
            completion()
        }
    }
}
