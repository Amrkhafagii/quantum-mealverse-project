import Foundation
import BackgroundTasks

@available(iOS 13.0, *)
class BackgroundSync {
    static func register() {
        print("Registering background tasks")
        
        BGTaskScheduler.shared.register(forTaskWithIdentifier: "com.quantummealverse.backgroundsync", using: nil) { task in
            handleBackgroundSync(task: task as! BGAppRefreshTask)
        }
    }
    
    static func handleBackgroundSync(task: BGAppRefreshTask) {
        print("Handling background sync task")
        
        task.expirationHandler = {
            task.setTaskCompleted(success: false)
        }
        
        // Perform background sync operations
        DispatchQueue.global(qos: .utility).async {
            // Background sync logic here
            task.setTaskCompleted(success: true)
        }
    }
}
