
import UIKit
import BackgroundTasks

class BackgroundTaskManager {
    static let shared = BackgroundTaskManager()
    
    private var backgroundTask: UIBackgroundTaskIdentifier = .invalid
    private var taskExpirationHandler: (() -> Void)?
    
    func extendBackgroundExecution() {
        // End any existing background task
        endBackgroundTask()
        
        // Register a new background task to extend runtime
        backgroundTask = UIApplication.shared.beginBackgroundTask { [weak self] in
            // Handle task expiration
            self?.taskExpirationHandler?()
            self?.endBackgroundTask()
        }
        
        // Set up expiration handler
        taskExpirationHandler = { [weak self] in
            // Save any critical location data before expiration
            LocationManager.shared.saveCriticalLocationData()
            self?.endBackgroundTask()
        }
    }
    
    func endBackgroundTask() {
        if backgroundTask != .invalid {
            UIApplication.shared.endBackgroundTask(backgroundTask)
            backgroundTask = .invalid
        }
    }
    
    func scheduleBackgroundLocationTask() {
        if #available(iOS 13.0, *) {
            // Define a location fetch task for iOS 13+
            BGTaskScheduler.shared.register(
                forTaskWithIdentifier: "com.lovable.location.refresh",
                using: nil
            ) { task in
                self.handleBackgroundLocationTask(task as! BGAppRefreshTask)
            }
        }
    }
    
    @available(iOS 13.0, *)
    private func handleBackgroundLocationTask(_ task: BGAppRefreshTask) {
        // Schedule the next background task
        scheduleNextBackgroundTask()
        
        // Begin new background task to extend runtime
        self.extendBackgroundExecution()
        
        // Get location update in the background
        LocationManager.shared.locationManager?.requestLocation()
        
        // Set task expiration handler
        task.expirationHandler = {
            // Clean up any resources
            self.endBackgroundTask()
        }
        
        // Give the location manager time to get an update
        DispatchQueue.global().asyncAfter(deadline: .now() + 15) {
            // Mark the task complete
            task.setTaskCompleted(success: true)
        }
    }
    
    @available(iOS 13.0, *)
    private func scheduleNextBackgroundTask() {
        let request = BGAppRefreshTaskRequest(identifier: "com.lovable.location.refresh")
        request.earliestBeginDate = Date(timeIntervalSinceNow: 15 * 60) // 15 minutes
        
        do {
            try BGTaskScheduler.shared.submit(request)
        } catch {
            print("Could not schedule background task: \(error)")
        }
    }
}
