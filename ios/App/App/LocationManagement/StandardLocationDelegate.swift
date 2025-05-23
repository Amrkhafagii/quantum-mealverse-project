import CoreLocation

class StandardLocationDelegate: NSObject, CLLocationManagerDelegate {
    var onAuthorizationChange: ((CLAuthorizationStatus) -> Void)?
    var onLocationUpdate: ((CLLocation) -> Void)?
    var onError: ((Error) -> Void)?
    
    func setup(with locationManager: CLLocationManager) {
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
        locationManager.distanceFilter = 5 // 5 meters
        locationManager.activityType = .otherNavigation
        locationManager.pausesLocationUpdatesAutomatically = false
    }
    
    // MARK: - CLLocationManagerDelegate
    
    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        let status = manager.authorizationStatus
        print("Location authorization status changed: \(status.rawValue)")
        onAuthorizationChange?(status)
    }
    
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }
        
        let coordinate = location.coordinate
        let accuracy = location.horizontalAccuracy
        let timestamp = location.timestamp
        let speed = location.speed
        
        print("""
        Location update:
        - Latitude: \(coordinate.latitude)
        - Longitude: \(coordinate.longitude)
        - Accuracy: \(accuracy)m
        - Timestamp: \(timestamp)
        - Speed: \(speed)m/s
        """)
        
        onLocationUpdate?(location)
    }
    
    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        let errorMessage: String
        
        if let clError = error as? CLError {
            switch clError.code {
            case .locationUnknown:
                errorMessage = "Location could not be determined"
            case .denied:
                errorMessage = "Location access denied"
            case .headingFailure:
                errorMessage = "Heading could not be determined"
            default:
                errorMessage = "Location error: \(clError.code.rawValue)"
            }
        } else {
            errorMessage = error.localizedDescription
        }
        
        print("Location manager failed: \(errorMessage)")
        onError?(error)
    }
    
    // Optional: Handle pause/resume events
    func locationManagerDidPauseLocationUpdates(_ manager: CLLocationManager) {
        print("Location updates paused")
    }
    
    func locationManagerDidResumeLocationUpdates(_ manager: CLLocationManager) {
        print("Location updates resumed")
    }
}
