
import UIKit
import BackgroundTasks

@objc class BackgroundTaskManager: NSObject {
    static let shared = BackgroundTaskManager()
    
    private var backgroundTaskIdentifier: UIBackgroundTaskIdentifier = .invalid
    
    private override init() {
        super.init()
    }
    
    @available(iOS 13.0, *)
    static func register() {
        BGTaskScheduler.shared.register(forTaskWithIdentifier: "com.lovable.background.refresh", 
                                      using: nil) { task in
            AppDelegate.shared.handleBackgroundRefresh(task: task as! BGAppRefreshTask)
        }
    }
    
    @available(iOS 13.0, *)
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
    
    func extendBackgroundExecution() {
        if backgroundTaskIdentifier != .invalid {
            // End previous task if one exists
            endBackgroundTask()
        }
        
        backgroundTaskIdentifier = UIApplication.shared.beginBackgroundTask { [weak self] in
            self?.endBackgroundTask()
        }
        
        print("Background execution extended")
    }
    
    func endBackgroundTask() {
        if backgroundTaskIdentifier != .invalid {
            UIApplication.shared.endBackgroundTask(backgroundTaskIdentifier)
            backgroundTaskIdentifier = .invalid
            print("Background task ended")
        }
    }
}
