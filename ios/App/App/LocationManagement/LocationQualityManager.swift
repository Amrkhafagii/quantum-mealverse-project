
import CoreLocation

class LocationQualityManager {
    // Location filtering parameters
    private let minimumHorizontalAccuracy: CLLocationAccuracy = 100.0
    private let significantDistance: CLLocationDistance = 50.0 // 50 meters considered significant
    private let poorQualityThreshold: Int = 3 // Number of consecutive poor quality locations
    
    private var lastSignificantLocation: CLLocation?
    private var poorQualityLocationCount: Int = 0
    
    func isQualityLocation(_ location: CLLocation) -> Bool {
        // Check horizontal accuracy
        guard location.horizontalAccuracy > 0 && location.horizontalAccuracy < minimumHorizontalAccuracy else {
            poorQualityLocationCount += 1
            print("Poor quality location detected: accuracy \(location.horizontalAccuracy)m")
            return false
        }
        
        // Reset poor quality counter since we got a good location
        poorQualityLocationCount = 0
        
        // Check for significant movement if we have a previous location
        if let lastLocation = lastSignificantLocation {
            let distance = location.distance(from: lastLocation)
            if distance < significantDistance {
                // Not significant movement
                print("Movement not significant: \(distance)m")
                return false
            }
        }
        
        // This is a quality location
        lastSignificantLocation = location
        return true
    }
    
    func takePoorQualityAction(
        locationManager: CLLocationManager?,
        startHybridPositioningCallback: @escaping () -> Void
    ) {
        if poorQualityLocationCount >= poorQualityThreshold {
            print("Multiple poor quality locations detected. Adjusting strategy.")
            // Restart location updates with different settings
            locationManager?.stopUpdatingLocation()
            
            // Reset inaccurate counter
            poorQualityLocationCount = 0
            
            // Try to activate hybrid positioning
            startHybridPositioningCallback()
        }
    }
}
