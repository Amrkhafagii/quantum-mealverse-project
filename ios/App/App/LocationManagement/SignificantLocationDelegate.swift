import CoreLocation

class SignificantLocationDelegate: NSObject, CLLocationManagerDelegate {
    var onLocationUpdate: ((CLLocation) -> Void)?
    var onError: ((Error) -> Void)?
    var onAuthorizationChange: ((CLAuthorizationStatus) -> Void)?
    
    func setup(with locationManager: CLLocationManager) {
        locationManager.desiredAccuracy = kCLLocationAccuracyHundredMeters
        locationManager.distanceFilter = kCLDistanceFilterNone
    }
    
    // MARK: - CLLocationManagerDelegate
    
    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        let status = manager.authorizationStatus
        print("Significant location auth status changed: \(status.rawValue)")
        onAuthorizationChange?(status)
    }
    
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }
        
        print("""
        Significant location change:
        - Latitude: \(location.coordinate.latitude)
        - Longitude: \(location.coordinate.longitude)
        - Accuracy: \(location.horizontalAccuracy)m
        - Timestamp: \(location.timestamp)
        """)
        
        onLocationUpdate?(location)
    }
    
    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        let errorMessage: String
        
        if let clError = error as? CLError {
            switch clError.code {
            case .denied:
                errorMessage = "Significant location access denied"
                // Automatically stop updates if denied
                manager.stopMonitoringSignificantLocationChanges()
            default:
                errorMessage = "Significant location error: \(clError.code.rawValue)"
            }
        } else {
            errorMessage = error.localizedDescription
        }
        
        print("Significant location manager failed: \(errorMessage)")
        onError?(error)
    }
}
