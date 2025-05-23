
import CoreLocation

class StandardLocationDelegate: NSObject, CLLocationManagerDelegate {
    var onLocationUpdate: ((CLLocation) -> Void)?
    var onError: ((Error) -> Void)?
    var onAuthorizationChange: ((CLAuthorizationStatus) -> Void)?
    
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        if let location = locations.last {
            onLocationUpdate?(location)
        }
    }
    
    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        // Filter out common location errors that don't need to be propagated
        if let clError = error as? CLError {
            switch clError.code {
            case .locationUnknown, .network:
                // These are transient errors, log but don't propagate
                print("Transient location error: \(error.localizedDescription)")
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
}
