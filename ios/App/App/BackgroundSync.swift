import Foundation
import Capacitor
import BackgroundTasks
import UIKit

@objc public class BackgroundSync: NSObject {
    private static let backgroundIdentifier = "com.lovable.quantummealverse.background-sync"
    private static let syncCompleteNotification = Notification.Name("backgroundSyncCompleted")
    
    // Pattern analysis for intelligent scheduling
    private static var lastSyncTimes: [Date] = []
    private static let maxPatternHistory = 10
    private static var userPatternAnalyzer: UserPatternAnalyzer?
    
    // Register background tasks
    @objc public static func register() {
        BGTaskScheduler.shared.register(forTaskWithIdentifier: backgroundIdentifier, using: nil) { task in
            self.handleBackgroundSync(task: task as! BGAppRefreshTask)
        }
        
        // Initialize the user pattern analyzer
        userPatternAnalyzer = UserPatternAnalyzer()
        
        // Setup observer for when app goes to background
        NotificationCenter.default.addObserver(forName: UIApplication.didEnterBackgroundNotification, object: nil, queue: .main) { _ in
            self.scheduleAppRefresh()
        }
        
        print("Background sync tasks registered")
    }
    
    // Schedule the next background refresh task
    @objc public static func scheduleAppRefresh() {
        let request = BGAppRefreshTaskRequest(identifier: backgroundIdentifier)
        
        // Set intelligent scheduling based on user patterns
        if let nextOptimalTime = calculateNextOptimalSyncTime() {
            request.earliestBeginDate = nextOptimalTime
            print("Background sync scheduled for optimal time: \(nextOptimalTime)")
        } else {
            // Default to 15 minutes if no pattern is established
            request.earliestBeginDate = Date(timeIntervalSinceNow: 15 * 60)
            print("Background sync scheduled with default time")
        }
        
        do {
            try BGTaskScheduler.shared.submit(request)
            print("Background task scheduled successfully")
        } catch {
            print("Could not schedule background task: \(error)")
        }
    }
    
    // Handle the background sync task
    private static func handleBackgroundSync(task: BGAppRefreshTask) {
        // Create a task assertion to extend runtime if needed
        let taskAssertionID = UIApplication.shared.beginBackgroundTask {
            // This is the expiration handler if we run out of time
            print("Background sync task expiring")
        }
        
        // Set up a task expiration handler
        task.expirationHandler = {
            // Handle early expiration by saving state if necessary
            print("Background sync task expired")
            // Cancel any ongoing work
            NotificationCenter.default.post(name: Notification.Name("cancelBackgroundSync"), object: nil)
            
            if taskAssertionID != .invalid {
                UIApplication.shared.endBackgroundTask(taskAssertionID)
            }
        }
        
        // Record this sync time for pattern analysis
        let currentDate = Date()
        recordSyncTime(currentDate)
        
        // Start the actual sync operation
        print("Starting background data synchronization")
        
        // Create and start the background sync operation
        performDataSync { success, error in
            // Handle sync completion
            if success {
                print("Background sync completed successfully")
                NotificationCenter.default.post(name: syncCompleteNotification, object: nil)
            } else {
                print("Background sync failed: \(error?.localizedDescription ?? "Unknown error")")
            }
            
            // Schedule the next refresh task
            scheduleAppRefresh()
            
            // Mark the task as complete
            task.setTaskCompleted(success: success)
            
            // End the background task assertion
            if taskAssertionID != .invalid {
                UIApplication.shared.endBackgroundTask(taskAssertionID)
            }
        }
    }
    
