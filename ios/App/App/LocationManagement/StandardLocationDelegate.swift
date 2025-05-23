import CoreLocation

class StandardLocationDelegate: NSObject, CLLocationManagerDelegate {
    var onLocationUpdate: ((CLLocation) -> Void)?
    var onError: ((Error) -> Void)?
    var onAuthorizationChange: ((CLAuthorizationStatus) -> Void)?
    
    // Cache the best location based on accuracy
    private var bestLocation: CLLocation?
    private let significantAccuracyImprovement: CLLocationAccuracy = 50.0 // meters
    
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        // Process locations from most recent to oldest
        if let location = locations.sorted(by: { $0.timestamp > $1.timestamp }).first {
            // Check if this is significantly better than what we have
            let isBetterLocation = shouldUpdateLocation(newLocation: location)
            
            if isBetterLocation {
                bestLocation = location
                onLocationUpdate?(location)
            } else {
                print("Ignoring location update - not significantly better: \(location.coordinate), accuracy: \(location.horizontalAccuracy)m")
                // We still cache it if it's the best we have
                if bestLocation == nil {
                    bestLocation = location
                }
            }
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
