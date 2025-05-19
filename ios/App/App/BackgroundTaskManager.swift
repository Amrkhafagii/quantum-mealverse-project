
import UIKit

class BackgroundTaskManager {
    static let shared = BackgroundTaskManager()
    
    private var backgroundTask: UIBackgroundTaskIdentifier = .invalid
    
    private init() {}
    
    func extendBackgroundExecution() {
        // End previous task if one exists
        if backgroundTask != .invalid {
            UIApplication.shared.endBackgroundTask(backgroundTask)
            backgroundTask = .invalid
        }
        
        // Begin new background task with proper completion handler
        backgroundTask = UIApplication.shared.beginBackgroundTask { [weak self] in
            // Clean up code if the task is ending
            guard let self = self else { return }
            
            if self.backgroundTask != .invalid {
                // Save any critical state or data before the task ends
                LocationManager.shared.saveCriticalLocationData()
                
                UIApplication.shared.endBackgroundTask(self.backgroundTask)
                self.backgroundTask = .invalid
            }
        }
    }
    
    func endBackgroundTask() {
        if backgroundTask != .invalid {
            UIApplication.shared.endBackgroundTask(backgroundTask)
            backgroundTask = .invalid
        }
    }
}