    // Core data synchronization implementation
    private static func performDataSync(completion: @escaping (Bool, Error?) -> Void) {
        // Post a notification that will be picked up by our JS bridge
        NotificationCenter.default.post(
            name: Notification.Name("backgroundSyncStarted"),
            object: nil
        )
        
        // Set a timeout in case the JS part doesn't respond
        let timeout = 25.0 // seconds
        let timer = Timer.scheduledTimer(withTimeInterval: timeout, repeats: false) { _ in
            completion(false, NSError(domain: "BackgroundSyncError", code: 1, userInfo: [NSLocalizedDescriptionKey: "Sync operation timed out"]))
        }
        
        // Declare the observer variable before the closure that uses it
        var observer: NSObjectProtocol?
        
        // Set up observer for sync completion from the JS side
        observer = NotificationCenter.default.addObserver(forName: syncCompleteNotification, object: nil, queue: .main) { _ in
            timer.invalidate()
            // Use optional binding to safely remove the observer
            if let observerToRemove = observer {
                NotificationCenter.default.removeObserver(observerToRemove)
            }
            completion(true, nil)
        }
    }
    
    // Record sync times for pattern analysis
    private static func recordSyncTime(_ time: Date) {
        lastSyncTimes.append(time)
        
        // Keep the history at a reasonable size
        if lastSyncTimes.count > maxPatternHistory {
            lastSyncTimes.removeFirst()
        }
        
        // Update the pattern analyzer
        userPatternAnalyzer?.addSyncTime(time)
    }
    
    // Calculate the next optimal sync time based on user patterns
    private static func calculateNextOptimalSyncTime() -> Date? {
        return userPatternAnalyzer?.predictNextOptimalSyncTime()
    }
}

// Helper class to analyze user sync patterns
class UserPatternAnalyzer {
    private var syncTimes: [Date] = []
    private var hourFrequency = [Int: Int]()
    private var dayOfWeekFrequency = [Int: Int]()
    
    func addSyncTime(_ time: Date) {
        syncTimes.append(time)
        
        // Extract hour and day of week
        let calendar = Calendar.current
        let hour = calendar.component(.hour, from: time)
        let dayOfWeek = calendar.component(.weekday, from: time)
        
        // Update frequency maps
        hourFrequency[hour] = (hourFrequency[hour] ?? 0) + 1
        dayOfWeekFrequency[dayOfWeek] = (dayOfWeekFrequency[dayOfWeek] ?? 0) + 1
        
        // Keep history at a reasonable size
        if syncTimes.count > 50 {
            let oldestTime = syncTimes.removeFirst()
            let oldHour = calendar.component(.hour, from: oldestTime)
            let oldDay = calendar.component(.weekday, from: oldestTime)
            
            hourFrequency[oldHour] = (hourFrequency[oldHour] ?? 1) - 1
            dayOfWeekFrequency[oldDay] = (dayOfWeekFrequency[oldDay] ?? 1) - 1
        }
    }
    
    func predictNextOptimalSyncTime() -> Date? {
        guard !syncTimes.isEmpty else { return nil }
        
        // Find the most frequent hour
        let mostFrequentHour = hourFrequency.max(by: { $0.value < $1.value })?.key ?? 12
        
        // Find the most frequent day (for weekly patterns)
        let mostFrequentDay = dayOfWeekFrequency.max(by: { $0.value < $1.value })?.key ?? Calendar.current.component(.weekday, from: Date())
        
        // Calculate the time interval patterns between syncs
        var intervalPatterns: [TimeInterval] = []
        for i in 0..<syncTimes.count - 1 {
            let interval = syncTimes[i + 1].timeIntervalSince(syncTimes[i])
            if interval > 0 && interval < 24 * 60 * 60 { // Only consider intervals less than a day
                intervalPatterns.append(interval)
            }
        }
        
        // Get the average interval if we have enough data
        var nextSyncInterval: TimeInterval = 30 * 60 // Default to 30 minutes
        if !intervalPatterns.isEmpty {
            nextSyncInterval = intervalPatterns.reduce(0, +) / Double(intervalPatterns.count)
            
            // Make sure it's at least 15 minutes
            nextSyncInterval = max(nextSyncInterval, 15 * 60)
        }
        
        return Date(timeIntervalSinceNow: nextSyncInterval)
    }
}
