
import UIKit
import CoreLocation
import BackgroundTasks

@available(iOS 13.0, *)
class BackgroundFetchManager {
    static let shared = BackgroundFetchManager()
    
    private init() {}
    
    func handleBackgroundFetch(task: BGAppRefreshTask) {
        // Schedule the next refresh
        BackgroundSync.scheduleAppRefresh()
        
        // Create a task request that expires if we take too long
        let expirationTime = 30.0 // 30 seconds
        
        // Set up expiration handler
        task.expirationHandler = {
            print("Background refresh task expired")
            BackgroundTaskManager.shared.endBackgroundTask()
        }
        
        // Extend background execution time
        BackgroundTaskManager.shared.extendBackgroundExecution()
        
        // Notify system that background sync has started
        NotificationCenter.default.post(name: Notification.Name("backgroundSyncStarted"), object: nil)
        
        // Perform the actual sync operations
        BackgroundSync.performBackgroundSync { success in
            // Mark the task complete
            task.setTaskCompleted(success: success)
            
            // End extended background task
            BackgroundTaskManager.shared.endBackgroundTask()
            
            // Notify that sync is complete
            NotificationCenter.default.post(name: Notification.Name("backgroundSyncCompleted"), object: nil)
        }
    }
    
    func handleLegacyBackgroundFetch(_ application: UIApplication, completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
        // Use the LocationManager directly for background fetch
        guard let locationManager = LocationManager.shared.locationManager else {
            completionHandler(.failed)
            return
        }
        
        // Only proceed if we have authorization
        let authStatus: CLAuthorizationStatus
        if #available(iOS 14.0, *) {
            authStatus = locationManager.authorizationStatus
        } else {
            authStatus = CLLocationManager.authorizationStatus()
        }
        
        if authStatus == .authorizedAlways {
            // Reset location manager with energy efficient settings for this fetch
            locationManager.desiredAccuracy = kCLLocationAccuracyHundredMeters
            locationManager.distanceFilter = 50
            
            // Set a timeout for the fetch
            let locationFetchTimeout = DispatchWorkItem {
                print("Location fetch timed out")
                completionHandler(.failed)
            }
            
            // Schedule timeout
            DispatchQueue.main.asyncAfter(deadline: .now() + 25, execute: locationFetchTimeout)
            
            // Request a single location update
            var didComplete = false
            
            let locationHandler: LocationUpdateCompletion = { location in
                // Only process once
                guard !didComplete else { return }
                didComplete = true
                
                // Cancel the timeout
                locationFetchTimeout.cancel()
                
                // Process the location
                if LocationManager.shared.isQualityLocation(location) {
                    // Post the location update
                    NotificationCenter.default.post(
                        name: NSNotification.Name("locationUpdate"),
                        object: nil,
                        userInfo: [
                            "latitude": location.coordinate.latitude,
                            "longitude": location.coordinate.longitude,
                            "accuracy": location.horizontalAccuracy,
                            "timestamp": location.timestamp.timeIntervalSince1970 * 1000,
                            "source": "background_fetch"
                        ]
                    )
                    completionHandler(.newData)
                } else {
                    completionHandler(.noData)
                }
            }
            
            // Declare the observer variable before the closure
            var observer: NSObjectProtocol?
            
            // Set the observer in a separate statement
            observer = NotificationCenter.default.addObserver(
                forName: NSNotification.Name("locationUpdateAvailable"), 
                object: nil, 
                queue: .main
            ) { notification in
                if let location = notification.userInfo?["location"] as? CLLocation {
                    locationHandler(location)
                }
            }
            
            // Set a timeout to remove observer
            DispatchQueue.main.asyncAfter(deadline: .now() + 20) {
                // Use optional binding to safely remove the observer
                if let observerToRemove = observer {
                    NotificationCenter.default.removeObserver(observerToRemove)
                }
                if !didComplete {
                    completionHandler(.noData)
                }
            }
            
            // Request the location update
            locationManager.requestLocation()
        } else {
            // No authorization for background location
            completionHandler(.noData)
        }
    }
}
