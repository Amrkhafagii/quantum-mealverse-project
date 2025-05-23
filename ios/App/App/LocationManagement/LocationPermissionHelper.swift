
import Foundation
import CoreLocation

class LocationPermissionHelper {
    // Format permission status for the plugin responses
    static func formatPermissionStatus(_ status: CLAuthorizationStatus) -> (foreground: String, background: String) {
        switch status {
        case .authorizedAlways:
            return ("granted", "granted")
        case .authorizedWhenInUse:
            return ("granted", "denied")
        case .denied, .restricted:
            return ("denied", "denied")
        case .notDetermined:
            return ("prompt", "prompt")
        @unknown default:
            return ("prompt", "prompt")
        }
    }
    
    // Calculate exponential backoff delay
    static func calculateBackoffDelay(attempt: Int) -> TimeInterval {
        // Exponential backoff: 2^attempt * 500ms with some jitter
        let baseDelay = pow(2.0, Double(attempt - 1)) * 0.5 // seconds
        let jitter = Double.random(in: 0...0.25) * baseDelay // Add up to 25% random jitter
        
        // Cap at 10 seconds maximum
        return min(baseDelay + jitter, 10.0)
    }
    
    // Helper method to check current location permission
    static func checkLocationPermission(locationManager: CLLocationManager?) -> CLAuthorizationStatus {
        if #available(iOS 14.0, *) {
            return locationManager?.authorizationStatus ?? .notDetermined
        } else {
            return CLLocationManager.authorizationStatus()
        }
    }
}

// Extension to check if app has background modes configured

