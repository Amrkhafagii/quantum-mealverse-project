
import CoreLocation

class StandardLocationDelegate: NSObject, CLLocationManagerDelegate {
    var onLocationUpdate: ((CLLocation) -> Void)?
    var onError: ((Error) -> Void)?
    
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }
        onLocationUpdate?(location)
    }
    
    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        print("Standard location manager failed with error: \(error.localizedDescription)")
        onError?(error)
    }
    
    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        // Relay to LocationManager
        LocationManager.shared.checkLocationPermission()
    }
}
