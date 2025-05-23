
import CoreLocation

class StandardLocationDelegate: NSObject, CLLocationManagerDelegate {
    var onLocationUpdate: ((CLLocation) -> Void)?
    var onError: ((Error) -> Void)?
    var onAuthorizationChange: ((CLAuthorizationStatus) -> Void)?
    
    // Cache the best location based on accuracy
    private var bestLocation: CLLocation?
    private let significantAccuracyImprovement: CLLocationAccuracy = 50.0 // meters
    
    // Buffer for debouncing frequent location updates
    private var locationUpdateBuffer: [CLLocation] = []
    private var debounceTimer: Timer?
    private let debounceInterval: TimeInterval = 0.5 // 500ms
    
    // Track accuracy levels for degradation features
    private var currentAccuracyState: AccuracyState = .high
    private var recoveryAttemptCount: Int = 0
    private var lastRecoveryAttempt: Date?
    private let recoveryInterval: TimeInterval = 30.0 // 30 seconds between recovery attempts
    
    // Accuracy thresholds for determining location quality
    private let highAccuracyThreshold: CLLocationAccuracy = 20.0  // meters
    private let mediumAccuracyThreshold: CLLocationAccuracy = 100.0 // meters
    
    enum AccuracyState {
        case high
        case medium
        case low
    }
    
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        // Process locations from most recent to oldest
        if let location = locations.sorted(by: { $0.timestamp > $1.timestamp }).first {
            // Add to update buffer instead of processing immediately
            locationUpdateBuffer.append(location)
            
            // Start debounce timer if not already running
            if debounceTimer == nil {
                debounceTimer = Timer.scheduledTimer(
                    withTimeInterval: debounceInterval,
                    repeats: false
                ) { [weak self] _ in
                    self?.processBufferedLocations()
                }
            }
        }
    }
    
    private func processBufferedLocations() {
        // Clear timer
        debounceTimer?.invalidate()
        debounceTimer = nil
        
        guard !locationUpdateBuffer.isEmpty else { return }
        
        // Find the best location in the buffer
        let bestBufferedLocation = locationUpdateBuffer.reduce(locationUpdateBuffer[0]) { (best, current) in
            return shouldUpdateLocation(newLocation: current, against: best) ? current : best
        }
        
        // Check if this is significantly better than our overall best
        let isBetterLocation = shouldUpdateLocation(newLocation: bestBufferedLocation)
        
        if isBetterLocation {
            bestLocation = bestBufferedLocation
            
            // Determine accuracy state before sending update
            updateAccuracyState(for: bestBufferedLocation)
            
            // Send location update with accuracy state info
            onLocationUpdate?(bestBufferedLocation)
            
            // Post notification about accuracy state changes
            NotificationCenter.default.post(
                name: Notification.Name("locationAccuracyChanged"),
                object: nil,
                userInfo: ["state": currentAccuracyState, "accuracy": bestBufferedLocation.horizontalAccuracy]
            )
        } else {
            print("Ignoring buffered location update - not significantly better: \(bestBufferedLocation.coordinate), accuracy: \(bestBufferedLocation.horizontalAccuracy)m")
            // We still cache it if it's the best we have
            if bestLocation == nil {
                bestLocation = bestBufferedLocation
                updateAccuracyState(for: bestBufferedLocation)
            }
        }
        
        // Clear buffer
        locationUpdateBuffer.removeAll()
        
        // If we're in lower accuracy modes, schedule a recovery attempt
        if currentAccuracyState != .high {
            scheduleAccuracyRecovery(manager: bestBufferedLocation.timestamp > Date().addingTimeInterval(-300) ? nil : manager)
        }
    }
    
    // Update the current accuracy state based on location accuracy
    private func updateAccuracyState(for location: CLLocation) {
        let accuracy = location.horizontalAccuracy
        
        let newState: AccuracyState
        if accuracy <= highAccuracyThreshold {
            newState = .high
        } else if accuracy <= mediumAccuracyThreshold {
            newState = .medium
        } else {
            newState = .low
        }
        
        // Only notify if state has changed
        if newState != currentAccuracyState {
            currentAccuracyState = newState
            print("Location accuracy state changed to: \(newState), accuracy: \(accuracy)m")
            
            // Reset recovery attempts on accuracy state change
            if newState == .high {
                recoveryAttemptCount = 0
                lastRecoveryAttempt = nil
            }
        }
    }
    
    // Schedule an attempt to recover higher accuracy
    private func scheduleAccuracyRecovery(manager: CLLocationManager?) {
        // Check if enough time has passed since last attempt
        if let lastAttempt = lastRecoveryAttempt, Date().timeIntervalSince(lastAttempt) < recoveryInterval {
            return
        }
        
        // Increment attempt count and update timestamp
        recoveryAttemptCount += 1
        lastRecoveryAttempt = Date()
        
        // Try to recover better accuracy by adjusting settings
        if let locationManager = manager {
            // Try to get better accuracy based on the current state
            switch currentAccuracyState {
            case .low:
                // If in low accuracy, first try with a balanced accuracy setting
                locationManager.desiredAccuracy = kCLLocationAccuracyHundredMeters
            case .medium:
                // If in medium accuracy, try to get to high accuracy
                locationManager.desiredAccuracy = kCLLocationAccuracyBest
            case .high:
                // Already in high accuracy, nothing to do
                return
            }
            
            // Request a new location with adjusted settings
            locationManager.requestLocation()
            
            print("Attempting to recover better location accuracy: attempt \(recoveryAttemptCount)")
        }
    }
    
    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        // Filter out common location errors that don't need to be propagated
        if let clError = error as? CLError {
            switch clError.code {
            case .locationUnknown, .network:
                // These are transient errors, log but don't propagate
                print("Transient location error: \(error.localizedDescription)")
                // If we have a cached location, use that
                if let cached = bestLocation {
                    print("Using cached location due to transient error")
                    onLocationUpdate?(cached)
                    
                    // If error persists, degrade accuracy state
                    if currentAccuracyState == .high {
                        currentAccuracyState = .medium
                        
                        // Notify about accuracy degradation due to error
                        NotificationCenter.default.post(
                            name: Notification.Name("locationAccuracyChanged"),
                            object: nil,
                            userInfo: ["state": currentAccuracyState, "accuracy": cached.horizontalAccuracy, "reason": "error"]
                        )
                    }
                }
                return
            default:
                break
            }
        }
        
        onError?(error)
    }
    
    // Handle authorization changes (iOS 14+)
    @available(iOS 14.0, *)
    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        let status = manager.authorizationStatus
        onAuthorizationChange?(status)
        
        // Post notification for other components that need to respond to permission changes
        NotificationCenter.default.post(
            name: Notification.Name("locationPermissionChanged"),
            object: nil,
            userInfo: ["status": status]
        )
    }
    
    // Handle authorization changes (pre-iOS 14)
    func locationManager(_ manager: CLLocationManager, didChangeAuthorization status: CLAuthorizationStatus) {
        onAuthorizationChange?(status)
        
        // Post notification for other components that need to respond to permission changes
        NotificationCenter.default.post(
            name: Notification.Name("locationPermissionChanged"),
            object: nil,
            userInfo: ["status": status]
        )
    }
    
    // Smart location update algorithm
    private func shouldUpdateLocation(newLocation: CLLocation) -> Bool {
        guard let currentBest = bestLocation else {
            // We don't have a location yet, so use this one
            return true
        }
        
        return shouldUpdateLocation(newLocation: newLocation, against: currentBest)
    }
    
    private func shouldUpdateLocation(newLocation: CLLocation, against currentBest: CLLocation) -> Bool {
        // Check if the new location is more accurate by a significant margin
        let accuracyImprovement = currentBest.horizontalAccuracy - newLocation.horizontalAccuracy
        
        // If accuracy is significantly better, use the new location
        if accuracyImprovement > significantAccuracyImprovement {
            return true
        }
        
        // If the new location is reasonably fresh and more accurate, use it
        let isSignificantlyMoreAccurate = newLocation.horizontalAccuracy < currentBest.horizontalAccuracy * 0.8
        let isNewer = newLocation.timestamp.timeIntervalSince(currentBest.timestamp) > 0
        
        if isNewer && isSignificantlyMoreAccurate {
            return true
        }
        
        // If the old location is quite stale (> 2 minutes) and the new one is fresher, use the new one
        let isMuchNewer = newLocation.timestamp.timeIntervalSince(currentBest.timestamp) > 120
        
        if isMuchNewer {
            return true
        }
        
        // Otherwise, keep the existing location
        return false
    }
}
